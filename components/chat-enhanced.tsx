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
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">
              {conversationTitle || 'New Conversation'}
            </h2>
            <div className="text-sm text-muted-foreground">
              Model: {selectedModel.split('/').pop()}
            </div>
          </div>
          
          {/* Model Selection */}
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-3 py-1 text-sm border border-input rounded-md bg-background"
          >
            <option value="anthropic/claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
            <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
            <option value="google/gemini-pro-1.5">Gemini Pro 1.5</option>
            <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <div className="text-lg mb-2">💭</div>
            <p>Start a conversation to capture your thoughts...</p>
            <p className="text-sm mt-2">Use voice input or type your message below</p>
            
            <div className="mt-6 text-xs space-y-2">
              <p className="font-medium">Try these commands:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <code className="bg-muted px-2 py-1 rounded text-xs">Create a flowchart for...</code>
                <code className="bg-muted px-2 py-1 rounded text-xs">Draw a mindmap of...</code>
                <code className="bg-muted px-2 py-1 rounded text-xs">Show me a diagram of...</code>
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-lg ${
              message.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground border border-border'
            }`}>
              <div className="px-4 pt-2">
                <div className="text-xs font-medium mb-1 opacity-70">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </div>
                
                {/* Regular message content */}
                <div className="whitespace-pre-wrap pb-2">
                  {message.content}
                </div>
              </div>
              
              {/* Mermaid diagram if present */}
              {message.mermaidCode && (
                <div className="px-4 pb-4">
                  <MermaidDiagram chart={message.mermaidCode} />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground border border-border rounded-lg px-4 py-2 max-w-[80%]">
              <div className="text-xs font-medium mb-1 opacity-70">Assistant</div>
              <div className="flex items-center gap-1">
                <div className="animate-bounce">●</div>
                <div className="animate-bounce" style={{animationDelay: '0.1s'}}>●</div>
                <div className="animate-bounce" style={{animationDelay: '0.2s'}}>●</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Capture your thoughts..."
            className="flex-1 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          />
          
          {speechSupported && (
            <button
              type="button"
              onClick={startListening}
              disabled={isLoading || isListening}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 transition-colors"
            >
              🎤
            </button>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
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