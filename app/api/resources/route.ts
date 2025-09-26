import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Resource } from "@/lib/models/Resource"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    // Get and validate parameters
    const category = searchParams.get("category") || null
    const governorate = searchParams.get("governorate") || null
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || null

    const db = await getDatabase()
    const resourcesCollection = db.collection<Resource>("resources")

    // Build query
    const query: any = { isActive: true }

    console.log("Received governorate:", governorate)
    console.log("Received category:", category)
    console.log("Raw search params:", Object.fromEntries(searchParams.entries()))

    if (category && category !== "null" && category !== "undefined") {
      query.category = category
      console.log("Added category to query:", category)
    }

    if (governorate && governorate !== "null" && governorate !== "undefined") {
      query["location.governorate"] = governorate
      console.log("Added governorate to query:", governorate)
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    // Get resources with supplier info
    const resources = await resourcesCollection
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "supplierId",
            foreignField: "_id",
            as: "supplier"
          }
        },
        { $unwind: "$supplier" },
        {
          $project: {
            name: 1,
            description: 1,
            category: 1,
            type: 1,
            images: 1,
            pricing: 1,
            specifications: 1,
            availability: 1,
            location: 1,
            "supplier.profile.firstName": 1,
            "supplier.profile.lastName": 1,
            "supplier.role": 1,
            ratings: 1,
            tags: 1,
            createdAt: 1,
            updatedAt: 1
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ])
      .toArray()

    // Get total count
    const total = await resourcesCollection.countDocuments(query)

    return NextResponse.json({
      resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("[v0] Get resources error:", error)
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
  }
}