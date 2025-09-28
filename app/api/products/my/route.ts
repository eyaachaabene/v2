import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Product } from "@/lib/models/User"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const productsCollection = db.collection<Product>("products")

    // Get products for the current farmer
    const products = await productsCollection
      .aggregate([
        { $match: { farmerId: new ObjectId(token.userId) } },
        {
          $lookup: {
            from: "users",
            localField: "farmerId",
            foreignField: "_id",
            as: "farmer",
          },
        },
        { $unwind: "$farmer" },
        {
          $project: {
            "farmer.password": 0,
            "farmer.verification": 0,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray()

    return NextResponse.json({
      products,
      total: products.length
    })
  } catch (error) {
    console.error("[v0] Get my products error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}