# Agentic RAG Implementation Plan

## Overview

This document outlines a plan to transition the current simple RAG system to an **agentic AI approach** where the LLM actively evaluates retrieval results and iteratively refines queries when results are insufficient.

**Current State:** Single-pass RAG with fixed retrieval → rerank → generate pipeline
**Target State:** Agentic RAG with iterative query refinement and result evaluation

## Background: Current Architecture

### Existing Flow

```
User Query → Embedding Generation → Qdrant Vector Search (top K)
                ↓
        Reranking (if enabled) → Top N results
                ↓
        LLM generates response from results
```

**Key Files:**
- [server/api/chat/index.post.ts](../server/api/chat/index.post.ts) - Chat API endpoint using `streamText` with tools
- [lib/chat/tools.ts](../lib/chat/tools.ts) - `searchTool` and `guardTool` definitions
- [lib/chat/embedding.ts](../lib/chat/embedding.ts) - Vector search via Qdrant
- [lib/chat/rerank.ts](../lib/chat/rerank.ts) - Qwen3-Reranker-4B reranking
- [lib/chat/providers.ts](../lib/chat/providers.ts) - DeepInfra LLM provider

### Current Limitations

1. **Single-shot retrieval**: No opportunity to refine the query if results are poor
2. **No result evaluation**: The system cannot detect when retrieved documents are irrelevant
3. **Fixed workflow**: Cannot adapt strategy based on query complexity or result quality
4. **No self-correction**: If the initial search returns poor results, the LLM must work with what it has

## Problem Statement

> "This approach is inconsistent, and sometimes leads to bad answers due to wrong documents retrieval."

The current system retrieves documents based on semantic similarity but cannot:
- Detect when results have low relevance scores
- Recognize when document content doesn't match the query intent
- Automatically rephrase and retry the query with different terms
- Switch search strategies (e.g., try different collections)

## Proposed Solution: Agentic RAG with AI SDK ToolLoopAgent

### Architecture Overview

```
User Query → Agent (ToolLoopAgent)
                ↓
        1. Intent Analysis & Query Planning
                ↓
        2. Tool Selection (searchTool with dynamic parameters)
                ↓
        3. Retrieve & Evaluate Results
                ↓
        4. Decision: Sufficient? → Generate Answer
                ↓
                    No → Refine Query & Retry (max 3 iterations)
                ↓
        5. Grounded Answer Generation
```

### Key Capabilities

1. **Result Evaluation**: Agent checks both `score` (from reranking) and `payload.content` relevance
2. **Query Refinement**: Agent rewrites queries using different terminology when results are poor
3. **Iterative Retrieval**: Multiple search attempts with refined queries before giving up
4. **Collection Switching**: Agent can try different collections if first choice fails

## AI SDK Foundation

### Why ToolLoopAgent?

AI SDK v6 provides the `ToolLoopAgent` class which is ideal for agentic RAG:

- **Automatic loop management**: Handles tool execution and message passing
- **Built-in stop conditions**: Control when to stop iterating
- **prepareStep hook**: Dynamically modify behavior between iterations
- **Type safety**: Full TypeScript support for tools and outputs

