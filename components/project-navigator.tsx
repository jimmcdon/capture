'use client'

import { useState, useEffect } from 'react'

interface Project {
  id: string
  name: string
  workspaceId: string
  conversations: Conversation[]
  createdAt: string
  updatedAt: string
}

interface Conversation {
  id: string
  title: string
  projectId: string | null
  createdAt: string
  updatedAt: string
}

interface ProjectNavigatorProps {
  activeWorkspaceId: string | null
  onConversationSelect: (conversationId: string) => void
  selectedConversationId: string | null
}

export default function ProjectNavigator({ 
  activeWorkspaceId, 
  onConversationSelect,
  selectedConversationId 
}: ProjectNavigatorProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [inboxConversations, setInboxConversations] = useState<Conversation[]>([])
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (activeWorkspaceId) {
      fetchProjects()
      fetchInboxConversations()
    }
  }, [activeWorkspaceId])

  const fetchProjects = async () => {
    if (!activeWorkspaceId) return

    try {
      const response = await fetch(`/api/projects?workspaceId=${activeWorkspaceId}`)
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchInboxConversations = async () => {
    if (!activeWorkspaceId) return

    try {
      const response = await fetch(`/api/conversations?workspaceId=${activeWorkspaceId}`)
      const data = await response.json()
      setInboxConversations(data)
    } catch (error) {
      console.error('Error fetching inbox conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createProject = async () => {
    if (!newProjectName.trim() || !activeWorkspaceId) return

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newProjectName,
          workspaceId: activeWorkspaceId
        })
      })

      if (response.ok) {
        setNewProjectName('')
        setShowCreateProject(false)
        await fetchProjects()
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  if (isLoading || !activeWorkspaceId) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-16"></div>
          <div className="h-6 bg-muted rounded"></div>
          <div className="h-6 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-foreground">Projects</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Inbox Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-muted-foreground">📥 Inbox</h4>
            <span className="text-xs text-muted-foreground">
              {inboxConversations.length}
            </span>
          </div>
          
          <div className="space-y-1">
            {inboxConversations.map(conversation => (
              <button
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`w-full text-left p-2 text-sm rounded-md transition-colors ${
                  selectedConversationId === conversation.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                }`}
              >
                <div className="truncate">{conversation.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(conversation.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))}
            
            {inboxConversations.length === 0 && (
              <div className="text-xs text-muted-foreground p-2">
                No conversations in inbox
              </div>
            )}
          </div>
        </div>

        {/* Projects Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-muted-foreground">Projects</h4>
            <span className="text-xs text-muted-foreground">
              {projects.length}
            </span>
          </div>

          <div className="space-y-4">
            {projects.map(project => (
              <div key={project.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">📁 {project.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({project.conversations.length})
                  </span>
                </div>
                
                <div className="ml-4 space-y-1">
                  {project.conversations.map(conversation => (
                    <button
                      key={conversation.id}
                      onClick={() => onConversationSelect(conversation.id)}
                      className={`w-full text-left p-2 text-sm rounded-md transition-colors ${
                        selectedConversationId === conversation.id
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className="truncate">{conversation.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                  
                  {project.conversations.length === 0 && (
                    <div className="text-xs text-muted-foreground p-2">
                      No conversations
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Create New Project */}
          <div className="mt-4">
            {showCreateProject ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name"
                  className="w-full px-2 py-1 text-sm border border-input rounded-md bg-background"
                  onKeyDown={(e) => e.key === 'Enter' && createProject()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={createProject}
                    className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateProject(false)
                      setNewProjectName('')
                    }}
                    className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateProject(true)}
                className="w-full p-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded-md hover:border-accent transition-colors"
              >
                + New Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}