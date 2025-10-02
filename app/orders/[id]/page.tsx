"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, MapPin, Phone, ShoppingCart, ArrowLeft } from "lucide-react";
import { DashboardNav } from "@/components/dashboard-nav";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

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
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    governorate: string;
    phone: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  seller?: {
    _id: string;
    firstName: string;
    lastName: string;
    name?: string;
    avatar?: string;
    email: string;
  };
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch order');
      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading order...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">Order not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Button>
        <Card>
          <CardHeader>
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
            <div className="mt-2">
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
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
            {order.shippingAddress && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Shipping Address:</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                    <div>
                      <p className="font-medium">{order.shippingAddress.fullName}</p>
                      <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress.city}, {order.shippingAddress.governorate}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span className="text-sm text-gray-600">{order.shippingAddress.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {order.notes && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Notes:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
              </div>
            )}
            <div className="flex justify-end">
              <div className="text-2xl font-bold text-primary">
                Total: {formatPrice(order.total, 'TND')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
