import { createGroqBuilder, makeSafeQueryRunner } from 'groqd'
import type * as SanityTypes from '@/sanity/types'

export const useGroqd = () => {
  const { client } = useSanity()

  const q = createGroqBuilder<{
    schemaTypes: SanityTypes.AllSanitySchemaTypes
    referenceSymbol: typeof SanityTypes.internalGroqTypeReferenceTo
  }>()

  const runQuery = makeSafeQueryRunner((query) => client.fetch(query))

  return { q, runQuery }
}
