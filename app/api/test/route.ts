import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'API routes are working!',
    timestamp: new Date().toISOString(),
    url: request.url
  })
}