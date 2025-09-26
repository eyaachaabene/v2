import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Opportunity } from "@/lib/models/Opportunity"
import { verifyToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const location = searchParams.get("location")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const { db } = await connectToDatabase()

    // Build filter query
    const filter: any = { status: "active" }

    if (type && type !== "all") {
      filter.type = type
    }

    if (location && location !== "all") {
      filter["location.governorate"] = location
    }

    if (search) {
      filter.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    const opportunities = await db
      .collection("opportunities")
      .find(filter)
      .sort({ featured: -1, urgent: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const total = await db.collection("opportunities").countDocuments(filter)

    return NextResponse.json({
      opportunities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching opportunities:", error)
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { db } = await connectToDatabase()

    const opportunity: Opportunity = {
      ...body,
      postedBy: token.userId,
      currentApplicants: 0,
      status: "active",
      featured: false,
      urgent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("opportunities").insertOne(opportunity)

    return NextResponse.json({
      message: "Opportunity created successfully",
      opportunityId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating opportunity:", error)
    return NextResponse.json({ error: "Failed to create opportunity" }, { status: 500 })
  }
}
