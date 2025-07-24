import { streamText } from 'ai'
import { createAIModel } from '@/lib/ai'

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json()

    // Create AI model instance (use provided model or default)
    const aiModel = createAIModel(model)

    const result = streamText({
      model: aiModel,
      messages,
      system: `You are a helpful AI assistant for Capture, a personal knowledge management app. 
      
Your role is to help users:
- Capture and organize their thoughts and ideas
- Develop concepts through conversation
- Analyze and summarize content they share
- Generate diagrams when requested (use Mermaid syntax)
- Connect related ideas and concepts

Be conversational, insightful, and help users think through their ideas clearly.`,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}