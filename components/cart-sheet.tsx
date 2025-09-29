"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Plus, Minus, Trash2, Package } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import Link from "next/link"

export function CartSheet() {
  const { state, updateQuantity, removeFromCart, clearCart, toggleCart, setCartOpen } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleQuantityChange = (id: string, newQuantity: number) => {
    const item = state.items.find(item => item.id === id)
    if (item && item.minimumOrder && newQuantity < item.minimumOrder) {
      toast.error(`Minimum order quantity is ${item.minimumOrder}`)
      return
    }
    if (item && item.maxQuantity && newQuantity > item.maxQuantity) {
      toast.error(`Maximum quantity available is ${item.maxQuantity}`)
      return
    }
    updateQuantity(id, newQuantity)
  }

  const handleCheckout = async () => {
    if (state.items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    setIsCheckingOut(true)
    try {
      // Create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          items: state.items,
          total: state.total
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const order = await response.json()
      
      // Clear cart and close
      clearCart()
      setCartOpen(false)
      
      toast.success("Order placed successfully!")
      
      // Redirect to order confirmation
      window.location.href = `/orders/${order.orderId}`
      
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error("Failed to place order. Please try again.")
    } finally {
      setIsCheckingOut(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return `${price.toFixed(2)} ${currency}`
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {state.itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {state.itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
            {state.itemCount > 0 && (
              <Badge variant="secondary">
                {state.itemCount} item{state.itemCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {state.items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-4">
                Add some products or resources to get started
              </p>
              <Button asChild>
                <Link href="/marketplace">
                  Browse Marketplace
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4">
                {state.items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{item.name}</h4>
                          <p className="text-sm text-gray-600 truncate">{item.description}</p>
                          <p className="text-sm font-medium text-primary">
                            {formatPrice(item.price, item.currency)}/{item.unit}
                          </p>
                          
                          {item.minimumOrder && (
                            <p className="text-xs text-gray-500">
                              Min. order: {item.minimumOrder} {item.unit}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 h-6 text-center text-sm"
                              min={item.minimumOrder || 1}
                              max={item.maxQuantity}
                            />
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {/* Total Price */}
                          <p className="font-medium text-sm">
                            {formatPrice(item.price * item.quantity, item.currency)}
                          </p>
                          
                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(state.total, 'TND')}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full"
                  >
                    {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="flex-1"
                    >
                      Clear Cart
                    </Button>
                    
                    <Button variant="ghost" asChild className="flex-1">
                      <Link href="/marketplace">
                        Continue Shopping
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Cart Notes */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Minimum order quantities apply for some items</p>
                  <p>• Final prices may vary based on availability</p>
                  <p>• Delivery charges will be calculated at checkout</p>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}