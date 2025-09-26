import type { ObjectId } from "mongodb"

export interface Opportunity {
  _id?: ObjectId
  title: string
  description: string
  type: "seasonal_work" | "part_time_job" | "technical_work" | "training" | "workshop" | "partnership"
  postedBy: ObjectId
  postedByType: "farmer" | "ngo" | "partner" | "government"
  location: {
    governorate: string
    city: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  compensation: {
    type: "salary" | "hourly" | "daily" | "free" | "certificate"
    amount?: number
    currency?: string
    benefits?: string[]
  }
  duration: {
    type: "days" | "weeks" | "months" | "ongoing"
    value: number
  }
  requirements: {
    skills: string[]
    experience?: string
    education?: string
    other?: string[]
  }
  applicationDeadline?: Date
  startDate?: Date
  endDate?: Date
  maxApplicants?: number
  currentApplicants: number
  status: "active" | "closed" | "cancelled"
  featured: boolean
  urgent: boolean
  createdAt: Date
  updatedAt: Date
}

export interface OpportunityApplication {
  _id?: ObjectId
  opportunityId: ObjectId
  applicantId: ObjectId
  status: "pending" | "accepted" | "rejected" | "withdrawn"
  coverLetter?: string
  appliedAt: Date
  reviewedAt?: Date
  reviewedBy?: ObjectId
}
