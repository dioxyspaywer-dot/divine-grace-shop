'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Bell, Check } from 'lucide-react'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).eq('is_read', false).order('created_at', { ascending: false }).limit(20)
      setNotifications(data || [])
    }
    load()
    const channel = supabase.channel('notif').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload: any) => {
      setNotifications(prev => [payload.new, ...prev])
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
    setNotifications([])
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 text-gray-600">
        <Bell size={22}/>
        {notifications.length > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{notifications.length}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <span className="font-bold text-sm">Notifications</span>
            {notifications.length > 0 && <button onClick={markAllRead} className="text-xs text-purple-600 font-bold">Tout marquer lu</button>}
          </div>
          {notifications.length === 0 ? <p className="p-4 text-center text-gray-400 text-sm">Aucune notification</p> : (
            notifications.map(n => (
              <div key={n.id} className="p-3 border-b last:border-0 hover:bg-gray-50 flex gap-3">
                <div className="flex-1"><p className="text-sm font-medium">{n.title}</p><p className="text-xs text-gray-500 mt-0.5">{n.message}</p><p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('fr-TG')}</p></div>
                <button onClick={() => markRead(n.id)} className="text-gray-400 hover:text-green-600 self-start"><Check size={14}/></button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
    }
