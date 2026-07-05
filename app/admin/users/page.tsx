'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Ban, UserCheck, Trash2, Mail, Search } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const load = () => { let q = supabase.from('profiles').select('*, orders(count)').order('created_at', { ascending: false }); if (search) q = q.or(`full_name.ilike.%${search}%,phone_number.ilike.%${search}%`); q.then(({ data }) => setUsers(data || [])) }
  useEffect(() => { load() }, [search])
  const toggleSuspend = async (id: string, current: boolean) => { await supabase.from('profiles').update({ is_suspended: !current }).eq('id', id); load() }
  const deleteUser = async (id: string) => { if (!confirm('Supprimer définitivement ?')) return; await supabase.from('profiles').delete().eq('id', id); load() }

  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1><div className="relative"><Search size={16} className="absolute left-3 top-3 text-gray-400"/><input placeholder="Rechercher..." className="pl-9 pr-3 py-2 border rounded-lg text-sm" value={search} onChange={e => setSearch(e.target.value)} /></div></div>
      <div className="space-y-3">{users.map(u => (<div key={u.id} className="bg-white p-4 rounded-xl shadow-sm border flex gap-3 items-center"><div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg shrink-0">{u.full_name?.[0]?.toUpperCase() || '?'}</div><div className="flex-1 min-w-0"><h3 className="font-semibold text-sm truncate">{u.full_name}</h3><p className="text-xs text-gray-500">{u.phone_number}</p><p className="text-xs text-gray-400 mt-1">{u.orders?.[0]?.count || 0} commande(s)</p></div><div className="flex gap-1"><a href={`mailto:${u.phone_number}@divinegrace.tg`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Mail size={16}/></a><button onClick={() => toggleSuspend(u.id, u.is_suspended)} className={`p-2 rounded-lg ${u.is_suspended ? 'text-green-600 hover:bg-green-50' : 'text-orange-500 hover:bg-orange-50'}`}>{u.is_suspended ? <UserCheck size={16}/> : <Ban size={16}/>}</button><button onClick={() => deleteUser(u.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button></div></div>))}</div>
    </div>
  )
      }
