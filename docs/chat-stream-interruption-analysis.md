# Chat Stream Interruption Analysis

## Issue Summary

The chatbot sometimes stops streaming mid-response, leaving partial answers incomplete. This document analyzes the root causes and proposes solutions based on a thorough investigation of the codebase and AI SDK documentation.

## Investigation Scope

**Files Analyzed:**
- [server/api/chat/index.post.ts](../server/api/chat/index.post.ts) - Main chat API endpoint
- [lib/chat/providers.ts](../lib/chat/providers.ts) - LLM provider configuration
- [lib/chat/config.ts](../lib/chat/config.ts) - Chat configuration
- [lib/chat/tools.ts](../lib/chat/tools.ts) - Tool implementations (search, guard)
- [lib/chat/guard.ts](../lib/chat/guard.ts) - Content moderation guard
- [pages/chat.vue](../pages/chat.vue) - Client-side chat UI
- [components/TclConversation.vue](../components/TclConversation.vue) - Conversation display component
- [components/ai-elements/response/Response.vue](../components/ai-elements/response/Response.vue) - Markdown response renderer
- [plugins/citation-hydration.client.ts](../plugins/citation-hydration.client.ts) - Citation hydration plugin

**AI SDK Documentation Reviewed:**
- Stream abort handling
- Timeout configuration
- `consumeStream` utility
- `stepCountIs` stop conditions
- `smoothStream` transformer
- UI message streaming

---

## Root Causes Identified

### 1. **Missing `consumeStream` in UI Message Stream Response** (HIGH PRIORITY)

