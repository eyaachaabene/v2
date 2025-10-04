import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Données de démonstration réalistes pour l'analyse des prix
    const demoAnalysis = [
      {
        type: 'product',
        id: 'demo-1',
        name: 'Organic Tomatoes',
        userPrice: 150,
        marketPrice: 125.30,
        marketUnit: 'USD/100kg',
        commodityName: 'Tomato',
        analysis: {
          status: 'too_high',
          difference: 24.70,
          percentage: 19.7,
          recommendation: 'Consider lowering your price to stay competitive with market rates.'
        }
      },
      {
        type: 'resource',
        id: 'demo-2',
        name: 'Wheat Seeds Premium',
        userPrice: 1000,
        marketPrice: 1250.60,
        marketUnit: 'USD/T',
        commodityName: 'Seeds',
        analysis: {
          status: 'too_low',
          difference: -250.60,
          percentage: -20.0,
          recommendation: 'You might be undervaluing your product. Consider increasing the price.'
        }
      },
      {
        type: 'product',
        id: 'demo-3',
        name: 'Fresh Strawberries',
        userPrice: 325,
        marketPrice: 320.75,
        marketUnit: 'USD/100kg',
        commodityName: 'Strawberry',
        analysis: {
          status: 'optimal',
          difference: 4.25,
          percentage: 1.3,
          recommendation: 'Your price is competitive and well-aligned with market rates.'
        }
      },
      {
        type: 'resource',
        id: 'demo-4',
        name: 'Organic Fertilizer',
        userPrice: 380,
        marketPrice: 340.80,
        marketUnit: 'USD/T',
        commodityName: 'Fertilizer',
        analysis: {
          status: 'volatile',
          difference: 39.20,
          percentage: 11.5,
          recommendation: 'Monitor market trends closely as prices are fluctuating.'
        }
      },
      {
        type: 'product',
        id: 'demo-5',
        name: 'Premium Dates',
        userPrice: 180,
        marketPrice: 165.45,
        marketUnit: 'USD/100kg',
        commodityName: 'Dates',
        analysis: {
          status: 'volatile',
          difference: 14.55,
          percentage: 8.8,
          recommendation: 'Monitor market trends closely as prices are fluctuating.'
        }
      },
      {
        type: 'product',
        id: 'demo-6',
        name: 'Wheat Flour Organic',
        userPrice: 85,
        marketPrice: 140.30,
        marketUnit: 'USD/100kg',
        commodityName: 'Flour',
        analysis: {
          status: 'too_low',
          difference: -55.30,
          percentage: -39.4,
          recommendation: 'You are significantly underpricing. Consider a substantial price increase.'
        }
      }
    ]

    const demoNotifications = [
      {
        _id: 'notif-1',
        title: 'Price Alert: Organic Tomatoes',
        message: 'Consider lowering your price to stay competitive with market rates. Market price: 125.30 USD/100kg. Your price: 150 TND.',
        marketData: {
          commodityName: 'Tomato',
          marketPrice: 125.30,
          userPrice: 150,
          recommendation: 'Consider lowering your price to stay competitive with market rates.',
          status: 'too_high'
        },
        createdAt: new Date().toISOString(),
        read: false
      },
      {
        _id: 'notif-2',
        title: 'Price Alert: Wheat Seeds Premium',
        message: 'You might be undervaluing your product. Consider increasing the price. Market price: 1250.60 USD/T. Your price: 1000 TND.',
        marketData: {
          commodityName: 'Seeds',
          marketPrice: 1250.60,
          userPrice: 1000,
          recommendation: 'You might be undervaluing your product. Consider increasing the price.',
          status: 'too_low'
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true
      },
      {
        _id: 'notif-3',
        title: 'Price Alert: Wheat Flour Organic',
        message: 'You are significantly underpricing. Consider a substantial price increase. Market price: 140.30 USD/100kg. Your price: 85 TND.',
        marketData: {
          commodityName: 'Flour',
          marketPrice: 140.30,
          userPrice: 85,
          recommendation: 'You are significantly underpricing. Consider a substantial price increase.',
          status: 'too_low'
        },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: false
      },
      {
        _id: 'notif-4',
        title: 'Price Alert: Organic Fertilizer',
        message: 'Monitor market trends closely as prices are fluctuating. Market price: 340.80 USD/T. Your price: 380 TND.',
        marketData: {
          commodityName: 'Fertilizer',
          marketPrice: 340.80,
          userPrice: 380,
          recommendation: 'Monitor market trends closely as prices are fluctuating.',
          status: 'volatile'
        },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        read: false
      }
    ]

    return NextResponse.json({
      success: true,
      message: 'Demo price analysis completed. 4 notifications sent.',
      analysisResults: demoAnalysis,
      totalAnalyzed: demoAnalysis.length,
      notificationsSent: 4,
      notifications: demoNotifications
    })

  } catch (error) {
    console.error('Error in demo price analysis:', error)
    return NextResponse.json(
      { error: 'Failed to run demo analysis' },
      { status: 500 }
    )
  }
}