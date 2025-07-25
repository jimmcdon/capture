import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { prisma } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages, conversationId, title, model } = req.body
    console.log('Received messages:', messages)
    console.log('Conversation ID:', conversationId)
    console.log('Selected model:', model)

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' })
    }

    // Create OpenRouter client
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    })

    // Use the selected model or default to Claude 3.5 Sonnet
    const selectedModel = model || 'anthropic/claude-3-5-sonnet-20241022'
    const aiModel = openrouter(selectedModel)

    console.log('Making request to OpenRouter...')
    const result = await generateText({
      model: aiModel,
      messages,
      system: `You are a helpful AI assistant for Capture, a personal knowledge management app. Help users organize their thoughts and ideas.`,
    })

    console.log('Got response from OpenRouter:', result.text.substring(0, 100) + '...')

    // Handle conversation persistence
    let currentConversationId = conversationId
    
    // Create new conversation if none exists
    if (!currentConversationId && title) {
      console.log('Creating new conversation:', title)
      const newConversation = await prisma.conversation.create({
        data: {
          title,
          projectId: null // Default to inbox
        }
      })
      currentConversationId = newConversation.id
    }

    // Save the user message if we have a conversation
    if (currentConversationId && messages.length > 0) {
      const lastUserMessage = messages[messages.length - 1]
      if (lastUserMessage.role === 'user') {
        await prisma.message.create({
          data: {
            conversationId: currentConversationId,
            role: 'user',
            content: lastUserMessage.content
          }
        })
      }
    }

    // Save the AI response
    if (currentConversationId) {
      await prisma.message.create({
        data: {
          conversationId: currentConversationId,
          role: 'assistant',
          content: result.text
        }
      })
    }

    // Return response in the exact format useChat expects, including conversation ID
    res.status(200).json({
      id: Date.now().toString(),
      object: 'chat.completion',
      created: Date.now(),
      model: selectedModel,
      conversationId: currentConversationId,
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