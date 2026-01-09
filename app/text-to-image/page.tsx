import { MainLayout } from "@/components/main-layout"
import { TextToImageForm } from "@/components/text-to-image-form"
import { ImageIcon } from "lucide-react"

export const metadata = {
  title: "Texto a Imagen - CreativeAI",
  description: "Genera imágenes únicas usando inteligencia artificial de Cloudflare Workers AI",
}

export default function TextToImagePage() {
  return (
    <MainLayout>
      <div className="px-4 py-8 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Texto a Imagen</span>
          </div>
          <h1 className="mb-2 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Genera imágenes con IA
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Describe la imagen que deseas crear y nuestra IA la generará para ti usando Cloudflare Workers AI. Tus
            creaciones se guardarán y compartirán con la comunidad.
          </p>
        </div>

        {/* Form */}
        <TextToImageForm />
      </div>
    </MainLayout>
  )
}
