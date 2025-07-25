'use client'

import { useState, useEffect } from 'react'
import CaptureLayout from '../components/capture-layout'
import WorkspaceSwitcher from '../components/workspace-switcher'
import ProjectNavigator from '../components/project-navigator'
import ChatEnhanced from '../components/chat-enhanced'

interface Workspace {
  id: string
  name: string
  isActive: boolean
}

export default function Home() {
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  // Fetch active workspace on mount
  useEffect(() => {
    fetchActiveWorkspace()
  }, [])

  const fetchActiveWorkspace = async () => {
    try {
      const response = await fetch('/api/workspaces')
      const workspaces = await response.json()
      const active = workspaces.find((ws: Workspace) => ws.isActive)
      setActiveWorkspace(active || null)
    } catch (error) {
      console.error('Error fetching active workspace:', error)
    }
  }

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId)
  }

  const handleNewConversation = (conversationId: string, title: string) => {
    setSelectedConversationId(conversationId)
    // Could trigger a refresh of the project navigator here
  }

  const leftPanel = (
    <div className="flex flex-col h-full">
      <WorkspaceSwitcher />
      <div className="flex-1">
        <ProjectNavigator 
          activeWorkspaceId={activeWorkspace?.id || null}
          onConversationSelect={handleConversationSelect}
          selectedConversationId={selectedConversationId}
        />
      </div>
    </div>
  )

  const centerPanel = (
    <div className="p-4 h-full">
      <div className="text-center text-muted-foreground py-8">
        <div className="text-2xl mb-2">📋</div>
        <p className="text-sm">Conversation Details</p>
        <p className="text-xs mt-2">Future: Links, dependencies, metadata</p>
      </div>
    </div>
  )

  const rightPanel = (
    <ChatEnhanced 
      conversationId={selectedConversationId}
      onNewConversation={handleNewConversation}
    />
  )

  return (
    <CaptureLayout 
      leftPanel={leftPanel}
      centerPanel={centerPanel}
      rightPanel={rightPanel}
    />
  )
}