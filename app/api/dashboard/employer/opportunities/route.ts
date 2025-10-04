import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth-middleware"
import { ObjectId } from "mongodb"

// Get employer's posted opportunities
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

    // Build filter
    const filter: any = { postedBy: new ObjectId(token.userId) }
    if (status !== "all") {
      filter.status = status
    }

    // Get opportunities
    const opportunities = await db
      .collection("opportunities")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const total = await db.collection("opportunities").countDocuments(filter)

    // Get application counts and stats for each opportunity
    const opportunitiesWithStats = await Promise.all(
      opportunities.map(async (opp) => {
        const applications = await db.collection("opportunity_applications")
          .find({ opportunityId: opp._id })
          .toArray()

        const stats = {
          total: applications.length,
          pending: applications.filter((app: any) => app.status === "pending").length,
          reviewed: applications.filter((app: any) => app.status === "reviewed").length,
          accepted: applications.filter((app: any) => app.status === "accepted").length,
          rejected: applications.filter((app: any) => app.status === "rejected").length,
        }

        return {
          ...opp,
          applicationStats: stats,
        }
      })
    )

    // Get overall statistics
    const allOpportunities = await db.collection("opportunities")
      .find({ postedBy: new ObjectId(token.userId) })
      .toArray()

    const allApplications = await db.collection("opportunity_applications")
      .find({ 
        opportunityId: { 
          $in: allOpportunities.map(o => o._id) 
        } 
      })
      .toArray()

    const overallStats = {
      totalOpportunities: allOpportunities.length,
      activeOpportunities: allOpportunities.filter((o: any) => o.status === "active").length,
      totalApplications: allApplications.length,
      pendingApplications: allApplications.filter((a: any) => a.status === "pending").length,
      totalViews: allOpportunities.reduce((sum: number, o: any) => sum + (o.viewCount || 0), 0),
    }

    return NextResponse.json({ 
      opportunities: opportunitiesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: overallStats,
    }, { status: 200 })
  } catch (error) {
    console.error("Error fetching employer opportunities:", error)
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 })
  }
}
