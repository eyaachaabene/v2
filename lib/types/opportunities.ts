/**
 * Comprehensive Type Definitions for Opportunities Marketplace
 * Use these types throughout your application for type safety
 */

import type { ObjectId } from "mongodb"

// ============================================================================
// OPPORTUNITY TYPES
// ============================================================================

export type JobType = 
  | "Seasonal Work"
  | "Full-time" 
  | "Part-time"
  | "Contract"
  | "Temporary"
  | "Internship"

export type OpportunityType = 
  | "seasonal_work"
  | "full_time"
  | "part_time"
  | "technical_work"
  | "training"
  | "workshop"
  | "partnership"
  | "contract"

export type UrgencyLevel = "urgent" | "normal" | "low_priority"

export type OpportunityStatus = "active" | "filled" | "expired" | "closed" | "cancelled"

export type UserRole = "farmer" | "ngo" | "partner" | "government" | "buyer" | "admin"

export type CompensationType = "salary" | "hourly" | "daily" | "monthly" | "free" | "certificate"

export type DurationType = "days" | "weeks" | "months" | "seasonal" | "ongoing"

export type ExperienceLevel = "entry" | "intermediate" | "experienced" | "expert"

export interface Location {
  governorate: string
  city: string
  address?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface Compensation {
  type: CompensationType
  amount?: number
  currency?: string
  payRate?: string
  benefits?: string[]
}

export interface Duration {
  type: DurationType
  value: number
  description?: string
}

export interface Positions {
  available: number
  filled: number
}

export interface Requirements {
  skills: string[]
  experienceLevel?: ExperienceLevel
  experienceYears?: number
  education?: string
  languages?: string[]
  other?: string[]
}

export interface ContactInfo {
  name?: string
  email?: string
  phone?: string
  preferredContact?: "email" | "phone" | "both"
}

export interface Opportunity {
  _id?: ObjectId
  title: string
  description: string
  type: OpportunityType
  jobType: JobType
  urgency: UrgencyLevel
  
  // Poster info
  postedBy: ObjectId
  postedByName?: string
  postedByType: UserRole
  
  // Details
  location: Location
  compensation: Compensation
  duration: Duration
  positions: Positions
  requirements: Requirements
  contactInfo: ContactInfo
  
  // Dates
  startDate?: Date
  endDate?: Date
  applicationDeadline?: Date
  
  // Application tracking
  maxApplicants?: number
  currentApplicants: number
  applicantIds: ObjectId[]
  
  // Engagement metrics
  viewCount: number
  saveCount: number
  
  // Status
  status: OpportunityStatus
  featured: boolean
  urgent: boolean
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// APPLICATION TYPES
// ============================================================================

export type ApplicationStatus = "pending" | "reviewed" | "accepted" | "rejected" | "withdrawn"

export interface Availability {
  startDate?: Date
  endDate?: Date
  description?: string
}

export interface OpportunityApplication {
  _id?: ObjectId
  
  // References
  opportunityId: ObjectId
  opportunityTitle?: string
  applicantId: ObjectId
  applicantName?: string
  applicantEmail?: string
  applicantPhone?: string
  
  // Status
  status: ApplicationStatus
  
  // Application content
  coverLetter?: string
  relevantExperience?: string
  availability: Availability
  resumeUrl?: string
  
  // Review
  reviewedAt?: Date
  reviewedBy?: ObjectId
  reviewNotes?: string
  
  // Notifications
  notificationSent: boolean
  emailSent: boolean
  
  // Timestamp
  appliedAt: Date
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 
  | "new_application"
  | "application_accepted"
  | "application_rejected"
  | "new_opportunity"
  | "opportunity_closing"
  | "application_reviewed"

export interface OpportunityNotification {
  _id?: ObjectId
  type: NotificationType
  
  // Recipients
  recipientId: ObjectId
  senderId?: ObjectId
  
