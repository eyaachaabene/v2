import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password: string
  role: "farmer" | "buyer" | "supplier" | "admin" | "partner" | "ngo"
  profile: {
    firstName: string
    lastName: string
    phone: string
    avatar?: string
    location: {
      governorate: string
      city: string
      address?: string
      coordinates: {
        lat: number
        lng: number
      }
    }
    dateOfBirth?: Date
    gender?: string
    languages: string[]
    interests: string[]
  }
  farmerProfile?: {
    farmName: string
    farmSize: number
    farmingExperience: number
    specializations: string[]
    certifications: string[]
    farmLocation: {
      address: string
      coordinates: {
        lat: number
        lng: number
      }
    }
    bankDetails?: {
      accountNumber: string
      bankName: string
      iban: string
    }
  }
  buyerProfile?: {
    companyName: string
    businessType: string
    taxId: string
    preferredProducts: string[]
    averageOrderValue: number
  }
  supplierProfile?: {
    companyName: string
    businessType: string
    taxId: string
    suppliedProducts: string[]
    serviceArea: string[]
    certifications: string[]
    establishedYear: number
  }
  preferences: {
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
    language: string
    currency: string
  }
  verification: {
    emailVerified: boolean
    phoneVerified: boolean
    identityVerified: boolean
    farmVerified?: boolean
  }
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  isActive: boolean
}

export interface Product {
  _id?: ObjectId
  farmerId: ObjectId
  name: string
  description: string
  category: string
  subcategory: string
  images: string[]
  pricing: {
    price: number
    unit: string
    currency: string
    minimumOrder: number
    bulkDiscounts: Array<{
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
  quality: {
    organic: boolean
    certifications: string[]
    gradeLevel: string
    qualityScore: number
  }
  specifications: {
    origin: string
    processingMethod: string
    storageConditions: string
    shelfLife: string
    nutritionalInfo?: object
  }
  tags: string[]
  ratings: {
    averageRating: number
    totalReviews: number
    ratingDistribution: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
  }
  seo: {
    slug: string
    metaTitle: string
    metaDescription: string
  }
  location: {
    governorate: string
    city: string
    coordinates: {
      latitude: number
      longitude: number
    }
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IoTSensor {
  _id?: ObjectId
  farmerId: ObjectId
  sensorId: string
  name: string
  type: "soil_moisture" | "temperature" | "ph" | "humidity"
  location: {
    fieldName: string
    coordinates: {
      lat: number
      lng: number
    }
    depth?: number
  }
  specifications: {
    model: string
    manufacturer: string
    installationDate: Date
    calibrationDate: Date
    batteryLevel: number
    signalStrength: number
  }
  thresholds: {
    min: number
    max: number
    optimal: {
      min: number
      max: number
    }
  }
  status: "Online" | "Offline" | "Maintenance" | "Error"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SensorReading {
  _id?: ObjectId
  sensorId: ObjectId
  farmerId: ObjectId
  readings: {
    value: number
    unit: string
    quality: "Good" | "Fair" | "Poor"
    batteryLevel: number
    signalStrength: number
  }
  alerts: Array<{
    type: string
    severity: "low" | "medium" | "high" | "critical"
    message: string
    acknowledged: boolean
    acknowledgedAt?: Date
  }>
  weather?: {
    temperature: number
    humidity: number
    rainfall: number
    windSpeed: number
  }
  timestamp: Date
  processed: boolean
}
