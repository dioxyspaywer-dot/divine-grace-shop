'use client'
import { useState, useEffect } from 'react'
import PaymentUSSD from '@/components/PaymentUSSD'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { MapPin, ShieldCheck, Truck } from 'lucide-react'

export default function Checkout() {
  const [cart, setCart] = useState<any[]>([])
  const [shipping, setShipping] = useState({ region: '', city: '', neighborhood: '' })
  const [txId, setTxId] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { const saved = localStorage.getItem('dg_cart'); if (saved) setCart(JSON.parse(saved)) }, [])
  
  const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0)

  const submitOrder = async () => {
    if (!shipping.region || !shipping.city || !shipping.neighborhood) return alert('Remplissez l\'adresse complète')
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return router.push('/login') }
    
    const { error } = await supabase.from('orders').insert({
      user_id: user.id, total_amount: total, payment_method: 'Mobile Money',
      payment_status: 'pending_verification', transaction_id: txId || null,
      shipping_region: shipping.region, shipping_city: shipping.city,
      shipping_neighborhood: shipping.neighborhood, status: 'pending'
    })
    
    setLoading(false)
    if (!error) {
      localStorage.removeItem('dg_cart')
      alert('✅ Commande envoyée ! Les frais de livraison seront réglés directement au livreur.')
      router.push('/profile')
    } else alert('Erreur: ' + error.message)
  }

  return (
    <div className="p-4 max-w-md mx-auto pb-32 bg-gray-50 min-h-screen md:max-w-2xl md:py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Finalisation</h1>
      
      <div className="bg-white p-5 rounded-xl shadow-sm mb-6 border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin size={18} className="text-purple-600"/> Adresse de livraison (Togo)</h2>
        <div className="space-y-3">
          <input placeholder="Région (ex: Maritime)" className="w-full p-3.5 border border-gray-200 rounded-lg focus:border-purple-500 outline-none" onChange={e => setShipping({...shipping, region: e.target.value})} />
          <input placeholder="Ville (ex: Lomé)" className="w-full p-3.5 border border-gray-200 rounded-lg focus:border-purple-500 outline-none" onChange={e => setShipping({...shipping, city: e.target.value})} />
          <input placeholder="Quartier / Repère" className="w-full p-3.5 border border-gray-200 rounded-lg focus:border-purple-500 outline-none" onChange={e => setShipping({...shipping, neighborhood: e.target.value})} />
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6 flex items-start gap-3">
        <Truck size={20} className="text-orange-600 shrink-0 mt-0.5"/>
        <div>
          <p className="font-bold text-orange-800 text-sm">📦 Frais de livraison</p>
          <p className="text-orange-700 text-xs mt-1">Les frais de livraison sont à régler <strong>directement au livreur</strong> lors de la réception du colis. Le paiement ci-dessous concerne uniquement les produits commandés.</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><ShieldCheck size={18} className="text-teal-600"/> Paiement des produits</h2>
        <PaymentUSSD totalAmount={total} />
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <label className="text-sm font-bold text-gray-700 mb-2 block">ID Transaction (Optionnel)</label>
        <input placeholder="Ex: 2405..." className="w-full p-3.5 border border-gray-200 rounded-lg focus:border-purple-500 outline-none" onChange={e => setTxId(e.target.value)} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-md mx-auto md:max-w-2xl">
          <div className="flex justify-between font-bold text-lg mb-3">
            <span className="text-gray-600">Total produits</span>
            <span className="text-purple-600 text-xl">{total.toLocaleString()} F CFA</span>
          </div>
          <p className="text-[10px] text-orange-600 text-center mb-2 font-medium">+ Frais de livraison à payer au livreur</p>
          <button onClick={submitOrder} disabled={loading} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg active:scale-95 transition shadow-lg shadow-purple-200 disabled:opacity-70">
            {loading ? 'ENVOI EN COURS...' : 'SOUMETTRE LA COMMANDE'}
          </button>
        </div>
      </div>
    </div>
  )
           }
