import ChatTest from '@/components/chat-test'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Capture</h1>
        <p className="mt-2 text-xl text-gray-600">Personal Knowledge Management</p>
      </div>
      
      <ChatTest />
    </main>
  )
}