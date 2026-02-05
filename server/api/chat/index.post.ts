import {
  consumeStream,
  createAgentUIStreamResponse,
  stepCountIs,
  ToolLoopAgent,
} from 'ai'
import { captureMessage } from '@sentry/nuxt'
import { model } from '@/lib/chat/providers'
import { ratelimit } from '@/lib/chat/rate-limit'
import { config } from '@/lib/chat/config'
import { guardTool, searchTool } from '@/lib/chat/tools'
import { fetchPrompt } from '@/lib/chat/prompt'

import type { UIMessage } from 'ai'
import type { modelID } from '@/lib/chat/providers'

// Vercel function max duration (5 minutes)
// Prevents responses from being cut off unexpectedly
export const maxDuration = 300

export default defineLazyEventHandler(() => {
  return defineEventHandler(async (event) => {
    // bypass XSS validator for this endpoint
    event.node.req.headers['x-skip-xss-validator'] = 'true'

    const {
      messages,
      selectedModel,
      userId,
    }: { messages: UIMessage[]; selectedModel: modelID; userId: string } =
      await readBody(event)

    const { success, remaining } = await ratelimit.limit(userId)

    // TODO: fix this so the LLM sends the message
    if (!success && process.env.NODE_ENV !== 'development') {
      const errorMessage = `Too many requests, please try again later. Remaining queries: ${remaining}`
      captureMessage(errorMessage, {
        level: 'warning',
        extra: { userId, selectedModel, messages },
      })
      setResponseStatus(event, 429, errorMessage)
      return errorMessage
    }

    const prompt = await fetchPrompt()

    // Set up abort controller for stream cancellation
    // This allows proper cleanup when user clicks stop or navigates away
    const controller = new AbortController()
    const timeout = setTimeout(
      () => controller.abort(),
      290000, // 4:50 timeout (slightly less than maxDuration)
    )

    const startTime = Date.now()

    // Use ToolLoopAgent to handle tool calling + text generation properly
    // Agents automatically continue until text response is generated
    const agent = new ToolLoopAgent({
      model: model.languageModel(selectedModel as modelID),
      temperature: config.llmTemperature,
      maxOutputTokens: config.llmMaxTokens,
      maxRetries: 3,
      instructions: prompt,
      tools: {
        checkContent: guardTool,
        getInformation: searchTool,
      },
      stopWhen: stepCountIs(50),
      experimental_telemetry: {
        isEnabled: true,
        metadata: {
          userId,
        },
      },
      onStepFinish: (stepResult) => {
        console.log('Agent step finished:', {
          finishReason: stepResult.finishReason,
          toolCalls: stepResult.toolCalls?.length || 0,
          textLength: stepResult.text?.length || 0,
        })
      },
    })

    // createAgentUIStreamResponse handles streaming internally
    // We provide onStepFinish for response-level logging
    return createAgentUIStreamResponse({
      agent,
      uiMessages: messages,
      abortSignal: controller.signal,
      timeout: 290000,
      consumeSseStream: consumeStream,
      onStepFinish: (stepResult) => {
        const duration = Date.now() - startTime
        console.log('Response step:', {
          duration,
          finishReason: stepResult.finishReason,
          toolCalls: stepResult.toolCalls?.length || 0,
          textLength: stepResult.text?.length || 0,
        })
      },
    })
  })
})
