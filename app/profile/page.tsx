'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut, ShieldCheck, Package, MapPin, Edit3, Phone, Save, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function Profile() {
  const [orders, setOrders] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', phone_number: '' })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      const { data: profile } = await supabase.from('profiles').select('role, full_name, phone_number').eq('id', user.id).single()
      if (profile?.role === 'admin') setIsAdmin(true)
      if (profile?.full_name) { setUserName(profile.full_name); setEditForm(f => ({...f, full_name: profile.full_name})) }
      if (profile?.phone_number) { setUserPhone(profile.phone_number); setEditForm(f => ({...f, phone_number: profile.phone_number})) }
      const { data } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setOrders(data || [])
    }
    load()
  }, [])

  const logout = async () => { await supabase.auth.signOut(); router.push('/') }
  const saveProfile = async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return; await supabase.from('profiles').update(editForm).eq('id', user.id); setUserName(editForm.full_name); setUserPhone(editForm.phone_number); setEditingProfile(false); alert('✅ Profil mis à jour') }
  const cancelOrder = async (orderId: string) => { if (!confirm('Annuler cette commande ?')) return; const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId).eq('status', 'pending'); if (error) alert(error.message); else { setOrders(prev => prev.map(o => o.id === orderId ? {...o, status: 'cancelled'} : o)); alert('Commande annulée') } }
  const getStatusColor = (s: string) => s === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' : s === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen bg-gray-50 md:max-w-3xl md:py-8">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
        {editingProfile ? (<div className="flex-1 space-y-2 mr-4"><input className="w-full p-2 border rounded text-sm" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} placeholder="Nom complet" /><input className="w-full p-2 border rounded text-sm" value={editForm.phone_number} onChange={e => setEditForm({...editForm, phone_number: e.target.value})} placeholder="Téléphone" /><div className="flex gap-2"><button onClick={saveProfile} className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-1"><Save size={14}/> Sauver</button><button onClick={() => setEditingProfile(false)} className="px-3 bg-gray-200 rounded text-sm"><XCircle size={18}/></button></div></div>) : (<div className="flex-1"><h1 className="text-xl font-bold text-gray-900">Bonjour, {userName}</h1><p className="text-sm text-gray-500 flex items-center gap-1"><Phone size={12}/> {userPhone}</p></div>)}
        <div className="flex gap-2">{!editingProfile && <button onClick={() => setEditingProfile(true)} className="text-purple-600 bg-purple-50 p-2 rounded-lg"><Edit3 size={20}/></button>}<button onClick={logout} className="text-red-500 bg-red-50 p-2 rounded-lg"><LogOut size={20}/></button></div>
      </div>
      {isAdmin && <Link href="/admin" className="flex items-center gap-3 bg-purple-600 p-4 rounded-xl mb-6 text-white font-bold shadow-lg shadow-purple-200 active:scale-95 transition"><ShieldCheck size={24} /> Espace Admin</Link>}
      <a href="https://wa.me/22890123892" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-green-50 border border-green-200 p-4 rounded-xl mb-6 text-green-700 font-bold active:scale-95 transition">💬 Contacter le service client</a>
      <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800"><Package size={20} className="text-purple-600"/> Mes Commandes</h2>
      <div className="space-y-3 pb-20">{orders.map(o => (<div key={o.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"><div className="flex justify-between items-start mb-3"><span className="text-xs text-gray-400 font-mono">{new Date(o.created_at).toLocaleDateString('fr-TG')}</span><span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(o.status)}`}>{o.status.toUpperCase()}</span></div><div className="font-bold text-xl text-purple-700 mb-2">{o.total_amount.toLocaleString()} F CFA</div><div className="text-sm text-gray-500 flex items-start gap-2 bg-gray-50 p-2 rounded-lg"><MapPin size={16} className="mt-0.5 shrink-0"/><span>{o.shipping_neighborhood}, {o.shipping_city}</span></div>{o.status === 'pending' && (<button onClick={() => cancelOrder(o.id)} className="mt-3 w-full border border-red-200 text-red-600 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-50"><XCircle size={16}/> Annuler</button>)}</div>))}{orders.length === 0 && <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300"><p className="text-gray-400 mb-4">Aucune commande</p><Link href="/catalog" className="text-purple-600 font-bold">Visiter la boutique</Link></div>}</div>
    </div>
  )
    }
