"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Volume2, Sparkles, Download, Play, Pause, RotateCcw } from "lucide-react"

export function TextToSpeechForm() {
  const [text, setText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Por favor, ingresa el texto que deseas convertir a voz")
      return
    }

    setIsGenerating(true)
    setGeneratedAudio(null)
    setIsPlaying(false)

    try {
      const response = await fetch("/api/generate/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error al generar el audio")
      }

      const data = await response.json()
      setGeneratedAudio(data.url)
      toast.success("Audio generado exitosamente")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al generar el audio")
    } finally {
      setIsGenerating(false)
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const restartAudio = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play()
    setIsPlaying(true)
  }

  const handleDownload = async () => {
    if (!generatedAudio) return

    try {
      const response = await fetch(generatedAudio)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `creativeai-audio-${Date.now()}.mp3`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      toast.error("Error al descargar el audio")
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Volume2 className="h-5 w-5 text-primary" />
            Convierte Texto a Voz
          </CardTitle>
          <CardDescription>Escribe el texto que deseas convertir en audio con voz natural</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text" className="text-foreground">
              Texto
            </Label>
            <Textarea
              id="text"
              placeholder="Escribe aquí el texto que deseas convertir a voz..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-32 resize-none border-input bg-input text-foreground placeholder:text-muted-foreground"
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground">Máximo 1000 caracteres • {text.length}/1000</p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim() || text.length > 1000}
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
                Generar Audio
              </>
            )}
          </Button>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h4 className="mb-2 text-sm font-medium text-foreground">Consejos para mejores resultados:</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Usa puntuación correcta para pausas naturales</li>
              <li>• Evita abreviaciones, escribe palabras completas</li>
              <li>• Los números se pronuncian mejor escritos en texto</li>
              <li>• Revisa la ortografía antes de generar</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Reproductor</CardTitle>
          <CardDescription>Tu audio generado aparecerá aquí</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-lg border border-border bg-gradient-to-br from-primary/10 to-accent/10">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Generando tu audio...</p>
              </div>
            ) : generatedAudio ? (
              <>
                <audio ref={audioRef} src={generatedAudio} onEnded={() => setIsPlaying(false)} className="hidden" />

                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                  <Volume2 className="h-10 w-10 text-primary" />
                </div>

                <div className="flex items-center gap-3">
                  <Button size="icon" variant="outline" onClick={restartAudio}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    onClick={togglePlayback}
                    className="h-14 w-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  <Button size="icon" variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <p className="mt-4 max-w-xs text-center text-sm text-muted-foreground line-clamp-2">{text}</p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Volume2 className="h-12 w-12" />
                <p className="text-sm">Tu audio aparecerá aquí</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
