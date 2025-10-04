"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  DollarSign,
  Package,
  Wrench
} from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"
import { useAuth } from "@/hooks/use-auth"
import { useNotifications } from "@/hooks/use-notifications"
import { toast } from "sonner"

interface Analysis {
  status: 'optimal' | 'too_high' | 'too_low' | 'volatile'
  difference: number
  percentage: number
  recommendation: string
}

interface AnalysisResult {
  type: 'product' | 'resource'
  id: string
  name: string
  userPrice: number
  marketPrice: number
  marketUnit: string
  commodityName: string
  analysis: Analysis
}

interface PriceNotification {
  _id: string
  title: string
  message: string
  marketData: {
    commodityName: string
    marketPrice: number
    userPrice: number
    recommendation: string
    status: string
  }
  createdAt: string
  read: boolean
}

export default function PriceAnalysisPage() {
  const { user } = useAuth()
  const { priceAlerts, markAsRead } = useNotifications()
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [notifications, setNotifications] = useState<PriceNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Utiliser les priceAlerts du hook quand elles sont disponibles
  useEffect(() => {
    if (priceAlerts.length > 0) {
      const formattedAlerts = priceAlerts.map(alert => ({
        _id: alert._id,
        title: alert.title,
        message: alert.message,
        marketData: alert.marketData || {
          commodityName: '',
          marketPrice: 0,
          userPrice: 0,
          recommendation: '',
          status: 'volatile'
        },
        createdAt: alert.createdAt instanceof Date ? alert.createdAt.toISOString() : alert.createdAt,
        read: alert.read
      }))
      setNotifications(formattedAlerts)
    }
  }, [priceAlerts])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/price-analysis', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      } else {
        console.error('Failed to fetch notifications:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const runPriceAnalysis = async () => {
    setAnalyzing(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        toast.error("Please log in to run analysis")
        return
      }

      const response = await fetch('/api/price-analysis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Valider et nettoyer les résultats d'analyse
        const validResults = (data.analysisResults || []).filter((result: any) => 
          result && 
          result.name && 
          typeof result.userPrice === 'number' && 
          typeof result.marketPrice === 'number' &&
          result.analysis &&
          typeof result.analysis.percentage === 'number'
        )
        setAnalysisResults(validResults)
        toast.success(`Analysis completed! ${data.notificationsSent || 0} notifications sent.`)
        fetchNotifications() // Refresh notifications
      } else {
        toast.error("Failed to run price analysis")
      }
    } catch (error) {
      console.error('Error running analysis:', error)
      toast.error("Error running price analysis")
    } finally {
      setAnalyzing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'too_high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'too_low':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'volatile':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="h-4 w-4" />
      case 'too_high':
        return <TrendingUp className="h-4 w-4" />
      case 'too_low':
        return <TrendingDown className="h-4 w-4" />
      case 'volatile':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null || isNaN(price)) {
      return '0.00'
    }
    return price.toFixed(2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Price Analysis</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={runPriceAnalysis}
              disabled={analyzing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${analyzing ? 'animate-spin' : ''}`} />
              {analyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
            <Button 
              variant="outline"
              onClick={async () => {
                setLoading(true)
                try {
                  const response = await fetch('/api/price-analysis/demo')
                  if (response.ok) {
                    const data = await response.json()
                    setAnalysisResults(data.analysisResults || [])
                    setNotifications(data.notifications || [])
                    toast.success('Demo analysis loaded!')
                  } else {
                    const errorData = await response.json().catch(() => ({}))
                    toast.error(errorData.error || "Failed to load demo")
                  }
                } catch (error) {
                  console.error('Error loading demo:', error)
                  toast.error("Error loading demo")
                } finally {
                  setLoading(false)
                }
              }}
              disabled={analyzing || loading}
            >
              Load Demo
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                {analysisResults.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Run a price analysis to compare your product prices with market rates.
                    </p>
                    <Button onClick={runPriceAnalysis} disabled={analyzing}>
                      Run First Analysis
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analysisResults.filter(result => 
                      result && 
                      result.name && 
                      typeof result.userPrice === 'number' && 
                      typeof result.marketPrice === 'number' &&
                      result.analysis
                    ).map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            {result.type === 'product' ? 
                              <Package className="h-5 w-5 text-blue-600" /> : 
                              <Wrench className="h-5 w-5 text-green-600" />
                            }
                            <div>
                              <h3 className="font-semibold">{result.name}</h3>
                              <p className="text-sm text-gray-600">
                                Market: {result.commodityName}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(result.analysis.status)}>
                            {getStatusIcon(result.analysis.status)}
                            {result.analysis.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-500">Your Price</p>
                            <p className="text-lg font-semibold">{formatPrice(result.userPrice)} TND</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Market Price</p>
                            <p className="text-lg font-semibold">{formatPrice(result.marketPrice)} {result.marketUnit || 'per unit'}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-sm font-medium text-gray-900 mb-1">Recommendation:</p>
                          <p className="text-sm text-gray-700">{result.analysis.recommendation}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Difference: {result.analysis.percentage ? result.analysis.percentage.toFixed(1) : '0.0'}% 
                            ({(result.analysis.percentage || 0) > 0 ? 'higher' : 'lower'} than market)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notifications Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">
                    <RefreshCw className="h-8 w-8 text-gray-300 mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-gray-600">Loading alerts...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-4">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No price alerts yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification._id} 
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                          notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                        }`}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification._id)
                          }
                        }}
                      >
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                        <div className="mt-2">
                          <Badge className={getStatusColor(notification.marketData.status)}>
                            {notification.marketData.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Market Info */}
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">💰 Smart Price Monitoring</h4>
                  <p>Compare your prices with real-time global commodity markets</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">🔔 Instant Alerts</h4>
                  <p>Get notified when your prices need adjustment</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">📊 Market Intelligence</h4>
                  <p>Make informed pricing decisions based on market trends</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">🎯 Stay Competitive</h4>
                  <p>Optimize your pricing strategy to maximize profits</p>
                </div>
                
                <div className="pt-3 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Supported Commodities:</h4>
                  <div className="text-xs text-gray-500 grid grid-cols-2 gap-1">
                    <span>• Wheat, Rice, Corn</span>
                    <span>• Tomato, Potato, Onion</span>
                    <span>• Apple, Orange, Banana</span>
                    <span>• Olive Oil, Sugar, Coffee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}