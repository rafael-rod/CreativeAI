import { type NextRequest, NextResponse } from "next/server"
import { generateImageWithCloudflare } from "@/lib/cloudflare"
import { uploadToS3 } from "@/lib/aws-s3"
import { saveGeneratedContent } from "@/lib/aws-dynamodb"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ message: "Prompt is required" }, { status: 400 })
    }

    if (prompt.length > 500) {
      return NextResponse.json({ message: "Prompt must be less than 500 characters" }, { status: 400 })
    }

    // Generate image using Cloudflare Workers AI
    const imageBuffer = await generateImageWithCloudflare(prompt)

    // Upload to S3
    const timestamp = Date.now()
    const key = `images/${timestamp}-${crypto.randomUUID()}.png`
    const s3Url = await uploadToS3(imageBuffer, key, "image/png")

    // Save to DynamoDB
    const id = await saveGeneratedContent("image", prompt, s3Url)

    return NextResponse.json({
      id,
      url: s3Url,
      message: "Image generated successfully",
    })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 },
    )
  }
}
