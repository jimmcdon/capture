'use client'

import { useState, useEffect } from 'react'

interface Conversation {
  id: string
  title: string
  updatedAt: string
  preview?: string
  status?: 'active' | 'archived'
  messageCount?: number
}

interface ConversationListProps {
  selectedConversationId?: string | null
  onConversationSelect: (conversationId: string) => void
  onToggleChat?: () => void
  isChatOpen?: boolean
}

export default function ConversationList({ 
  selectedConversationId, 
  onConversationSelect,
  onToggleChat,
  isChatOpen = false
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      // This would fetch from your API
      // For now, using mock data that matches Midday's style
      const mockConversations: Conversation[] = [
        {
          id: '1',
          title: 'Project Planning Discussion',
          updatedAt: '2025-01-25',
          preview: 'Let me create a flowchart for the new project workflow...',
          status: 'active',
          messageCount: 12
        },
        {
          id: '2', 
          title: 'Marketing Strategy Ideas',
          updatedAt: '2025-01-24',
          preview: 'Could you help me brainstorm some marketing approaches?',
          status: 'active',
          messageCount: 8
        },
        {
          id: '3',
          title: 'Technical Architecture Review',
          updatedAt: '2025-01-23',
          preview: 'Show me a diagram of the system architecture',
          status: 'active',
          messageCount: 15
        }
      ]
      
      setConversations(mockConversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.preview?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex flex-col h-full bg-card border-r border-border/50 shadow-sm">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">Conversations</h1>
          <div className="flex items-center gap-2">
            {onToggleChat && (
              <button 
                onClick={onToggleChat}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
                title={isChatOpen ? 'Close chat panel' : 'Open chat panel'}
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {isChatOpen ? (
                    // Close icon (panels with arrow pointing right)
                    <>
                      <rect x="3" y="3" width="8" height="18" rx="1" strokeWidth="1.5"/>
                      <rect x="13" y="3" width="8" height="18" rx="1" strokeWidth="1.5"/>
                      <path d="M16 12l2-2m0 0l2 2m-2-2v4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </>
                  ) : (
                    // Open icon (panels with arrow pointing left)
                    <>
                      <rect x="3" y="3" width="18" height="18" rx="1" strokeWidth="1.5"/>
                      <path d="M8 12l-2-2m0 0l-2 2m2-2v4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="13" y1="3" x2="13" y2="21" strokeWidth="1.5"/>
                    </>
                  )}
                </svg>
              </button>
            )}
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200">
              <span className="text-base">⋯</span>
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-muted-foreground text-sm">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search or filter"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted border-0 rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 shadow-sm transition-shadow duration-200 focus:shadow-md"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto relative">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                  <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`
                  w-full p-4 text-left rounded-xl border transition-all duration-200 mb-2 group
                  ${selectedConversationId === conversation.id
                    ? 'bg-accent border-accent-foreground/20 shadow-md ring-2 ring-ring/10'
                    : 'bg-card border-border/30 hover:bg-accent/30 hover:border-border/60 hover:shadow-sm'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-foreground text-sm truncate pr-2">
                    {conversation.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(conversation.updatedAt)}
                    </span>
                    {conversation.status === 'active' && (
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                    )}
                  </div>
                </div>
                
                {conversation.preview && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {conversation.preview}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {conversation.messageCount} messages
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ✓ Synced
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {/* Empty state when no conversation selected */}
        {!selectedConversationId && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl opacity-50">💬</span>
              </div>
              <h3 className="text-base font-medium text-muted-foreground mb-2">
                Select a conversation
              </h3>
              <p className="text-sm text-muted-foreground/70">
                Choose a conversation from the list or start a new one to begin
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}