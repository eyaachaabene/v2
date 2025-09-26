import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export interface Notification {
  _id?: ObjectId
  userId: ObjectId
  type: "weather_alert" | "task_reminder" | "opportunity_match" | "system" | "message"
  title: string
  message: string
  data?: any
  read: boolean
  priority: "low" | "medium" | "high"
  createdAt: Date
  expiresAt?: Date
}

export class NotificationService {
  static async createNotification(notification: Omit<Notification, "_id" | "createdAt">) {
    const { db } = await connectToDatabase()

    const newNotification: Notification = {
      ...notification,
      createdAt: new Date(),
    }

    await db.collection("notifications").insertOne(newNotification)
  }

  static async getUserNotifications(userId: string, limit = 20) {
    const { db } = await connectToDatabase()

    return await db
      .collection("notifications")
      .find({
        userId: new ObjectId(userId),
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
  }

  static async markAsRead(notificationId: string, userId: string) {
    const { db } = await connectToDatabase()

    await db.collection("notifications").updateOne(
      {
        _id: new ObjectId(notificationId),
        userId: new ObjectId(userId),
      },
      { $set: { read: true } },
    )
  }

  static async sendWeatherAlert(userId: string, weatherData: any) {
    await this.createNotification({
      userId: new ObjectId(userId),
      type: "weather_alert",
      title: "Weather Alert",
      message: `${weatherData.condition} expected. ${weatherData.message}`,
      data: weatherData,
      read: false,
      priority: "high",
    })
  }

  static async sendTaskReminder(userId: string, task: any) {
    await this.createNotification({
      userId: new ObjectId(userId),
      type: "task_reminder",
      title: "Task Reminder",
      message: `Task "${task.title}" is due ${task.dueDate}`,
      data: { taskId: task._id },
      read: false,
      priority: "medium",
    })
  }

  static async sendOpportunityMatch(userId: string, opportunity: any) {
    await this.createNotification({
      userId: new ObjectId(userId),
      type: "opportunity_match",
      title: "Perfect Match Found!",
      message: `You are a good match for "${opportunity.title}"`,
      data: { opportunityId: opportunity._id },
      read: false,
      priority: "high",
    })
  }
}
