'use client'

import { useState, useEffect } from 'react'
import { detectURL, captureWebContent, createWebContentSummary } from '../lib/web-capture'
import { detectDiagramRequest, createDiagramPrompt, extractMermaidCode } from '../lib/diagram-detection'
import MermaidDiagram from './mermaid-diagram'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: number
  mermaidCode?: string
}

interface ChatEnhancedProps {
  conversationId: string | null
  onNewConversation?: (conversationId: string, title: string) => void
}

export default function ChatEnhanced({ 
  conversationId, 
  onNewConversation 
}: ChatEnhancedProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3-5-sonnet-20241022')
  const [conversationTitle, setConversationTitle] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [currentRecognition, setCurrentRecognition] = useState<any>(null)
  const [showWebCaptureModal, setShowWebCaptureModal] = useState(false)
  const [detectedURL, setDetectedURL] = useState<string | null>(null)

  // Check for speech recognition support on component mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setSpeechSupported(!!SpeechRecognition)
  }, [])

  // Load conversation when conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId)
    } else {
      // Clear chat for new conversation
      setMessages([])
      setConversationTitle('')
    }
  }, [conversationId])

  const loadConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations?conversationId=${id}`)
      const conversation = await response.json()
      
      if (conversation.messages) {
        const formattedMessages = conversation.messages.map((msg: any, index: number) => {
          const mermaidCode = extractMermaidCode(msg.content)
          return {
            role: msg.role,
            content: msg.content,
            id: index,
            mermaidCode: mermaidCode || undefined
          }
        })
        setMessages(formattedMessages)
        setConversationTitle(conversation.title)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    setCurrentRecognition(recognition)
    setIsListening(true)
    setShowVoiceModal(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      stopListening()
    }

    recognition.onerror = () => {
      stopListening()  
    }

    recognition.onend = () => {
      stopListening()
    }

    recognition.start()
  }

  const stopListening = () => {
    if (currentRecognition) {
      currentRecognition.stop()
      setCurrentRecognition(null)
    }
    setIsListening(false)
    setShowVoiceModal(false)
  }

  const handleWebCapture = async (url: string) => {
    setIsLoading(true)
    setShowWebCaptureModal(false)
    
    try {
      const webContent = await captureWebContent(url)
      if (webContent && onNewConversation) {
        onNewConversation(webContent.conversationId, webContent.title)
      }
    } catch (error) {
      console.error('Error capturing web content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    // Check for URL in input
    const url = detectURL(input)
    if (url) {
      setDetectedURL(url)
      setShowWebCaptureModal(true)
      return
    }

    // Check for diagram request
    const diagramRequest = detectDiagramRequest(input)
    const isDiagramRequest = !!diagramRequest
    
    const userMessage: Message = { role: 'user', content: input, id: Date.now() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      // Generate conversation title from first message if new conversation
      const title = conversationTitle || (messages.length === 0 ? input.substring(0, 50) + '...' : '')
      
      const response = await fetch('/api/chat-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          conversationId: conversationId,
          title: title,
          model: selectedModel,
          isDiagramRequest: isDiagramRequest
        })
      })
      
      const data = await response.json()
      
      if (data.choices && data.choices[0]) {
        // Handle new conversation creation
        if (data.conversationId && !conversationId && onNewConversation) {
          onNewConversation(data.conversationId, title)
          setConversationTitle(title)
        }
        
        const responseContent = data.choices[0].message.content
        const mermaidCode = extractMermaidCode(responseContent)
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: responseContent,
          id: Date.now() + 1,
          mermaidCode: mermaidCode || undefined
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request.',
        id: Date.now() + 1
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border bg-card">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-sm">💬</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold text-foreground truncate">
                  {conversationTitle || 'New Conversation'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Model: {selectedModel.split('/').pop()}</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString()}</span>
              {conversationId && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    Active
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-1.5 text-sm border border-input rounded-lg bg-background hover:bg-accent transition-colors"
            >
              <option value="anthropic/claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
              <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
              <option value="google/gemini-pro-1.5">Gemini Pro 1.5</option>
              <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B</option>
            </select>
            
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <span className="text-lg">⋯</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💭</span>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Start a new conversation</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Capture your thoughts, create diagrams, or analyze web content with AI assistance.
            </p>
            
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Try these prompts:</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                <span className="bg-muted px-3 py-1.5 rounded-lg text-sm text-muted-foreground">Create a flowchart for...</span>
                <span className="bg-muted px-3 py-1.5 rounded-lg text-sm text-muted-foreground">Draw a mindmap of...</span>
                <span className="bg-muted px-3 py-1.5 rounded-lg text-sm text-muted-foreground">Analyze this URL...</span>
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
            <div className={`max-w-[85%] ${
              message.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-2xl shadow-sm' 
                : 'bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200'
            }`}>
              {/* Message header with avatar */}
              <div className="flex items-start gap-3 px-4 pt-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                  message.role === 'user'
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium mb-2 ${
                    message.role === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}>
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  
                  {/* Regular message content */}
                  <div className={`whitespace-pre-wrap text-sm leading-relaxed ${
                    message.role === 'user' ? 'text-primary-foreground' : 'text-foreground'
                  }`}>
                    {message.content}
                  </div>
                </div>
              </div>
              
              {/* Mermaid diagram if present */}
              {message.mermaidCode && (
                <div className="px-4 pb-4 mt-3">
                  <div className="border-t border-border/30 pt-3">
                    <MermaidDiagram chart={message.mermaidCode} />
                  </div>
                </div>
              )}
              
              {/* Bottom padding */}
              <div className="pb-3"></div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start group">
            <div className="bg-card border border-border/50 rounded-2xl shadow-sm max-w-[80%]">
              <div className="flex items-start gap-3 px-4 pt-3 pb-3">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 text-xs">
                  🤖
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Assistant
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-6 border-t border-border/50 bg-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input container with shadow */}
          <div className="relative bg-background border border-border/50 rounded-2xl shadow-sm hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring/30 transition-all duration-200">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Capture..."
              rows={1}
              className="w-full px-4 py-4 bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground text-sm leading-relaxed"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              style={{
                minHeight: '48px',
                maxHeight: '120px'
              }}
            />
            
            {/* Input actions bar */}
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-2">
                {speechSupported && (
                  <button
                    type="button"
                    onClick={startListening}
                    disabled={isLoading || isListening}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg disabled:opacity-50 transition-colors"
                    title="Voice input"
                  >
                    <span className="text-base">🎤</span>
                  </button>
                )}
                
                <button
                  type="button"
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
                  title="Attach file"
                >
                  <span className="text-base">📎</span>
                </button>
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    Sending
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Send</span>
                    <span className="text-xs opacity-70">⏎</span>
                  </div>
                )}
              </button>
            </div>
          </div>
          
          {/* Status bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <div className="flex items-center gap-3">
              <span>Model: {selectedModel.split('/').pop()}</span>
              {conversationId && (
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                  Auto-saved
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Press ⇧↵ for new line
            </div>
          </div>
        </form>
      </div>

      {/* Voice Recording Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-8 text-center max-w-sm mx-4 border border-border">
            <div className="mb-6">
              {/* Animated microphone icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center animate-pulse">
                <span className="text-primary-foreground text-2xl">🎤</span>
              </div>
              
              {/* Visual sound waves */}
              <div className="flex justify-center items-center space-x-1 mb-4">
                <div className="w-1 bg-primary rounded animate-pulse" style={{height: '20px', animationDelay: '0ms'}}></div>
                <div className="w-1 bg-primary rounded animate-pulse" style={{height: '30px', animationDelay: '150ms'}}></div>
                <div className="w-1 bg-primary rounded animate-pulse" style={{height: '25px', animationDelay: '300ms'}}></div>
                <div className="w-1 bg-primary rounded animate-pulse" style={{height: '35px', animationDelay: '450ms'}}></div>
                <div className="w-1 bg-primary rounded animate-pulse" style={{height: '20px', animationDelay: '600ms'}}></div>
              </div>

              <h3 className="text-lg font-medium text-card-foreground mb-2">
                Listening...
              </h3>
              <p className="text-muted-foreground text-sm">
                Speak your message clearly
              </p>
            </div>

            <button
              onClick={stopListening}
              className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:bg-secondary/80 transition-colors"
            >
              Stop Recording
            </button>
          </div>
        </div>
      )}

      {/* Web Content Capture Modal */}
      {showWebCaptureModal && detectedURL && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 text-center max-w-md mx-4 border border-border">
            <div className="mb-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🌐</span>
              </div>
              
              <h3 className="text-lg font-medium text-card-foreground mb-2">
                Web Content Detected
              </h3>
              <p className="text-muted-foreground text-sm mb-3">
                Would you like to capture and summarize this webpage?
              </p>
              
              <div className="bg-muted p-3 rounded-md text-sm font-mono break-all">
                {detectedURL}
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleWebCapture(detectedURL)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                📄 Capture Content
              </button>
              <button
                onClick={() => {
                  setShowWebCaptureModal(false)
                  setDetectedURL(null)
                  // Continue with regular chat message
                  const userMessage: Message = { role: 'user', content: input, id: Date.now() }
                  setMessages(prev => [...prev, userMessage])
                  setInput('')
                }}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
              >
                💬 Send as Message
              </button>
            </div>
            
            <button
              onClick={() => {
                setShowWebCaptureModal(false)
                setDetectedURL(null)
              }}
              className="text-muted-foreground text-xs mt-3 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}