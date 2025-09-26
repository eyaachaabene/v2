import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { Task } from "@/lib/models/Task"
import { verifyToken } from "@/lib/auth-middleware"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const priority = searchParams.get("priority")

    const { db } = await connectToDatabase()

    // Build filter query
    const filter: any = { farmerId: new ObjectId(token.userId) }

    if (status && status !== "all") {
      filter.status = status
    }

    if (category && category !== "all") {
      filter.category = category
    }

    if (priority && priority !== "all") {
      filter.priority = priority
    }

    const tasks = await db.collection("tasks").find(filter).sort({ priority: 1, dueDate: 1 }).toArray()

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { db } = await connectToDatabase()

    const task: Task = {
      ...body,
      farmerId: new ObjectId(token.userId),
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("tasks").insertOne(task)

    return NextResponse.json({
      message: "Task created successfully",
      taskId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
