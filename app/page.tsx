import { MainLayout } from "@/components/main-layout"
import { CommunityGallery } from "@/components/community-gallery"
import { Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <MainLayout>
      <div className="px-4 py-8 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">CreativeAI Platform</span>
          </div>
          <h1 className="mb-2 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Generado por la comunidad
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Explora el contenido creado por nuestra comunidad usando inteligencia artificial. Desde imágenes únicas
            hasta audio generado con voces naturales.
          </p>
        </div>

        {/* Stats
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-2xl font-bold text-foreground">Imágenes</p>
            <p className="text-sm text-muted-foreground">Generadas con IA</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-2xl font-bold text-foreground">Audio</p>
            <p className="text-sm text-muted-foreground">Texto a voz</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-2xl font-bold text-foreground">Cloudflare AI</p>
            <p className="text-sm text-muted-foreground">Workers AI Models</p>
          </div>
        </div> */}

        {/* Gallery */}
        <CommunityGallery />
      </div>
    </MainLayout>
  )
}
