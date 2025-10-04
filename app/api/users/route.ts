import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    console.log(`[API] Fetching all users`)
    
    // Test database connection
    console.log(`[API] Testing database connection...`)
    const { db } = await connectToDatabase()
    console.log(`[API] Database connection established successfully`)
    
    // Try to ping the database
    await db.admin().ping()
    console.log(`[API] Database ping successful`)
    
    // Get users count first
    const userCount = await db.collection("users").countDocuments()
    console.log(`[API] Total users in database: ${userCount}`)
    
    if (userCount === 0) {
      return NextResponse.json({
        message: "No users found in database",
        users: [],
        count: 0
      })
    }
    
    const users = await db.collection("users").find({}, {
      projection: {
        password: 0, // Never include password
        _id: 1,
        email: 1,
        role: 1,
        "profile.firstName": 1,
        "profile.lastName": 1,
        createdAt: 1
      }
    }).limit(10).toArray()

    console.log(`[API] Found ${users.length} users`)
    
    return NextResponse.json({
      users: users,
      count: users.length,
      totalCount: userCount
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error("Error details:", errorMessage)
    if (error instanceof Error) {
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json(
      { 
        error: "Failed to fetch users",
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}