export const config = {
  fireworksApiKey:
    process.env.FIREWORKS_API_KEY ?? process.env.DEEPINFRA_API_KEY,
  fireworksBaseUrl: process.env.FIREWORKS_BASE_URL,
  embedModel:
    process.env.FIREWORKS_EMBED_MODEL ?? process.env.DEEPINFRA_EMBED_MODEL,
  // lfFunctionId: process.env.LANGFUSE_FUNCTION_ID,
  // lfPublicKey: process.env.LANGFUSE_PUBLIC_KEY,
  // lfSecretKey: process.env.LANGFUSE_SECRET_KEY,
  // lfBaseUrl: process.env.LANGFUSE_BASE_URL,
  llmMaxTokens: parseInt(
    process.env.FIREWORKS_LLM_MAX_TOKENS ??
      process.env.DEEPINFRA_LLM_MAX_TOKENS!,
  ),
  llmModel: process.env.FIREWORKS_LLM_MODEL ?? process.env.DEEPINFRA_LLM_MODEL,
  llmTemperature: parseFloat(
    process.env.FIREWORKS_LLM_TEMPERATURE ??
      process.env.DEEPINFRA_LLM_TEMPERATURE!,
  ),
  // memoryPostgresUrl: process.env.MEMORY_POSTGRES_URL,
  qdrantCollection: process.env.QDRANT_COLLECTION,
  qdrantKey: process.env.QDRANT_KEY,
  qdrantMaxResults: parseInt(
    process.env.FIREWORKS_MAX_RESULTS ?? process.env.DEEPINFRA_MAX_RESULTS!,
  ),
  qdrantPort: parseInt(process.env.QDRANT_PORT || '6333'),
  qdrantUrl: process.env.QDRANT_URL,
  promptName: process.env.LANGSMITH_PROMPT_NAME,
  // rewriterModel: process.env.DEEPINFRA_REWRITER_MODEL,
  // workflowName: process.env.WORKFLOW_NAME,
  upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
  rateMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS!),
  ratePrefix: process.env.RATE_LIMIT_PREFIX || '@upstash/ratelimit',
  rateWindow: process.env.RATE_LIMIT_WINDOW,
  // Reranking
  rerankEnabled: process.env.RERANK_ENABLED === 'true',
  rerankModel:
    process.env.FIREWORKS_RERANK_MODEL ??
    process.env.RERANK_MODEL ??
    'accounts/fireworks/models/qwen3-reranker-8b',
  rerankTopN: parseInt(process.env.RERANK_TOP_N || '5'),
}
