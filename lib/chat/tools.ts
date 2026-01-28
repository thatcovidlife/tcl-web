import { tool } from 'ai'
import { z } from 'zod'

import { collectionName } from './collections'
import { findRelevantContent } from './embedding'
import { aiGuardCheckLlm } from './guard'
import { rerankDocuments } from './rerank'
import { config } from './config'

const RERANK_ENABLED = Boolean(config.rerankEnabled)
const RERANK_TOP_N = (() => {
  const value = config.rerankTopN
  const fallback = 5
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    return fallback
  }
  return value
})()

type QdrantResult = {
  id: string | number
  score?: number
  payload?: Record<string, unknown>
}

type SearchResult = {
  id: string | number
  score: number
  content: string
  url?: string
  title?: string
}

export const searchTool = tool({
  description: `get information from your knowledge base to answer questions.

IMPORTANT: Always evaluate the returned results:
- Check the 'averageScore' field: values below ${config.agenticMinScoreThreshold} indicate low relevance
- Check the 'content' fields: ensure they actually address the question
- If results are poor (low scores or irrelevant content), refine your query and try again`,
  inputSchema: z.object({
    selectedCollection: z
      .string()
      .describe('the collection to use (general or lancet)'),
    question: z.string().describe('the users question'),
    iteration: z
      .number()
      .optional()
      .describe('current attempt number (1, 2, or 3)'),
  }),
  execute: async ({ question, selectedCollection, iteration = 1 }) => {
    // Get initial results from vector search
    const initialResults = await findRelevantContent(
      question,
      collectionName(selectedCollection),
    )

    if (!initialResults || initialResults.length === 0) {
      return {
        success: false,
        results: [],
        resultCount: 0,
        averageScore: 0,
        message: 'No results found in collection. Try rephrasing your query or using the other collection.',
        iteration,
      } as const
    }

    // Apply reranking if enabled
    let finalResults = initialResults as QdrantResult[]
    if (RERANK_ENABLED && initialResults.length > 0) {
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

      finalResults = reranked.map((doc) => ({
        id: doc.id,
        score: doc.score ?? 0,
        payload: doc.metadata ?? {},
      }))
    }

    // Calculate average score for evaluation
    const scores = finalResults.map((r) => r.score ?? 0)
    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : 0

    // Transform to enhanced results format
    const enhancedResults: SearchResult[] = finalResults.map((r) => {
      const payload = r.payload ?? {}
      const metadata = (payload as { metadata?: Record<string, unknown> }).metadata ?? {}

      return {
        id: r.id,
        score: r.score ?? 0,
        content:
          (payload.content as string) ||
          (payload.text as string) ||
          '',
        url: metadata.url as string | undefined,
        title: metadata.title as string | undefined,
      }
    })

    return {
      success: true,
      results: enhancedResults,
      resultCount: finalResults.length,
      averageScore,
      maxScore: Math.max(...scores, 0),
      minScore: scores.length > 0 ? Math.min(...scores) : 0,
      message: `Found ${finalResults.length} results with average relevance score of ${averageScore.toFixed(2)}.`,
      iteration,
    } as const
  },
})

export const guardTool = tool({
  description: `check text for harmful content.`,
  inputSchema: z.object({
    question: z.string().describe("the user's original question"),
  }),
  execute: async ({ question }) => {
    try {
      const result = await aiGuardCheckLlm(question)
      return result?.blocked
    } catch (error) {
      console.error('Error in guardTool:', error)
      // On error, default to not blocked
      return false
    }
  },
})
