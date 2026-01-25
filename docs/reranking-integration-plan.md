# Reranking Integration Plan

## Overview

This document outlines the plan to integrate reranking into the AI chat system to improve search relevance and response quality. The implementation will use the **Qwen/Qwen3-Reranker-4B** model from DeepInfra.

## Background

### Current Architecture

The chat system currently uses a two-step retrieval process:

1. **Vector Search (Qdrant)**: Documents are retrieved based on semantic similarity using embeddings
2. **Direct LLM Usage**: Raw search results are passed directly to the LLM without re-ranking

**Flow:**
```
User Query → Embedding Generation → Qdrant Vector Search → Raw Results → LLM → Response
```

**Key Files:**
- [lib/chat/tools.ts](lib/chat/tools.ts) - Search tool definition
- [lib/chat/embedding.ts](lib/chat/embedding.ts) - Vector search implementation
- [lib/chat/providers.ts](lib/chat/providers.ts) - DeepInfra provider configuration
- [server/api/chat/index.post.ts](server/api/chat/index.post.ts) - Chat API endpoint

### Problem with Current Approach

Vector similarity search alone has limitations:
- Semantic embeddings may miss nuanced query-document relationships
- No cross-query reranking when searching multiple collections
- Fixed result ordering may not match user's actual information need

## Proposed Solution: Modify Existing Search Tool

### Decision: Modify Existing Tool vs Create New Tool

**Recommendation: Modify the existing `searchTool` in [lib/chat/tools.ts](lib/chat/tools.ts)**

**Rationale:**
1. **No system prompt changes needed** - The LLM already uses the `getInformation` tool with a specific query
2. **Transparent improvement** - Better results without changing the chat flow
3. **Cleaner data flow** - Reranking happens within the tool execution, not exposed to the LLM
4. **Performance optimization** - Reduces context by returning only top-N most relevant documents

### Architecture with Reranking

```
User Query → Embedding → Qdrant Search (top K candidates)
                ↓
        Reranking with Qwen3-Reranker-4B
                ↓
        Top N reranked results → LLM → Response
```

## Technical Implementation

### AI SDK v6 Rerank Feature

The AI SDK v6 provides a `rerank` function with the following signature:

```typescript
import { rerank } from 'ai';

const { ranking, rerankedDocuments } = await rerank({
  model: provider.reranking('model-id'),
  documents: [...],  // strings or objects
  query: 'search query',
  topN: 5,  // optional: number of results to return
});
```

**Supported Providers:**
- Cohere (`cohere.reranking()`)
- Amazon Bedrock
- Together.ai

### Critical Finding: DeepInfra Not Supported in AI SDK

**The AI SDK v6 `rerank` function does NOT currently support DeepInfra as a provider.**

### DeepInfra Qwen3-Reranker-4B API

**Model:** `Qwen/Qwen3-Reranker-4B`

**Endpoint:** `https://api.deepinfra.com/v1/inference/Qwen/Qwen3-Reranker-4B`

**Pricing:** $0.025 per 1M tokens

**Request Format:**
```bash
curl -X POST \
  -d '{"queries": ["What is the capital of United States?"], "documents": ["The capital of USA is Washington DC."]}' \
  -H "Authorization: bearer $DEEPINFRA_TOKEN" \
  -H 'Content-Type: application/json' \
  'https://api.deepinfra.com/v1/inference/Qwen/Qwen3-Reranker-4B'
```

**Response Format:**
```json
{
  "scores": [0.1, 0.2, 0.3],
  "input_tokens": 42,
  "request_id": null,
  "inference_status": {
    "status": "unknown",
    "runtime_ms": 0,
    "cost": 0.0,
    "tokens_generated": 0,
    "tokens_input": 0
  }
}
```

**Context Window:** 32K tokens

## Implementation Plan

### Phase 1: Create Custom Reranking Function

Since AI SDK doesn't support DeepInfra reranking natively, we'll create a custom wrapper function.

**File to create:** `lib/chat/rerank.ts`

