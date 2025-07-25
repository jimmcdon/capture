'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  chart: string
  className?: string
}

export default function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize Mermaid with configuration
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true
      }
    })
  }, [])

  useEffect(() => {
    if (!elementRef.current || !chart) return

    const renderDiagram = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Clear previous content
        elementRef.current!.innerHTML = ''
        
        // Generate unique ID for this diagram
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        // Validate and render the diagram
        const { svg } = await mermaid.render(id, chart)
        
        if (elementRef.current) {
          elementRef.current.innerHTML = svg
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
      } finally {
        setIsLoading(false)
      }
    }

    renderDiagram()
  }, [chart])

  const handleExportSVG = () => {
    if (elementRef.current) {
      const svg = elementRef.current.querySelector('svg')
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg)
        const blob = new Blob([svgData], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = 'diagram.svg'
        link.click()
        
        URL.revokeObjectURL(url)
      }
    }
  }

  if (error) {
    return (
      <div className={`border border-destructive rounded-lg p-4 bg-destructive/10 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-destructive">⚠️</span>
          <span className="font-medium text-destructive">Diagram Error</span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{error}</p>
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Show diagram code
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
            {chart}
          </pre>
        </details>
      </div>
    )
  }

  return (
    <div className={`border border-border rounded-lg bg-card ${className}`}>
      {/* Diagram Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-blue-500">📊</span>
          <span className="text-sm font-medium">Diagram</span>
        </div>
        <button
          onClick={handleExportSVG}
          disabled={isLoading || !!error}
          className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-50 transition-colors"
        >
          Export SVG
        </button>
      </div>

      {/* Diagram Content */}
      <div className="p-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
              <span className="text-sm">Rendering diagram...</span>
            </div>
          </div>
        )}
        
        <div 
          ref={elementRef}
          className="mermaid-container overflow-x-auto"
          style={{ minHeight: isLoading ? '100px' : 'auto' }}
        />
      </div>
    </div>
  )
}