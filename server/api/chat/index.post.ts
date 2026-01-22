import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  streamText,
  stepCountIs,
} from 'ai'
import { captureMessage, captureException } from '@sentry/nuxt'
import { model } from '@/lib/chat/providers'
import { ratelimit } from '@/lib/chat/rate-limit'
import { config } from '@/lib/chat/config'
import { guardTool, searchTool } from '@/lib/chat/tools'
import { fetchPrompt } from '@/lib/chat/prompt'

import type { UIMessage } from 'ai'
import type { modelID } from '@/lib/chat/providers'

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

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          model: model.languageModel(selectedModel as modelID),
          temperature: config.llmTemperature,
          maxOutputTokens: config.llmMaxTokens,
          system: prompt,
          messages: await convertToModelMessages(messages),
          stopWhen: stepCountIs(10),
          tools: {
            checkContent: guardTool,
            getInformation: searchTool,
          },
          toolChoice: 'required',
          experimental_telemetry: {
            isEnabled: true,
            metadata: {
              userId,
            },
          },
          experimental_transform: smoothStream({
            delayInMs: 20,
          }),
          // onFinish: () => {},
          // onStepFinish: ({ stepType }) => {
          //   console.log('Step finished:', stepType)
          // },
          onError: (error) => {
            captureException(error, {
              extra: { userId, selectedModel, messages },
            })
          },
        })

        writer.merge(
          result.toUIMessageStream({
            sendReasoning: true,
            sendSources: true,
          }),
        )
      },
      onError: (error) => {
        // Error messages are masked by default for security reasons.
        // If you want to expose the error message to the client, you can do so here:
        captureException(error, {
          extra: { userId, selectedModel, messages },
        })
        return error instanceof Error ? error.message : String(error)
      },
    })

    return createUIMessageStreamResponse({ stream })
  })
})
