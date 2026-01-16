import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

let s3Client: S3Client | null = null

export function getS3Client(): S3Client {
  if (!s3Client) {
    const region = process.env.AWS_REGION
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
    const sessionToken=process.env.AWS_SESSION_TOKEN

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "Missing AWS credentials. Please set AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY environment variables.",
      )
    }

    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken
      },
    })
  }

  return s3Client
}

export async function uploadToS3(
  buffer: Buffer | ArrayBuffer, 
  key: string, 
  contentType: string,
  metadata: Record<string, string> = {}
): Promise<string> {
  const client = getS3Client()
  const bucket = process.env.AWS_S3_BUCKET

  if (!bucket) {
    throw new Error("Missing AWS_S3_BUCKET environment variable")
  }

  const body = buffer instanceof ArrayBuffer ? Buffer.from(buffer) : buffer

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata, // <-- Aquí enviamos los metadatos (como el prompt)
    }),
  )

  // Return the public URL
  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}

export async function getSignedS3Url(key: string): Promise<string> {
  const client = getS3Client()
  const bucket = process.env.AWS_S3_BUCKET

  if (!bucket) {
    throw new Error("Missing AWS_S3_BUCKET environment variable")
  }

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  })

  return getSignedUrl(client, command, { expiresIn: 3600 })
}
