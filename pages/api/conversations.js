import { prisma } from '../../lib/db'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const { projectId, workspaceId, conversationId } = req.query
        
        // Get single conversation with all messages
        if (conversationId) {
          const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
              messages: {
                orderBy: { createdAt: 'asc' }
              },
              project: true,
              links: {
                include: {
                  targetConversation: true
                }
              },
              linkedBy: {
                include: {
                  sourceConversation: true
                }
              },
              dependencies: {
                include: {
                  blockingConversation: true
                }
              },
              dependencyFor: {
                include: {
                  dependentConversation: true
                }
              }
            }
          })
          
          if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' })
          }
          
          return res.status(200).json(conversation)
        }
        
        // Get conversations for a project
        if (projectId) {
          const conversations = await prisma.conversation.findMany({
            where: { projectId },
            include: {
              messages: {
                orderBy: { createdAt: 'asc' },
                take: 1 // Just the first message for preview
              }
            },
            orderBy: { updatedAt: 'desc' }
          })
          
          return res.status(200).json(conversations)
        }
        
        // Get inbox conversations (no project) for a workspace
        if (workspaceId) {
          const conversations = await prisma.conversation.findMany({
            where: { 
              projectId: null,
              project: {
                workspaceId
              }
            },
            include: {
              messages: {
                orderBy: { createdAt: 'asc' },
                take: 1
              }
            },
            orderBy: { updatedAt: 'desc' }
          })
          
          return res.status(200).json(conversations)  
        }
        
        return res.status(400).json({ error: 'Project ID, workspace ID, or conversation ID is required' })

      case 'POST':
        const { title, projectId: projId, workspaceId: wsId } = req.body
        
        if (!title) {
          return res.status(400).json({ error: 'Conversation title is required' })
        }

        const conversation = await prisma.conversation.create({
          data: {
            title,
            projectId: projId || null // Can be null for inbox items
          },
          include: {
            messages: true,
            project: true
          }
        })

        return res.status(201).json(conversation)

      case 'PUT':
        const { 
          id, 
          title: newTitle, 
          projectId: newProjectId 
        } = req.body
        
        if (!id) {
          return res.status(400).json({ error: 'Conversation ID is required' })
        }

        const updatedConversation = await prisma.conversation.update({
          where: { id },
          data: {
            ...(newTitle && { title: newTitle }),
            ...(newProjectId !== undefined && { projectId: newProjectId })
          },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            },
            project: true
          }
        })

        return res.status(200).json(updatedConversation)

      case 'DELETE':
        const { id: deleteId } = req.body
        
        if (!deleteId) {
          return res.status(400).json({ error: 'Conversation ID is required' })
        }

        await prisma.conversation.delete({
          where: { id: deleteId }
        })

        return res.status(200).json({ message: 'Conversation deleted successfully' })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Conversation API error:', error)
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message 
    })
  }
}