// Cloudflare Workers AI client configuration

export interface CloudflareConfig {
  accountId: string
  apiToken: string
}

export function getCloudflareConfig(): CloudflareConfig {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN

  if (!accountId || !apiToken) {
    throw new Error(
      "Missing Cloudflare credentials. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN environment variables.",
    )
  }

  return { accountId, apiToken }
}

export async function generateImageWithCloudflare(prompt: string): Promise<ArrayBuffer> {
  const { accountId, apiToken } = getCloudflareConfig()

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    },
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errors?.[0]?.message || "Failed to generate image")
  }

  return response.arrayBuffer()
}

export async function generateSpeechWithCloudflare(text: string): Promise<ArrayBuffer> {
  const { accountId, apiToken } = getCloudflareConfig()

  // Using Cloudflare's TTS model
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/m2m100-1.2b`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        source_lang: "es",
        target_lang: "es",
      }),
    },
  )

  // For TTS, we'll use a workaround with Cloudflare's available models
  // In production, you might want to use @cf/openai/whisper for speech-related tasks
  // or integrate with another TTS service

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errors?.[0]?.message || "Failed to generate speech")
  }

  return response.arrayBuffer()
}
