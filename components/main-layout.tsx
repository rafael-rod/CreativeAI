import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="md:ml-64">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  )
}
