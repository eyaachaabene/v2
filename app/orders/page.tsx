"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Calendar, MapPin, Phone, ShoppingCart } from "lucide-react";
import { DashboardNav } from "@/components/dashboard-nav";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface OrderItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  unit: string;
  quantity: number;
  image?: string;
  category: string;
  type: 'product' | 'resource';
  supplierId?: string;
  farmerId?: string;
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress?: { fullName: string; address: string; city: string; governorate: string; phone: string; };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  seller?: { _id: string; firstName: string; lastName: string; name?: string; avatar?: string; email: string; };
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [receivedOrders, setReceivedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("my-orders");
  const [activeTab, setActiveTab] = useState("all");
  const [contactMessage, setContactMessage] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
    if (user?.role === 'farmer' || user?.role === 'supplier') {
      fetchReceivedOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchReceivedOrders = async () => {
    try {
      const response = await fetch('/api/orders/received', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReceivedOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching received orders:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatPrice = (price: number, currency: string) => `${price.toFixed(2)} ${currency}`;

  const filterOrdersByStatus = (status: string) => {
    const currentOrders = viewMode === 'my-orders' ? orders : receivedOrders;
    return status === 'all' ? currentOrders : currentOrders.filter((order: Order) => order.status === status);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) { toast.error("Please log in to cancel orders"); return; }
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (response.ok) { toast.success("Order cancelled successfully"); fetchOrders(); }
      else { toast.error("Failed to cancel order"); }
    } catch (error) { console.error('Error cancelling order:', error); toast.error("Error cancelling order"); }
  };

  const handleContactSeller = async (seller: any, message: string) => {
    if (!seller) { toast.error("No seller information available"); return; }
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) { toast.error("Please log in to send messages"); return; }
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ recipientId: seller._id, subject: `Message from order buyer`, message }),
      });
      if (response.ok) { toast.success("Message sent to seller successfully"); setContactMessage(""); setSelectedSeller(null); }
      else { const errorData = await response.json(); toast.error(errorData.error || "Failed to send message"); }
    } catch (error) { console.error('Error sending message:', error); toast.error("Error sending message"); }
  };

  const handleViewDetails = (orderId: string) => { router.push(`/orders/${orderId}`); };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) { toast.error("Please log in to manage orders"); return; }
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'confirmed' }),
      });
      if (response.ok) { toast.success("Order confirmed successfully"); fetchReceivedOrders(); }
      else { toast.error("Failed to confirm order"); }
    } catch (error) { console.error('Error confirming order:', error); toast.error("Error confirming order"); }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) { toast.error("Please log in to manage orders"); return; }
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (response.ok) { toast.success("Order rejected"); fetchReceivedOrders(); }
      else { toast.error("Failed to reject order"); }
    } catch (error) { console.error('Error rejecting order:', error); toast.error("Error rejecting order"); }
  };

  const filteredOrders = filterOrdersByStatus(activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading orders...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Orders</h1>
        </div>
        {(user?.role === 'farmer' || user?.role === 'supplier') && (
          <div className="mb-6">
            <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="my-orders">My Orders ({orders.length})</TabsTrigger>
                <TabsTrigger value="received-orders">Received Orders ({receivedOrders.length})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({viewMode === 'my-orders' ? orders.length : receivedOrders.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">
                    {activeTab === 'all' 
                      ? `No ${viewMode === 'my-orders' ? 'orders' : 'received orders'} yet`
                      : `No ${activeTab} orders found`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {viewMode === 'my-orders' 
                      ? "Start shopping to see your orders here."
                      : "Orders from customers will appear here."}
                  </p>
                  <Button onClick={() => router.push('/marketplace')}>Browse Marketplace</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order._id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Order #{order._id.slice(-8)}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(order.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <div className="text-2xl font-bold text-primary mt-1">
                            {formatPrice(order.total, 'TND')}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-6">
                        <h4 className="font-medium">Items:</h4>
                        {order.items.map((item, index) => (
                          <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
                            ) : (
                              <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h5 className="font-medium">{item.name}</h5>
                              <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-gray-500">
                                  {item.quantity} × {formatPrice(item.price, item.currency)}/{item.unit}
                                </span>
                                <span className="font-medium">
                                  {formatPrice(item.price * item.quantity, item.currency)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 justify-end">
                        {viewMode === 'my-orders' ? (
                          <>
                            {order.status === 'pending' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">Cancel Order</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel this order? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>No, keep order</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleCancelOrder(order._id)} className="bg-red-600 hover:bg-red-700">
                                      Cancel Order
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedSeller(order.seller)} disabled={!order.seller}>
                                  Contact Seller
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Contact Seller</DialogTitle>
                                  <DialogDescription>
                                    Send a message to {order.seller ? 
                                      (order.seller.name || `${order.seller.firstName} ${order.seller.lastName}`) : 
                                      'Unknown Seller'}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="message" className="text-right">Message</Label>
                                    <Textarea id="message" placeholder="Type your message here..." className="col-span-3" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button type="submit" onClick={() => handleContactSeller(selectedSeller, contactMessage)} disabled={!contactMessage.trim()}>
                                    Send Message
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button size="sm" onClick={() => handleViewDetails(order._id)}>View Details</Button>
                          </>
                        ) : (
                          <>
                            {order.status === 'pending' && (
                              <>
                                <Button variant="outline" size="sm" onClick={() => handleConfirmOrder(order._id)} className="bg-green-50 hover:bg-green-100 text-green-700">
                                  Accept Order
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleRejectOrder(order._id)} className="bg-red-50 hover:bg-red-100 text-red-700">
                                  Reject Order
                                </Button>
                              </>
                            )}
                            <Button size="sm" onClick={() => handleViewDetails(order._id)}>View Details</Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
