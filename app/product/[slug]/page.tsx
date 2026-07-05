import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Share2, Check, X, PlayCircle, Star } from 'lucide-react'
import ReviewForm from '@/components/ReviewForm'

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: product } = await supabase.from('products').select('*, categories(name)').eq('slug', params.slug).eq('status', 'published').single()
  if (!product) notFound()

  await supabase.from('product_views').insert({ product_id: product.id })

  const { data: reviews } = await supabase.from('reviews').select('*, profiles(full_name)').eq('product_id', product.id).order('created_at', { ascending: false })
  const avgRating = reviews?.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0
  const { data: similarProducts } = await supabase.from('products').select('id, name, slug, price, promo_price, images').eq('category_id', product.category_id).eq('status', 'published').neq('id', product.id).limit(4)
  const discount = product.promo_price ? Math.round(((product.price - product.promo_price) / product.price) * 100) : 0

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen md:max-w-5xl md:bg-transparent pb-20">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b px-4 py-3 flex justify-between items-center"><Link href="/catalog" className="text-sm font-medium text-gray-600">← Catalogue</Link><h1 className="text-lg font-bold truncate max-w-[200px]">{product.name}</h1><Share2 size={20} className="text-gray-600" /></header>
      <div className="relative aspect-square bg-gray-100 w-full">{product.images?.[0] ? (<Image src={product.images[0]} alt={product.name} fill className="object-cover" priority />) : (<div className="w-full h-full flex items-center justify-center text-gray-300">Aucune image</div>)}{discount > 0 && (<span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">-{discount}%</span>)}</div>
      {product.images?.length > 1 && (<div className="flex gap-2 p-3 overflow-x-auto">{product.images.map((img: string, i: number) => (<div key={i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border"><Image src={img} alt="" fill className="object-cover" /></div>))}</div>)}
      {product.video_url && (<div className="px-4 pt-2"><a href={product.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-purple-600 font-medium text-sm bg-purple-50 p-3 rounded-lg"><PlayCircle size={18}/> Voir la vidéo</a></div>)}
      <div className="p-4 space-y-4">
        <div><p className="text-xs text-purple-600 font-medium uppercase">{product.categories?.name || 'Produit'}</p><h1 className="text-2xl font-bold text-gray-900 mt-1">{product.name}</h1></div>
        <div className="flex items-baseline gap-3"><span className="text-3xl font-extrabold text-purple-700">{(product.promo_price || product.price).toLocaleString()} F</span>{product.promo_price && (<span className="text-lg text-gray-400 line-through">{product.price.toLocaleString()} F</span>)}</div>
        {reviews && reviews.length > 0 && (<div className="flex items-center gap-1 text-sm"><Star size={16} className="text-yellow-400" fill="currentColor"/><span className="font-bold">{avgRating.toFixed(1)}</span><span className="text-gray-400">({reviews.length} avis)</span></div>)}
        <div className="flex items-center gap-2 text-sm">{product.stock_quantity > 0 ? (<span className="flex items-center gap-1 text-green-600 font-medium"><Check size={16}/> En stock ({product.stock_quantity})</span>) : (<span className="flex items-center gap-1 text-red-500 font-medium"><X size={16}/> Rupture</span>)}</div>
        {product.short_description && (<p className="text-gray-600 text-sm leading-relaxed">{product.short_description}</p>)}
        {product.colors?.length > 0 && (<div><p className="text-sm font-medium text-gray-700 mb-2">Couleurs</p><div className="flex gap-2 flex-wrap">{product.colors.map((c: string) => (<span key={c} className="px-3 py-1 border rounded-full text-xs bg-gray-50">{c}</span>))}</div></div>)}
        {product.sizes?.length > 0 && (<div><p className="text-sm font-medium text-gray-700 mb-2">Tailles</p><div className="flex gap-2 flex-wrap">{product.sizes.map((s: string) => (<span key={s} className="px-3 py-1 border rounded-lg text-xs font-medium bg-gray-50">{s}</span>))}</div></div>)}
        
        <div className="flex gap-2 pt-2 flex-wrap">
          <button onClick={() => { const cart = JSON.parse(localStorage.getItem('dg_cart') || '[]'); const existing = cart.find((i:any) => i.id === product.id); if (existing) existing.qty += 1; else cart.push({ id: product.id, name: product.name, price: product.promo_price || product.price, image: product.images?.[0], qty: 1 }); localStorage.setItem('dg_cart', JSON.stringify(cart)); window.location.href = '/checkout' }} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50 min-w-[140px]" disabled={product.stock_quantity <= 0}><ShoppingCart size={18}/> Acheter</button>
          <button onClick={() => { const cart = JSON.parse(localStorage.getItem('dg_cart') || '[]'); const existing = cart.find((i:any) => i.id === product.id); if (existing) existing.qty += 1; else cart.push({ id: product.id, name: product.name, price: product.promo_price || product.price, image: product.images?.[0], qty: 1 }); localStorage.setItem('dg_cart', JSON.stringify(cart)); alert('✅ Ajouté au panier !') }} className="flex-1 border-2 border-purple-600 text-purple-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50 min-w-[140px]" disabled={product.stock_quantity <= 0}><ShoppingCart size={18}/> Panier</button>
          <button onClick={async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return alert('Connectez-vous'); const { error } = await supabase.from('favorites').insert({ user_id: user.id, product_id: product.id }); if (error && !error.message.includes('unique')) alert(error.message); else alert('❤️ Favori !') }} className="p-3 border rounded-xl text-gray-600 active:bg-gray-50"><Heart size={20}/></button>
          <button onClick={() => { if (navigator.share) navigator.share({ title: product.name, url: window.location.href }); else { navigator.clipboard.writeText(window.location.href); alert('Lien copié !') } }} className="p-3 border rounded-xl text-gray-600 active:bg-gray-50"><Share2 size={20}/></button>
        </div>

        {product.description && (<div className="pt-4 border-t"><h3 className="font-bold text-gray-900 mb-2">Description</h3><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p></div>)}
        {(product.weight || product.dimensions || product.warranty || product.brand || product.sku || product.condition) && (<div className="pt-4 border-t"><h3 className="font-bold text-gray-900 mb-3">Caractéristiques</h3><div className="space-y-2 text-sm">{product.brand && <div className="flex justify-between"><span className="text-gray-500">Marque</span><span className="font-medium">{product.brand}</span></div>}{product.sku && <div className="flex justify-between"><span className="text-gray-500">Référence</span><span className="font-mono text-xs">{product.sku}</span></div>}{product.condition && <div className="flex justify-between"><span className="text-gray-500">État</span><span className="capitalize">{product.condition}</span></div>}{product.weight && <div className="flex justify-between"><span className="text-gray-500">Poids</span><span>{product.weight} kg</span></div>}{product.dimensions && <div className="flex justify-between"><span className="text-gray-500">Dimensions</span><span>{product.dimensions}</span></div>}{product.warranty && <div className="flex justify-between"><span className="text-gray-500">Garantie</span><span>{product.warranty}</span></div>}</div></div>)}
        
        <div className="pt-4 border-t"><h3 className="font-bold text-gray-900 mb-3">Avis Clients ({reviews?.length || 0})</h3><ReviewForm productId={product.id} onSuccess={() => window.location.reload()} /><div className="mt-4 space-y-3">{reviews?.map(r => (<div key={r.id} className="bg-gray-50 p-3 rounded-lg"><div className="flex justify-between items-start mb-1"><span className="font-bold text-sm">{r.profiles?.full_name || 'Anonyme'}</span><div className="flex text-yellow-400">{Array.from({length: r.rating}).map((_,i) => <Star key={i} size={12} fill="currentColor"/>)}</div></div><p className="text-sm text-gray-600">{r.comment}</p></div>))}</div></div>
      </div>
      {similarProducts && similarProducts.length > 0 && (<div className="p-4 border-t bg-gray-50"><h3 className="font-bold text-gray-900 mb-4">Produits similaires</h3><div className="grid grid-cols-2 gap-3">{similarProducts.map(p => (<Link key={p.id} href={`/product/${p.slug}`} className="bg-white rounded-xl overflow-hidden border shadow-sm"><div className="relative aspect-square bg-gray-100">{p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover"/>}</div><div className="p-2"><p className="text-xs font-semibold truncate">{p.name}</p><p className="text-purple-600 font-bold text-sm">{(p.promo_price || p.price).toLocaleString()} F</p></div></Link>))}</div></div>)}
    </div>
  )
        }
