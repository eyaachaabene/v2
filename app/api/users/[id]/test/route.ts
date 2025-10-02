import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[Test Route] GET request received for user:', params.id)
  
  return NextResponse.json({
    success: true,
    message: `Test route working for user ${params.id}`,
    timestamp: new Date().toISOString()
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[Test Route] POST request received for user:', params.id)
  
  try {
    const body = await request.json()
    console.log('[Test Route] Body:', body)
    
    return NextResponse.json({
      success: true,
      message: `Test POST route working for user ${params.id}`,
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Test Route] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Test route error' },
      { status: 500 }
    )
  }
}