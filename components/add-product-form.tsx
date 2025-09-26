"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface AddProductFormProps {
  onProductAdded: () => void
  farmerName: string
  location: {
    governorate: string
    city?: string
  }
}

export function AddProductForm({ onProductAdded, farmerName, location }: AddProductFormProps) {
  type AvailabilityStatus = "In Stock" | "Limited" | "Out of Stock" | "Seasonal"
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricing: {
      price: 0,
      unit: "kg",
      currency: "TND"
    },
    category: "Vegetables",
    availability: {
      status: "In Stock" as AvailabilityStatus,
      quantity: 0
    },
    location: {
      governorate: location.governorate || "",
      city: location.city || "",
      coordinates: {
        latitude: 0,
        longitude: 0
      }
    },
    tags: []
  })

  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get the token from localStorage
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          farmer: {
            name: farmerName,
            rating: 0,
            reviews: 0
          }
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add product")
      }

      toast.success("Product added successfully!")
      setFormData({
        name: "",
        description: "",
        pricing: {
          price: 0,
          unit: "kg",
          currency: "TND"
        },
        category: "Vegetables",
        availability: {
          status: "In Stock",
          quantity: 0
        },
        location: {
          governorate: location.governorate || "",
          city: location.city || "",
          coordinates: {
            latitude: 0,
            longitude: 0
          }
        },
        tags: []
      })
      setIsOpen(false)
      onProductAdded()
    } catch (error) {
      toast.error("Failed to add product. Please try again.")
      console.error("Error adding product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Product</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to add your product to the marketplace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Product Name</label>
            <Input
              id="name"
              required
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea
              id="description"
              required
              placeholder="Describe your product"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">Price</label>
              <Input
                id="price"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.pricing.price}
                onChange={(e) => setFormData({
                  ...formData,
                  pricing: { ...formData.pricing, price: parseFloat(e.target.value) }
                })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="unit" className="text-sm font-medium">Unit</label>
              <Select
                value={formData.pricing.unit}
                onValueChange={(value) => setFormData({
                  ...formData,
                  pricing: { ...formData.pricing, unit: value }
                })}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                  <SelectItem value="g">Gram (g)</SelectItem>
                  <SelectItem value="L">Liter (L)</SelectItem>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">Category</label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vegetables">Vegetables</SelectItem>
                <SelectItem value="Fruits">Fruits</SelectItem>
                <SelectItem value="Grains">Grains</SelectItem>
                <SelectItem value="Dairy">Dairy</SelectItem>
                <SelectItem value="Meat">Meat</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Availability Status</label>
              <Select
                value={formData.availability.status}
                onValueChange={(value: "In Stock" | "Limited" | "Out of Stock" | "Seasonal") =>
                  setFormData({
                    ...formData,
                    availability: { ...formData.availability, status: value }
                  })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Limited">Limited</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  <SelectItem value="Seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">Quantity Available</label>
              <Input
                id="quantity"
                type="number"
                required
                min="0"
                placeholder="Enter available quantity"
                value={formData.availability.quantity}
                onChange={(e) => setFormData({
                  ...formData,
                  availability: { ...formData.availability, quantity: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}