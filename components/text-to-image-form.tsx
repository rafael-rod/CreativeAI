"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, ImageIcon, Sparkles, Download } from "lucide-react"

export function TextToImageForm() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, ingresa un prompt para generar la imagen")
      return
    }

    setIsGenerating(true)
    setGeneratedImage(null)

    try {
      const response = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error al generar la imagen")
      }

      const data = await response.json()
      setGeneratedImage(data.url)
      toast.success("Imagen generada exitosamente")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al generar la imagen")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `creativeai-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      toast.error("Error al descargar la imagen")
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <ImageIcon className="h-5 w-5 text-primary" />
            Genera tu Imagen
          </CardTitle>
          <CardDescription>Describe la imagen que deseas crear y nuestra IA la generará para ti</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-foreground">
              Prompt
            </Label>
            <Textarea
              id="prompt"
              placeholder="Ej: Un astronauta cabalgando un caballo en Marte, estilo realista, alta definición..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-32 resize-none border-input bg-input text-foreground placeholder:text-muted-foreground"
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground">Sé descriptivo para obtener mejores resultados</p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generar Imagen
              </>
            )}
          </Button>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h4 className="mb-2 text-sm font-medium text-foreground">Consejos para mejores resultados:</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Describe el estilo artístico deseado (realista, anime, pintura al óleo)</li>
              <li>• Incluye detalles sobre iluminación y ambiente</li>
              <li>• Especifica colores o paleta de colores</li>
              <li>• Menciona la perspectiva o ángulo de la imagen</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Vista Previa</CardTitle>
          <CardDescription>Tu imagen generada aparecerá aquí</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
            {isGenerating ? (
              <div className="flex h-full flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Generando tu imagen...</p>
              </div>
            ) : generatedImage ? (
              <>
                <Image src={generatedImage || "/placeholder.svg"} alt={prompt} fill className="object-cover" />
                <div className="absolute bottom-4 right-4">
                  <Button size="sm" variant="secondary" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="h-12 w-12" />
                <p className="text-sm">Tu imagen aparecerá aquí</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
