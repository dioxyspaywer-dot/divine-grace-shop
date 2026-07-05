'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import { Search, Grid3X3, List, ChevronDown } from 'lucide-react'
import Link from 'next/link'

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState<string>('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { supabase.from('categories').select('*').eq('is_active', true).order('display_order').then(({ data }) => setCategories(data || [])) }, [])

  useEffect(() => {
    setLoading(true)
    let query = supabase.from('products').select('*, categories(name)').eq('status', 'published')
    if (selectedCat !== 'all') query = query.eq('category_id', selectedCat)
    if (search) query = query.ilike('name', `%${search}%`)
    switch(sortBy) {
      case 'price_asc': query = query.order('price', { ascending: true }); break
      case 'price_desc': query = query.order('price', { ascending: false }); break
      case 'popular': query = query.eq('is_popular', true).order('created_at', { ascending: false }); break
      case 'promo': query = query.not('promo_price', 'is', null).order('created_at', { ascending: false }); break
      default: query = query.order('created_at', { ascending: false })
    }
    query.then(({ data }) => { setProducts(data || []); setLoading(false) })
  }, [search, selectedCat, sortBy])

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen md:max-w-6xl">
      <div className="sticky top-0 z-40 bg-white border-b px-4 py-3 space-y-3">
        <div className="flex items-center gap-3"><Link href="/" className="text-sm text-gray-500 shrink-0">← Accueil</Link><div className="relative flex-1"><Search size={18} className="absolute left-3 top-3.5 text-gray-400"/><input placeholder="Rechercher..." className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200" value={search} onChange={e => setSearch(e.target.value)} /></div></div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar"><button onClick={() => setSelectedCat('all')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${selectedCat === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Tout</button>{categories.map(c => (<button key={c.id} onClick={() => setSelectedCat(c.id)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${selectedCat === c.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{c.name}</button>))}</div>
        <div className="flex justify-between items-center"><div className="relative"><select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none bg-transparent text-xs font-medium text-gray-600 pr-6 outline-none cursor-pointer"><option value="newest">Nouveauté</option><option value="price_asc">Prix croissant</option><option value="price_desc">Prix décroissant</option><option value="popular">Populaire</option><option value="promo">En promotion</option></select><ChevronDown size={12} className="absolute right-0 top-1 text-gray-400 pointer-events-none"/></div><div className="flex gap-1"><button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}><Grid3X3 size={16}/></button><button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}><List size={16}/></button></div></div>
      </div>
      <div className="p-4"><p className="text-xs text-gray-400 mb-3">{products.length} produit{products.length > 1 ? 's' : ''}</p>{loading ? (<div className="py-20 text-center text-gray-400">Chargement...</div>) : products.length === 0 ? (<div className="py-20 text-center text-gray-400">Aucun produit trouvé</div>) : (<div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>{products.map(p => <ProductCard key={p.id} product={p as any} listView={viewMode === 'list'} />)}</div>)}</div>
    </div>
  )
    }
