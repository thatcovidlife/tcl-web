import { ToolLoopAgent, stepCountIs } from 'ai'
import { model } from './providers'
import { searchTool, guardTool } from './tools'
import { config } from './config'
import { z } from 'zod'
import { defaultModel } from './providers'

/**
 * Agentic RAG agent that iteratively searches and evaluates results.
 *
 * The agent will:
 * 1. Use getInformation to search for relevant documents
 * 2. Evaluate the results you receive:
 *   - Check the "averageScore" field (if provided): values below threshold indicate poor relevance
 *   - Check the "content" fields: ensure they actually address the user's question
 *   - Look for missing key information
 * 3. If results are insufficient:
 *    - Refine the query with different terminology or synonyms
 *    - Try the alternative collection (general ↔ lancet)
 *    - Break complex questions into sub-queries
 *    - Try searching again (max attempts total)
 * 4. When satisfied, generate the final answer as text (not a tool call)
 *
 * Key evaluation criteria:
 * - Rerank scores below the threshold indicate poor relevance
 * - Content that doesn't address the core question is insufficient
 * - Missing key information means you should try again
 */
export const searchAgent = new ToolLoopAgent({
  model: model.languageModel(defaultModel),
  tools: {
    getInformation: searchTool,
    checkContent: guardTool,
  },
  // Define call options schema for dynamic configuration
  callOptionsSchema: z.object({
    selectedModel: z
      .string()
      .describe('The model to use for generation (e.g., openai/gpt-4o)'),
    systemPrompt: z
      .string()
      .optional()
      .describe('Additional system instructions'),
    currentDate: z.string().optional().describe('Current date for context'),
  }),
  prepareCall: ({ options, ...settings }) => {
    // Build the instructions with dynamic content
    const thresholdText = `below ${config.agenticMinScoreThreshold}`
    const maxAttemptsText = `${config.agenticMaxIterations}`

    // Use the selected model if provided, otherwise use default
    const languageModel = options?.selectedModel
      ? model.languageModel(options.selectedModel as any)
      : model.languageModel('openai/gpt-oss-120b')

    console.log('searchAgent: using model', languageModel.modelId)

    let instructions = `You are a research assistant that helps find information from a knowledge base to answer COVID-19 related questions.

Your process:
1. Use getInformation to search for relevant documents (you can call it multiple times with refined queries if needed)
2. Evaluate the results you receive:
   - Check the "averageScore" field: values ${thresholdText} indicate poor relevance
   - Check the "content" fields: ensure they actually address the user's question
   - Look for missing key information
3. If results are insufficient:
   - Refine the query using different terminology or synonyms
   - Try the alternative collection (general or lancet)
   - Break complex questions into sub-queries
   - Try searching again (max ${maxAttemptsText} search attempts total)
4. When you have sufficient information, provide your final answer as regular text (NOT a tool call)

Key evaluation criteria:
- Rerank scores ${thresholdText} indicate poor relevance
- Content that doesn't address the core question is insufficient
- Missing key information means you should try again
- If no results are found, try rephrasing your query

When providing your final answer:
- Provide a clear, comprehensive answer based on the search results
- List all sources/references used
- If information is missing, acknowledge it honestly
- Always cite sources using markdown links: [Title](url)`

    // Append dynamic system prompt if provided
    if (options?.systemPrompt) {
      instructions += `\n\n${options.systemPrompt}`
    }

    // Append current date if provided
    if (options?.currentDate) {
      instructions += `\n\nCurrent date: ${options.currentDate}`
    }

    return {
      ...settings,
      instructions,
      model: languageModel,
    }
  },
  stopWhen: [
    stepCountIs(50), // Absolute max steps (safety limit)
  ],
  toolChoice: 'required', // Require at least one tool call before generating text
})
