import { prisma } from '../../lib/db'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const workspaces = await prisma.workspace.findMany({
          include: {
            projects: {
              include: {
                conversations: {
                  orderBy: { updatedAt: 'desc' },
                  take: 5 // Latest 5 conversations per project
                }
              }
            }
          },
          orderBy: { updatedAt: 'desc' }
        })
        
        return res.status(200).json(workspaces)

      case 'POST':
        const { name, isActive } = req.body
        
        if (!name) {
          return res.status(400).json({ error: 'Workspace name is required' })
        }

        // If this workspace should be active, set all others to inactive
        if (isActive) {
          await prisma.workspace.updateMany({
            data: { isActive: false }
          })
        }

        const workspace = await prisma.workspace.create({
          data: {
            name,
            isActive: isActive || false
          }
        })

        return res.status(201).json(workspace)

      case 'PUT':
        const { id, name: newName, isActive: newIsActive } = req.body
        
        if (!id) {
          return res.status(400).json({ error: 'Workspace ID is required' })
        }

        // If setting this workspace as active, deactivate others
        if (newIsActive) {
          await prisma.workspace.updateMany({
            data: { isActive: false }
          })
        }

        const updatedWorkspace = await prisma.workspace.update({
          where: { id },
          data: {
            ...(newName && { name: newName }),
            ...(newIsActive !== undefined && { isActive: newIsActive })
          }
        })

        return res.status(200).json(updatedWorkspace)

      case 'DELETE':
        const { id: deleteId } = req.body
        
        if (!deleteId) {
          return res.status(400).json({ error: 'Workspace ID is required' })
        }

        await prisma.workspace.delete({
          where: { id: deleteId }
        })

        return res.status(200).json({ message: 'Workspace deleted successfully' })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Workspace API error:', error)
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message 
    })
  }
}