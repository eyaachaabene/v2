import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File || formData.get("image") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum 5MB allowed." },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine upload type based on form data
    const isResource = formData.get("image") !== null
    const uploadType = isResource ? "resources" : "products"
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", uploadType)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop()
    const filename = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`
    const filepath = join(uploadsDir, filename)

    // Write file to uploads directory
    await writeFile(filepath, buffer)

    // Return the relative path for use in the frontend
    const relativePath = `/uploads/${uploadType}/${filename}`

    return NextResponse.json({
      success: true,
      filename: relativePath,
      message: "File uploaded successfully"
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}