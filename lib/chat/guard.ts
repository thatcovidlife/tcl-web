import { PangeaConfig, AIGuardService } from 'pangea-node-sdk'
import type { AIGuard } from 'pangea-node-sdk'

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
