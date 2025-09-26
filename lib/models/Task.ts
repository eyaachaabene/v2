import type { ObjectId } from "mongodb"

export interface Task {
  _id?: ObjectId
  farmerId: ObjectId
  title: string
  description: string
  category: "planting" | "harvesting" | "irrigation" | "pest_control" | "soil_testing" | "maintenance" | "other"
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed" | "overdue"
  dueDate: Date
  estimatedDuration?: number // in hours
  actualDuration?: number // in hours
  location?: {
    field: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  assignedTo?: ObjectId[] // for collaborative tasks
  completedAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}
