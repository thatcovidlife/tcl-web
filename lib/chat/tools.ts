import { tool } from 'ai'
import { z } from 'zod'

import { collectionName, collectionType } from './collections'
import { smartSearch, findRelevantContent } from './embedding'
import { aiGuardCheckLlm } from './guard'
import { rerankDocuments } from './rerank'
import { config } from './config'

const RERANK_ENABLED = Boolean(config.rerankEnabled)
const RERANK_TOP_N = (() => {
  const value = config.rerankTopN
  const fallback = 5
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0)
    return fallback
  return value
})()

// ---------------------------------------------------------------------------
// searchTool — uses smartSearch with named vector routing + hybrid RRF fusion
// Falls back to legacy single-vector search if smartSearch returns null
// ---------------------------------------------------------------------------
export const searchTool = tool({
  description: `Search the knowledge base to answer questions about public health,
COVID-19, infectious diseases, epidemiology, clinical research, and related topics.
Always call this tool before answering any factual question.`,

  inputSchema: z.object({
    selectedCollection: z
      .string()
      .describe(
        'The collection to search: "general" for public health content, "lancet" for scientific papers',
      ),
    question: z
      .string()
      .describe(
        'The search query — rephrase the user question as a clear, specific search query if needed',
      ),
  }),

  execute: async ({ question, selectedCollection }) => {
    const name = collectionName(selectedCollection)
    const type = collectionType(selectedCollection) // 'general' | 'lancet'

    // Primary: smartSearch with named vector routing + hybrid RRF
    let initialResults = await smartSearch(question, name, type)

    // Fallback to legacy search if smartSearch fails or collection has no named vectors
    if (!initialResults || initialResults.length === 0) {
      console.log(
        'searchTool: smartSearch returned no results, falling back to legacy search',
      )
      initialResults = await findRelevantContent(question, name)
    }

    if (!initialResults || initialResults.length === 0) {
      return null
    }

    // Reranking pass — uses Qwen3 reranker to rescore top candidates
    if (RERANK_ENABLED) {
      console.log('searchTool: reranking', {
        collection: selectedCollection,
        resultCount: initialResults.length,
        topN: RERANK_TOP_N,
      })

      const documents = initialResults.map((result) => ({
        id: String(result.id),
        // Prefer rawContent (original chunk text) over enriched content for reranking
        // rawContent is what was stored pre-prefix-injection, giving cleaner signal
        content:
          (result.payload?.rawContent as string) ??
          (result.payload?.content as string) ??
          (result.payload?.text as string) ??
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

      // Return in Qdrant-compatible format so the LLM sees consistent structure
      return reranked.map((doc) => ({
        id: doc.id,
        score: doc.score ?? 0,
        payload: doc.metadata ?? {},
      }))
    }

    return initialResults
  },
})

// ---------------------------------------------------------------------------
// guardTool — content safety check before any retrieval
// ---------------------------------------------------------------------------
export const guardTool = tool({
  description: `Check whether the user's question is safe to answer.
Always call this tool FIRST before any other tool.
Returns true if the content should be blocked, false if it is safe.`,

  inputSchema: z.object({
    question: z.string().describe("The user's original question"),
  }),

  execute: async ({ question }) => {
    console.log('guardTool: checking question:', question)
    try {
      const result = await aiGuardCheckLlm(question)
      console.log('guardTool: result:', result)
      return result?.blocked ?? false
    } catch (error) {
      console.error('guardTool: error:', error)
      // Default to safe on error — avoids silently blocking valid questions
      return false
    }
  },
})
