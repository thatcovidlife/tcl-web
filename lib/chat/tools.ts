import { tool } from 'ai'
import { z } from 'zod'

import { collectionName } from './collections'
import { findRelevantContent } from './embedding'

import { /* aiGuardCheck, */ aiGuardCheckLlm } from './guard'

// const PANGEA_ENABLED = process.env.PANGEA_ENABLED === 'true'

export const searchTool = tool({
  description: `get information from your knowledge base to answer questions.`,
  inputSchema: z.object({
    selectedCollection: z.string().describe('the collection to use'),
    question: z.string().describe('the users question'),
  }),
  execute: async ({ question, selectedCollection }) => {
    return await findRelevantContent(
      question,
      collectionName(selectedCollection),
    )
  },
})

export const guardTool = tool({
  description: `check text for harmful content.`,
  inputSchema: z.object({
    question: z.string().describe("the user's original question"),
  }),
  execute: async ({ question }) => {
    // if (PANGEA_ENABLED) {
    console.log('guardTool checking question:', question)
    try {
      const result = await aiGuardCheckLlm(question)
      console.log('guardTool result:', result)
      return result?.blocked
    } catch (error) {
      console.error('Error in guardTool:', error)
      // On error, default to not blocked
      return false
    }
    // } else {
    //   return false
    // }
  },
})
