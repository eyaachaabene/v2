"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Calendar, Package, Trash2, Edit } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
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
  tags: string[]
  createdAt: string
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
  tags: string[]
  createdAt: string
}

interface UserItemsGridProps {
  items: Product[] | Resource[]
  itemType: 'products' | 'resources'
  isCurrentUser: boolean
  onItemDelete?: (itemId: string) => void
  onItemEdit?: (itemId: string) => void
}

export function UserItemsGrid({ items, itemType, isCurrentUser, onItemDelete, onItemEdit }: UserItemsGridProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'limited':
        return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'Available'
      case 'limited':
        return 'Limited Stock'
      case 'out_of_stock':
        return 'Out of Stock'
      default:
        return status || 'Unknown'
    }
  }

  const formatPrice = (pricing: any) => {
    return `${pricing.price} ${pricing.currency}/${pricing.unit}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm(`Are you sure you want to delete this ${itemType.slice(0, -1)}?`)) {
      return
    }

    try {
      const endpoint = itemType === 'products' ? `/api/products/${itemId}` : `/api/resources/${itemId}`
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to delete ${itemType.slice(0, -1)}`)
      }

      toast.success(`${itemType.slice(0, -1)} deleted successfully`)
      onItemDelete?.(itemId)
    } catch (error) {
      console.error(`Error deleting ${itemType.slice(0, -1)}:`, error)
      toast.error(`Failed to delete ${itemType.slice(0, -1)}`)
    }
  }

  const handleEdit = (itemId: string) => {
    // Navigate to edit page or open edit modal
    const editPath = itemType === 'products' ? `/dashboard/products/edit/${itemId}` : `/dashboard/resources/edit/${itemId}`
    window.location.href = editPath
  }

  if (!items.length) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No {itemType} yet
        </h3>
        <p className="text-gray-500 mb-4">
          {isCurrentUser 
            ? `Start by adding your first ${itemType.slice(0, -1)}`
            : `This user hasn't added any ${itemType} yet`
          }
        </p>
        {isCurrentUser && (
          <Button asChild>
            <Link href={itemType === 'products' ? '/dashboard/products/add' : '/dashboard/resources/add'}>
              Add {itemType.slice(0, -1)}
            </Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <div className="relative">
            {item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-2 right-2">
              <Badge className={getStatusColor(item.availability.status)}>
                {getStatusText(item.availability.status)}
              </Badge>
            </div>

            {/* Owner Actions */}
            {isCurrentUser && (
              <div className="absolute top-2 left-2 flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEdit(item._id)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(item._id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Title and Category */}
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  {item.category}
                  {'type' in item && ` • ${item.type}`}
                </p>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm line-clamp-2">
                {item.description}
              </p>

              {/* Price */}
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-primary">
                  {formatPrice(item.pricing)}
                </span>
                <span className="text-sm text-gray-500">
                  Qty: {item.availability.quantity}
                </span>
              </div>

              {/* Additional Info for Resources */}
              {'minimumOrder' in item.pricing && (
                <div className="text-sm text-gray-600">
                  Min. Order: {item.pricing.minimumOrder} {item.pricing.unit}
                </div>
              )}

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Date */}
              <div className="flex items-center gap-1 text-xs text-gray-500 pt-2 border-t">
                <Calendar className="h-3 w-3" />
                <span>Added {formatDate(item.createdAt)}</span>
              </div>

              {/* Action Button */}
              {!isCurrentUser && (
                <Button asChild className="w-full mt-3">
                  <Link href={itemType === 'products' ? `/products/${item._id}` : `/resources/${item._id}`}>
                    View Details
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}