import { embed } from 'ai'
import { deepinfra } from '@ai-sdk/deepinfra'
import { QdrantClient } from '@qdrant/js-client-rest'

import { config } from './config'

export const embeddingModel = deepinfra.textEmbeddingModel(config.embedModel!)
export const qdrant = new QdrantClient({
  url: config.qdrantUrl,
  apiKey: config.qdrantKey,
})

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\n', ' ')
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  })

  return embedding
}

export const findRelevantContent = async (
  userQuery: string,
  collection?: string,
) => {
  const userQueryEmbedded = await generateEmbedding(userQuery)

  try {
    return await qdrant.search(collection || config.qdrantCollection!, {
      vector: userQueryEmbedded,
      limit: config.qdrantMaxResults,
    })
  } catch (e) {
    console.error(e)
    return null
  }
}
