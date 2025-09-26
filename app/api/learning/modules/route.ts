import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const type = searchParams.get("type")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")

    const { db } = await connectToDatabase()

    // Build filter query
    const filter: any = {}

    if (category && category !== "all") {
      filter.category = category
    }

    if (difficulty && difficulty !== "all") {
      filter.difficulty = difficulty
    }

    if (type && type !== "all") {
      filter.type = type
    }

    const modules = await db
      .collection("learning_modules")
      .find(filter)
      .sort({ "ratings.averageRating": -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const total = await db.collection("learning_modules").countDocuments(filter)

    return NextResponse.json({
      modules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching learning modules:", error)
    return NextResponse.json({ error: "Failed to fetch learning modules" }, { status: 500 })
  }
}
