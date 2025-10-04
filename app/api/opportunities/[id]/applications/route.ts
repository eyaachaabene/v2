import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth-middleware"
import { ObjectId } from "mongodb"

// Get all applications for an opportunity (for employer)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get all applications with applicant details
    const applications = await db.collection("opportunity_applications")
      .find({ opportunityId: new ObjectId(params.id) })
      .sort({ appliedAt: -1 })
      .toArray()

    // Get detailed applicant info
    const applicationsWithDetails = await Promise.all(
      applications.map(async (app) => {
        const applicant = await db.collection("users").findOne(
          { _id: app.applicantId },
          { projection: { password: 0 } } // Exclude password
        )
        return {
          ...app,
          applicant: applicant ? {
            firstName: applicant.profile?.firstName,
            lastName: applicant.profile?.lastName,
            email: applicant.email,
            phone: applicant.profile?.phone,
            avatar: applicant.profile?.avatar,
            location: applicant.profile?.location,
          } : null
        }
      })
    )

    return NextResponse.json({ 
      applications: applicationsWithDetails,
      total: applications.length,
      opportunity: {
        title: opportunity.title,
        currentApplicants: opportunity.currentApplicants,
        maxApplicants: opportunity.maxApplicants,
      }
    }, { status: 200 })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}
