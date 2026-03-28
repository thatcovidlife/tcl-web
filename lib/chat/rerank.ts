import { config } from './config'
import { fireworksBaseUrl } from './fireworks'

interface RerankResponse {
  object: string
  model: string
  data: {
    index: number
    relevance_score: number
    document?: string
  }[]
  usage: {
    prompt_tokens: number
    total_tokens: number
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
 * Reranks documents using Fireworks' Qwen3 reranker endpoint.
 * This stays separate from the AI SDK provider because reranking uses
 * Fireworks' dedicated `/rerank` HTTP API.
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
    console.log('rerankDocuments: calling Fireworks rerank API', {
      queryLength: query.length,
      documentCount: documents.length,
      topN,
    })

    const rerankUrl = `${fireworksBaseUrl}/rerank`

    // Add timeout handling to prevent hanging on stalled requests
    // Increased to 30s since reranking can be slow with large documents
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Rerank API timeout')), 30000),
    )

    const fetchPromise = fetch(rerankUrl, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${config.fireworksApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.rerankModel,
        query,
        documents: documents.map((d) => d.content),
        top_n: topN,
        return_documents: false,
      }),
    })

    const response = await Promise.race([fetchPromise, timeoutPromise])

    if (!response.ok) {
      const errorText = await response.text()
      console.error('rerankDocuments: Fireworks API error', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
      throw new Error(
        `Fireworks rerank API error: ${response.status} ${response.statusText}`,
      )
    }

    const result = (await response.json()) as RerankResponse

    console.log('rerankDocuments: API success', {
      resultCount: result.data.length,
      promptTokens: result.usage.prompt_tokens,
      totalTokens: result.usage.total_tokens,
    })

    return result.data.reduce<RerankDocument[]>(
      (ranked, { index, relevance_score }) => {
        const doc = documents[index]

        if (!doc) {
          return ranked
        }

        ranked.push({
          ...doc,
          score: relevance_score,
        })

        return ranked
      },
      [],
    )
  } catch (error) {
    console.error('rerankDocuments: error during reranking', error)
    // On error, return original documents truncated to topN
    return documents.slice(0, topN)
  }
}
