import { createOpenAI } from '@ai-sdk/openai'

// Create OpenRouter client using OpenAI-compatible interface
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

// Default model instance  
export const aiModel = openrouter(process.env.DEFAULT_MODEL || 'anthropic/claude-3-5-sonnet-20241022')

// Available models for selection
export const availableModels = [
  {
    id: 'anthropic/claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Best for conversational AI and complex reasoning'
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI', 
    description: 'Excellent for general tasks and coding'
  },
  {
    id: 'google/gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Good for analysis and multimodal tasks'
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    description: 'Open-source model, cost-effective'
  }
]

// Helper to create model instance
export function createAIModel(modelId?: string) {
  const model = modelId || process.env.DEFAULT_MODEL || 'anthropic/claude-3-5-sonnet-20241022'
  return openrouter(model)
}