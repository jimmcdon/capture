import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages } = req.body
    console.log('Received messages:', messages)

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' })
    }

    // Create OpenRouter client
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    })

    // Use Claude 3.5 Sonnet now that credits are available
    const aiModel = openrouter('anthropic/claude-3-5-sonnet-20241022')

    console.log('Making request to OpenRouter...')
    const result = await generateText({
      model: aiModel,
      messages,
      system: `You are a helpful AI assistant for Capture, a personal knowledge management app. Help users organize their thoughts and ideas.`,
    })

    console.log('Got response from OpenRouter:', result.text.substring(0, 100) + '...')

    // Return response in the exact format useChat expects
    res.status(200).json({
      id: Date.now().toString(),
      object: 'chat.completion',
      created: Date.now(),
      model: 'anthropic/claude-3-5-sonnet-20241022',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: result.text
          },
          finish_reason: 'stop'
        }
      ]
    })
    
  } catch (error) {
    console.error('Simple chat error:', error)
    return res.status(500).json({ 
      error: 'Error',
      details: error.message 
    })
  }
}