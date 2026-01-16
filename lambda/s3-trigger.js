import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  
  // Format: https://BUCKET_NAME.s3.REGION.amazonaws.com/KEY
  const region = process.env.AWS_REGION || "us-east-1"; 
  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  // Determine type based on extension
  const type = key.endsWith(".png") || key.endsWith(".jpg") || key.endsWith(".jpeg") ? "image" : "audio";

  let prompt = "Uploaded via S3 Trigger";

  try {
    // 1. Fetch Object Metadata from S3 to get the 'prompt'
    const headData = await s3Client.send(new HeadObjectCommand({
      Bucket: bucket,
      Key: key
    }));
    
    console.log("Metadata:", headData.Metadata);

    if (headData.Metadata && headData.Metadata.prompt) {
      prompt = headData.Metadata.prompt;
    }

  } catch (error) {
    console.warn("Could not fetch S3 metadata:", error);
    // We continue execution even if we can't get the prompt, effectively falling back to default
  }

  // 2. Save to DynamoDB
  const params = {
    TableName: "Generations-Proyecto-Cloud-Computing", // Actualizado con tu nombre real de tabla
    Item: {
      id: key, 
      s3Url: url, // CAMBIO: Renombrado de 'url' a 's3Url' para coincidir con la app
      type: type,
      createdAt: new Date().toISOString(),
      prompt: prompt, 
    },
  };

  try {
    const data = await docClient.send(new PutCommand(params));
    console.log("Success - item added or updated", data);
    return { statusCode: 200, body: JSON.stringify({ message: "Item inserted successfully" }) };
  } catch (err) {
    console.log("Error writing to DynamoDB", err);
    throw err; 
  }
};
