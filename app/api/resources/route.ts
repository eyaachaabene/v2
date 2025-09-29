import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Resource } from "@/lib/models/Resource"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    // Get and validate parameters
    const category = searchParams.get("category") || null
    const governorate = searchParams.get("governorate") || null
    const supplierId = searchParams.get("supplierId") || null
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || null
    const userOnly = searchParams.get("userOnly") === "true"

    const db = await getDatabase()
    const resourcesCollection = db.collection<Resource>("resources")

    // Build query
    const query: any = {}

    // If userOnly is true, get user ID from token
    if (userOnly) {
      const authHeader = request.headers.get("authorization")
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Authorization token required" },
          { status: 401 }
        )
      }

      const token = authHeader.split(" ")[1]
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
        query.supplierId = decoded.userId
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        )
      }
    }

    console.log("Received governorate:", governorate)
    console.log("Received category:", category)
    console.log("Raw search params:", Object.fromEntries(searchParams.entries()))
    console.log("Checking resources collection...")

    if (category && category !== "null" && category !== "undefined") {
      query.category = category
      console.log("Added category to query:", category)
    }

    if (governorate && governorate !== "null" && governorate !== "undefined") {
      query["location.governorate"] = governorate
      console.log("Added governorate to query:", governorate)
    }

    if (supplierId && supplierId !== "null" && supplierId !== "undefined") {
      if (ObjectId.isValid(supplierId)) {
        query.supplierId = new ObjectId(supplierId)
        console.log("Added supplierId to query:", supplierId)
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    // Get resources with supplier info
    const resources = await resourcesCollection
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "supplierId",
            foreignField: "_id",
            as: "supplier"
          }
        },
        { $unwind: "$supplier" },
        {
          $project: {
            name: 1,
            description: 1,
            category: 1,
            type: 1,
            images: 1,
            pricing: 1,
            specifications: 1,
            availability: 1,
            location: 1,
            "supplier.profile.firstName": 1,
            "supplier.profile.lastName": 1,
            "supplier.role": 1,
            ratings: 1,
            tags: 1,
            supplierId: 1,
            createdAt: 1,
            updatedAt: 1
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ])
      .toArray()

    // Get total count
    const total = await resourcesCollection.countDocuments(query)
    
    console.log("Found resources:", resources.length)
    console.log("Total count:", total)

    return NextResponse.json({
      resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("[v0] Get resources error:", error)
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/resources - Start")
    
    const authHeader = request.headers.get("authorization")
    console.log("Auth header:", authHeader)
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No auth header or wrong format")
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const tokenString = authHeader.split(" ")[1]
    console.log("Token string length:", tokenString.length)
    
    let token
    try {
      token = jwt.verify(tokenString, process.env.JWT_SECRET || "fallback-secret") as any
      console.log("Token decoded successfully:", { userId: token.userId, role: token.role })
    } catch (error) {
      console.log("Token verification failed:", error)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Vérifier que l'utilisateur est un supplier
    const db = await getDatabase()
    const usersCollection = db.collection("users")
    const user = await usersCollection.findOne({ _id: new ObjectId(token.userId) })
    
    console.log("User found:", user ? { id: user._id, role: user.role } : "null")

    if (!user) {
      console.log("User not found in database")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== "Supplier" && user.role !== "supplier" && user.role !== "admin") {
      console.log("User role not authorized:", user.role)
      return NextResponse.json({ error: "Only suppliers can add resources" }, { status: 403 })
    }

    console.log("User authorized, proceeding with resource creation")

    const resourceData = await request.json()

    // Créer la nouvelle ressource
    const newResource: Omit<Resource, '_id'> = {
      supplierId: new ObjectId(token.userId),
      name: resourceData.name,
      description: resourceData.description,
      category: resourceData.category,
      type: resourceData.type,
      images: resourceData.images || [],
      pricing: {
        price: resourceData.pricing.price,
        unit: resourceData.pricing.unit,
        currency: resourceData.pricing.currency || "TND",
        minimumOrder: resourceData.pricing.minimumOrder || 1,
        bulkDiscounts: resourceData.pricing.bulkDiscounts || []
      },
      specifications: {
        brand: resourceData.specifications.brand || "",
        model: resourceData.specifications.model || "",
        manufacturer: resourceData.specifications.manufacturer || "",
        weight: resourceData.specifications.weight,
        dimensions: resourceData.specifications.dimensions,
        activeIngredients: resourceData.specifications.activeIngredients || [],
        composition: resourceData.specifications.composition,
        applicationMethod: resourceData.specifications.applicationMethod,
        safetyPeriod: resourceData.specifications.safetyPeriod,
        certifications: resourceData.specifications.certifications || []
      },
      availability: {
        status: resourceData.availability.status || "available",
        quantity: resourceData.availability.quantity || 0,
        leadTime: resourceData.availability.leadTime || "1-3 days",
        shippingInfo: {
          methods: resourceData.availability.shippingInfo?.methods || ["pickup"],
          costs: resourceData.availability.shippingInfo?.costs || {}
        }
      },
      location: {
        governorate: user.profile.location.governorate,
        city: user.profile.location.city,
        coordinates: {
          lat: user.profile.location.coordinates.lat,
          lng: user.profile.location.coordinates.lng
        }
      },
      ratings: {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {}
      },
      tags: resourceData.tags || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const resourcesCollection = db.collection<Resource>("resources")
    const result = await resourcesCollection.insertOne(newResource as Resource)

    return NextResponse.json({
      message: "Resource created successfully",
      resourceId: result.insertedId
    }, { status: 201 })

  } catch (error) {
    console.error("[v0] Create resource error:", error)
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 })
  }
}