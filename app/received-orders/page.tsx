"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { 
  ShoppingBag, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"

interface OrderItem {
  id: string
  name: string
  description: string
  price: number
  currency: string
  unit: string
  quantity: number
  image?: string
  category: string
  type: 'product' | 'resource'
  supplierId?: string
  farmerId?: string
}

interface ReceivedOrder {
  _id: string
  userId: string
  items: OrderItem[]
  total: number
  sellerTotal: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress?: {
    fullName: string
    address: string
    city: string
    governorate: string
    phone: string
  }
  notes?: string
  createdAt: string
  updatedAt: string
  buyer?: {
    _id: string
    firstName: string
    lastName: string
    name?: string
    avatar?: string
    email: string
    phone?: string
  }
  sellerResponse?: {
    action: 'accept' | 'reject'
    reason?: string
    respondedAt: string
    respondedBy: string
  }
}

export default function ReceivedOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<ReceivedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<ReceivedOrder | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchReceivedOrders()
  }, [])

  const fetchReceivedOrders = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('/api/orders/received', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch received orders",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching received orders:', error)
      toast({
        title: "Error",
        description: "Error fetching received orders",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOrderAction = async (orderId: string, action: 'accept' | 'reject', reason?: string) => {
    setActionLoading(orderId)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to perform this action",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/orders/received', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          action,
          reason
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Order ${action}ed successfully`,
        })
        setRejectionReason("")
        setSelectedOrder(null)
        fetchReceivedOrders()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || `Failed to ${action} order`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error(`Error ${action}ing order:`, error)
      toast({
        title: "Error",
        description: `Error ${action}ing order`,
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'shipped':
        return 'bg-orange-100 text-orange-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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

  const formatPrice = (price: number, currency: string) => {
    return `${price.toFixed(2)} ${currency}`
  }

  const filterOrdersByStatus = (status: string) => {
    if (status === 'all') return orders
    return orders.filter(order => order.status === status)
  }

  const filteredOrders = filterOrdersByStatus(activeTab)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading received orders...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Received Orders</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Confirmed
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Cancelled
            </TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="all">All Orders</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No {activeTab === 'all' ? '' : activeTab} orders found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <Card key={order._id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-lg">Order #{order._id.slice(-8)}</CardTitle>
                          <CardDescription className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(order.createdAt)}
                            </span>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.toUpperCase()}
                            </Badge>
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {formatPrice(order.sellerTotal, order.items[0]?.currency || 'TND')}
                          </p>
                          <p className="text-sm text-muted-foreground">Your earnings</p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Buyer Information */}
                      {order.buyer && (
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={order.buyer.avatar} />
                            <AvatarFallback>
                              {order.buyer.firstName?.[0]}{order.buyer.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {order.buyer.name || `${order.buyer.firstName} ${order.buyer.lastName}`}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {order.buyer.email}
                              </span>
                              {order.buyer.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {order.buyer.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Order Items */}
                      <div className="space-y-3">
                        <h4 className="font-semibold">Items Ordered:</h4>
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium">{item.name}</h5>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} {item.unit} × {formatPrice(item.price, item.currency)}
                              </p>
                              <Badge variant="outline" className="mt-1">
                                {item.type === 'product' ? 'Product' : 'Resource'}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {formatPrice(item.price * item.quantity, item.currency)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold mb-2">Shipping Address:</h4>
                          <p className="text-sm">
                            {order.shippingAddress.fullName}<br />
                            {order.shippingAddress.address}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.governorate}<br />
                            Phone: {order.shippingAddress.phone}
                          </p>
                        </div>
                      )}

                      {/* Notes */}
                      {order.notes && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold mb-2">Customer Notes:</h4>
                          <p className="text-sm">{order.notes}</p>
                        </div>
                      )}

                      {/* Seller Response */}
                      {order.sellerResponse && (
                        <div className={`p-4 rounded-lg ${
                          order.sellerResponse.action === 'accept' 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <h4 className="font-semibold mb-2">Your Response:</h4>
                          <p className="text-sm">
                            <strong>{order.sellerResponse.action === 'accept' ? 'Accepted' : 'Rejected'}</strong>
                            {' '}on {formatDate(order.sellerResponse.respondedAt)}
                          </p>
                          {order.sellerResponse.reason && (
                            <p className="text-sm mt-1">
                              <strong>Reason:</strong> {order.sellerResponse.reason}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {order.status === 'pending' && !order.sellerResponse && (
                        <div className="flex gap-3 pt-4 border-t">
                          <Button
                            onClick={() => handleOrderAction(order._id, 'accept')}
                            disabled={actionLoading === order._id}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {actionLoading === order._id ? 'Processing...' : 'Accept Order'}
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                className="flex-1"
                                disabled={actionLoading === order._id}
                                onClick={() => setSelectedOrder(order)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Order
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Reject Order</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for rejecting this order (optional)
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="reason">Reason for rejection</Label>
                                  <Textarea
                                    id="reason"
                                    placeholder="e.g., Out of stock, Quality concerns, etc."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="resize-none"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleOrderAction(order._id, 'reject', rejectionReason)}
                                  disabled={actionLoading === order._id}
                                >
                                  {actionLoading === order._id ? 'Processing...' : 'Reject Order'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}