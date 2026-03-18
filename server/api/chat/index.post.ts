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
export const maxDuration = 300

// ---------------------------------------------------------------------------
// Expected tool call sequence per turn:
//
//   Step 1 — checkContent        (guard, always first)
//   Step 2 — getInformation x1   (general collection, always)
//   Step 3 — getInformation x1   (lancet collection, if scientific)
//   Step 4 — text response
//
// Max 6 steps: covers guard + 2 searches + potential retries + final answer
// Previously set to 50 — that allowed runaway loops, wasting tokens and time
// ---------------------------------------------------------------------------
const MAX_STEPS = 6

export default defineLazyEventHandler(() => {
  return defineEventHandler(async (event) => {
    // Bypass XSS validator for this endpoint
    event.node.req.headers['x-skip-xss-validator'] = 'true'

    const {
      messages,
      selectedModel,
      userId,
    }: { messages: UIMessage[]; selectedModel: modelID; userId: string } =
      await readBody(event)

    const { success, remaining } = await ratelimit.limit(userId)

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

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 290000)

    const startTime = Date.now()

    console.log(`Selected model: ${selectedModel}, User ID: ${userId}`)

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

      // Tightly bounded: guard + 2 searches + answer = 4 steps normally,
      // 6 gives headroom for a retry without allowing runaway loops
      stopWhen: stepCountIs(MAX_STEPS),

      experimental_telemetry: {
        isEnabled: true,
        metadata: { userId },
      },

      onStepFinish: (stepResult) => {
        const elapsed = Date.now() - startTime
        console.log('Agent step:', {
          elapsed,
          finishReason: stepResult.finishReason,
          toolCalls: stepResult.toolCalls?.length ?? 0,
          textLength: stepResult.text?.length ?? 0,
        })

        // Clear timeout on final text response to avoid aborting a completed stream
        if (
          stepResult.finishReason === 'stop' &&
          (stepResult.text?.length ?? 0) > 0
        ) {
          clearTimeout(timeout)
        }
      },
    })

    return createAgentUIStreamResponse({
      agent,
      uiMessages: messages,
      abortSignal: controller.signal,
      timeout: 290000,
      consumeSseStream: consumeStream,
      onStepFinish: (stepResult) => {
        console.log('Stream step:', {
          duration: Date.now() - startTime,
          finishReason: stepResult.finishReason,
          toolCalls: stepResult.toolCalls?.length ?? 0,
          textLength: stepResult.text?.length ?? 0,
        })
      },
    })
  })
})
