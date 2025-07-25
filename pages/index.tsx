'use client'

import { useState, useRef, useEffect } from 'react'
import CaptureLayout, { CaptureLayoutHandle } from '../components/capture-layout'
import ConversationList from '../components/conversation-list'
import ChatEnhanced from '../components/chat-enhanced'

export default function Home() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const layoutRef = useRef<CaptureLayoutHandle>(null)

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    setIsChatOpen(true)
    layoutRef.current?.openChat()
  }

  const handleNewConversation = (conversationId: string, title: string) => {
    setSelectedConversationId(conversationId)
    setIsChatOpen(true)
    layoutRef.current?.openChat()
  }

  const handleCreateNewConversation = () => {
    // Clear selection to start a new conversation
    setSelectedConversationId(null)
    setIsChatOpen(true)
    layoutRef.current?.openChat()
  }
  
  // Effect to handle initial state
  useEffect(() => {
    if (!selectedConversationId && !isChatOpen) {
      layoutRef.current?.closeChat()
    }
  }, [])
  
  const handleToggleChat = () => {
    if (isChatOpen) {
      setIsChatOpen(false)
      layoutRef.current?.closeChat()
    } else {
      setIsChatOpen(true)
      layoutRef.current?.openChat()
    }
  }

  const conversationList = (
    <ConversationList 
      selectedConversationId={selectedConversationId}
      onConversationSelect={handleConversationSelect}
      onToggleChat={handleToggleChat}
      isChatOpen={isChatOpen}
    />
  )

  const chatInterface = (
    <ChatEnhanced 
      conversationId={selectedConversationId}
      onNewConversation={handleNewConversation}
    />
  )

  return (
    <CaptureLayout 
      ref={layoutRef}
      conversationList={conversationList}
      chatInterface={chatInterface}
      onNewConversation={handleCreateNewConversation}
      isChatOpen={isChatOpen}
    />
  )
}