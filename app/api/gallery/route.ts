import { NextResponse } from "next/server"
import { getGeneratedContent } from "@/lib/aws-dynamodb"

export async function GET() {
  try {
    const content = await getGeneratedContent(50)

    const items = content.map((item) => ({
      id: item.id,
      type: item.type,
      prompt: item.prompt,
      url: item.s3Url,
      createdAt: item.createdAt,
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching gallery:", error)
    return NextResponse.json({ items: [] })
  }
}
