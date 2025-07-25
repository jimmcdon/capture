import { prisma } from '../../lib/db'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const { workspaceId } = req.query
        
        if (!workspaceId) {
          return res.status(400).json({ error: 'Workspace ID is required' })
        }

        const projects = await prisma.project.findMany({
          where: { workspaceId },
          include: {
            conversations: {
              orderBy: { updatedAt: 'desc' }
            }
          },
          orderBy: { updatedAt: 'desc' }
        })
        
        return res.status(200).json(projects)

      case 'POST':
        const { name, workspaceId: wsId } = req.body
        
        if (!name || !wsId) {
          return res.status(400).json({ error: 'Project name and workspace ID are required' })
        }

        const project = await prisma.project.create({
          data: {
            name,
            workspaceId: wsId
          },
          include: {
            conversations: true
          }
        })

        return res.status(201).json(project)

      case 'PUT':
        const { id, name: newName, workspaceId: newWorkspaceId } = req.body
        
        if (!id) {
          return res.status(400).json({ error: 'Project ID is required' })
        }

        const updatedProject = await prisma.project.update({
          where: { id },
          data: {
            ...(newName && { name: newName }),
            ...(newWorkspaceId && { workspaceId: newWorkspaceId })
          },
          include: {
            conversations: true
          }
        })

        return res.status(200).json(updatedProject)

      case 'DELETE':
        const { id: deleteId } = req.body
        
        if (!deleteId) {
          return res.status(400).json({ error: 'Project ID is required' })
        }

        await prisma.project.delete({
          where: { id: deleteId }
        })

        return res.status(200).json({ message: 'Project deleted successfully' })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Project API error:', error)
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message 
    })
  }
}