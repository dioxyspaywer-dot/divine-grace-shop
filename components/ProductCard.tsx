import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types/database'

export default function ProductCard({ product, listView = false }: { product: Product; listView?: boolean }) {
  if (listView) {
    return (
      <Link href={`/product/${product.slug}`} className="flex gap-3 bg-white p-3 rounded-xl border shadow-sm hover:shadow-md transition">
        <div className="relative w-24 h-24 shrink-0 bg-gray-100 rounded-lg overflow-hidden">{product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill className="object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Img</div>}</div>
        <div className="flex-1 flex flex-col justify-between"><h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3><div className="flex items-baseline gap-2"><span className="text-purple-600 font-bold">{product.price.toLocaleString()} F</span>{product.promo_price && <span className="text-xs text-gray-400 line-through">{product.promo_price.toLocaleString()} F</span>}</div></div>
      </Link>
    )
  }
  return (
    <Link href={`/product/${product.slug}`} className="group bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">{product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-300">Pas d'image</div>}</div>
      <div className="p-3"><h3 className="font-semibold text-gray-900 truncate text-sm">{product.name}</h3><div className="flex items-baseline gap-2 mt-1"><span className="text-purple-600 font-bold text-lg">{product.price.toLocaleString()} F</span>{product.promo_price && <span className="text-xs text-gray-400 line-through">{product.promo_price.toLocaleString()} F</span>}</div></div>
    </Link>
  )
}
