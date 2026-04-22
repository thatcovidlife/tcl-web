import { generateText } from 'ai'
import { deepinfra } from '@ai-sdk/deepinfra'
import { guardToolInstructions } from './messages'

export interface GuardResult {
  blocked: boolean
}

export const aiGuardCheckLlm = async (
  text: string,
): Promise<GuardResult> => {
  try {
    const response = await generateText({
      model: deepinfra('openai/gpt-oss-20b'),
      system: guardToolInstructions,
      prompt: text,
    })

    const [result] = response.steps[0].content.filter((c) => c.type === 'text')

    const blocked = result?.text?.startsWith('UNSAFE') || false

    if (blocked) {
      console.log('aiGuardCheckLlm blocked text:', result?.text)
    }

    return { blocked }
  } catch (error) {
    return { blocked: false }
  }
}
