import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth-middleware"
import { ObjectId } from "mongodb"
import type { OpportunityNotification } from "@/lib/models/Opportunity"
import { EmailService } from "@/lib/services/email-service"

// Update application status (accept/reject)
export async function PATCH(request: NextRequest, { params }: { params: { id: string, applicationId: string } }) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!ObjectId.isValid(params.id) || !ObjectId.isValid(params.applicationId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const body = await request.json()

    // Validate status
    if (!["accepted", "rejected", "reviewed"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Check if user owns this opportunity
    const opportunity = await db.collection("opportunities").findOne({ 
      _id: new ObjectId(params.id),
      postedBy: new ObjectId(token.userId)
    })

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found or unauthorized" }, { status: 404 })
    }

    // Get application
    const application = await db.collection("opportunity_applications").findOne({
      _id: new ObjectId(params.applicationId),
      opportunityId: new ObjectId(params.id)
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Update application
    await db.collection("opportunity_applications").updateOne(
      { _id: new ObjectId(params.applicationId) },
      { 
        $set: {
          status: body.status,
          reviewedAt: new Date(),
          reviewedBy: new ObjectId(token.userId),
          reviewNotes: body.notes,
        }
      }
    )

    // If accepted, increment filled positions
    if (body.status === "accepted") {
      await db.collection("opportunities").updateOne(
        { _id: new ObjectId(params.id) },
        { 
          $inc: { "positions.filled": 1 },
          $set: { updatedAt: new Date() }
        }
      )
    }

    // Create notification for applicant
    const notification: OpportunityNotification = {
      type: body.status === "accepted" ? "application_accepted" : "application_rejected",
      recipientId: application.applicantId,
      senderId: new ObjectId(token.userId),
      opportunityId: new ObjectId(params.id),
      applicationId: new ObjectId(params.applicationId),
      title: body.status === "accepted" ? "Application Accepted!" : "Application Update",
      message: body.status === "accepted" 
        ? `Your application for "${opportunity.title}" has been accepted!`
        : `Your application for "${opportunity.title}" has been reviewed.`,
      actionUrl: `/opportunities/${params.id}`,
      read: false,
      createdAt: new Date(),
    }

    await db.collection("notifications").insertOne(notification)

    // Send email notification to applicant
    await EmailService.sendApplicationStatusNotification(application.applicantId, {
      opportunityId: params.id,
      opportunityTitle: opportunity.title,
      status: body.status,
      reviewNotes: body.notes,
      contactEmail: opportunity.contactInfo?.email,
      contactPhone: opportunity.contactInfo?.phone,
    })

    return NextResponse.json({ 
      message: `Application ${body.status} successfully`,
      notification
    }, { status: 200 })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}
