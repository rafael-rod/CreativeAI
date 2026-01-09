"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageIcon, Volume2, Play, Pause, RefreshCw } from "lucide-react"

export interface GalleryItem {
  id: string
  type: "image" | "audio"
  prompt: string
  url: string
  createdAt: string
}

interface AudioPlayerState {
  [key: string]: boolean
}

export function CommunityGallery() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [audioPlaying, setAudioPlaying] = useState<AudioPlayerState>({})
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({})

  const fetchGalleryItems = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/gallery")
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error("Error fetching gallery:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const toggleAudio = (id: string, url: string) => {
    if (audioPlaying[id]) {
      audioElements[id]?.pause()
      setAudioPlaying((prev) => ({ ...prev, [id]: false }))
    } else {
      // Pause all other audio
      Object.keys(audioElements).forEach((key) => {
        audioElements[key]?.pause()
      })
      setAudioPlaying({})

      let audio = audioElements[id]
      if (!audio) {
        audio = new Audio(url)
        audio.onended = () => setAudioPlaying((prev) => ({ ...prev, [id]: false }))
        setAudioElements((prev) => ({ ...prev, [id]: audio }))
      }
      audio.play()
      setAudioPlaying((prev) => ({ ...prev, [id]: true }))
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden border-border bg-card">
            <Skeleton className="aspect-square w-full" />
            <CardContent className="p-4">
              <Skeleton className="mb-2 h-4 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">No hay contenido todavía</h3>
        <p className="mb-4 max-w-sm text-muted-foreground">
          Sé el primero en generar imágenes o audio usando nuestras herramientas de IA
        </p>
        <Button onClick={fetchGalleryItems} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <Button onClick={fetchGalleryItems} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className="group overflow-hidden border-border bg-card transition-all hover:border-primary/50"
          >
            {item.type === "image" ? (
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                  src={item.url || "/placeholder.svg"}
                  alt={item.prompt}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ) : (
              <div className="relative flex aspect-square items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-16 w-16 rounded-full border-2 bg-transparent"
                  onClick={() => toggleAudio(item.id, item.url)}
                >
                  {audioPlaying[item.id] ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                </Button>
                <div className="absolute bottom-4 left-4">
                  <Volume2 className="h-6 w-6 text-primary" />
                </div>
              </div>
            )}
            <CardContent className="p-4">
              <Badge variant="secondary" className="mb-2">
                {item.type === "image" ? (
                  <>
                    <ImageIcon className="mr-1 h-3 w-3" />
                    Imagen
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-1 h-3 w-3" />
                    Audio
                  </>
                )}
              </Badge>
              <p className="line-clamp-2 text-sm text-muted-foreground">{item.prompt}</p>
              <p className="mt-2 text-xs text-muted-foreground/60">
                {new Date(item.createdAt).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
