import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages, model } = req.body

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' })
    }

    // Create OpenRouter client
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    })

    // Use Claude 3.5 Sonnet now that credits are available
    const selectedModel = model || process.env.DEFAULT_MODEL || 'anthropic/claude-3-5-sonnet-20241022'
    console.log('Using model:', selectedModel)
    
    const aiModel = openrouter(selectedModel)

    const result = await streamText({
      model: aiModel,
      messages,
      system: `You are a helpful AI assistant for Capture, a personal knowledge management app. Help users organize their thoughts and ideas.`,
    })

    // Use the toDataStreamResponse method which works in Pages Router
    return result.toDataStreamResponse()
    
  } catch (error) {
    console.error('Chat API error:', error)
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message 
    })
  }
}