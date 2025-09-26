import type { ObjectId } from "mongodb"

export interface LearningModule {
  _id?: ObjectId
  title: string
  description: string
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
  type: "video" | "article" | "interactive" | "quiz"
  content: {
    videoUrl?: string
    articleContent?: string
    duration?: number // in minutes
    resources?: string[]
  }
  tags: string[]
  ratings: {
    averageRating: number
    totalReviews: number
  }
  completions: number
  createdBy: ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface LearningProgress {
  _id?: ObjectId
  userId: ObjectId
  moduleId: ObjectId
  status: "not_started" | "in_progress" | "completed"
  progress: number // 0-100
  startedAt?: Date
  completedAt?: Date
  timeSpent: number // in minutes
}
