import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth-middleware"
import { ObjectId } from "mongodb"

// Get single opportunity by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid opportunity ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    const opportunity = await db.collection("opportunities").findOne({ 
      _id: new ObjectId(params.id) 
    })

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
    }

    // Fetch provider information if postedBy exists
    let provider = null
    if (opportunity.postedBy) {
      const providerUser = await db.collection("users").findOne(
        { _id: new ObjectId(opportunity.postedBy) },
        { 
          projection: { 
            _id: 1, 
            'profile.firstName': 1, 
            'profile.lastName': 1,
            'profile.avatar': 1,
            email: 1,
            role: 1
          } 
        }
      )
      if (providerUser) {
        provider = {
          _id: providerUser._id.toString(),
          profile: {
            firstName: providerUser.profile?.firstName || '',
            lastName: providerUser.profile?.lastName || ''
          }
        }
      }
    }

    // Increment view count
    await db.collection("opportunities").updateOne(
      { _id: new ObjectId(params.id) },
      { $inc: { viewCount: 1 } }
    )

    const responseData = {
      ...opportunity,
      _id: opportunity._id.toString(),
      providerId: opportunity.postedBy?.toString(),
      provider
    }

    return NextResponse.json({ opportunity: responseData }, { status: 200 })
  } catch (error) {
    console.error("Error fetching opportunity:", error)
    return NextResponse.json({ error: "Failed to fetch opportunity" }, { status: 500 })
  }
}

// Update opportunity
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid opportunity ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const body = await request.json()

    // Check if user owns this opportunity
    const opportunity = await db.collection("opportunities").findOne({ 
      _id: new ObjectId(params.id),
      postedBy: new ObjectId(token.userId)
    })

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found or unauthorized" }, { status: 404 })
    }

    // Update opportunity
    const updateData = {
      ...body,
      updatedAt: new Date(),
    }

    // Remove fields that shouldn't be updated this way
    delete updateData._id
    delete updateData.postedBy
    delete updateData.currentApplicants
    delete updateData.createdAt

    await db.collection("opportunities").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )

    return NextResponse.json({ 
      message: "Opportunity updated successfully" 
    }, { status: 200 })
  } catch (error) {
    console.error("Error updating opportunity:", error)
    return NextResponse.json({ error: "Failed to update opportunity" }, { status: 500 })
  }
}

// Delete/Close opportunity
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid opportunity ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if user owns this opportunity
    const opportunity = await db.collection("opportunities").findOne({ 
      _id: new ObjectId(params.id),
      postedBy: new ObjectId(token.userId)
    })

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found or unauthorized" }, { status: 404 })
    }

    // Soft delete - change status to closed
    await db.collection("opportunities").updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          status: "closed",
          updatedAt: new Date()
        } 
      }
    )

    return NextResponse.json({ 
      message: "Opportunity closed successfully" 
    }, { status: 200 })
  } catch (error) {
    console.error("Error closing opportunity:", error)
    return NextResponse.json({ error: "Failed to close opportunity" }, { status: 500 })
  }
}
