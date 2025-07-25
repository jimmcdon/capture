import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { prisma } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages, conversationId, title, model, isDiagramRequest } = req.body
    console.log('Received messages:', messages)
    console.log('Conversation ID:', conversationId)
    console.log('Selected model:', model)
    console.log('Is diagram request:', isDiagramRequest)

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

    // Create system prompt based on request type
    let systemPrompt = `You are a helpful AI assistant for Capture, a personal knowledge management app. Help users organize their thoughts and ideas.`
    
    if (isDiagramRequest) {
      systemPrompt = `You are a diagram generation specialist for Capture, a personal knowledge management app. 

When users request diagrams, charts, or visualizations:
1. Generate clean, well-structured Mermaid.js syntax
2. Always wrap your Mermaid code in \`\`\`mermaid code blocks
3. Choose the most appropriate diagram type (flowchart, mindmap, sequence, class, gantt)
4. Make diagrams clear, readable, and properly structured
5. Include a brief explanation of the diagram after the code

For flowcharts: Use flowchart TD or LR syntax
For mindmaps: Use mindmap syntax  
For sequence diagrams: Use sequenceDiagram syntax
For class diagrams: Use classDiagram syntax
For project timelines: Use gantt syntax

Focus on creating visually clear and informative diagrams that help users understand and organize their ideas better.`
    }

    console.log('Making request to OpenRouter...')
    const result = await generateText({
      model: aiModel,
      messages,
      system: systemPrompt,
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