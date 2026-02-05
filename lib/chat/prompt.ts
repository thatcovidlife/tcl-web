import { Client } from 'langsmith'
import { captureException } from '@sentry/nuxt'
import { llmInstructionsV4 } from './messages'
import { config } from './config'

const client = new Client()

// Set to true to force using local fallback prompt instead of LangSmith
const FORCE_LOCAL_PROMPT = process.env.FORCE_LOCAL_PROMPT === 'true'

export async function fetchPrompt() {
  // Force local fallback if enabled (for testing)
  if (FORCE_LOCAL_PROMPT) {
    console.log('[LangSmith] FORCE_LOCAL_PROMPT is true, using local fallback')
    return llmInstructionsV4
  }

  try {
    const promptName = config.promptName
    if (!promptName) {
      throw new Error('Prompt name is not defined in configuration.')
    }
    const call = await client._pullPrompt(promptName)
    const prompt = JSON.parse(call)

    if (!prompt?.kwargs?.template) {
      throw new Error(`Prompt template not found for prompt: ${promptName}`)
    }

    // Log the LangSmith prompt for debugging
    console.log('[LangSmith] Using prompt:', promptName)
    console.log('[LangSmith] Prompt length:', prompt.kwargs.template.length)
    console.log(
      '[LangSmith] First 500 chars:',
      prompt.kwargs.template.slice(0, 500),
    )

    return prompt.kwargs.template
  } catch (error) {
    console.error('Error fetching prompt:', error)
    captureException(error)
    console.log('[LangSmith] Falling back to local prompt (llmInstructionsV4)')
    return llmInstructionsV4
  }
}
