import type { Metadata } from 'next'
import './globals.css'
import NotificationBell from '@/components/NotificationBell'
import { createClient } from '@/lib/supabase'

export const metadata: Metadata = { title: 'Divine Grâce - Boutique Togo', description: 'Vente en ligne au Togo' }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: settings } = await supabase.from('site_settings').select('font_family').single()
  
  return (
    <html lang="fr">
      <body className="min-h-screen pb-20 md:pb-0" style={{ fontFamily: settings?.font_family || 'Inter, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
