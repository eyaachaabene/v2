import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { OpportunityApplication } from "@/lib/models/Opportunity"
import { verifyToken } from "@/lib/auth-middleware"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { coverLetter } = await request.json()
    const { db } = await connectToDatabase()

    // Check if user already applied
    const existingApplication = await db.collection("opportunity_applications").findOne({
      opportunityId: new ObjectId(params.id),
      applicantId: new ObjectId(token.userId),
    })

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied to this opportunity" }, { status: 400 })
    }

    const application: OpportunityApplication = {
      opportunityId: new ObjectId(params.id),
      applicantId: new ObjectId(token.userId),
      status: "pending",
      coverLetter,
      appliedAt: new Date(),
    }

    await db.collection("opportunity_applications").insertOne(application)

    // Update opportunity applicant count
    await db.collection("opportunities").updateOne({ _id: new ObjectId(params.id) }, { $inc: { currentApplicants: 1 } })

    return NextResponse.json({
      message: "Application submitted successfully",
    })
  } catch (error) {
    console.error("Error applying to opportunity:", error)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}
