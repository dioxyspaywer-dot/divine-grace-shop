'use client'
import { useState, useEffect } from 'react'
import { Trash2, Plus, Minus, ShoppingBag, Truck } from 'lucide-react'
import Link from 'next/link'
import CouponInput from '@/components/CouponInput'

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])
  const [discount, setDiscount] = useState(0)
  const [couponCode, setCouponCode] = useState('')
  useEffect(() => { const saved = localStorage.getItem('dg_cart'); if (saved) setCart(JSON.parse(saved)) }, [])
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
  const totalAPayer = subtotal - discount

  const updateQty = (id: string, delta: number) => { const c = cart.map(i => i.id === id ? {...i, qty: Math.max(1, i.qty + delta)} : i); setCart(c); localStorage.setItem('dg_cart', JSON.stringify(c)) }
  const remove = (id: string) => { const c = cart.filter(i => i.id !== id); setCart(c); localStorage.setItem('dg_cart', JSON.stringify(c)); setDiscount(0); setCouponCode('') }
  const applyCoupon = (amount: number, code: string) => { setDiscount(amount); setCouponCode(code) }

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen bg-white md:max-w-4xl md:rounded-xl md:shadow-lg md:my-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><ShoppingBag className="text-purple-600" /> Mon Panier</h1>
      {cart.length === 0 ? (
        <div className="text-center py-20"><p className="text-gray-400 text-lg mb-6">Panier vide</p><Link href="/catalog" className="text-purple-600 font-bold underline">Voir les produits</Link></div>
      ) : (
        <>
          <div className="space-y-4 mb-4">
            {cart.map(item => (
              <div key={item.id} className="bg-gray-50 p-3 rounded-xl flex gap-4 border border-gray-100">
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-white" />
                <div className="flex-1 flex flex-col justify-between">
                  <div><h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3><p className="text-purple-600 font-bold mt-1">{item.price.toLocaleString()} F</p></div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-white rounded-lg border px-2 py-1">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1 text-gray-500"><Minus size={16}/></button>
                      <span className="font-bold w-4 text-center text-sm">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1 text-gray-500"><Plus size={16}/></button>
                    </div>
                    <button onClick={() => remove(item.id)} className="text-red-400 p-2"><Trash2 size={18}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-sm mb-2">Code Promotionnel</h3>
            <CouponInput cartTotal={subtotal} onApply={applyCoupon} />
            {couponCode && <p className="text-green-600 text-xs mt-2 font-bold">✅ Code "{couponCode}" appliqué (-{discount} F)</p>}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
            <div className="max-w-md mx-auto md:max-w-4xl space-y-2">
              <div className="flex justify-between text-sm text-gray-500"><span>Sous-total</span><span>{subtotal.toLocaleString()} F</span></div>
              {discount > 0 && <div className="flex justify-between text-sm text-green-600 font-bold"><span>Remise</span><span>-{discount.toLocaleString()} F</span></div>}
              
              <div className="flex justify-between items-center text-sm bg-orange-50 p-2 rounded-lg border border-orange-100">
                <span className="flex items-center gap-1 text-orange-700 font-medium"><Truck size={14}/> Livraison</span>
                <span className="text-orange-700 font-bold text-xs">À payer au livreur</span>
              </div>
              
              <div className="flex justify-between font-bold text-xl pt-2 border-t">
                <span>Total à payer en ligne</span>
                <span className="text-purple-600">{totalAPayer.toLocaleString()} F CFA</span>
              </div>
              <Link href="/checkout" className="block w-full bg-purple-600 text-white text-center py-4 rounded-xl font-bold text-lg active:scale-95 transition shadow-lg shadow-purple-200">COMMANDER</Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
