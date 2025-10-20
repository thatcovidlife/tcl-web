import { Client } from 'langsmith'
import { captureException } from '@sentry/nuxt'
import { llmInstructionsV4 } from './messages'

const client = new Client()

export async function fetchPrompt() {
  try {
    const promptName = 'tcl-chatbot-stg' // TODO: revert this
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
