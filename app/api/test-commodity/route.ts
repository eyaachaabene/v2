import { NextRequest, NextResponse } from 'next/server'

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '053bc9f366mshe0a84f770e9ae6cp197faejsn434d49c55699'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing RapidAPI connection...')
    console.log('API Key:', RAPIDAPI_KEY.substring(0, 10) + '...')
    
    const response = await fetch('https://commodity-prices2.p.rapidapi.com/api/Commodity', {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'commodity-prices2.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.log('Error response body:', errorText)
      
      return NextResponse.json({
        success: false,
        error: `API returned status ${response.status}`,
        details: errorText,
        headers: Object.fromEntries(response.headers.entries())
      }, { status: response.status })
    }

    const data = await response.json()
    console.log('Success! Data keys:', Object.keys(data))
    console.log('Data structure:', typeof data, Array.isArray(data))
    
    if (data.data) {
      console.log('Data.data length:', data.data.length)
      console.log('First item:', data.data[0])
    } else if (Array.isArray(data)) {
      console.log('Direct array length:', data.length)
      console.log('First item:', data[0])
    }

    return NextResponse.json({
      success: true,
      data: data,
      info: {
        type: typeof data,
        isArray: Array.isArray(data),
        keys: Object.keys(data),
        itemCount: data.data ? data.data.length : (Array.isArray(data) ? data.length : 0)
      }
    })

  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      type: 'fetch_error'
    }, { status: 500 })
  }
}