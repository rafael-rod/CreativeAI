// import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
// import { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb"

// let docClient: DynamoDBDocumentClient | null = null

// function getDocClient(): DynamoDBDocumentClient {
//   if (!docClient) {
//     const region = process.env.AWS_REGION
//     const accessKeyId = process.env.AWS_ACCESS_KEY_ID
//     const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
//     const sessionToken=process.env.AWS_SESSION_TOKEN

//     if (!region || !accessKeyId || !secretAccessKey) {
//       throw new Error(
//         "Missing AWS credentials. Please set AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY environment variables.",
//       )
//     }

//     const client = new DynamoDBClient({
//       region,
//       credentials: {
//         accessKeyId,
//         secretAccessKey,
//         sessionToken
//       },
//     })

//     docClient = DynamoDBDocumentClient.from(client)
//   }

//   return docClient
// }

// const TABLE_NAME = process.env.AWS_DYNAMODB_TABLE || "generated_content"

// export interface GeneratedContent {
//   id: string
//   type: "image" | "audio"
//   prompt: string
//   s3Url: string
//   createdAt: string
// }

// export async function saveGeneratedContent(type: "image" | "audio", prompt: string, s3Url: string): Promise<string> {
//   const client = getDocClient()
//   const id = crypto.randomUUID()
//   const createdAt = new Date().toISOString()

//   await client.send(
//     new PutCommand({
//       TableName: TABLE_NAME,
//       Item: {
//         id,
//         type,
//         prompt,
//         s3Url,
//         createdAt,
//         // GSI partition key for querying all items sorted by date
//         pk: "CONTENT",
//       },
//     }),
//   )

//   return id
// }

// export async function getGeneratedContent(limit = 50): Promise<GeneratedContent[]> {
//   const client = getDocClient()

//   // Query using GSI to get all content sorted by createdAt
//   const result = await client.send(
//     new QueryCommand({
//       TableName: TABLE_NAME,
//       IndexName: "pk-createdAt-index",
//       KeyConditionExpression: "pk = :pk",
//       ExpressionAttributeValues: {
//         ":pk": "CONTENT",
//       },
//       ScanIndexForward: false, // Sort descending (newest first)
//       Limit: limit,
//     }),
//   )

//   return (result.Items || []) as GeneratedContent[]
// }

// export async function getContentById(id: string): Promise<GeneratedContent | null> {
//   const client = getDocClient()

//   const result = await client.send(
//     new GetCommand({
//       TableName: TABLE_NAME,
//       Key: { id },
//     }),
//   )

//   return (result.Item as GeneratedContent) || null
// }



import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb"

let docClient: DynamoDBDocumentClient | null = null

function getDocClient(): DynamoDBDocumentClient {
  if (!docClient) {
    const region = process.env.AWS_REGION
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
    const sessionToken = process.env.AWS_SESSION_TOKEN

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "Missing AWS credentials. Please set AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY environment variables.",
      )
    }

    const client = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken
      },
    })

    docClient = DynamoDBDocumentClient.from(client)
  }

  return docClient
}

const TABLE_NAME = process.env.AWS_DYNAMODB_TABLE || "Generations"

export interface GeneratedContent {
  id: string
  type: "image" | "audio"
  prompt: string
  s3Url: string
  createdAt: string
}

export async function saveGeneratedContent(type: "image" | "audio", prompt: string, s3Url: string): Promise<string> {
  const client = getDocClient()
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  await client.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        id,
        type,
        prompt,
        s3Url,
        createdAt,
        // Eliminamos "pk" porque no usamos índices complejos
      },
    }),
  )

  return id
}

export async function getGeneratedContent(limit = 50): Promise<GeneratedContent[]> {
  const client = getDocClient()

  // CAMBIO: Usamos ScanCommand en lugar de QueryCommand
  // Esto lee toda la tabla (perfecto para demos/tesis) sin necesitar índices extra
  const result = await client.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      Limit: limit,
    }),
  )

  const items = (result.Items || []) as GeneratedContent[]

  // Ordenamos manualmente por fecha (del más nuevo al más viejo)
  return items.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function getContentById(id: string): Promise<GeneratedContent | null> {
  const client = getDocClient()

  const result = await client.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    }),
  )

  return (result.Item as GeneratedContent) || null
}