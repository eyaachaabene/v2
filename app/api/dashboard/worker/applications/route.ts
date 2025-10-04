import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth-middleware"
import { ObjectId } from "mongodb"

// Get worker's applied opportunities
export async function GET(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const { db } = await connectToDatabase()

    // Build filter for applications
    const filter: any = { applicantId: new ObjectId(token.userId) }
    if (status !== "all") {
      filter.status = status
    }

    // Get applications
    const applications = await db
      .collection("opportunity_applications")
      .find(filter)
      .sort({ appliedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const total = await db.collection("opportunity_applications").countDocuments(filter)

    // Get opportunity details for each application
    const applicationsWithOpportunities = await Promise.all(
      applications.map(async (app) => {
        const opportunity = await db.collection("opportunities").findOne({ 
          _id: app.opportunityId 
        })
        
        return {
          ...app,
          opportunity: opportunity ? {
            title: opportunity.title,
            description: opportunity.description,
            type: opportunity.type,
            location: opportunity.location,
            compensation: opportunity.compensation,
            duration: opportunity.duration,
            status: opportunity.status,
            postedByName: opportunity.postedByName,
          } : null
        }
      })
    )

    // Get overall statistics
    const allApplications = await db.collection("opportunity_applications")
      .find({ applicantId: new ObjectId(token.userId) })
      .toArray()

    const stats = {
      totalApplications: allApplications.length,
      pending: allApplications.filter((a: any) => a.status === "pending").length,
      reviewed: allApplications.filter((a: any) => a.status === "reviewed").length,
      accepted: allApplications.filter((a: any) => a.status === "accepted").length,
      rejected: allApplications.filter((a: any) => a.status === "rejected").length,
    }

    return NextResponse.json({ 
      applications: applicationsWithOpportunities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    }, { status: 200 })
  } catch (error) {
    console.error("Error fetching worker applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}
