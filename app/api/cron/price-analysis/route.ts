import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '053bc9f366mshe0a84f770e9ae6cp197faejsn434d49c55699'

// Cette fonction peut être appelée par un cron job pour exécuter l'analyse automatiquement
export async function POST(request: NextRequest) {
  try {
    // Vérifier la clé API pour la sécurité
    const authHeader = request.headers.get('x-api-key')
    if (authHeader !== process.env.CRON_API_KEY && authHeader !== 'internal-cron-key') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Récupérer les prix des commodités
    const commodityResponse = await fetch('https://commodity-prices2.p.rapidapi.com/api/Commodity', {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'commodity-prices2.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    })

    if (!commodityResponse.ok) {
      throw new Error('Failed to fetch commodity prices')
    }

    const commodityData = await commodityResponse.json()
    const commodities = commodityData.data || commodityData || []

    const { db } = await connectToDatabase()
    
    // Récupérer tous les utilisateurs actifs (farmers et suppliers)
    const users = await db.collection("users").find({
      role: { $in: ['farmer', 'supplier'] }
    }).toArray()

    let totalNotifications = 0

    for (const user of users) {
      // Analyser les produits du farmer
      if (user.role === 'farmer') {
        const products = await db.collection("products").find({
          farmerId: user._id
        }).toArray()

        for (const product of products) {
          const matchedCommodity = findCommodityMatch(product.name, commodities)
          
          if (matchedCommodity && matchedCommodity.price) {
            const analysis = analyzePriceVariation(product.price, matchedCommodity.price)
            
            if (analysis.status !== 'optimal') {
              // Vérifier s'il y a déjà une notification récente
              const existingNotification = await db.collection("notifications").findOne({
                userId: user._id,
                type: 'price_alert',
                productId: product._id,
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // dernières 24h
              })

              if (!existingNotification) {
                await db.collection("notifications").insertOne({
                  userId: user._id,
                  type: 'price_alert',
                  title: `Price Alert: ${product.name}`,
                  message: `${analysis.recommendation} Market price: ${matchedCommodity.price} ${matchedCommodity.unit || 'per unit'}. Your price: ${product.price} TND.`,
                  productId: product._id,
                  marketData: {
                    commodityName: matchedCommodity.name,
                    marketPrice: matchedCommodity.price,
                    userPrice: product.price,
                    recommendation: analysis.recommendation,
                    status: analysis.status
                  },
                  read: false,
                  createdAt: new Date()
                })
                totalNotifications++
              }
            }
          }
        }
      }

      // Analyser les ressources du supplier
      if (user.role === 'supplier') {
        const resources = await db.collection("resources").find({
          supplierId: user._id
        }).toArray()

        for (const resource of resources) {
          const matchedCommodity = findCommodityMatch(resource.name, commodities)
          
          if (matchedCommodity && matchedCommodity.price) {
            const analysis = analyzePriceVariation(resource.pricing.price, matchedCommodity.price)
            
            if (analysis.status !== 'optimal') {
              // Vérifier s'il y a déjà une notification récente
              const existingNotification = await db.collection("notifications").findOne({
                userId: user._id,
                type: 'price_alert',
                resourceId: resource._id,
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // dernières 24h
              })

              if (!existingNotification) {
                await db.collection("notifications").insertOne({
                  userId: user._id,
                  type: 'price_alert',
                  title: `Price Alert: ${resource.name}`,
                  message: `${analysis.recommendation} Market price: ${matchedCommodity.price} ${matchedCommodity.unit || 'per unit'}. Your price: ${resource.pricing.price} ${resource.pricing.currency}.`,
                  resourceId: resource._id,
                  marketData: {
                    commodityName: matchedCommodity.name,
                    marketPrice: matchedCommodity.price,
                    userPrice: resource.pricing.price,
                    recommendation: analysis.recommendation,
                    status: analysis.status
                  },
                  read: false,
                  createdAt: new Date()
                })
                totalNotifications++
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Automated price analysis completed. ${totalNotifications} notifications sent.`,
      usersAnalyzed: users.length,
      notificationsSent: totalNotifications
    })

  } catch (error) {
    console.error('Error in automated price analysis:', error)
    return NextResponse.json(
      { error: 'Failed to run automated analysis' },
      { status: 500 }
    )
  }
}

// Fonction utilitaire pour trouver une correspondance de commodité
function findCommodityMatch(productName: string, commodities: any[]): any {
  const commodityMapping: { [key: string]: string[] } = {
    'wheat': ['wheat', 'blé', 'ble'],
    'rice': ['rice', 'riz'],
    'corn': ['corn', 'maize', 'maïs', 'mais'],
    'barley': ['barley', 'orge'],
    'tomato': ['tomato', 'tomate'],
    'potato': ['potato', 'pomme de terre', 'patate'],
    'onion': ['onion', 'oignon'],
    'carrot': ['carrot', 'carrotte'],
    'apple': ['apple', 'pomme'],
    'orange': ['orange'],
    'banana': ['banana', 'banane'],
    'lemon': ['lemon', 'citron'],
    'olive oil': ['olive oil', 'huile olive', 'huile d\'olive'],
    'palm oil': ['palm oil', 'huile de palme'],
    'sugar': ['sugar', 'sucre'],
    'coffee': ['coffee', 'café', 'cafe'],
    'tea': ['tea', 'thé', 'the']
  }

  const normalizedProduct = productName.toLowerCase().trim()
  
  // Recherche dans le mapping
  for (const [commodity, aliases] of Object.entries(commodityMapping)) {
    if (aliases.some(alias => normalizedProduct.includes(alias) || alias.includes(normalizedProduct))) {
      const matchedCommodity = commodities.find(c => 
        c.name?.toLowerCase().includes(commodity) || 
        c.symbol?.toLowerCase().includes(commodity)
      )
      if (matchedCommodity) return matchedCommodity
    }
  }
  
  // Recherche directe
  const directMatch = commodities.find(c => 
    c.name?.toLowerCase().includes(normalizedProduct) || 
    normalizedProduct.includes(c.name?.toLowerCase()) ||
    c.symbol?.toLowerCase().includes(normalizedProduct)
  )
  
  return directMatch
}

// Fonction d'analyse des prix
function analyzePriceVariation(userPrice: number, marketPrice: number): {
  status: 'optimal' | 'too_high' | 'too_low' | 'volatile'
  difference: number
  percentage: number
  recommendation: string
} {
  const difference = userPrice - marketPrice
  const percentage = (difference / marketPrice) * 100
  
  if (Math.abs(percentage) <= 5) {
    return {
      status: 'optimal',
      difference,
      percentage,
      recommendation: 'Your price is competitive and well-aligned with market rates.'
    }
  } else if (percentage > 15) {
    return {
      status: 'too_high',
      difference,
      percentage,
      recommendation: 'Consider lowering your price to stay competitive with market rates.'
    }
  } else if (percentage < -15) {
    return {
      status: 'too_low',
      difference,
      percentage,
      recommendation: 'You might be undervaluing your product. Consider increasing the price.'
    }
  } else {
    return {
      status: 'volatile',
      difference,
      percentage,
      recommendation: 'Monitor market trends closely as prices are fluctuating.'
    }
  }
}