import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      url: request.url,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
        hasDbUrl: !!process.env.POSTGRES_PRISMA_URL,
        defaultModel: process.env.DEFAULT_MODEL,
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}