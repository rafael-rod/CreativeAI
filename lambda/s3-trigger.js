import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  // --- EL DETECTOR (NUEVO) ---
  // Detectamos si el evento viene directo de S3 o envuelto por SNS
  let s3Record;
  
  if (event.Records[0].EventSource === 'aws:sns') {
    // Si viene de SNS, tenemos que "parsear" el mensaje interno
    const snsMessage = JSON.parse(event.Records[0].Sns.Message);
    s3Record = snsMessage.Records[0].s3;
    console.log("Procesando evento via SNS Fan-out");
  } else if (event.Records[0].s3) {
    // Si viene directo de S3 (como antes)
    s3Record = event.Records[0].s3;
  } else {
    throw new Error("Formato de evento no reconocido");
  }
  // ---------------------------

  const bucket = s3Record.bucket.name;
  // Usamos s3Record en lugar de event.Records[0].s3
  const key = decodeURIComponent(s3Record.object.key.replace(/\+/g, " "));
  
  const region = process.env.AWS_REGION || "us-east-1"; 
  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  const type = key.endsWith(".png") || key.endsWith(".jpg") || key.endsWith(".jpeg") ? "image" : "audio";

  let prompt = "Uploaded via S3 Trigger";

  try {
    const headData = await s3Client.send(new HeadObjectCommand({
      Bucket: bucket,
      Key: key
    }));
    
    if (headData.Metadata && headData.Metadata.prompt) {
      prompt = headData.Metadata.prompt;
    }

  } catch (error) {
    console.warn("Could not fetch S3 metadata:", error);
  }

  const params = {
    TableName: "Generations-Proyecto-Cloud-Computing", 
    Item: {
      id: key, 
      s3Url: url, 
      type: type,
      createdAt: new Date().toISOString(),
      prompt: prompt, 
    },
  };

  try {
    const data = await docClient.send(new PutCommand(params));
    console.log("Success - item added to DB", data);
    return { statusCode: 200, body: JSON.stringify({ message: "Item inserted successfully" }) };
  } catch (err) {
    console.log("Error writing to DynamoDB", err);
    throw err; 
  }
};