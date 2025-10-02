import { NextRequest, NextResponse } from 'next/server'

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '053bc9f366mshe0a84f770e9ae6cp197faejsn434d49c55699'
const RAPIDAPI_HOST = 'commodity-prices2.p.rapidapi.com'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('https://commodity-prices2.p.rapidapi.com/api/Commodity', {
      method: 'GET',
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch commodity prices')
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      commodities: data
    })

  } catch (error) {
    console.error('Error fetching commodity prices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commodity prices' },
      { status: 500 }
    )
  }
}