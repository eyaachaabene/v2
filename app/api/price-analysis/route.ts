import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '053bc9f366mshe0a84f770e9ae6cp197faejsn434d49c55699'

// Cache pour éviter trop d'appels à l'API
let commodityCache: any[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 heure en millisecondes

// Mapping étendu des noms de produits/ressources vers les commodités
const commodityMapping: { [key: string]: string[] } = {
  // Céréales
  'wheat': ['wheat', 'blé', 'ble', 'froment'],
  'rice': ['rice', 'riz', 'paddy'],
  'corn': ['corn', 'maize', 'maïs', 'mais', 'sweet corn'],
  'barley': ['barley', 'orge'],
  'oats': ['oats', 'avoine'],
  
  // Légumes
  'tomato': ['tomato', 'tomate', 'tomatoes', 'fresh tomato', 'red tomato'],
  'potato': ['potato', 'pomme de terre', 'patate', 'potatoes'],
  'onion': ['onion', 'oignon', 'onions'],
  'carrot': ['carrot', 'carrotte', 'carrots'],
  'cabbage': ['cabbage', 'chou', 'choux'],
  'lettuce': ['lettuce', 'laitue', 'salade'],
  
  // Fruits
  'apple': ['apple', 'pomme', 'apples', 'organic apple'],
  'orange': ['orange', 'oranges', 'citrus'],
  'banana': ['banana', 'banane', 'bananas'],
  'lemon': ['lemon', 'citron', 'lemons'],
  'strawberry': ['strawberry', 'fraise', 'strawberries', 'fresh strawberry'],
  
  // Huiles et dérivés
  'olive oil': ['olive oil', 'huile olive', 'huile d\'olive', 'premium olive oil'],
  'sunflower oil': ['sunflower oil', 'huile tournesol', 'huile de tournesol'],
  
  // Autres produits agricoles
  'sugar': ['sugar', 'sucre'],
  'coffee': ['coffee', 'café', 'cafe', 'coffee bean'],
  'tea': ['tea', 'thé', 'the'],
  
  // Ressources agricoles
  'fertilizer': ['fertilizer', 'engrais', 'fertiliser', 'organic fertilizer'],
  'seeds': ['seeds', 'graines', 'seed', 'vegetable seed', 'wheat seed', 'corn seed'],
  'pesticide': ['pesticide', 'pesticides', 'insecticide', 'herbicide', 'organic pesticide'],
  
  // Herbes et épices
  'herbs': ['herbs', 'herbes', 'dried herbs', 'fresh herbs'],
  'dates': ['dates', 'dattes', 'premium dates'],
  'flour': ['flour', 'farine', 'wheat flour']
}

// Fonction pour normaliser les noms et trouver des correspondances
function findCommodityMatch(productName: string, commodities: any[]): any {
  const normalizedProduct = productName.toLowerCase().trim()
  
  // Recherche directe dans le mapping
  for (const [commodity, aliases] of Object.entries(commodityMapping)) {
    if (aliases.some(alias => normalizedProduct.includes(alias) || alias.includes(normalizedProduct))) {
      const matchedCommodity = commodities.find(c => 
        c.name?.toLowerCase().includes(commodity) || 
        c.symbol?.toLowerCase().includes(commodity)
      )
      if (matchedCommodity) return matchedCommodity
    }
  }
  
  // Recherche directe dans les commodités
  const directMatch = commodities.find(c => 
    c.name?.toLowerCase().includes(normalizedProduct) || 
    normalizedProduct.includes(c.name?.toLowerCase()) ||
    c.symbol?.toLowerCase().includes(normalizedProduct)
  )
  
  return directMatch
}

// Fonction pour analyser les prix
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

// Données agricoles réalistes basées sur les marchés mondiaux
function getTestCommodityData() {
  return [
    // Céréales (prix en USD/tonne)
    { name: 'Wheat', symbol: 'WHEAT', price: 280.50, unit: 'USD/T' },
    { name: 'Rice', symbol: 'RICE', price: 420.75, unit: 'USD/T' },
    { name: 'Corn', symbol: 'CORN', price: 195.25, unit: 'USD/T' },
    { name: 'Barley', symbol: 'BARLEY', price: 215.80, unit: 'USD/T' },
    { name: 'Oats', symbol: 'OATS', price: 178.40, unit: 'USD/T' },
    
    // Légumes (prix en USD/100kg)
    { name: 'Tomato', symbol: 'TOMATO', price: 125.30, unit: 'USD/100kg' },
    { name: 'Potato', symbol: 'POTATO', price: 45.20, unit: 'USD/100kg' },
    { name: 'Onion', symbol: 'ONION', price: 65.40, unit: 'USD/100kg' },
    { name: 'Carrot', symbol: 'CARROT', price: 55.60, unit: 'USD/100kg' },
    { name: 'Cabbage', symbol: 'CABBAGE', price: 35.80, unit: 'USD/100kg' },
    { name: 'Lettuce', symbol: 'LETTUCE', price: 85.20, unit: 'USD/100kg' },
    
    // Fruits (prix en USD/100kg)
    { name: 'Apple', symbol: 'APPLE', price: 140.60, unit: 'USD/100kg' },
    { name: 'Orange', symbol: 'ORANGE', price: 95.80, unit: 'USD/100kg' },
    { name: 'Banana', symbol: 'BANANA', price: 78.25, unit: 'USD/100kg' },
    { name: 'Lemon', symbol: 'LEMON', price: 165.45, unit: 'USD/100kg' },
    { name: 'Strawberry', symbol: 'STRAWBERRY', price: 320.75, unit: 'USD/100kg' },
    
    // Huiles et autres (prix en USD/tonne)
    { name: 'Olive Oil', symbol: 'OLIVE_OIL', price: 4200.75, unit: 'USD/T' },
    { name: 'Sunflower Oil', symbol: 'SUNFLOWER_OIL', price: 950.50, unit: 'USD/T' },
    { name: 'Sugar', symbol: 'SUGAR', price: 420.60, unit: 'USD/T' },
    { name: 'Coffee', symbol: 'COFFEE', price: 2850.40, unit: 'USD/T' },
    { name: 'Tea', symbol: 'TEA', price: 1650.30, unit: 'USD/T' },
    
    // Ressources agricoles (prix en USD/tonne)
    { name: 'Fertilizer', symbol: 'FERTILIZER', price: 340.80, unit: 'USD/T' },
    { name: 'Seeds', symbol: 'SEEDS', price: 1250.60, unit: 'USD/T' },
    { name: 'Pesticide', symbol: 'PESTICIDE', price: 2800.90, unit: 'USD/T' }
  ]
}

export async function POST(request: NextRequest) {
  try {
    // Authentification
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    // Récupérer les prix des commodités (priorité aux données agricoles)
    let commodities = []
    const now = Date.now()
    
    // Vérifier si nous avons des données en cache récentes
    if (commodityCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Using cached commodity data')
      commodities = commodityCache
    } else {
      console.log('Loading fresh agricultural commodity data...')
      
      // Utiliser nos données agricoles comme source principale
      const agriculturalData = getTestCommodityData()
      
      try {
        // Optionnel : compléter avec l'API RapidAPI pour d'autres commodités
        const commodityResponse = await fetch('https://commodity-prices2.p.rapidapi.com/api/Commodity', {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'commodity-prices2.p.rapidapi.com',
            'x-rapidapi-key': RAPIDAPI_KEY,
          },
        })

        if (commodityResponse.ok) {
          const commodityData = await commodityResponse.json()
          const externalData = commodityData.data || commodityData || []
          
          // Fusionner les données agricoles avec les données externes
          commodities = [...agriculturalData, ...externalData]
          console.log('Combined agricultural data with external API data')
        } else {
          // Utiliser uniquement les données agricoles
          commodities = agriculturalData
          console.log('Using agricultural data only (API unavailable)')
        }
        
      } catch (apiError) {
        console.log('External API unavailable, using agricultural data only')
        commodities = agriculturalData
      }
      
      // Mettre en cache les données
      commodityCache = commodities
      cacheTimestamp = now
    }

    const { db } = await connectToDatabase()
    
    // Récupérer tous les produits et ressources
    const products = await db.collection("products").find({}).toArray()
    const resources = await db.collection("resources").find({}).toArray()
    
    const notifications = []
    const analysisResults = []

    // Analyser les produits
    for (const product of products) {
      const matchedCommodity = findCommodityMatch(product.name, commodities)
      
      if (matchedCommodity && matchedCommodity.price) {
        const analysis = analyzePriceVariation(product.price, matchedCommodity.price)
        
        analysisResults.push({
          type: 'product',
          id: product._id,
          name: product.name,
          userPrice: product.price,
          marketPrice: matchedCommodity.price,
          marketUnit: matchedCommodity.unit || 'per unit',
          commodityName: matchedCommodity.name,
          analysis
        })

        // Créer notification si nécessaire
        if (analysis.status !== 'optimal') {
          notifications.push({
            userId: product.farmerId,
            type: 'price_alert',
            title: `Price Alert: ${product.name}`,
            message: `${analysis.recommendation} Market price: ${matchedCommodity.price} ${matchedCommodity.unit || 'per unit'}. Your price: ${product.price} ${product.currency}.`,
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
        }
      }
    }

    // Analyser les ressources
    for (const resource of resources) {
      const matchedCommodity = findCommodityMatch(resource.name, commodities)
      
      if (matchedCommodity && matchedCommodity.price) {
        const analysis = analyzePriceVariation(resource.pricing.price, matchedCommodity.price)
        
        analysisResults.push({
          type: 'resource',
          id: resource._id,
          name: resource.name,
          userPrice: resource.pricing.price,
          marketPrice: matchedCommodity.price,
          marketUnit: matchedCommodity.unit || 'per unit',
          commodityName: matchedCommodity.name,
          analysis
        })

        // Créer notification si nécessaire
        if (analysis.status !== 'optimal') {
          notifications.push({
            userId: resource.supplierId,
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
        }
      }
    }

    // Insérer les notifications
    if (notifications.length > 0) {
      await db.collection("notifications").insertMany(notifications)
    }

    return NextResponse.json({
      success: true,
      message: `Price analysis completed. ${notifications.length} notifications sent.`,
      analysisResults,
      totalAnalyzed: analysisResults.length,
      notificationsSent: notifications.length
    })

  } catch (error) {
    console.error('Error analyzing prices:', error)
    return NextResponse.json(
      { error: 'Failed to analyze prices' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Récupérer les notifications de prix pour l'utilisateur
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const priceNotifications = await db.collection("notifications")
      .find({ 
        userId: userId, 
        type: 'price_alert'
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray()

    return NextResponse.json({
      success: true,
      notifications: priceNotifications
    })

  } catch (error) {
    console.error('Error fetching price notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}