import { createClient } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import NotificationBell from '@/components/NotificationBell'
import Link from 'next/link'
import { ShoppingBag, User } from 'lucide-react'

export default async function Home() {
  const supabase = createClient()
  const [productsRes, settingsRes] = await Promise.all([
    supabase.from('products').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(12),
    supabase.from('site_settings').select('*').single()
  ])
  const products = productsRes.data || []
  const settings = settingsRes.data

  return (
    <main className="max-w-md mx-auto bg-white min-h-screen shadow-xl md:max-w-7xl md:bg-transparent">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-extrabold text-purple-700 tracking-tight">{settings?.shop_name || 'Divine Grâce'}</h1>
        <div className="flex gap-3 items-center">
          <NotificationBell />
          <Link href="/cart"><ShoppingBag className="text-gray-700" /></Link>
          <Link href="/profile"><User className="text-gray-700" /></Link>
        </div>
      </header>
      
      {settings?.hero_text && (<div className="px-4 py-6 text-center"><p className="text-lg font-medium text-gray-700">{settings.hero_text}</p></div>)}
      {settings?.banner_url && (<div className="w-full h-52 bg-gray-200 relative overflow-hidden"><img src={settings.banner_url} alt="Banner" className="w-full h-full object-cover" /></div>)}
      
      <section className="p-4">
        <div className="flex justify-between items-end mb-4"><h2 className="text-xl font-bold text-gray-900">Nos Produits</h2><Link href="/catalog" className="text-sm text-purple-600 font-medium">Voir tout →</Link></div>
        {products.length > 0 ? (<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">{products.map(p => <ProductCard key={p.id} product={p as any} />)}</div>) : (<div className="py-20 text-center text-gray-400">Aucun produit disponible</div>)}
      </section>
      
      <footer className="p-6 text-center text-xs text-gray-400 border-t mt-8">
        <p>{settings?.footer_text || '© 2024 Divine Grâce'}</p>
        {settings?.contact_address && <p className="mt-1">{settings.contact_address}</p>}
      </footer>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 md:hidden z-50">
        <Link href="/" className="text-purple-600 font-bold text-sm">Accueil</Link>
        <Link href="/catalog" className="text-gray-500 font-medium text-sm">Catalogue</Link>
        <Link href="/cart" className="text-gray-500 font-medium text-sm">Panier</Link>
        <Link href="/profile" className="text-gray-500 font-medium text-sm">Compte</Link>
      </nav>
    </main>
  )
      }