From [AI SDK Agent Documentation](https://ai-sdk.dev/docs/agents/overview):

> "The ToolLoopAgent class handles loop, context management, and stopping conditions. Agents are LLMs that use tools in a loop to accomplish tasks."

### Relevant AI SDK Patterns

1. **Loop Control** ([docs/agents/loop-control](https://ai-sdk.dev/docs/agents/loop-control)):
   - `stopWhen`: Define stopping conditions (e.g., max iterations, sufficient results)
   - `prepareStep`: Modify settings between steps (e.g., change query, switch tools)

2. **Evaluator-Optimizer Pattern** ([docs/agents/workflows](https://ai-sdk.dev/docs/agents/workflows)):
   - Evaluate results quality
   - Refine and retry if below threshold

3. **Forced Tool Calling** with termination:
   - Use `toolChoice: 'required'` with a `done` tool (no execute function)
   - Agent signals completion by calling `done`

## Implementation Plan

### Phase 1: Create ToolLoopAgent with Evaluation Logic

**New file:** `lib/chat/agent.ts`

```typescript
import { ToolLoopAgent, tool, stepCountIs, StopCondition } from 'ai'
import { model } from './providers'
import { searchTool } from './tools'
import { z } from 'zod'

// Evaluation tool: assess if results are sufficient
const evaluateResultsTool = tool({
  description: 'Evaluate whether search results are sufficient to answer the user question',
  inputSchema: z.object({
    question: z.string().describe('The original user question'),
    results: z.array(z.object({
      score: z.number(),
      content: z.string(),
    })).describe('Search results with relevance scores'),
    isSufficient: z.boolean().describe('Whether results are sufficient'),
    reasoning: z.string().describe('Explanation for the decision'),
  }),
  execute: async ({ isSufficient, reasoning }) => {
    // Return evaluation - no execute function means this is just for the agent's reasoning
    return { isSufficient, reasoning }
  },
})

// Completion tool: signal that agent is done
const doneTool = tool({
  description: 'Signal that you have completed your research and are ready to answer',
  inputSchema: z.object({
    answer: z.string().describe('The final answer to the user'),
    sources: z.array(z.string()).describe('List of sources used'),
  }),
  // No execute function - terminates the loop when called
})

// Custom stop condition: max 3 search iterations
const maxSearchIterations: StopCondition<typeof searchTools> = ({ steps }) => {
  const searchCalls = steps.filter(s =>
    s.toolCalls?.some(tc => tc.toolName === 'getInformation')
  )
  return searchCalls.length >= 3
}

export const searchAgent = new ToolLoopAgent({
  model: model.languageModel('gpt-oss'), // or appropriate model
  tools: {
    getInformation: searchTool,
    evaluateResults: evaluateResultsTool,
    done: doneTool,
  },
  instructions: `You are a research assistant that helps find information from a knowledge base.

Your process:
1. Use getInformation to search for relevant documents
2. Evaluate the results (check scores and content relevance)
3. If results are insufficient (low scores or irrelevant content):
   - Refine the query with different terminology
   - Try searching again (max 3 attempts)
4. When you have sufficient information, call the done tool with your answer

Key evaluation criteria:
- Rerank scores below 0.3 indicate poor relevance
- Content that doesn't address the core question is insufficient
- Missing key information means you should try again`,
  stopWhen: [
    stepCountIs(10), // Absolute max steps
    maxSearchIterations, // Max search attempts
  ],
  toolChoice: 'required', // Force tool calling
})
```

### Phase 2: Modify Chat Endpoint to Use Agent

**File to modify:** `server/api/chat/index.post.ts`

Replace the current `streamText` approach with `createAgentUIStreamResponse`:

```typescript
import { createAgentUIStreamResponse } from 'ai'
import { searchAgent } from '@/lib/chat/agent'

export default defineLazyEventHandler(() => {
  return defineEventHandler(async (event) => {
    // ... existing rate limiting and setup ...

    const { messages, selectedModel, userId } = await readBody(event)

    const prompt = await fetchPrompt()

    // Create agent with call options for dynamic configuration
    const agent = searchAgent.withOptions({
      prepareCall: async ({ messages }) => {
        // Modify system prompt if needed
        return {
          instructions: `${prompt}\n\nCurrent date: ${new Date().toISOString()}`,
        }
      },
    })

    return createAgentUIStreamResponse({
      agent,
      messages,
      context: {
        selectedModel,
        userId,
      },
    })
  })
})
```

### Phase 3: Enhanced Search Tool with Metadata

**File to modify:** `lib/chat/tools.ts`

Enhance `searchTool` to return more metadata for evaluation:

```typescript
export const searchTool = tool({
  description: `get information from your knowledge base to answer questions.

IMPORTANT: Always evaluate the returned results:
- Check the 'score' field: values below 0.3 indicate low relevance
- Check the 'content' field: ensure it actually addresses the question
- If results are poor, refine your query and try again`,
  inputSchema: z.object({
    selectedCollection: z.string().describe('the collection to use (general or lancet)'),
    question: z.string().describe('the users question'),
    iteration: z.number().optional().describe('current attempt number (1, 2, or 3)'),
  }),
  execute: async ({ question, selectedCollection, iteration = 1 }) => {
    console.log('searchTool: searching', { question, selectedCollection, iteration })

    const initialResults = await findRelevantContent(
      question,
      collectionName(selectedCollection),
    )

    if (!initialResults) {
      return {
        success: false,
        results: [],
        message: 'No results found',
        iteration,
      }
    }

    // Apply reranking if enabled
    let finalResults = initialResults
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

    // Return enhanced results for evaluation
    return {
      success: true,
      results: finalResults.map(r => ({
        id: r.id,
        score: r.score,
        content: (r.payload?.content as string) || (r.payload?.text as string) || '',
        url: r.payload?.url as string | undefined,
      })),
      resultCount: finalResults.length,
      averageScore: finalResults.reduce((sum, r) => sum + (r.score || 0), 0) / finalResults.length,
      iteration,
    }
  },
})
```

### Phase 4: Configuration

**File to modify:** `lib/chat/config.ts`

Add agentic RAG configuration:

```typescript
export const config = {
  // ... existing config ...

  // Agentic RAG
  agenticEnabled: process.env.AGENTIC_ENABLED === 'true',
  agenticMaxIterations: parseInt(process.env.AGENTIC_MAX_ITERATIONS || '3'),
  agenticMinScoreThreshold: parseFloat(process.env.AGENTIC_MIN_SCORE_THRESHOLD || '0.3'),
}
```

**Add to `.env`:**

```bash
# Enable agentic RAG (iterative query refinement)
AGENTIC_ENABLED=true

# Maximum search iterations per query
AGENTIC_MAX_ITERATIONS=3

# Minimum average rerank score to consider results sufficient
AGENTIC_MIN_SCORE_THRESHOLD=0.3
```

### Phase 5: System Prompt Updates

The system prompt ([public/instructions.md](../public/instructions.md)) should be updated to reflect agentic behavior:

```markdown
[AGENTIC BEHAVIOR]

You are equipped with iterative search capabilities:

1. Always evaluate search results after calling getInformation:
   - Check average scores (below 0.3 = poor)
   - Verify content addresses the question
   - Identify missing information

2. If results are insufficient:
   - Rewrite the query using synonyms
   - Break complex questions into sub-queries
   - Try the alternative collection (general ↔ lancet)
   - Maximum 3 search attempts

3. Only provide final answer when you have:
   - Results with scores > 0.3
   - Content that directly addresses the question
   - Sufficient information to answer completely
```

## Alternative Approach: Manual Loop with Core Functions

If `ToolLoopAgent` proves too restrictive, an alternative is to use AI SDK core functions (`generateText`, `streamText`) with manual loop control:

```typescript
// lib/chat/agent-manual.ts
export async function agenticSearch(params: {
  question: string
  selectedCollection: string
  maxIterations: number
}) {
  const { question, selectedCollection, maxIterations = 3 } = params

  let iteration = 0
  let currentQuery = question
  let allResults: SearchResult[] = []
  let reasoning: string[] = []

  while (iteration < maxIterations) {
    iteration++

    // Generate search query
    const { text: searchQuery } = await generateText({
      model: model.languageModel('gpt-oss'),
      system: 'Generate an optimized search query based on the original question and previous results.',
      prompt: `Original question: ${question}
Iteration: ${iteration}
Previous queries: ${reasoning.join('\n')}
Current query idea: ${currentQuery}

Output only the refined search query.`,
    })

    // Execute search
    const results = await findRelevantContent(searchQuery, selectedCollection)
    allResults = [...allResults, ...results]

    // Evaluate results
    const { object: evaluation } = await generateObject({
      model: model.languageModel('gpt-oss'),
      schema: z.object({
        sufficient: z.boolean(),
        reasoning: z.string(),
        nextQuery: z.string().optional(),
      }),
      prompt: `Question: ${question}
Results: ${JSON.stringify(results.slice(0, 5))}

Are these results sufficient to answer the question?`,
    })

    reasoning.push(evaluation.reasoning)

    if (evaluation.sufficient) {
      break
    }

    currentQuery = evaluation.nextQuery || searchQuery
  }

  return {
    results: allResults,
    iterations: iteration,
    reasoning,
  }
}
```

**Trade-offs:**
- **Pros**: Full control, can implement custom logic, easier debugging
- **Cons**: More code to maintain, lose AI SDK's built-in features

## Testing Strategy

### 1. Unit Tests

Test individual components:
- `searchTool` returns proper metadata (scores, content)
- `evaluateResultsTool` validates result quality
- `stopWhen` conditions trigger correctly

### 2. Integration Tests

Test full agent flow:
```typescript
describe('Agentic RAG Agent', () => {
  it('should retry with refined query on poor results', async () => {
    // Mock low-score results
    const result = await searchAgent.generate({
      prompt: 'What is the latest COVID variant?',
    })

    expect(result.steps).toHaveLength(3) // Initial + 1 retry + answer
  })

  it('should stop after max iterations', async () => {
    const result = await searchAgent.generate({
      prompt: 'Obscure question with no matches',
    })

    // Should hit max iteration limit
    expect(result.steps.some(s => s.toolCalls?.[0]?.toolName === 'done'))
  })
})
```

### 3. A/B Testing

Compare agentic vs non-agentic:
- Response quality (human evaluation)
- Query success rate
- Average latency
- Token usage

### 4. Edge Cases

- No results found
- All results below score threshold
- Conflicting information across results
- Network errors during retrieval

## Benefits

1. **Improved Accuracy**: Iterative refinement catches cases where initial retrieval fails
2. **Better User Experience**: More accurate answers reduce user frustration
3. **Self-Healing**: System can recover from poor initial queries
4. **Transparent Debugging**: `steps` array shows decision process
5. **Configurable**: Can toggle agentic mode via environment variable

## Trade-offs and Considerations

### Latency Impact

| Mode | Latency | Token Usage |
|------|---------|-------------|
| Current (single-pass) | ~500ms | Baseline |
| Agentic (1 retry) | ~1s | +50% |
| Agentic (2 retries) | ~1.5s | +100% |

**Mitigation:**
- Set `AGENTIC_MAX_ITERATIONS=1` for lower latency
- Cache repeated queries
- Use faster model for query refinement

### Cost Impact

- Additional LLM calls for evaluation
- Multiple reranking operations per query
- More tokens for multi-turn conversations

**Estimate:** 2-3x cost per query (worst case)

### Complexity

- More moving parts to debug
- Agent behavior can be non-deterministic
- Requires careful prompt engineering

**Mitigation:**
- Extensive logging
- Clear evaluation criteria
- Fallback to non-agentic mode on errors

## Future Enhancements

1. **Multi-Collection Routing**: Agent analyzes query and decides which collection to use
2. **Query Decomposition**: Break complex questions into sub-queries
3. **Result Synthesis**: Combine information from multiple iterations
4. **Learning from Feedback**: Track which refinements work best
5. **Hybrid Search**: Add keyword/lexical search as fallback

## References

- [AI SDK v6 Documentation - Agents](https://ai-sdk.dev/docs/agents/overview)
- [AI SDK v6 Documentation - Loop Control](https://ai-sdk.dev/docs/agents/loop-control)
- [AI SDK v6 Documentation - Workflow Patterns](https://ai-sdk.dev/docs/agents/workflows)
- [Agentic AI RAG: How Retrieval-Augmented Generation Powers Autonomous AI Systems](https://www.tredence.com/blog/agentic-ai-rag)
- [Agentic RAG: Smarter Retrieval with Autonomous Reasoning](https://dify.ai/blog/agentic-rag-smarter-retrieval-with-autonomous-reasoning)
- [Agentic RAG : A Comprehensive Guide](https://www.kore.ai/blog/what-is-agentic-rag)

## Decision Checklist

Before implementation, confirm:

- [ ] AI SDK version >= 6.0.34 (current: 6.0.44) ✓
- [ ] Willing to accept increased latency (500ms → 1-1.5s)
- [ ] Budget for increased token usage (~2-3x)
- [ ] Team capacity for testing and debugging
- [ ] User feedback mechanism for quality tracking

---

**Status:** Draft - Ready for review and feedback

**Next Steps:**
1. Review plan with team
2. Decide on ToolLoopAgent vs manual loop approach
3. Prototype Phase 1 (agent creation)
4. Set up evaluation metrics
5. Begin implementation
