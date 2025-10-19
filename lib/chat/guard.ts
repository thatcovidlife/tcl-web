import { PangeaConfig, AIGuardService } from 'pangea-node-sdk'
import type { AIGuard } from 'pangea-node-sdk'

const token = process.env.PANGEA_TOKEN!
const domain = process.env.PANGEA_DOMAIN!

const config = new PangeaConfig({ domain })
const aiGuard = new AIGuardService(token, config)

export const aiGuardCheck = async (
  text: string,
): Promise<AIGuard.TextGuardResult> => {
  const response = await aiGuard.guardText({ text })
  return response.result
}
