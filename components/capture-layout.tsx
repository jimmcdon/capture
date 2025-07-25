'use client'

import { ReactNode, useRef, useImperativeHandle, forwardRef } from 'react'
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels'
import SidebarNavigation from './sidebar-navigation'

interface CaptureLayoutProps {
  conversationList: ReactNode
  chatInterface: ReactNode
  onNewConversation?: () => void
  isChatOpen?: boolean
}

export interface CaptureLayoutHandle {
  openChat: () => void
  closeChat: () => void
}

const CaptureLayout = forwardRef<CaptureLayoutHandle, CaptureLayoutProps>(({ 
  conversationList, 
  chatInterface,
  onNewConversation,
  isChatOpen = false
}, ref) => {
  const chatPanelRef = useRef<ImperativePanelHandle>(null)
  const conversationPanelRef = useRef<ImperativePanelHandle>(null)
  
  useImperativeHandle(ref, () => ({
    openChat: () => {
      chatPanelRef.current?.resize(65)
      conversationPanelRef.current?.resize(35)
    },
    closeChat: () => {
      chatPanelRef.current?.resize(0)
      conversationPanelRef.current?.resize(100)
    }
  }), [])
  return (
    <div className="h-screen w-full bg-background flex">
      {/* Left Navigation - Minimal expandable sidebar */}
      <SidebarNavigation onNewConversation={onNewConversation} />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-16">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Middle Panel - Conversation List */}
          <Panel 
            ref={conversationPanelRef}
            defaultSize={isChatOpen ? 35 : 100} 
            minSize={25} 
          >
            <div className="h-full">
              {conversationList}
            </div>
          </Panel>
          
          <PanelResizeHandle 
            className={`w-px bg-border/50 hover:bg-border hover:w-1 transition-all duration-200 hover:shadow-sm ${
              !isChatOpen ? 'opacity-0 pointer-events-none' : ''
            }`} 
          />
          
          {/* Right Panel - Chat Interface */}
          <Panel 
            ref={chatPanelRef}
            defaultSize={isChatOpen ? 65 : 0} 
            minSize={50}
            collapsible={true}
            collapsedSize={0}
          >
            <div className="h-full bg-background">
              {chatInterface}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
})

CaptureLayout.displayName = 'CaptureLayout'

export default CaptureLayout