import { captureException } from '@sentry/nuxt'
import { llmInstructionsV5 } from './messages'
import { config } from './config'

const FORCE_LOCAL_PROMPT = process.env.FORCE_LOCAL_PROMPT === 'true'

async function pullPromptFromLangSmith(
  promptName: string,
): Promise<string | null> {
  const rc = useRuntimeConfig()
  const apiKey = rc.langchainApiKey
  const endpoint = rc.langchainEndpoint || 'https://api.smith.langchain.com'

  if (!apiKey) return null

  try {
    const response = await fetch(
      `${endpoint}/api/v1/prompts/${encodeURIComponent(promptName)}`,
      {
        headers: {
          'x-api-key': apiKey,
          Accept: 'application/json',
        },
      },
    )

    if (!response.ok) return null

    const data = await response.json()
    return data?.kwargs?.template ?? null
  } catch (error) {
    console.error('[LangSmith] HTTP fetch error:', error)
    return null
  }
}

export async function fetchPrompt() {
  if (FORCE_LOCAL_PROMPT) {
    console.log('[LangSmith] FORCE_LOCAL_PROMPT is true, using local fallback')
    return llmInstructionsV5
  }

  try {
    const promptName = config.promptName
    if (!promptName) {
      throw new Error('Prompt name is not defined in configuration.')
    }

    const template = await pullPromptFromLangSmith(promptName)

    if (!template) {
      throw new Error(`Prompt template not found for prompt: ${promptName}`)
    }

    console.log('[LangSmith] Using prompt:', promptName)
    console.log('[LangSmith] Prompt length:', template.length)
    console.log('[LangSmith] First 500 chars:', template.slice(0, 500))

    return template
  } catch (error) {
    console.error('Error fetching prompt:', error)
    captureException(error)
    console.log('[LangSmith] Falling back to local prompt (llmInstructionsV5)')
    return llmInstructionsV5
  }
}
