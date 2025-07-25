import { prisma } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }

    // Use Firecrawl MCP to scrape and extract content
    let webContent
    
    try {
      // This would be implemented with the actual Firecrawl MCP call
      // For now, using a basic structure that demonstrates the integration
      const domain = new URL(url).hostname.replace('www.', '')
      
      webContent = {
        title: `Content from ${domain}`,
        summary: `Automatically captured content from ${url}. This demonstrates the web capture feature that will use Firecrawl MCP for real content extraction and AI summarization.`,
        content: `Full webpage content would be extracted here using Firecrawl's advanced scraping capabilities. The system would then generate intelligent summaries and extract key information.`,
        url: url
      }
    } catch (error) {
      console.error('Firecrawl extraction error:', error)
      
      // Fallback content
      webContent = {
        title: 'Web Content (Processing Failed)',
        summary: `Unable to fully process ${url}. The link has been saved for manual review.`,
        content: 'Content extraction failed. Please review manually.',
        url: url
      }
    }

    // Create a new conversation with the web content
    const conversation = await prisma.conversation.create({
      data: {
        title: `📄 ${webContent.title}`,
        projectId: null // Default to inbox
      }
    })

    // Create the initial message with web content summary
    const summaryContent = `📄 **${webContent.title}**

🔗 **Source:** ${webContent.url}

📝 **Summary:**
${webContent.summary}

---
*Captured with Capture - Personal Knowledge Management*`

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: summaryContent
      }
    })

    return res.status(200).json({
      ...webContent,
      conversationId: conversation.id
    })

  } catch (error) {
    console.error('Web capture error:', error)
    return res.status(500).json({ 
      error: 'Error capturing web content',
      details: error.message 
    })
  }
}