  // References
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

// ============================================================================
// SAVED OPPORTUNITY TYPES
// ============================================================================

export interface SavedOpportunity {
  _id?: ObjectId
  userId: ObjectId
  opportunityId: ObjectId
  savedAt: Date
  notes?: string
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export interface OpportunitiesResponse {
  opportunities: Opportunity[]
  locations: string[]
  pagination: PaginationInfo
}

export interface OpportunityResponse {
  opportunity: Opportunity
}

export interface ApplicationsResponse {
  applications: (OpportunityApplication & {
    applicant?: {
      firstName: string
      lastName: string
      email: string
      phone?: string
      avatar?: string
      location?: Location
    }
  })[]
  total: number
  opportunity: {
    title: string
    currentApplicants: number
    maxApplicants?: number
  }
}

export interface ApplicationResponse {
  message: string
  applicationId: ObjectId
}

export interface ApplicationStatusResponse {
  applied: boolean
  application?: OpportunityApplication
}

export interface ApplicationStats {
  total: number
  pending: number
  reviewed: number
  accepted: number
  rejected: number
}

export interface OpportunityWithStats extends Opportunity {
  applicationStats: ApplicationStats
}

export interface EmployerDashboardResponse {
  opportunities: OpportunityWithStats[]
  pagination: PaginationInfo
  stats: {
    totalOpportunities: number
    activeOpportunities: number
    totalApplications: number
    pendingApplications: number
    totalViews: number
  }
}

export interface WorkerApplicationWithOpportunity extends OpportunityApplication {
  opportunity: {
    title: string
    description: string
    type: OpportunityType
    location: Location
    compensation: Compensation
    duration: Duration
    status: OpportunityStatus
    postedByName?: string
  } | null
}

export interface WorkerDashboardResponse {
  applications: WorkerApplicationWithOpportunity[]
  pagination: PaginationInfo
  stats: ApplicationStats
}

export interface SavedOpportunitiesResponse {
  savedOpportunities: (SavedOpportunity & {
    opportunity: Opportunity
  })[]
  total: number
}

export interface NotificationsResponse {
  notifications: OpportunityNotification[]
  unreadCount: number
  total: number
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

export interface OpportunityFormData {
  title: string
  description: string
  type: OpportunityType
  jobType: JobType
  urgency: UrgencyLevel
  governorate: string
  city: string
  address?: string
  paymentType: CompensationType
  amount?: string
  payRate?: string
  durationType: DurationType
  durationValue: string
  durationDescription?: string
  availablePositions: string
  skills: string[]
  experienceLevel?: ExperienceLevel
  experienceYears?: string
  education?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  startDate?: Date
  endDate?: Date
  applicationDeadline?: Date
  maxApplicants?: string
}

export interface ApplicationFormData {
  coverLetter: string
  relevantExperience?: string
  availability: {
    startDate?: Date
    endDate?: Date
    description?: string
  }
  resumeUrl?: string
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface OpportunityFilters {
  type?: OpportunityType | "all"
  location?: string | "all"
  urgency?: UrgencyLevel | "all"
  search?: string
  page?: number
  limit?: number
}

export interface DashboardFilters {
  status?: OpportunityStatus | ApplicationStatus | "all"
  page?: number
  limit?: number
}

// ============================================================================
// EMAIL TYPES
// ============================================================================

export interface EmailNotificationData {
  to: string
  subject: string
  html: string
  text?: string
}

export interface ApplicationEmailData {
  opportunityId: string
  opportunityTitle: string
  applicantName: string
  applicantEmail: string
  applicantPhone?: string
  coverLetter?: string
  appliedAt: Date
}

export interface StatusChangeEmailData {
  opportunityId: string
  opportunityTitle: string
  status: ApplicationStatus
  reviewNotes?: string
  contactEmail?: string
  contactPhone?: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type CreateOpportunityInput = Omit<
  Opportunity,
  "_id" | "postedBy" | "postedByName" | "currentApplicants" | "applicantIds" | "viewCount" | "saveCount" | "status" | "createdAt" | "updatedAt"
>

export type UpdateOpportunityInput = Partial<
  Omit<Opportunity, "_id" | "postedBy" | "createdAt">
>

export type CreateApplicationInput = Omit<
  OpportunityApplication,
  "_id" | "opportunityId" | "applicantId" | "status" | "appliedAt" | "notificationSent" | "emailSent"
>

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  Opportunity,
  OpportunityApplication,
  OpportunityNotification,
  SavedOpportunity,
}
