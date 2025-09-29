"use client"

import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"

interface Product {
  _id: string
  name: string  
  description: string
  category: string
  images: string[]
  pricing: {
    price: number
    currency: string
    unit: string
  }
  availability: {
    status: string
    quantity: number
  }
  farmer?: {
    _id: string
    name: string
  }
}

interface Resource {
  _id: string
  name: string
  description: string
  category: string
  type: string
  images: string[]
  pricing: {
    price: number
    currency: string
    unit: string
    minimumOrder: number
  }
  availability: {
    status: string
    quantity: number
  }
  supplierId: string
}

export const useAddToCart = () => {
  const { addToCart } = useCart()

  const addProductToCart = (product: Product, quantity: number = 1) => {
    if (product.availability.status !== 'available' && product.availability.status !== 'In Stock') {
      toast.error("This product is currently not available")
      return false
    }

    if (quantity > product.availability.quantity) {
      toast.error(`Only ${product.availability.quantity} items available`)
      return false
    }

    addToCart({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.pricing.price,
      currency: product.pricing.currency,
      unit: product.pricing.unit,
      quantity,
      image: product.images?.[0],
      category: product.category,
      type: 'product',
      farmerId: product.farmer?._id,
      maxQuantity: product.availability.quantity
    })

    return true
  }

  const addResourceToCart = (resource: Resource, quantity: number = 1) => {
    if (resource.availability.status !== 'available') {
      toast.error("This resource is currently not available")
      return false
    }

    if (quantity < resource.pricing.minimumOrder) {
      toast.error(`Minimum order quantity is ${resource.pricing.minimumOrder}`)
      return false
    }

    if (quantity > resource.availability.quantity) {
      toast.error(`Only ${resource.availability.quantity} items available`)
      return false
    }

    addToCart({
      id: resource._id,
      name: resource.name,
      description: resource.description,
      price: resource.pricing.price,
      currency: resource.pricing.currency,
      unit: resource.pricing.unit,
      quantity,
      image: resource.images?.[0],
      category: resource.category,
      type: 'resource',
      supplierId: resource.supplierId,
      minimumOrder: resource.pricing.minimumOrder,
      maxQuantity: resource.availability.quantity
    })

    return true
  }

  return {
    addProductToCart,
    addResourceToCart
  }
}