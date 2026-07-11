'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      setLoading(false)
    }
    checkUser()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <User size={24} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mon Compte</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4">
          <p className="text-green-700 text-sm font-medium">✅ Connecté avec succès</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition"
        >
          <LogOut size={18} /> Se déconnecter
        </button>
      </div>
    </div>
  )
}
