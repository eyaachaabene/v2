import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] Fetching user profile for ID: ${params.id}`)
    
    const { db } = await connectToDatabase()
    console.log(`[API] Database connection established`)
    
    if (!ObjectId.isValid(params.id)) {
      console.log(`[API] Invalid ObjectId: ${params.id}`)
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      )
    }

    console.log(`[API] ObjectId is valid: ${params.id}`)

    // Get user with simple query first
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(params.id) },
      { projection: { password: 0 } } // Never include password in response
    )
    
    console.log(`[API] User query result:`, user ? 'User found' : 'User not found')

    if (!user) {
      console.log(`[API] User not found in database: ${params.id}`)
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get product count for farmers
    let productCount = 0
    if (user.role === 'farmer') {
      try {
        productCount = await db.collection("products").countDocuments({ "farmer._id": new ObjectId(params.id) })
        console.log(`[API] Product count for farmer: ${productCount}`)
      } catch (error) {
        console.log(`[API] Error counting products:`, error)
      }
    }

    // Get resource count for suppliers
    let resourceCount = 0
    if (user.role === 'supplier') {
      try {
        resourceCount = await db.collection("resources").countDocuments({ "supplierId": new ObjectId(params.id) })
        console.log(`[API] Resource count for supplier: ${resourceCount}`)
      } catch (error) {
        console.log(`[API] Error counting resources:`, error)
      }
    }

    // Build user profile with stats
    const userProfile = {
      ...user,
      stats: {
        totalProducts: user.role === 'farmer' ? productCount : 0,
        totalResources: user.role === 'supplier' ? resourceCount : 0,
        totalSales: user.profile?.totalSales || 0,
        rating: user.profile?.rating || 0,
        reviewCount: user.profile?.reviewCount || 0,
        yearsExperience: user.profile?.yearsExperience || 0,
        joinedDate: user.createdAt || new Date()
      }
    }

    console.log(`[API] Returning user profile successfully`)
    return NextResponse.json({
      user: userProfile
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // Check if user is updating their own profile
    if (decoded.userId !== params.id) {
      return NextResponse.json(
        { error: "You can only update your own profile" },
        { status: 403 }
      )
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { profile, location } = body

    const { db } = await connectToDatabase()

    const updateData: any = {}
    
    if (profile) {
      updateData.profile = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        address: profile.address,
        bio: profile.bio,
        avatar: profile.avatar
      }
    }

    if (location) {
      updateData.location = {
        governorate: location.governorate,
        city: location.city
      }
    }

    updateData.updatedAt = new Date()

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Fetch updated user profile
    const updatedUser = await db.collection("users").findOne(
      { _id: new ObjectId(params.id) },
      { projection: { password: 0 } }
    )

    return NextResponse.json({
      user: updatedUser,
      message: "Profile updated successfully"
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    )
  }
}