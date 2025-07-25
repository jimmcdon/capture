'use client'

import { useState, useEffect } from 'react'

interface Workspace {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function WorkspaceSwitcher() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch workspaces on component mount
  useEffect(() => {
    fetchWorkspaces()
  }, [])

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces')
      const data = await response.json()
      setWorkspaces(data)
      
      // Find active workspace
      const active = data.find((ws: Workspace) => ws.isActive)
      setActiveWorkspace(active || null)
    } catch (error) {
      console.error('Error fetching workspaces:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createWorkspace = async () => {
    if (!newWorkspaceName.trim()) return

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newWorkspaceName,
          isActive: true // Make new workspace active
        })
      })

      if (response.ok) {
        setNewWorkspaceName('')
        setShowCreateForm(false)
        await fetchWorkspaces() // Refresh the list
      }
    } catch (error) {
      console.error('Error creating workspace:', error)
    }
  }

  const switchWorkspace = async (workspaceId: string) => {
    try {
      const response = await fetch('/api/workspaces', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: workspaceId,
          isActive: true
        })
      })

      if (response.ok) {
        await fetchWorkspaces() // Refresh to get updated active state
      }
    } catch (error) {
      console.error('Error switching workspace:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-24 mb-3"></div>
          <div className="h-8 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 border-b border-border">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-muted-foreground">Workspace</h2>
      </div>

      {/* Active Workspace Display */}
      {activeWorkspace && (
        <div className="mb-3">
          <div className="flex items-center justify-between p-2 bg-accent rounded-md">
            <span className="font-medium text-accent-foreground">
              {activeWorkspace.name}
            </span>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
        </div>
      )}

      {/* Workspace List */}
      {workspaces.length > 1 && (
        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-2">Switch to:</div>
          <div className="space-y-1">
            {workspaces
              .filter(ws => !ws.isActive)
              .map(workspace => (
                <button
                  key={workspace.id}
                  onClick={() => switchWorkspace(workspace.id)}
                  className="w-full text-left p-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                >
                  {workspace.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Create New Workspace */}
      {showCreateForm ? (
        <div className="space-y-2">
          <input
            type="text"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="Workspace name"
            className="w-full px-2 py-1 text-sm border border-input rounded-md bg-background"
            onKeyDown={(e) => e.key === 'Enter' && createWorkspace()}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={createWorkspace}
              className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false)
                setNewWorkspaceName('')
              }}
              className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full p-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded-md hover:border-accent transition-colors"
        >
          + New Workspace
        </button>
      )}
    </div>
  )
}