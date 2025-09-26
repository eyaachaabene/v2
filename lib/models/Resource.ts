import { ObjectId } from "mongodb"

export interface Resource {
  _id: ObjectId
  supplierId: ObjectId
  name: string
  description: string
  category: string
  type: string
  images: string[]
  pricing: {
    price: number
    unit: string
    currency: string
    minimumOrder: number
    bulkDiscounts?: {
      quantity: number
      discountPercentage: number
    }[]
  }
  specifications: {
    brand: string
    model: string
    manufacturer: string
    weight?: number
    dimensions?: {
      length: number
      width: number
      height: number
      unit: string
    }
    activeIngredients?: string[]
    composition?: any
    applicationMethod?: string
    safetyPeriod?: string
    certifications: string[]
  }
  availability: {
    status: string
    quantity: number
    leadTime: string
    shippingInfo: {
      methods: string[]
      costs: Record<string, number>
    }
  }
  location: {
    governorate: string
    city: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  ratings: {
    averageRating: number
    totalReviews: number
    ratingDistribution: Record<string, number>
  }
  tags: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}