import { type NextRequest, NextResponse } from "next/server"
import { join } from "path"
import { createReadStream } from "fs"
import { stat } from "fs/promises"

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = join(process.cwd(), "public/uploads", ...params.path)

    // Check if file exists
    try {
      await stat(filePath)
    } catch (error) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Create a readable stream
    const stream = createReadStream(filePath)

    // Create response with appropriate content type
    const extension = filePath.split(".").pop()?.toLowerCase()
    const contentType = extension === "jpg" || extension === "jpeg" 
      ? "image/jpeg"
      : extension === "png"
      ? "image/png"
      : extension === "gif"
      ? "image/gif"
      : "application/octet-stream"

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
      },
    })
  } catch (error) {
    console.error("[v0] Error serving file:", error)
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    )
  }
}