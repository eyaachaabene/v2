"use client"

import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Upload, Image as ImageIcon, Edit, Trash2 } from "lucide-react"
import { type Product } from "@/hooks/use-products"

interface EditProductFormProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onProductUpdated: () => void
  onProductDeleted: () => void
}

export function EditProductForm({ product, isOpen, onClose, onProductUpdated, onProductDeleted }: EditProductFormProps) {
  type AvailabilityStatus = "In Stock" | "Limited" | "Out of Stock" | "Seasonal"
  
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    pricing: {
      price: product.pricing.price,
      unit: product.pricing.unit,
      currency: product.pricing.currency
    },
    category: product.category,
    availability: {
      status: product.availability.status as AvailabilityStatus,
      quantity: product.availability.quantity
    },
    location: {
      governorate: product.location.governorate,
      city: product.location.city,
      coordinates: {
        latitude: product.location.coordinates.latitude,
        longitude: product.location.coordinates.longitude
      }
    },
    tags: product.tags || [],
    images: product.images || []
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>(product.images || [])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update form data when product changes
  useEffect(() => {
    setFormData({
      name: product.name,
      description: product.description,
      pricing: {
        price: product.pricing.price,
        unit: product.pricing.unit,
        currency: product.pricing.currency
      },
      category: product.category,
      availability: {
        status: product.availability.status as AvailabilityStatus,
        quantity: product.availability.quantity
      },
      location: {
        governorate: product.location.governorate,
        city: product.location.city,
        coordinates: {
          latitude: product.location.coordinates.latitude,
          longitude: product.location.coordinates.longitude
        }
      },
      tags: product.tags || [],
      images: product.images || []
    })
    setUploadedImages(product.images || [])
  }, [product])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Upload failed")
        }

        const result = await response.json()
        return result.filename
      })

      const newImagePaths = await Promise.all(uploadPromises)
      const updatedImages = [...uploadedImages, ...newImagePaths]
      
      setUploadedImages(updatedImages)
      setFormData({ ...formData, images: updatedImages })
      
      toast.success(`${files.length} image(s) uploaded successfully!`)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload images. Please try again.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(updatedImages)
    setFormData({ ...formData, images: updatedImages })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`/api/products?id=${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      toast.success("Product updated successfully!")
      onClose()
      onProductUpdated()
    } catch (error) {
      toast.error("Failed to update product. Please try again.")
      console.error("Error updating product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`/api/products?id=${product._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      toast.success("Product deleted successfully!")
      onClose()
      onProductDeleted()
    } catch (error) {
      toast.error("Failed to delete product. Please try again.")
      console.error("Error deleting product:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit Product
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogTitle>
          <DialogDescription>
            Update your product information below.
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Product Images</label>
            <div className="space-y-3">
              {/* Upload Button */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Add Images
                    </>
                  )}
                </Button>
                <span className="text-xs text-gray-500">
                  Max 5MB per file. JPG, PNG, GIF, WebP supported.
                </span>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Image Preview */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {uploadedImages.map((imagePath, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                        <img
                          src={imagePath}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadedImages.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No images uploaded yet</p>
                  <p className="text-xs text-gray-400">Click "Add Images" to upload product photos</p>
                </div>
              )}
            </div>
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}