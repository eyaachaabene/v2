import type { ObjectId } from "mongodb"

export interface Opportunity {
  _id?: ObjectId
  title: string
  description: string
  type: "seasonal_work" | "full_time" | "part_time" | "technical_work" | "training" | "workshop" | "partnership" | "contract"
  postedBy: ObjectId
  postedByName?: string // Denormalized for quick display
  postedByType: "farmer" | "ngo" | "partner" | "government" | "buyer"
  location: {
    governorate: string
    city: string
    address?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  jobType: "Seasonal Work" | "Full-time" | "Part-time" | "Contract" | "Temporary" | "Internship"
  urgency: "urgent" | "normal" | "low_priority"
  compensation: {
    type: "salary" | "hourly" | "daily" | "monthly" | "free" | "certificate"
    amount?: number
    currency?: string
    payRate?: string // e.g., "25 TND/day"
    benefits?: string[]
  }
  duration: {
    type: "days" | "weeks" | "months" | "seasonal" | "ongoing"
    value: number
    description?: string // e.g., "2-3 weeks", "1 month"
  }
  positions: {
    available: number // Number of positions available
    filled: number // Number of positions filled
  }
  requirements: {
    skills: string[] // ["Harvesting", "Physical Work", "Agriculture"]
    experienceLevel?: "entry" | "intermediate" | "experienced" | "expert"
    experienceYears?: number
    education?: string
    languages?: string[]
    other?: string[]
  }
  contactInfo: {
    name?: string
    email?: string
    phone?: string
    preferredContact?: "email" | "phone" | "both"
  }
  applicationDeadline?: Date
  startDate?: Date
  endDate?: Date
  maxApplicants?: number
  currentApplicants: number
  applicantIds: ObjectId[] // Track who applied
  viewCount: number // Track how many times viewed
  saveCount: number // Track how many times saved/bookmarked
  status: "active" | "filled" | "expired" | "closed" | "cancelled"
  featured: boolean
  urgent: boolean
  createdAt: Date
  updatedAt: Date
}

export interface OpportunityApplication {
  _id?: ObjectId
  opportunityId: ObjectId
  opportunityTitle?: string // Denormalized for quick display
  applicantId: ObjectId
  applicantName?: string // Denormalized
  applicantEmail?: string // Denormalized
  applicantPhone?: string // Denormalized
  status: "pending" | "reviewed" | "accepted" | "rejected" | "withdrawn"
  
  // Application details
  coverLetter?: string
  relevantExperience?: string
  availability: {
    startDate?: Date
    endDate?: Date
    description?: string
  }
  resumeUrl?: string // URL to uploaded resume/CV
  
  // Metadata
  appliedAt: Date
  reviewedAt?: Date
  reviewedBy?: ObjectId
  reviewNotes?: string
  
  // Notification tracking
  notificationSent: boolean
  emailSent: boolean
}

export interface OpportunityNotification {
  _id?: ObjectId
  type: "new_application" | "application_accepted" | "application_rejected" | "new_opportunity" | "opportunity_closing"
  recipientId: ObjectId
  senderId?: ObjectId
  opportunityId: ObjectId
  applicationId?: ObjectId
  
  // Content
  title: string
  message: string
  actionUrl?: string
  
  // Status
  read: boolean
  readAt?: Date
  
  // Metadata
  createdAt: Date
  expiresAt?: Date
}

export interface SavedOpportunity {
  _id?: ObjectId
  userId: ObjectId
  opportunityId: ObjectId
  savedAt: Date
  notes?: string
}
