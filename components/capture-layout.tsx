'use client'

import { ReactNode } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

interface CaptureLayoutProps {
  leftPanel: ReactNode
  centerPanel: ReactNode
  rightPanel: ReactNode
}

export default function CaptureLayout({ 
  leftPanel, 
  centerPanel, 
  rightPanel 
}: CaptureLayoutProps) {
  return (
    <div className="h-screen w-full bg-background">
      {/* Desktop Layout */}
      <div className="hidden md:block h-full">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - Workspace & Projects */}
          <Panel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full border-r border-border bg-card">
              {leftPanel}
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-border hover:bg-accent transition-colors" />
          
          {/* Center Panel - Conversations */}
          <Panel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full border-r border-border bg-card">
              {centerPanel}
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-border hover:bg-accent transition-colors" />
          
          {/* Right Panel - Chat Interface */}
          <Panel defaultSize={55} minSize={40}>
            <div className="h-full bg-background">
              {rightPanel}
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Mobile Layout - Single Column */}
      <div className="md:hidden h-full">
        <div className="h-full bg-background">
          {rightPanel}
        </div>
      </div>
    </div>
  )
}