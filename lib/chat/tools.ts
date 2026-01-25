import { tool } from 'ai'
import { z } from 'zod'

import { collectionName } from './collections'
import { findRelevantContent } from './embedding'
import { /* aiGuardCheck, */ aiGuardCheckLlm } from './guard'
import { rerankDocuments } from './rerank'

// const PANGEA_ENABLED = process.env.PANGEA_ENABLED === 'true'
const RERANK_ENABLED = process.env.RERANK_ENABLED === 'true'
const RERANK_TOP_N = parseInt(process.env.RERANK_TOP_N || '5')

export const searchTool = tool({
  description: `get information from your knowledge base to answer questions.`,
  inputSchema: z.object({
    selectedCollection: z.string().describe('the collection to use'),
    question: z.string().describe('the users question'),
  }),
  execute: async ({ question, selectedCollection }) => {
    // Get initial results from vector search
    const initialResults = await findRelevantContent(
      question,
      collectionName(selectedCollection),
    )

    if (!initialResults) {
      return null
    }

    // Apply reranking if enabled and we have results
    if (RERANK_ENABLED && initialResults.length > 0) {
      console.log('searchTool: reranking enabled', {
        resultCount: initialResults.length,
        topN: RERANK_TOP_N,
      })

      // Transform Qdrant results to rerank format
      const documents = initialResults.map((result) => ({
        id: String(result.id),
        content:
          (result.payload?.content as string) ||
          (result.payload?.text as string) ||
          '',
        metadata: result.payload ?? {},
      }))

      const reranked = await rerankDocuments({
        query: question,
        documents,
        topN: RERANK_TOP_N,
      })

      console.log('searchTool: reranking complete', {
        originalCount: initialResults.length,
        rerankedCount: reranked.length,
      })

      // Transform reranked results back to Qdrant format for frontend compatibility
      return reranked.map((doc) => ({
        id: doc.id,
        score: doc.score ?? 0,
        payload: doc.metadata ?? {},
      }))
    }

    return initialResults
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
