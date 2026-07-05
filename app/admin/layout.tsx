'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ShoppingCart, Settings, Home, LogOut, Users, Layers } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') return router.push('/profile')
      setAuthorized(true)
    }
    check()
  }, [])

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }
  if (!authorized) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div></div>

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <aside className="bg-purple-900 text-white p-4 md:w-64 md:min-h-screen flex md:flex-col justify-between sticky top-0 z-50">
        <h2 className="font-bold text-xl hidden md:block mb-6">Admin Divine Grâce</h2>
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          <Link href="/admin" className="flex items-center gap-2 p-2.5 hover:bg-purple-800 rounded-lg whitespace-nowrap"><Home size={18}/> Dashboard</Link>
          <Link href="/admin/orders" className="flex items-center gap-2 p-2.5 hover:bg-purple-800 rounded-lg whitespace-nowrap"><ShoppingCart size={18}/> Commandes</Link>
          <Link href="/admin/products" className="flex items-center gap-2 p-2.5 hover:bg-purple-800 rounded-lg whitespace-nowrap"><Package size={18}/> Produits</Link>
          <Link href="/admin/categories" className="flex items-center gap-2 p-2.5 hover:bg-purple-800 rounded-lg whitespace-nowrap"><Layers size={18}/> Catégories</Link>
          <Link href="/admin/users" className="flex items-center gap-2 p-2.5 hover:bg-purple-800 rounded-lg whitespace-nowrap"><Users size={18}/> Utilisateurs</Link>
          <Link href="/admin/settings" className="flex items-center gap-2 p-2.5 hover:bg-purple-800 rounded-lg whitespace-nowrap"><Settings size={18}/> Réglages</Link>
        </nav>
        <button onClick={handleLogout} className="hidden md:flex items-center gap-2 p-2.5 text-purple-300 hover:text-white mt-auto"><LogOut size={18}/> Déconnexion</button>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">{children}</main>
    </div>
  )
}
