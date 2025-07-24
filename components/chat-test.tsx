'use client'

import { useChat } from 'ai/react'
import { useState } from 'react'

export default function ChatTest() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3-5-sonnet-20241022')

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">AI Chat Test</h2>
      
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
          <option value="google/gemini-pro">Gemini Pro</option>
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
      <form onSubmit={(e) => {
        handleSubmit(e, { data: { model: selectedModel } })
      }} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 border rounded px-3 py-2"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}