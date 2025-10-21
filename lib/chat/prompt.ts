import { Client } from 'langsmith'
import { captureException } from '@sentry/nuxt'
import { llmInstructionsV4 } from './messages'
import { config } from './config'

const client = new Client()

export async function fetchPrompt() {
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

    return prompt.kwargs.template
  } catch (error) {
    console.error('Error fetching prompt:', error)
    captureException(error)
    return llmInstructionsV4
  }
}
