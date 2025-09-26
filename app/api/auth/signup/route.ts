import { type NextRequest, NextResponse } from "next/server"
import { signup } from "../auth"

export async function POST(request: NextRequest) {
  return signup(request)
}