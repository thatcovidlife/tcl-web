import { embed } from 'ai'
import { QdrantClient } from '@qdrant/js-client-rest'

import { config } from './config'
import { fireworksProvider } from './fireworks'

const getEmbeddingModelId = (modelId: string): string => {
  if (modelId.startsWith('accounts/fireworks/models/qwen3-embedding-')) {
    return modelId.replace('accounts/fireworks/models/', 'fireworks/')
  }

  return modelId
}

export const embeddingModel = fireworksProvider.embeddingModel(
  getEmbeddingModelId(config.embedModel!),
)

interface CollectionVectorConfig {
  denseVectorSize: number | null
  denseVectorName: string | null
  denseVectorNames: string[]
  hasSparseVector: boolean
}

const collectionVectorConfigCache = new Map<
  string,
  Promise<CollectionVectorConfig | null>
>()

export const qdrant = new QdrantClient({
  url: config.qdrantUrl,
  port: config.qdrantPort,
  apiKey: config.qdrantKey,
})

const getCollectionVectorConfig = async (
  collection: string,
): Promise<CollectionVectorConfig | null> => {
  if (!collectionVectorConfigCache.has(collection)) {
    collectionVectorConfigCache.set(
      collection,
      (async () => {
        try {
          const info = await qdrant.getCollection(collection)
          const vectors = info.config?.params?.vectors
          const sparseVectors = info.config?.params?.sparse_vectors

          if (!vectors) {
            return null
          }

          if ('size' in vectors && typeof vectors.size === 'number') {
            return {
              denseVectorSize: vectors.size,
              denseVectorName: null,
              denseVectorNames: [],
              hasSparseVector: Boolean(sparseVectors),
            }
          }

          const namedVectors = Object.entries(vectors as Record<string, unknown>)
            .map(([name, value]) => {
              if (value === null || typeof value !== 'object') {
                return null
              }

              return {
                name,
                size:
                  'size' in value && typeof value.size === 'number'
                    ? value.size
                    : null,
              }
            })
            .filter(
              (
                vector,
              ): vector is { name: string; size: number | null } =>
                vector !== null,
            )

          const preferredDenseVector =
            namedVectors.find((vector) => vector.name === 'content') ??
            namedVectors.find((vector) => vector.size !== null) ??
            null

          return {
            denseVectorSize: preferredDenseVector?.size ?? null,
            denseVectorName: preferredDenseVector?.name ?? null,
            denseVectorNames: namedVectors.map((vector) => vector.name),
            hasSparseVector: Boolean(sparseVectors),
          }
        } catch (error) {
          console.error('getCollectionVectorConfig error:', error)
          return null
        }
      })(),
    )
  }

  return collectionVectorConfigCache.get(collection) ?? null
}

export const generateEmbedding = async (
  value: string,
  dimensions?: number,
): Promise<number[]> => {
  const input = value.replaceAll('\n', ' ')
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
    ...(dimensions
      ? {
          providerOptions: {
            fireworks: {
              dimensions,
            },
          },
        }
      : {}),
  })
  return embedding
}

// ---------------------------------------------------------------------------
// Query routing — maps query intent to named vector spaces
// ---------------------------------------------------------------------------

const GENERAL_ROUTING: Record<string, RegExp> = {
  epidemiology:
    /spread|transmit|contagion|outbreak|R0|reproduction.?number|cases|incidence|prevalence|wave|surge|variant|strain|mutation/i,
  clinical:
    /symptom|treatment|therapy|severity|hospitali|ICU|intensive.care|death|mortality|fatality|risk.factor|comorbid|vulnerable/i,
  geography:
    /country|region|where|europe|asia|africa|america|city|border|nation|global|worldwide|continent/i,
  policy:
    /guideline|recommend|mandate|CDC|WHO|lockdown|restriction|response|measure|intervention|protocol|regulation|authority/i,
}

const LANCET_ROUTING: Record<string, RegExp> = {
  methodology:
    /study|trial|RCT|randomis|cohort|method|design|sample|statistic|analysis|endpoint|protocol|blinded|placebo|controlled/i,
  findings:
    /result|outcome|efficacy|effectiveness|hazard|ratio|confidence|interval|significant|p.value|reduction|increase|decrease/i,
  clinical:
    /patient|population|dose|dosing|intervention|vaccin|treatment|cohort|inclusion|exclusion|adverse|side.effect|safety/i,
  pathophysiology:
    /mechanism|immune|antibody|antigen|viral|biology|protein|receptor|inflammatory|ACE2|spike|cytokine|T.cell|B.cell|innate/i,
}

