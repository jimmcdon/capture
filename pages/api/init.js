import { prisma } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check if we already have workspaces
    const existingWorkspaces = await prisma.workspace.findMany()
    
    if (existingWorkspaces.length > 0) {
      return res.status(200).json({ 
        message: 'Database already initialized',
        workspaces: existingWorkspaces 
      })
    }

    // Create default workspace
    const defaultWorkspace = await prisma.workspace.create({
      data: {
        name: 'Personal',
        isActive: true
      }
    })

    // Create a default project in the workspace
    const defaultProject = await prisma.project.create({
      data: {
        name: 'General Ideas',
        workspaceId: defaultWorkspace.id
      }
    })

    return res.status(201).json({
      message: 'Database initialized successfully',
      workspace: defaultWorkspace,
      project: defaultProject
    })

  } catch (error) {
    console.error('Init API error:', error)
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message 
    })
  }
}