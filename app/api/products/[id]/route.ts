import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] Fetching product for ID: ${params.id}`)
    
    const { db } = await connectToDatabase()
    console.log(`[API] Database connection established`)
    
    if (!ObjectId.isValid(params.id)) {
      console.log(`[API] Invalid ObjectId: ${params.id}`)
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      )
    }

    const product = await db.collection("products").findOne({ 
      _id: new ObjectId(params.id) 
    })

    if (!product) {
      console.log(`[API] Product not found: ${params.id}`)
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    console.log(`[API] Product found successfully`)
    return NextResponse.json({
      product: product
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] Updating product for ID: ${params.id}`)
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const { db } = await connectToDatabase()
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      )
    }

    // Check if product exists and user owns it
    const existingProduct = await db.collection("products").findOne({ 
      _id: new ObjectId(params.id) 
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Check ownership
    if (existingProduct.farmer._id.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "You don't have permission to edit this product" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, category, pricing, availability, tags, images } = body

    const updateData = {
      name,
      description,
      category,
      pricing,
      availability,
      tags: tags || [],
      images: images || [],
      updatedAt: new Date()
    }

    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Fetch updated product
    const updatedProduct = await db.collection("products").findOne({ 
      _id: new ObjectId(params.id) 
    })

    console.log(`[API] Product updated successfully`)
    return NextResponse.json({
      product: updatedProduct,
      message: "Product updated successfully"
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] Deleting product for ID: ${params.id}`)
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const { db } = await connectToDatabase()
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      )
    }

    // Check if product exists and user owns it
    const existingProduct = await db.collection("products").findOne({ 
      _id: new ObjectId(params.id) 
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Check ownership
    if (existingProduct.farmer._id.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this product" },
        { status: 403 }
      )
    }

    const result = await db.collection("products").deleteOne({
      _id: new ObjectId(params.id)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    console.log(`[API] Product deleted successfully`)
    return NextResponse.json({
      message: "Product deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}