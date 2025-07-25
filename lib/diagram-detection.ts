// Diagram detection and processing utilities

export interface DiagramRequest {
  type: 'flowchart' | 'mindmap' | 'sequence' | 'class' | 'gantt' | 'generic'
  description: string
  originalText: string
}

// Keywords that suggest diagram requests
const DIAGRAM_KEYWORDS = [
  // General diagram terms
  'diagram', 'chart', 'graph', 'visualization', 'visual', 'draw', 'create',
  
  // Specific diagram types
  'flowchart', 'flow chart', 'flow diagram',
  'mindmap', 'mind map', 'concept map',
  'sequence diagram', 'sequence chart',
  'class diagram', 'uml',
  'gantt', 'timeline', 'schedule',
  'org chart', 'organizational chart',
  'network diagram', 'architecture',
  
  // Action words
  'show me', 'illustrate', 'map out', 'visualize', 'outline'
]

// Specific diagram type patterns
const DIAGRAM_TYPE_PATTERNS = {
  flowchart: ['flowchart', 'flow chart', 'flow diagram', 'process flow', 'workflow'],
  mindmap: ['mindmap', 'mind map', 'concept map', 'brain storm', 'brainstorm'],
  sequence: ['sequence diagram', 'sequence chart', 'interaction', 'timeline', 'steps'],
  class: ['class diagram', 'uml', 'object model', 'relationship'],
  gantt: ['gantt', 'project timeline', 'schedule', 'milestone']
}

export function detectDiagramRequest(text: string): DiagramRequest | null {
  const lowerText = text.toLowerCase()
  
  // Check if text contains diagram-related keywords
  const containsDiagramKeyword = DIAGRAM_KEYWORDS.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  )
  
  if (!containsDiagramKeyword) {
    return null
  }
  
  // Determine diagram type
  let detectedType: DiagramRequest['type'] = 'generic'
  
  for (const [type, patterns] of Object.entries(DIAGRAM_TYPE_PATTERNS)) {
    if (patterns.some(pattern => lowerText.includes(pattern))) {
      detectedType = type as DiagramRequest['type']
      break
    }
  }
  
  // Extract the main description (remove diagram keywords for cleaner prompt)
  let description = text
  DIAGRAM_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    description = description.replace(regex, '').trim()
  })
  
  // Clean up extra spaces
  description = description.replace(/\s+/g, ' ').trim()
  
  return {
    type: detectedType,
    description: description || text,
    originalText: text
  }
}

export function createDiagramPrompt(request: DiagramRequest): string {
  const basePrompt = `Create a Mermaid diagram for: ${request.description}`
  
  const typeSpecificPrompts = {
    flowchart: `${basePrompt}

Generate a Mermaid flowchart that shows the process, decision points, and flow. Use proper flowchart syntax with nodes, arrows, and decision diamonds. Make it clear and easy to follow.

Format: Start with \`\`\`mermaid and use flowchart TD syntax.`,

    mindmap: `${basePrompt}

Generate a Mermaid mindmap that organizes the concepts hierarchically. Use the mindmap syntax to show relationships between ideas and subtopics.

Format: Start with \`\`\`mermaid and use mindmap syntax.`,

    sequence: `${basePrompt}

Generate a Mermaid sequence diagram showing the interactions, participants, and message flow over time.

Format: Start with \`\`\`mermaid and use sequenceDiagram syntax.`,

    class: `${basePrompt}

Generate a Mermaid class diagram showing the classes, relationships, and structure.

Format: Start with \`\`\`mermaid and use classDiagram syntax.`,

    gantt: `${basePrompt}

Generate a Mermaid Gantt chart showing tasks, timelines, and dependencies.

Format: Start with \`\`\`mermaid and use gantt syntax.`,

    generic: `${basePrompt}

Choose the most appropriate Mermaid diagram type (flowchart, mindmap, sequence, class, or gantt) and generate a clear, well-structured diagram.

Format: Start with \`\`\`mermaid and use the appropriate syntax.`
  }
  
  return typeSpecificPrompts[request.type]
}

export function extractMermaidCode(text: string): string | null {
  // Look for mermaid code blocks
  const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/i
  const match = text.match(mermaidRegex)
  
  if (match && match[1]) {
    return match[1].trim()
  }
  
  // Fallback: look for any code block that might be mermaid
  const codeBlockRegex = /```\n?([\s\S]*?)\n?```/
  const codeMatch = text.match(codeBlockRegex)
  
  if (codeMatch && codeMatch[1]) {
    const code = codeMatch[1].trim()
    // Basic check if it looks like mermaid syntax
    if (code.includes('graph') || code.includes('flowchart') || 
        code.includes('sequenceDiagram') || code.includes('classDiagram') ||
        code.includes('mindmap') || code.includes('gantt')) {
      return code
    }
  }
  
  return null
}