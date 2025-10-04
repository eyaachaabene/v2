import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Opportunity } from "@/lib/models/Opportunity"
import { verifyToken } from "@/lib/auth-middleware"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const location = searchParams.get("location")
    const search = searchParams.get("search")
    const urgency = searchParams.get("urgency")
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

    if (urgency && urgency !== "all") {
      filter.urgency = urgency
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } }, 
        { description: { $regex: search, $options: "i" } },
        { "requirements.skills": { $regex: search, $options: "i" } }
      ]
    }

    const opportunities = await db
      .collection("opportunities")
      .find(filter)
      .sort({ featured: -1, urgent: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const total = await db.collection("opportunities").countDocuments(filter)

    // Get unique locations for filter dropdown
    const locations = await db.collection("opportunities").distinct("location.governorate", { status: "active" })

    return NextResponse.json({
      opportunities,
      locations,
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

    // Validate required fields
    if (!body.title || !body.description || !body.type || !body.location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user info for denormalization
    const user = await db.collection("users").findOne({ _id: new ObjectId(token.userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const opportunity: Opportunity = {
      title: body.title?.trim(),
      description: body.description?.trim(),
      type: body.type,
      jobType: body.jobType || "Seasonal Work",
      urgency: body.urgency || "normal",
      postedBy: new ObjectId(token.userId),
      postedByName: `${user.profile?.firstName} ${user.profile?.lastName}`,
      postedByType: user.role,
      location: {
        governorate: body.location.governorate,
        city: body.location.city,
        address: body.location.address,
        coordinates: body.location.coordinates,
      },
      compensation: {
        type: body.compensation?.type || "daily",
        amount: body.compensation?.amount,
        currency: body.compensation?.currency || "TND",
        payRate: body.compensation?.payRate,
        benefits: body.compensation?.benefits || [],
      },
      duration: {
        type: body.duration?.type || "weeks",
        value: body.duration?.value || 1,
        description: body.duration?.description,
      },
      positions: {
        available: body.positions?.available || 1,
        filled: 0,
      },
      requirements: {
        skills: body.requirements?.skills || [],
        experienceLevel: body.requirements?.experienceLevel,
        experienceYears: body.requirements?.experienceYears,
        education: body.requirements?.education,
        languages: body.requirements?.languages || [],
        other: body.requirements?.other || [],
      },
      contactInfo: {
        name: body.contactInfo?.name,
        email: body.contactInfo?.email || user.email,
        phone: body.contactInfo?.phone || user.profile?.phone,
        preferredContact: body.contactInfo?.preferredContact || "email",
      },
      applicationDeadline: body.applicationDeadline ? new Date(body.applicationDeadline) : undefined,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      maxApplicants: body.maxApplicants,
      currentApplicants: 0,
      applicantIds: [],
      viewCount: 0,
      saveCount: 0,
      status: "active",
      featured: body.featured || false,
      urgent: body.urgency === "urgent",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("opportunities").insertOne(opportunity)

    return NextResponse.json({
      message: "Opportunity created successfully",
      opportunityId: result.insertedId,
      opportunity: { ...opportunity, _id: result.insertedId }
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating opportunity:", error)
    return NextResponse.json({ error: "Failed to create opportunity" }, { status: 500 })
  }
}
