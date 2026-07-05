'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { MapPin, Phone, Hash, Search, ChevronDown } from 'lucide-react'

const STATUSES = ['pending','confirmed','preparing','shipped','in_delivery','delivered','cancelled','refunded']
const STATUS_LABELS: Record<string,string> = { pending:'En attente', confirmed:'Confirmée', preparing:'En préparation', shipped:'Expédiée', in_delivery:'En cours de livraison', delivered:'Livrée', cancelled:'Annulée', refunded:'Remboursée' }

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const supabase = createClient()

  const load = () => supabase.from('orders').select('*, profiles(full_name, phone_number)').order('created_at', { ascending: false }).then(({ data }) => setOrders(data || []))
  useEffect(() => { load() }, [])

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    const { error } = await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId)
    setUpdatingId(null)
    if (error) alert(error.message)
    else { setOrders(prev => prev.map(o => o.id === orderId ? {...o, status: newStatus} : o)); alert('✅ Statut mis à jour') }
  }

  const filtered = orders.filter(o => { if (!search) return true; const s = search.toLowerCase(); return o.profiles?.full_name?.toLowerCase().includes(s) || o.profiles?.phone_number?.includes(s) || o.transaction_id?.toLowerCase().includes(s) })

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3"><h1 className="text-2xl font-bold text-gray-900">Commandes</h1><div className="relative w-full md:w-72"><Search size={16} className="absolute left-3 top-3 text-gray-400"/><input placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" value={search} onChange={e => setSearch(e.target.value)} /></div></div>
      <div className="space-y-4">{filtered.map(o => (<div key={o.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"><div className="flex justify-between items-start mb-4"><div><div className="font-bold text-lg">{o.profiles?.full_name}</div><div className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone size={14}/> {o.profiles?.phone_number}</div></div><div className="text-right"><span className="block font-extrabold text-xl text-purple-600">{o.total_amount.toLocaleString()} F</span><span className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString('fr-TG')}</span></div></div><div className="bg-gray-50 p-3 rounded-lg mb-3 text-sm text-gray-600 flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-gray-400"/><span>{o.shipping_neighborhood}, {o.shipping_city} — <strong>{o.shipping_region}</strong></span></div><div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-3 border-t border-gray-100 gap-3"><div className="text-xs font-mono text-gray-400 flex items-center gap-1"><Hash size={12}/> TX: {o.transaction_id || '-'}</div><div className="flex items-center gap-2"><span className="text-xs text-gray-500 font-medium">Statut :</span>{updatingId === o.id ? (<span className="text-xs text-purple-600 font-bold animate-pulse">Mise à jour...</span>) : (<div className="relative"><select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className="appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border cursor-pointer outline-none bg-white" style={{ backgroundColor: o.status === 'delivered' ? '#dcfce7' : o.status === 'cancelled' || o.status === 'refunded' ? '#fee2e2' : o.status === 'pending' ? '#fef9c3' : '#dbeafe', color: o.status === 'delivered' ? '#15803d' : o.status === 'cancelled' || o.status === 'refunded' ? '#b91c1c' : o.status === 'pending' ? '#a16207' : '#1d4ed8' }}>{STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select><ChevronDown size={12} className="absolute right-2 top-2 pointer-events-none opacity-50"/></div>)}</div></div></div>))}{filtered.length === 0 && <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed">{search ? 'Aucune commande trouvée' : 'Aucune commande'}</div>}</div>
    </div>
  )
      }
