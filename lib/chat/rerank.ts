import { config } from './config'

interface RerankResponse {
  scores: number[]
  input_tokens: number
  request_id: string | null
  inference_status: {
    status: string
    runtime_ms: number
    cost: number
    tokens_generated: number
    tokens_input: number
  }
}

interface RerankDocument {
  id: string
  content: string
  score?: number
  metadata?: Record<string, unknown>
}

interface RerankOptions {
  query: string
  documents: RerankDocument[]
  topN?: number
}

/**
 * Reranks documents using DeepInfra's Qwen3-Reranker-4B model.
 * This custom implementation is needed because AI SDK v6's rerank()
 * function does not currently support DeepInfra as a provider.
 */
export async function rerankDocuments({
  query,
  documents,
  topN = 5,
}: RerankOptions): Promise<RerankDocument[]> {
  if (documents.length === 0) {
    return []
  }

  try {
    console.log('rerankDocuments: calling DeepInfra rerank API', {
      queryLength: query.length,
      documentCount: documents.length,
      topN,
    })

    const response = await fetch(
      'https://api.deepinfra.com/v1/inference/Qwen/Qwen3-Reranker-4B',
      {
        method: 'POST',
        headers: {
          Authorization: `bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queries: [query],
          documents: documents.map((d) => d.content),
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('rerankDocuments: API error', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
      throw new Error(
        `DeepInfra rerank API error: ${response.status} ${response.statusText}`,
      )
    }

    const result = (await response.json()) as RerankResponse

    console.log('rerankDocuments: API success', {
      scoresCount: result.scores.length,
      inputTokens: result.input_tokens,
      runtimeMs: result.inference_status.runtime_ms,
    })

    // Pair scores with original documents and sort by relevance
    const ranked = documents
      .map((doc, index) => ({
        doc,
        score: result.scores[index] ?? 0,
        originalIndex: index,
      }))
      .sort((a, b) => b.score - a.score)

    // Return top N documents with scores included
    return ranked.slice(0, topN).map((r) => ({
      ...r.doc,
      score: r.score,
    }))
  } catch (error) {
    console.error('rerankDocuments: error during reranking', error)
    // On error, return original documents truncated to topN
    return documents.slice(0, topN)
  }
}
