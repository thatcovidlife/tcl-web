const rc = () => useRuntimeConfig()

function intOr(value: string | undefined, fallback: number): number {
  return value ? parseInt(value) : fallback
}

function floatOr(value: string | undefined, fallback: number): number {
  return value ? parseFloat(value) : fallback
}

export const config = {
  get apiKey() {
    return rc().deepinfraApiKey
  },
  get baseUrl() {
    return rc().deepinfraBaseUrl
  },
  get embedModel() {
    return rc().deepinfraEmbedModel
  },
  get llmMaxTokens() {
    return intOr(rc().deepinfraLlmMaxTokens, 16384)
  },
  get llmModel() {
    return rc().deepinfraLlmModel
  },
  get llmTemperature() {
    return floatOr(rc().deepinfraLlmTemperature, 0.5)
  },
  get qdrantCollection() {
    return rc().qdrantCollection
  },
  get qdrantKey() {
    return rc().qdrantKey
  },
  get qdrantMaxResults() {
    return intOr(rc().deepinfraMaxResults, 15)
  },
  get qdrantPort() {
    return intOr(rc().qdrantPort, 6333)
  },
  get qdrantUrl() {
    return rc().qdrantUrl
  },
  get promptName() {
    return rc().langsmithPromptName
  },
  get upstashToken() {
    return rc().upstashToken
  },
  get upstashUrl() {
    return rc().upstashUrl
  },
  get rateMaxRequests() {
    return intOr(rc().rateMaxRequests, 50)
  },
  get ratePrefix() {
    return rc().ratePrefix || '@upstash/ratelimit'
  },
  get rateWindow() {
    return rc().rateWindow
  },
  get rerankEnabled() {
    return rc().rerankEnabled === 'true'
  },
  get rerankModel() {
    return rc().rerankModel || 'Qwen/Qwen3-Reranker-4B'
  },
  get rerankTopN() {
    return intOr(rc().rerankTopN, 5)
  },
}
