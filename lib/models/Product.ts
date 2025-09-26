
import type { ObjectId } from "mongodb"

export interface Product {
  _id?: ObjectId
  farmerId: ObjectId
  name: string
  description: string
  category: string
  subcategory?: string
  images: string[]
  pricing: {
    price: number
    unit: string
    currency: string
    minimumOrder?: number
    bulkDiscounts?: Array<{
      quantity: number
      discountPercentage: number
    }>
  }
  availability: {
    status: "In Stock" | "Limited" | "Out of Stock" | "Seasonal"
    quantity: number
    harvestDate?: Date
    expiryDate?: Date
    seasonalAvailability?: {
      startMonth: number
      endMonth: number
    }
  }
  quality?: {
    organic?: boolean
    certifications?: string[]
    gradeLevel?: string
    qualityScore?: number
  }
  location: {
    governorate: string
    city: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  specifications?: {
    origin?: string
    processingMethod?: string
    storageConditions?: string
    shelfLife?: string
    nutritionalInfo?: object
  }
  tags: string[]
  ratings: {
    averageRating: number
    totalReviews: number
    ratingDistribution?: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
  }
  seo?: {
    slug?: string
    metaTitle?: string
    metaDescription?: string
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductReview {
  _id?: ObjectId
  productId: ObjectId
  buyerId: ObjectId
  rating: number // 1-5
  comment: string
  createdAt: Date
}
