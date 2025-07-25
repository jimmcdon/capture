'use client'

import { useState } from 'react'

interface SidebarNavigationProps {
  activeWorkspace?: string
  onWorkspaceSelect?: (workspaceId: string) => void
  onNewConversation?: () => void
}

export default function SidebarNavigation({ 
  activeWorkspace, 
  onWorkspaceSelect,
  onNewConversation 
}: SidebarNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const navigationItems = [
    {
      id: 'conversations',
      icon: '💬',
      label: 'Conversations',
      active: true
    },
    {
      id: 'search',
      icon: '🔍',
      label: 'Search',
      active: false
    },
    {
      id: 'analytics',
      icon: '📊',
      label: 'Analytics',
      active: false
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Settings',
      active: false
    }
  ]

  return (
    <div 
      className={`
        fixed left-0 top-0 h-full bg-card border-r border-border/50 shadow-lg transition-all duration-200 ease-in-out z-50
        ${isExpanded ? 'w-64 shadow-2xl' : 'w-16'}
      `}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Header */}
      <div className="flex items-center h-16 px-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-primary-foreground font-semibold text-sm">C</span>
          </div>
          
          {/* App name - only visible when expanded */}
          <div className={`transition-all duration-200 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>
            <span className="font-semibold text-foreground whitespace-nowrap">Capture</span>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-1 p-2 mt-4">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
              ${item.active 
                ? 'bg-accent text-accent-foreground shadow-sm ring-2 ring-ring/10' 
                : 'text-muted-foreground hover:bg-accent/30 hover:text-accent-foreground hover:shadow-sm'
              }
            `}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            <span className={`transition-all duration-200 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden whitespace-nowrap`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Quick Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-border/50">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span className="text-lg flex-shrink-0">➕</span>
          <span className={`transition-all duration-200 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden whitespace-nowrap`}>
            New Chat
          </span>
        </button>
      </div>
    </div>
  )
}