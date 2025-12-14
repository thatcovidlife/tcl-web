import { PangeaConfig, AIGuardService } from 'pangea-node-sdk'
import type { AIGuard } from 'pangea-node-sdk'
import { generateText } from 'ai'
import { deepinfra } from '@ai-sdk/deepinfra'
import { guardToolInstructions } from './messages'

const token = process.env.PANGEA_TOKEN!
const domain = process.env.PANGEA_DOMAIN!

const config = new PangeaConfig({ domain })
const aiGuard = new AIGuardService(token, config)

export const aiGuardCheck = async (
  text: string,
): Promise<AIGuard.TextGuardResult> => {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI Guard timeout')), 5000),
    )

    const response = await Promise.race([
      aiGuard.guardText({ text }),
      timeoutPromise,
    ])
    return response.result
  } catch (error) {
    // Return unblocked on timeout or error
    // TODO: fix this properly... this is a temp fix
    return { blocked: false } as AIGuard.TextGuardResult
  }
}

export const aiGuardCheckLlm = async (
  text: string,
): Promise<AIGuard.TextGuardResult> => {
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

    return {
      blocked,
    } as AIGuard.TextGuardResult
  } catch (error) {
    // Return unblocked on timeout or error
    return { blocked: false } as AIGuard.TextGuardResult
  }
}
