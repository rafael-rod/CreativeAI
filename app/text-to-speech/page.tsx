import { MainLayout } from "@/components/main-layout"
import { TextToSpeechForm } from "@/components/text-to-speech-form"
import { Volume2 } from "lucide-react"

export const metadata = {
  title: "Texto a Voz - CreativeAI",
  description: "Convierte texto en audio con voz natural usando Cloudflare Workers AI",
}

export default function TextToSpeechPage() {
  return (
    <MainLayout>
      <div className="px-4 py-8 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Texto a Voz</span>
          </div>
          <h1 className="mb-2 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Convierte texto en audio
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Escribe cualquier texto y nuestra IA lo convertirá en audio con voz natural usando Cloudflare Workers AI.
            Tus audios se guardarán y compartirán con la comunidad.
          </p>
        </div>

        {/* Form */}
        <TextToSpeechForm />
      </div>
    </MainLayout>
  )
}
