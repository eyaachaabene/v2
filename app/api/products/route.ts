import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Product } from "@/lib/models/User"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    // Get search parameters directly from the request
    const searchParams = request.nextUrl.searchParams
    
    // Get and validate parameters
    const category = searchParams.get("category") || null
    const governorate = searchParams.get("governorate") || null
    const userId = searchParams.get("userId") || null
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || null

    const db = await getDatabase()
    const productsCollection = db.collection<Product>("products")

    // Build query
    const query: any = {}

    console.log("Received governorate:", governorate);
    console.log("Received category:", category);
    console.log("Raw search params:", Object.fromEntries(searchParams.entries()));

    if (category && category !== "null" && category !== "undefined") {
      query.category = category
      console.log("Added category to query:", category);
    }

    if (governorate && governorate !== "null" && governorate !== "undefined") {
      query["location.governorate"] = governorate
      console.log("Added governorate to query:", governorate);
    }

    if (userId && userId !== "null" && userId !== "undefined") {
      if (ObjectId.isValid(userId)) {
        query.farmerId = new ObjectId(userId)
        console.log("Added farmerId to query:", userId);
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    // Get products with farmer info
    console.log("Query:", query);
    const products = await productsCollection
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "farmerId",
            foreignField: "_id",
            as: "farmer",
          },
        },
        { $unwind: "$farmer" },
        {
          $project: {
            "farmer.password": 0,
            "farmer.verification": 0,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ])
      .toArray()
    // Get total count
    const total = await productsCollection.countDocuments(query)

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Get products error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const productData = await request.json()

    const db = await getDatabase()
    const productsCollection = db.collection<Product>("products")

    const newProduct: Product = {
      ...productData,
      farmerId: new ObjectId(token.userId),
      ratings: {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      },
      seo: {
        slug: productData.name.toLowerCase().replace(/\s+/g, "-"),
        metaTitle: productData.name,
        metaDescription: productData.description.substring(0, 160),
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await productsCollection.insertOne(newProduct)

    return NextResponse.json(
      {
        message: "Product created successfully",
        product: { ...newProduct, _id: result.insertedId },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Create product error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("id")

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const productData = await request.json()
    const db = await getDatabase()
    const productsCollection = db.collection<Product>("products")

    // Check if product exists and belongs to the user
    const existingProduct = await productsCollection.findOne({
      _id: new ObjectId(productId),
      farmerId: new ObjectId(token.userId)
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    // Update product
    const updatedProduct = {
      ...productData,
      farmerId: new ObjectId(token.userId),
      updatedAt: new Date(),
    }

    const result = await productsCollection.updateOne(
      { _id: new ObjectId(productId) },
      { $set: updatedProduct }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product: { ...updatedProduct, _id: productId }
    })

  } catch (error) {
    console.error("[v0] Update product error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("id")

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const productsCollection = db.collection<Product>("products")

    // Check if product exists and belongs to the user
    const existingProduct = await productsCollection.findOne({
      _id: new ObjectId(productId),
      farmerId: new ObjectId(token.userId)
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    // Delete product
    const result = await productsCollection.deleteOne({
      _id: new ObjectId(productId),
      farmerId: new ObjectId(token.userId)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Product deleted successfully"
    })

  } catch (error) {
    console.error("[v0] Delete product error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
