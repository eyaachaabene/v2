"use client"

import { useCart } from "@/contexts/cart-context"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"

export function CartIndicator() {
  const { state } = useCart()

  if (state.itemCount === 0) {
    return (
      <ShoppingCart className="h-4 w-4" />
    )
  }

  return (
    <div className="relative">
      <ShoppingCart className="h-4 w-4" />
      <Badge
        variant="destructive"
        className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
      >
        {state.itemCount > 99 ? '99+' : state.itemCount}
      </Badge>
    </div>
  )
}