import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

interface EmailNotificationData {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  /**
   * Send email notification
   * In production, integrate with SendGrid, NodeMailer, or AWS SES
   */
  static async sendEmail(data: EmailNotificationData) {
    // TODO: Implement actual email sending
    // For now, log to console and save to database
    console.log("📧 Email to be sent:", {
      to: data.to,
      subject: data.subject,
    })

    // Store email log in database
    const { db } = await connectToDatabase()
    await db.collection("email_logs").insertOne({
      ...data,
      sentAt: new Date(),
      status: "pending", // In production: "sent", "failed"
    })
  }

  /**
   * Send application notification to employer
   */
  static async sendApplicationNotification(employerId: ObjectId | any, applicationData: any) {
    const { db } = await connectToDatabase()
    
    // Convert employerId to ObjectId if it's not already
    const empId = employerId instanceof ObjectId 
      ? employerId 
      : new ObjectId(employerId)
    
    const employer = await db.collection("users").findOne({ _id: empId })
    if (!employer || !employer.email) return

    const emailData: EmailNotificationData = {
      to: employer.email,
      subject: `New Application for "${applicationData.opportunityTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">New Application Received!</h2>
          <p>Hello ${employer.profile?.firstName},</p>
          <p><strong>${applicationData.applicantName}</strong> has applied for your opportunity:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${applicationData.opportunityTitle}</h3>
            <p><strong>Applicant:</strong> ${applicationData.applicantName}</p>
            <p><strong>Email:</strong> ${applicationData.applicantEmail}</p>
            ${applicationData.applicantPhone ? `<p><strong>Phone:</strong> ${applicationData.applicantPhone}</p>` : ""}
            <p><strong>Applied:</strong> ${new Date(applicationData.appliedAt).toLocaleDateString()}</p>
          </div>

          ${applicationData.coverLetter ? `
            <div style="margin: 20px 0;">
              <h4>Cover Letter:</h4>
              <p style="white-space: pre-wrap;">${applicationData.coverLetter}</p>
            </div>
          ` : ""}

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/opportunities/${applicationData.opportunityId}/applications" 
             style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View Application
          </a>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            You can review, accept, or reject this application from your dashboard.
          </p>
        </div>
      `,
      text: `New application from ${applicationData.applicantName} for "${applicationData.opportunityTitle}"`,
    }

    await this.sendEmail(emailData)
  }

  /**
   * Send application status notification to applicant
   */
  static async sendApplicationStatusNotification(applicantId: ObjectId, statusData: any) {
    const { db } = await connectToDatabase()
    
    const applicant = await db.collection("users").findOne({ _id: applicantId })
    if (!applicant || !applicant.email) return

    const isAccepted = statusData.status === "accepted"
    const emailData: EmailNotificationData = {
      to: applicant.email,
      subject: isAccepted 
        ? `🎉 Application Accepted - "${statusData.opportunityTitle}"`
        : `Application Update - "${statusData.opportunityTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${isAccepted ? `
            <h2 style="color: #22c55e;">🎉 Congratulations!</h2>
            <p>Hello ${applicant.profile?.firstName},</p>
            <p>Great news! Your application has been <strong style="color: #22c55e;">accepted</strong>!</p>
          ` : `
            <h2 style="color: #3b82f6;">Application Update</h2>
            <p>Hello ${applicant.profile?.firstName},</p>
            <p>Your application has been reviewed.</p>
          `}
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${statusData.opportunityTitle}</h3>
            <p><strong>Status:</strong> ${statusData.status.charAt(0).toUpperCase() + statusData.status.slice(1)}</p>
            ${statusData.reviewNotes ? `<p><strong>Notes:</strong> ${statusData.reviewNotes}</p>` : ""}
          </div>

          ${isAccepted ? `
            <p>The employer will contact you soon with next steps.</p>
            <p><strong>Contact Information:</strong><br>
            Email: ${statusData.contactEmail}<br>
            ${statusData.contactPhone ? `Phone: ${statusData.contactPhone}` : ""}
            </p>
          ` : ""}

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/opportunities/${statusData.opportunityId}" 
             style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View Opportunity
          </a>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Thank you for using Agri-SHE platform!
          </p>
        </div>
      `,
      text: `Your application for "${statusData.opportunityTitle}" has been ${statusData.status}`,
    }

    await this.sendEmail(emailData)
  }

  /**
   * Send new opportunity alert to matched workers
   */
  static async sendOpportunityAlert(userId: ObjectId, opportunityData: any) {
    const { db } = await connectToDatabase()
    
    const user = await db.collection("users").findOne({ _id: userId })
    if (!user || !user.email) return

    const emailData: EmailNotificationData = {
      to: user.email,
      subject: `New Opportunity: ${opportunityData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">New Opportunity Available!</h2>
          <p>Hello ${user.profile?.firstName},</p>
          <p>We found a new opportunity that matches your profile:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${opportunityData.title}</h3>
            <p>${opportunityData.description.substring(0, 200)}...</p>
            <p><strong>Location:</strong> ${opportunityData.location.city}, ${opportunityData.location.governorate}</p>
            <p><strong>Type:</strong> ${opportunityData.jobType}</p>
            <p><strong>Compensation:</strong> ${opportunityData.compensation.payRate || `${opportunityData.compensation.amount} ${opportunityData.compensation.currency}`}</p>
          </div>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/opportunities/${opportunityData._id}" 
             style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View & Apply
          </a>
        </div>
      `,
      text: `New opportunity: ${opportunityData.title}`,
    }

    await this.sendEmail(emailData)
  }
}
