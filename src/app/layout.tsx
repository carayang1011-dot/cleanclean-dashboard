import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { OperatorSelector } from '@/components/layout/OperatorSelector'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: '淨淨 CleanClean｜團購儀表板',
  description: '淨淨 CleanClean 團購組內部管理儀表板',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="bg-gray-50 antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-3 flex justify-end items-center gap-3">
              <OperatorSelector />
            </header>
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