**Location:** [server/api/chat/index.post.ts:98](../server/api/chat/index.post.ts#L98)

**Issue:** The `createUIMessageStreamResponse` is called without the `consumeSseStream` parameter. According to [AI SDK docs on stream abort handling](../node_modules/ai/docs/09-troubleshooting/14-stream-abort-handling.mdx):

> Without `consumeStream`, the `onFinish` callback has no chance to execute when the stream is aborted, preventing important cleanup operations.

**Current Code:**
```typescript
return createUIMessageStreamResponse({ stream })
```

**Impact:** When the client disconnects or a network interruption occurs, the stream may not properly close, leaving orphaned connections and potentially causing incomplete responses to be displayed.

---

### 2. **Stop Condition at 20 Steps** (MEDIUM PRIORITY)

**Location:** [server/api/chat/index.post.ts:55](../server/api/chat/index.post.ts#L55)

**Issue:** The chat uses `stopWhen: stepCountIs(20)` which limits the tool-calling loop to 20 steps. While this prevents infinite loops, it may truncate legitimate multi-step reasoning.

**Analysis:**
- Each tool call (search, guard) counts as a step
- Complex queries may require multiple search iterations
- The default in AI SDK is `stepCountIs(20)` for tool-loop agents

**Current Configuration:**
```typescript
stopWhen: stepCountIs(20),
```

**Potential Issue:** If the LLM needs more than 20 steps to fully answer a complex question (e.g., multiple searches, guard checks, reasoning), the stream will terminate abruptly without completing the final text response.

---

### 3. **Guard Tool Timeout Fallback** (MEDIUM PRIORITY)

**Location:** [lib/chat/guard.ts:17-18](../lib/chat/guard.ts#L17-L18)

**Issue:** The guard tool has a 5-second hard timeout that returns "not blocked" on failure:

```typescript
const timeoutPromise = new Promise<never>((_, reject) =>
  setTimeout(() => reject(new Error('AI Guard timeout')), 5000),
)
```

**Impact:** If the guard LLM times out, it allows the content through (fail-open). This is noted as a "temp fix" in the code comments. While this doesn't directly cause stream interruption, it creates unpredictable behavior where content moderation may be silently bypassed.

**Recommendation:** The 5-second timeout should be increased or the LLM-based guard should be replaced with a faster alternative (e.g., deterministic rules or local model).

---

### 4. **SmoothStream Delay Configuration** (LOW-MEDIUM PRIORITY)

**Location:** [server/api/chat/index.post.ts:67-69](../server/api/chat/index.post.ts#L67-L69)

**Current Configuration:**
```typescript
experimental_transform: smoothStream({
  delayInMs: 20,
}),
```

**Issue:** The `smoothStream` transformer adds a 20ms delay between chunks. While this creates smoother visual output, it can contribute to perceived slowness and may interact poorly with network interruptions.

**From AI SDK docs:** The `delayInMs` parameter adds delays between outputting chunks. With slower connections, this additional delay could cause the stream to appear stuck.

---

### 5. **No Abort Signal Forwarding** (MEDIUM PRIORITY)

**Location:** [server/api/chat/index.post.ts:48-79](../server/api/chat/index.post.ts#L48-L79)

**Issue:** The `streamText` call doesn't include an `abortSignal` parameter. Without forwarding the request's abort signal:

1. The LLM API call cannot be cancelled when the user clicks "Stop"
2. Orphaned requests continue consuming server resources
3. The `onAbort` callback cannot be triggered

**AI SDK Recommendation:**
> Forward the abort signal from the request to enable proper stream cancellation and resource cleanup.

---

### 6. **Missing Error Handling for Stream Consumption** (LOW PRIORITY)

**Location:** [server/api/chat/index.post.ts:88-95](../server/api/chat/index.post.ts#L88-L95)

**Current Code:**
```typescript
onError: (error) => {
  captureException(error, {
    extra: { userId, selectedModel, messages },
  })
  return error instanceof Error ? error.message : String(error)
},
```

**Issue:** The error handler captures exceptions but doesn't differentiate between stream interruption errors (which might be transient) and fatal errors. Some stream errors might be recoverable with a retry.

---

### 7. **Markdown Rendering Synchronous Blocking** (LOW PRIORITY)

**Location:** [components/ai-elements/response/markdown.ts:19-23](../components/ai-elements/response/markdown.ts#L19-L23)

**Current Code:**
```typescript
export async function renderMarkdown(markdown: string): Promise<string> {
  const html = await marked.parse(markdown)
  return html
}
```

**Issue:** The markdown parsing is done via `await` on every text update. For large responses or slow devices, this could cause rendering delays that manifest as apparent stream interruptions.

---

### 8. **No Request Timeout Configuration** (HIGH PRIORITY for Vercel)

**Location:** N/A (Missing from [server/api/chat/index.post.ts](../server/api/chat/index.post.ts))

**Issue:** There's no `maxDuration` export for the Nuxt/Vercel serverless function. According to [AI SDK timeout documentation](../node_modules/ai/docs/09-troubleshooting/06-timeout-on-vercel.mdx):

> Streaming works locally but gets chopped off when deployed to Vercel due to default function duration limits.

**Vercel Limits:**
- Hobby: 300 seconds (5 minutes)
- Pro: 800 seconds (~13 minutes)
- Enterprise: 800 seconds

**Recommendation:** Add `export const maxDuration = 300` to ensure explicit timeout handling.

---

## Proposed Solutions

### Priority 1: Critical Fixes

#### 1.1 Add `consumeStream` to Stream Response

**File:** [server/api/chat/index.post.ts](../server/api/chat/index.post.ts)

```typescript
import { consumeStream } from 'ai'

// Replace line 98:
return createUIMessageStreamResponse({
  stream,
  consumeSseStream: consumeStream, // ADD THIS
})
```

**Benefit:** Ensures proper stream cleanup and `onFinish` callback execution even on abort.

---

#### 1.2 Add Abort Signal Forwarding

**File:** [server/api/chat/index.post.ts](../server/api/chat/index.post.ts)

```typescript
export default defineLazyEventHandler(() => {
  return defineEventHandler(async (event) => {
    // ... existing code ...

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 290000) // 4:50 timeout

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          // ... existing config ...
          abortSignal: event.node.req.signal || controller.signal, // ADD THIS
          onAbort: ({ steps }) => { // ADD THIS
            console.log('Stream aborted after', steps.length, 'steps')
          },
          // ... rest of config ...
        })
        // ... rest of code ...
      },
    })

    clearTimeout(timeout) // Clear timeout on completion
    return createUIMessageStreamResponse({ stream, consumeSseStream: consumeStream })
  })
})
```

**Benefit:** Enables proper cancellation when user clicks stop or navigates away.

---

#### 1.3 Add Vercel maxDuration

**File:** [server/api/chat/index.post.ts](../server/api/chat/index.post.ts)

```typescript
// Add at the top of the file, after imports:
export const maxDuration = 300 // 5 minutes - adjust based on Vercel plan
```

**Benefit:** Prevents Vercel from cutting off long responses unexpectedly.

---

### Priority 2: Important Improvements

#### 2.1 Add onFinish Callback with Abort Detection

**File:** [server/api/chat/index.post.ts](../server/api/chat/index.post.ts)

```typescript
const result = streamText({
  // ... existing config ...
  onFinish: async ({ isAborted, finishReason }) => { // ADD THIS
    if (isAborted) {
      console.log('Stream was aborted by client')
      captureMessage('Chat stream aborted', {
        level: 'info',
        extra: { userId, selectedModel, finishReason },
      })
    } else if (finishReason === 'stop') {
      console.log('Stream completed normally')
    } else if (finishReason === 'length') {
      console.log('Stream stopped due to token limit')
    }
  },
  // ... rest of config ...
})
```

**Benefit:** Better observability into why streams stop.

---

#### 2.2 Increase stepCountIs Limit or Remove It

**File:** [server/api/chat/index.post.ts](../server/api/chat/index.post.ts)

**Option A - Increase limit:**
```typescript
stopWhen: stepCountIs(50), // Increased from 20
```

**Option B - Remove explicit limit (use default):**
```typescript
// Remove the stopWhen line entirely to use AI SDK default behavior
```

**Benefit:** Prevents premature termination of complex multi-step queries.

---

#### 2.3 Add Retries with Exponential Backoff

**Current code has `maxRetries: 3`** but consider adding explicit error handling:

```typescript
const result = streamText({
  // ... existing config ...
  maxRetries: 3,
  retryOnRetryableError: (error) => {
    // Log retry attempts
    console.warn('Retrying stream request:', error.message)
    return true
  },
  // ... rest of config ...
})
```

---

### Priority 3: Nice-to-Have Enhancements

#### 3.1 Optimize Markdown Rendering

**File:** [components/ai-elements/response/Response.vue](../components/ai-elements/response/Response.vue)

Consider debouncing the markdown render for large updates:

```typescript
let renderTimeout: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.value,
  async (newValue) => {
    if (typeof newValue === 'string') {
      // Debounce rapid updates
      if (renderTimeout) clearTimeout(renderTimeout)
      renderTimeout = setTimeout(async () => {
        const rendered = await renderMarkdown(newValue)
        content.value = rendered
      }, 50) // 50ms debounce
    }
  },
  { immediate: true },
)
```

---

#### 3.2 Add Client-Side Stream Monitoring

**File:** [pages/chat.vue](../pages/chat.vue)

Add monitoring for stream health:

```typescript
const chat = new Chat({
  // ... existing config ...
  onData: (data) => {
    console.log('Chat data:', data)
  },
  onError: (error) => {
    captureException(error)
    console.error('Chat error:', error)

    // Detect specific error types
    if (error.message.includes('timeout')) {
      toast.error('Request timed out. Please try again.')
    } else if (error.message.includes('aborted')) {
      toast.info('Request was cancelled.')
    } else {
      toast.error('An error occurred while processing your request.')
    }
  },
})
```

---

## Client-Side Considerations

The client-side implementation using `@ai-sdk/vue`'s `Chat` class appears sound. The [Chat class](../node_modules/@ai-sdk/vue/src/chat.vue.ts) properly extends `AbstractChat` and handles:

- Message state management via Vue reactivity
- Status tracking (`ready`, `submitted`, `streaming`, `error`)
- Stop functionality via `chat.stop()`

**One observation:** The `stop` button in [TclPromptInput.vue](../components/TclPromptInput.vue) (referenced in chat.vue) properly calls `chat.stop()`, which should trigger the abort signal. This reinforces the importance of properly forwarding the abort signal on the server side.

---

## Testing Recommendations

To validate these fixes, test the following scenarios:

1. **Network interruption test:** Start a query, then disable network mid-stream, re-enable, and verify recovery or proper error handling.

2. **Stop button test:** Start a query, click stop, verify the stream terminates cleanly and can start a new query.

3. **Long response test:** Ask a question that requires >20 steps of tool calling (multiple searches, guard checks) to verify the stepCountIs limit doesn't truncate.

4. **Vercel deployment test:** Deploy to Vercel and test with long-running queries to verify maxDuration is respected.

5. **Concurrent request test:** Start multiple simultaneous chats to verify rate limiting and connection handling.

---

## Monitoring and Observability

Add the following metrics to track stream health:

```typescript
// In server/api/chat/index.post.ts
const startTime = Date.now()

const result = streamText({
  // ... config ...
  onFinish: async ({ isAborted, finishReason, usage }) => {
    const duration = Date.now() - startTime
    console.log('Stream finished:', {
      duration,
      isAborted,
      finishReason,
      totalTokens: usage?.totalTokens,
    })

    // Send to analytics/monitoring
    captureMessage('Chat stream completed', {
      level: 'info',
      extra: {
        duration,
        finishReason,
        tokenCount: usage?.totalTokens,
        userId,
        selectedModel,
      },
    })
  },
})
```

---

## Summary

| Issue | Priority | Impact | Fix Complexity |
|-------|----------|--------|----------------|
| Missing `consumeStream` | HIGH | Stream cleanup, abort handling | Low |
| No abort signal forwarding | MEDIUM | Cannot cancel requests, resource leaks | Low |
| No `maxDuration` for Vercel | HIGH | Responses cut off at 5 min default | Low |
| `stepCountIs(20)` limit | MEDIUM | Complex queries truncated | Low |
| Guard tool timeout | MEDIUM | Content moderation bypassed | Medium |
| `smoothStream` delay | LOW | Perceived slowness | Low |
| Markdown rendering | LOW | Rendering delays on large responses | Medium |

**Recommended Implementation Order:**
1. Add `consumeStream` (5 minutes)
2. Add abort signal forwarding (10 minutes)
3. Add `maxDuration` export (2 minutes)
4. Remove or increase `stepCountIs` limit (2 minutes)
5. Add comprehensive logging and monitoring (30 minutes)
6. Implement remaining improvements as time permits

---

## References

- [AI SDK: Stopping Streams](../node_modules/ai/docs/06-advanced/02-stopping-streams.mdx)
- [AI SDK: Stream Abort Handling](../node_modules/ai/docs/09-troubleshooting/14-stream-abort-handling.mdx)
- [AI SDK: Vercel Timeouts](../node_modules/ai/docs/09-troubleshooting/06-timeout-on-vercel.mdx)
- [AI SDK: stepCountIs Reference](../node_modules/ai/docs/07-reference/01-ai-sdk-core/70-step-count-is.mdx)
- [AI SDK: smoothStream Reference](../node_modules/ai/docs/07-reference/01-ai-sdk-core/80-smooth-stream.mdx)
- [AI SDK: createUIMessageStreamResponse](../node_modules/ai/docs/07-reference/02-ai-sdk-ui/41-create-ui-message-stream-response.mdx)
