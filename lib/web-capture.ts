// Web content capture utilities using Firecrawl MCP

export function detectURL(text: string): string | null {
  const urlRegex = /(https?:\/\/[^\s]+)/gi
  const match = text.match(urlRegex)
  return match ? match[0] : null
}

export async function captureWebContent(url: string): Promise<{
  title: string
  summary: string
  content: string
  url: string
  conversationId: string
} | null> {
  try {
    // This would use the Firecrawl MCP tool in a real implementation
    // For now, return a mock structure to show the integration pattern
    
    const response = await fetch('/api/web-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    
    if (!response.ok) {
      throw new Error('Failed to capture web content')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error capturing web content:', error)
    return null
  }
}

export function createWebContentSummary(
  title: string, 
  summary: string, 
  url: string
): string {
  return `📄 **${title}**

🔗 **Source:** ${url}

📝 **Summary:**
${summary}

---
*Captured with Capture - Personal Knowledge Management*`
}