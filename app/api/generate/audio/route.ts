// import { type NextRequest, NextResponse } from "next/server"
// import { uploadToS3 } from "@/lib/aws-s3"
// import { saveGeneratedContent } from "@/lib/aws-dynamodb"

// export async function POST(request: NextRequest) {
//   try {
//     const { text } = await request.json()

//     if (!text || typeof text !== "string") {
//       return NextResponse.json({ message: "Text is required" }, { status: 400 })
//     }

//     if (text.length > 1000) {
//       return NextResponse.json({ message: "Text must be less than 1000 characters" }, { status: 400 })
//     }

//     // Get Cloudflare credentials
//     const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
//     const apiToken = process.env.CLOUDFLARE_API_TOKEN

//     if (!accountId || !apiToken) {
//       throw new Error("Missing Cloudflare credentials")
//     }

//     // Generate audio using Cloudflare Workers AI TTS model
//     // Using the available speech synthesis model
//     const response = await fetch(
//       `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/myshell-ai/melotts`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${apiToken}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           prompt:text,
//           language: "ES",

import { type NextRequest, NextResponse } from "next/server"
import { uploadToS3 } from "@/lib/aws-s3"


export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ message: "Text is required" }, { status: 400 })
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN

    if (!accountId || !apiToken) {
      throw new Error("Missing Cloudflare credentials")
    }

    console.log("Generando audio con Cloudflare...");

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/myshell-ai/melotts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: text,
          language: "es",
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudflare AI Error:", errorText);
      throw new Error(`Failed to generate audio: ${response.statusText}`);
    }

    // 🕵️ DETECCIÓN INTELIGENTE: ¿Es JSON o Audio puro?
    const contentType = response.headers.get("content-type");
    let audioBuffer: Buffer;

    if (contentType && contentType.includes("application/json")) {
      // CASO 1: Cloudflare devolvió JSON con Base64
      console.log("Recibido JSON. Decodificando Base64...");
      const json = await response.json();
      
      // A veces viene en json.result.audio, a veces solo json.result
      const base64String = json.result.audio || json.result; 
      
      if (!base64String) {
          throw new Error("No se encontró audio en la respuesta JSON");
      }
      
      audioBuffer = Buffer.from(base64String, 'base64');
    } else {
      // CASO 2: Cloudflare devolvió el audio binario directo
      console.log("Recibido Audio Binario directo.");
      const arrayBuffer = await response.arrayBuffer();
      audioBuffer = Buffer.from(arrayBuffer);
    }

    const bufferLength = audioBuffer.byteLength;
    console.log(`Audio procesado. Tamaño final: ${bufferLength} bytes`);

    if (bufferLength < 100) {
        throw new Error("El archivo de audio generado es inválido (demasiado pequeño).");
    }

    // Subir a S3 como WAV
    const timestamp = Date.now()
    const key = `audio/${timestamp}-${crypto.randomUUID()}.mp3`
    const s3Url = await uploadToS3(audioBuffer, key, "audio/mp3", {
      prompt: text.substring(0, 1500)
    })

    // NOTA: Ya no guardamos en DynamoDB aquí. La Lambda lo hace.


    return NextResponse.json({
      id: key, // ID temporal
      url: s3Url,
      message: "Audio generated successfully",
    })
  } catch (error) {
    console.error("Error generating audio:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to generate audio" },
      { status: 500 },
    )
  }
}
