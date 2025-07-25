'use client'

import { useState, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: number
}

export default function ChatTest() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3-5-sonnet-20241022')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversationTitle, setConversationTitle] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [currentRecognition, setCurrentRecognition] = useState<any>(null)

  // Check for speech recognition support on component mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setSpeechSupported(!!SpeechRecognition)
  }, [])

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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
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
          model: selectedModel
        })
      })
      
      const data = await response.json()
      
      if (data.choices && data.choices[0]) {
        // Set conversation ID if this is a new conversation
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId)
          setConversationTitle(title)
        }
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.choices[0].message.content,
          id: Date.now() + 1
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
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">AI Chat Test</h2>
      
      {/* Conversation Info */}
      {conversationId && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Conversation:</strong> {conversationTitle}
          </p>
          <p className="text-xs text-blue-600">ID: {conversationId}</p>
          <p className="text-xs text-blue-600">Model: {selectedModel}</p>
        </div>
      )}
      
      {/* Model Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Model:</label>
        <select 
          value={selectedModel} 
          onChange={(e) => setSelectedModel(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="anthropic/claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
          <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
          <option value="google/gemini-pro-1.5">Gemini Pro 1.5</option>
          <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B</option>
        </select>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto border rounded p-4 mb-4 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-gray-500">Start a conversation to test the AI integration...</p>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border'
            }`}>
              <p className="text-sm font-medium mb-1">
                {message.role === 'user' ? 'You' : 'AI'}
              </p>
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <div className="inline-block bg-white border px-4 py-2 rounded-lg">
              <p className="text-sm font-medium mb-1">AI</p>
              <p>Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded px-3 py-2"
          disabled={isLoading}
        />
        {speechSupported && (
          <button
            type="button"
            onClick={startListening}
            disabled={isLoading || isListening}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            🎤
          </button>
        )}
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </form>

      {/* Voice Recording Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center max-w-sm mx-4">
            <div className="mb-6">
              {/* Animated microphone icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-2xl">🎤</span>
              </div>
              
              {/* Visual sound waves */}
              <div className="flex justify-center items-center space-x-1 mb-4">
                <div className="w-1 bg-red-500 rounded animate-pulse" style={{height: '20px', animationDelay: '0ms'}}></div>
                <div className="w-1 bg-red-500 rounded animate-pulse" style={{height: '30px', animationDelay: '150ms'}}></div>
                <div className="w-1 bg-red-500 rounded animate-pulse" style={{height: '25px', animationDelay: '300ms'}}></div>
                <div className="w-1 bg-red-500 rounded animate-pulse" style={{height: '35px', animationDelay: '450ms'}}></div>
                <div className="w-1 bg-red-500 rounded animate-pulse" style={{height: '20px', animationDelay: '600ms'}}></div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Listening...
              </h3>
              <p className="text-gray-600 text-sm">
                Speak your message clearly
              </p>
            </div>

            <button
              onClick={stopListening}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Stop Recording
            </button>
          </div>
        </div>
      )}
    </div>
  )
}