// Section-level intent detection for Lancet — routes to specific paper sections
const LANCET_SECTION_INTENT: Record<string, RegExp> = {
  results:
    /what (were|are) the (result|outcome|finding|efficacy)|did (it|the (drug|vaccine|treatment)) work/i,
  methods:
    /how (was|were|did) (the study|they|patients) (design|conduct|select|recruit)|what (method|design|approach)/i,
  abstract:
    /summarize|overview|what is (this|the) (paper|study|article) about/i,
  discussion:
    /what does (this|the) (mean|imply|suggest)|implication|interpret/i,
}

function routeQuery(
  query: string,
  collectionType: 'general' | 'lancet',
): string[] {
  const routing = collectionType === 'lancet' ? LANCET_ROUTING : GENERAL_ROUTING
  const matches = Object.entries(routing)
    .filter(([, pattern]) => pattern.test(query))
    .map(([facet]) => facet)
  return matches.length > 0 ? matches : ['content']
}

// Naive sparse vector from term frequencies
// Replace with SPLADE model output if available
function buildSparseVector(text: string): {
  indices: number[]
  values: number[]
} {
  const terms = text.toLowerCase().match(/\b[a-z]{3,}\b/g) ?? []
  const freqMap: Record<string, number> = {}
  for (const term of terms) freqMap[term] = (freqMap[term] ?? 0) + 1
  const vocab = Object.keys(freqMap)
  return {
    indices: vocab.map((_, i) => i),
    values: vocab.map((t) => freqMap[t] / terms.length),
  }
}

// ---------------------------------------------------------------------------
// smartSearch — named vector routing + hybrid RRF fusion
// ---------------------------------------------------------------------------
export const smartSearch = async (
  userQuery: string,
  collection: string,
  collectionType: 'general' | 'lancet',
  topK: number = config.qdrantMaxResults ?? 15,
  prefetchK: number = 25,
  sectionFilter?: string[],
) => {
  const collectionConfig = await getCollectionVectorConfig(collection)

  if (!collectionConfig?.denseVectorNames.length) {
    return null
  }

  const denseVector = await generateEmbedding(
    userQuery,
    collectionConfig.denseVectorSize ?? undefined,
  )
  const sparseVector = buildSparseVector(userQuery)

  // For Lancet: detect section-level intent and apply payload filter
  let filter: object | undefined
  if (collectionType === 'lancet') {
    for (const [section, pattern] of Object.entries(LANCET_SECTION_INTENT)) {
      if (pattern.test(userQuery)) {
        filter = {
          must: [{ key: 'sectionType', match: { value: section } }],
        }
        break
      }
    }
    // Explicit section filter passed from caller takes precedence
    if (sectionFilter && sectionFilter.length > 0) {
      filter = {
        must: [{ key: 'sectionType', match: { any: sectionFilter } }],
      }
    }
  }

  // Route to relevant named vector spaces based on query intent
  const facets = routeQuery(userQuery, collectionType).filter((facet) =>
    collectionConfig.denseVectorNames.includes(facet),
  )

  if (facets.length === 0 && collectionConfig.denseVectorNames.includes('content')) {
    facets.push('content')
  }

  // Build prefetch — one entry per matched vector space + sparse
  const prefetch = [
    ...facets.map((facet) => ({
      query: denseVector,
      using: facet,
      limit: prefetchK,
      ...(filter ? { filter } : {}),
    })),
    ...(collectionConfig.hasSparseVector
      ? [
          {
            query: sparseVector,
            using: 'sparse',
            limit: prefetchK,
            ...(filter ? { filter } : {}),
          },
        ]
      : []),
  ]

  try {
    const response = await qdrant.query(collection, {
      prefetch,
      query: { fusion: 'rrf' },
      limit: topK,
      with_payload: true,
      ...(filter ? { filter } : {}),
    })

    return response.points ?? []
  } catch (e) {
    console.error('smartSearch error:', e)
    return null
  }
}

// ---------------------------------------------------------------------------
// Fallback: legacy single-vector search (used if collection has no named vectors)
// ---------------------------------------------------------------------------
export const findRelevantContent = async (
  userQuery: string,
  collection?: string,
) => {
  const targetCollection = collection ?? config.qdrantCollection!
  const collectionConfig = await getCollectionVectorConfig(targetCollection)
  const userQueryEmbedded = await generateEmbedding(
    userQuery,
    collectionConfig?.denseVectorSize ?? undefined,
  )

  try {
    return await qdrant.search(targetCollection, {
      vector: collectionConfig?.denseVectorName
        ? {
            name: collectionConfig.denseVectorName,
            vector: userQueryEmbedded,
          }
        : userQueryEmbedded,
      limit: config.qdrantMaxResults,
    })
  } catch (e) {
    console.error(e)
    return null
  }
}
