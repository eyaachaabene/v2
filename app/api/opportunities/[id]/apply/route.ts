import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { OpportunityApplication, OpportunityNotification } from "@/lib/models/Opportunity"
import { verifyToken } from "@/lib/auth-middleware"
import { ObjectId } from "mongodb"
import { EmailService } from "@/lib/services/email-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please log in to apply." }, { status: 401 })
    }

    const body = await request.json()
    const { db } = await connectToDatabase()

    // Validate opportunity ID
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid opportunity ID" }, { status: 400 })
    }

    // Get opportunity details
    const opportunity = await db.collection("opportunities").findOne({ 
      _id: new ObjectId(params.id),
      status: "active"
    })

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found or no longer active" }, { status: 404 })
    }

    // Check if application deadline has passed
    if (opportunity.applicationDeadline && new Date() > new Date(opportunity.applicationDeadline)) {
      return NextResponse.json({ error: "Application deadline has passed" }, { status: 400 })
    }

    // Check if max applicants reached
    if (opportunity.maxApplicants && opportunity.currentApplicants >= opportunity.maxApplicants) {
      return NextResponse.json({ error: "Maximum number of applicants reached" }, { status: 400 })
    }

    // Check if user already applied
    const existingApplication = await db.collection("opportunity_applications").findOne({
      opportunityId: new ObjectId(params.id),
      applicantId: new ObjectId(token.userId),
    })

    if (existingApplication) {
      return NextResponse.json({ 
        error: "You have already applied to this opportunity",
        applicationId: existingApplication._id
      }, { status: 400 })
    }

    // Get applicant details
    const applicant = await db.collection("users").findOne({ _id: new ObjectId(token.userId) })
    if (!applicant) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create application
    const application: OpportunityApplication = {
      opportunityId: new ObjectId(params.id),
      opportunityTitle: opportunity.title,
      applicantId: new ObjectId(token.userId),
      applicantName: `${applicant.profile?.firstName} ${applicant.profile?.lastName}`,
      applicantEmail: applicant.email,
      applicantPhone: applicant.profile?.phone,
      status: "pending",
      coverLetter: body.coverLetter?.trim(),
      relevantExperience: body.relevantExperience?.trim(),
      availability: {
        startDate: body.availability?.startDate ? new Date(body.availability.startDate) : undefined,
        endDate: body.availability?.endDate ? new Date(body.availability.endDate) : undefined,
        description: body.availability?.description,
      },
      resumeUrl: body.resumeUrl,
      appliedAt: new Date(),
      notificationSent: false,
      emailSent: false,
    }

    const applicationResult = await db.collection("opportunity_applications").insertOne(application)

    // Update opportunity applicant count and add to applicant list
    await db.collection("opportunities").updateOne(
      { _id: new ObjectId(params.id) }, 
      { 
        $inc: { currentApplicants: 1 },
        $push: { applicantIds: new ObjectId(token.userId) } as any,
        $set: { updatedAt: new Date() }
      }
    )

    // Create notification for opportunity poster
    const notification: OpportunityNotification = {
      type: "new_application",
      recipientId: opportunity.postedBy,
      senderId: new ObjectId(token.userId),
      opportunityId: new ObjectId(params.id),
      applicationId: applicationResult.insertedId,
      title: "New Application Received",
      message: `${applicant.profile?.firstName} ${applicant.profile?.lastName} has applied for "${opportunity.title}"`,
      actionUrl: `/dashboard/opportunities/${params.id}/applications`,
      read: false,
      createdAt: new Date(),
    }

    await db.collection("notifications").insertOne(notification)

    // Send email notification to employer
    await EmailService.sendApplicationNotification(opportunity.postedBy, {
      opportunityId: params.id,
      opportunityTitle: opportunity.title,
      applicantName: `${applicant.profile?.firstName} ${applicant.profile?.lastName}`,
      applicantEmail: applicant.email,
      applicantPhone: applicant.profile?.phone,
      coverLetter: body.coverLetter,
      appliedAt: new Date(),
    })

    return NextResponse.json({
      message: "Application submitted successfully",
      applicationId: applicationResult.insertedId,
    }, { status: 201 })
  } catch (error) {
    console.error("Error applying to opportunity:", error)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}

// Get application status
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const application = await db.collection("opportunity_applications").findOne({
      opportunityId: new ObjectId(params.id),
      applicantId: new ObjectId(token.userId),
    })

    if (!application) {
      return NextResponse.json({ applied: false }, { status: 200 })
    }

    return NextResponse.json({ 
      applied: true,
      application: application
    }, { status: 200 })
  } catch (error) {
    console.error("Error checking application status:", error)
    return NextResponse.json({ error: "Failed to check application status" }, { status: 500 })
  }
}
