import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth-middleware"
import { ObjectId } from "mongodb"

// Get saved opportunities
export async function GET(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const savedOpportunities = await db
      .collection("saved_opportunities")
      .find({ userId: new ObjectId(token.userId) })
      .sort({ savedAt: -1 })
      .toArray()

    // Get full opportunity details
    const opportunitiesWithDetails = await Promise.all(
      savedOpportunities.map(async (saved) => {
        const opportunity = await db.collection("opportunities").findOne({ 
          _id: saved.opportunityId 
        })
        return {
          ...saved,
          opportunity
        }
      })
    )

    return NextResponse.json({ 
      savedOpportunities: opportunitiesWithDetails,
      total: savedOpportunities.length
    }, { status: 200 })
  } catch (error) {
    console.error("Error fetching saved opportunities:", error)
    return NextResponse.json({ error: "Failed to fetch saved opportunities" }, { status: 500 })
  }
}

// Save/bookmark an opportunity
export async function POST(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { opportunityId, notes } = await request.json()

    if (!ObjectId.isValid(opportunityId)) {
      return NextResponse.json({ error: "Invalid opportunity ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if already saved
    const existing = await db.collection("saved_opportunities").findOne({
      userId: new ObjectId(token.userId),
      opportunityId: new ObjectId(opportunityId),
    })

    if (existing) {
      return NextResponse.json({ 
        error: "Opportunity already saved" 
      }, { status: 400 })
    }

    // Save opportunity
    await db.collection("saved_opportunities").insertOne({
      userId: new ObjectId(token.userId),
      opportunityId: new ObjectId(opportunityId),
      savedAt: new Date(),
      notes: notes || "",
    })

    // Increment save count on opportunity
    await db.collection("opportunities").updateOne(
      { _id: new ObjectId(opportunityId) },
      { $inc: { saveCount: 1 } }
    )

    return NextResponse.json({ 
      message: "Opportunity saved successfully" 
    }, { status: 201 })
  } catch (error) {
    console.error("Error saving opportunity:", error)
    return NextResponse.json({ error: "Failed to save opportunity" }, { status: 500 })
  }
}

// Remove saved opportunity
export async function DELETE(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const opportunityId = searchParams.get("opportunityId")

    if (!opportunityId || !ObjectId.isValid(opportunityId)) {
      return NextResponse.json({ error: "Invalid opportunity ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    await db.collection("saved_opportunities").deleteOne({
      userId: new ObjectId(token.userId),
      opportunityId: new ObjectId(opportunityId),
    })

    // Decrement save count
    await db.collection("opportunities").updateOne(
      { _id: new ObjectId(opportunityId) },
      { $inc: { saveCount: -1 } }
    )

    return NextResponse.json({ 
      message: "Opportunity removed from saved" 
    }, { status: 200 })
  } catch (error) {
    console.error("Error removing saved opportunity:", error)
    return NextResponse.json({ error: "Failed to remove saved opportunity" }, { status: 500 })
  }
}