```typescript
interface RerankResult {
  scores: number[]
  input_tokens: number
  inference_status: {
    status: string
    runtime_ms: number
    cost: number
    tokens_generated: number
    tokens_input: number
  }
}

interface RerankOptions {
  query: string
  documents: Array<{
    id: string
    content: string
    metadata?: Record<string, any>
  }>
  topN?: number
}

export async function rerankDocuments({
  query,
  documents,
  topN = 5,
}: RerankOptions): Promise<Array<typeof.documents[0]>> {
  const config = useRuntimeConfig()

  // Call DeepInfra API directly
  const response = await $fetch<RerankResult>(
    'https://api.deepinfra.com/v1/inference/Qwen/Qwen3-Reranker-4B',
    {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${config.deepinfraApiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        queries: [query],
        documents: documents.map(d => d.content),
      },
    }
  )

  // Pair scores with original documents and sort
  const ranked = documents
    .map((doc, index) => ({
      doc,
      score: response.scores[index] ?? 0,
    }))
    .sort((a, b) => b.score - a.score)

  // Return top N documents
  return ranked.slice(0, topN).map(r => r.doc)
}
```

### Phase 2: Modify Search Tool

**File to modify:** `lib/chat/tools.ts`

```typescript
import { tool } from 'ai'
import { z } from 'zod'

import { collectionName } from './collections'
import { findRelevantContent } from './embedding'
import { rerankDocuments } from './rerank'  // Import rerank function

// const PANGEA_ENABLED = process.env.PANGEA_ENABLED === 'true'
const RERANK_ENABLED = process.env.RERANK_ENABLED === 'true'

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

    // Apply reranking if enabled
    if (RERANK_ENABLED && initialResults.length > 0) {
      const reranked = await rerankDocuments({
        query: question,
        documents: initialResults.map(result => ({
          id: result.id,
          content: result.payload?.content || result.payload?.text || '',
          metadata: result.payload,
        })),
        topN: parseInt(process.env.RERANK_TOP_N || '5'),
      })

      return reranked
    }

    return initialResults
  },
})
```

### Phase 3: Environment Variables

**Add to `.env`:**

```bash
# Enable/disable reranking
RERANK_ENABLED=true

# Number of results to return after reranking
RERANK_TOP_N=5
```

### Phase 4: Configuration Updates

**File to modify:** `lib/chat/config.ts`

Add reranking configuration:

```typescript
export const config = {
  // ... existing config

  // Reranking
  rerankEnabled: process.env.RERANK_ENABLED === 'true',
  rerankTopN: parseInt(process.env.RERANK_TOP_N || '5'),
  rerankModel: process.env.RERANK_MODEL || 'Qwen/Qwen3-Reranker-4B',
}
```

## Benefits

1. **Improved Relevance**: Reranking can improve search relevance by 10-30% based on industry benchmarks
2. **Reduced Context**: Returns only the most relevant documents, reducing token usage
3. **No Prompt Changes**: Transparent improvement without modifying system prompts
4. **Configurable**: Can be toggled via environment variable for A/B testing
5. **Cost Effective**: DeepInfra pricing at $0.025/1M tokens is very affordable

## Trade-offs and Considerations

### Latency Impact
- **Additional API call**: ~100-300ms added to each search
- **Mitigation**: Can be disabled via `RERANK_ENABLED=false` for faster responses

### Error Handling
- **Fallback behavior**: If reranking fails, return original vector search results
- **Implementation**: Wrap rerank call in try-catch with logging

### Top-K vs Top-N Strategy
- **Current**: Vector search returns `qdrantMaxResults` results
- **Proposed**: Rerank top K (e.g., 20) and return top N (e.g., 5)
- **Rationale**: Reranking is most effective on a smaller, high-similarity candidate set

## Testing Strategy

1. **Unit Tests**: Test the `rerankDocuments` function with mock responses
2. **Integration Tests**: Test the modified search tool end-to-end
3. **A/B Testing**: Run with `RERANK_ENABLED=false` vs `true` and measure:
   - Response relevance (human evaluation)
   - User satisfaction metrics
   - Latency impact

## Future Enhancements

1. **AI SDK Contribution**: Consider contributing a DeepInfra provider to AI SDK for native `rerank()` support
2. **Cross-Collection Reranking**: Combine results from multiple collections before reranking
3. **Caching**: Cache rerank results for identical queries
4. **Threshold Filtering**: Add a minimum relevance score threshold

## References

- [AI SDK v6 rerank documentation](https://ai-sdk.dev/docs/reference/ai-sdk-core/rerank)
- [AI SDK 6 announcement](https://vercel.com/blog/ai-sdk-6)
- [DeepInfra Qwen3-Reranker-4B API](https://deepinfra.com/Qwen/Qwen3-Reranker-4B/api)
- [DeepInfra LLM Rerankers Guide](https://deepinfra.com/blog/llm-rerankers)

---

**Status:** Draft - Ready for review and implementation
