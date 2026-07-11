'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, ShieldCheck, User, Phone, MapPin } from 'lucide-react'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      // Récupérer les infos du profil (nom, téléphone, rôle)
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!error && profileData) {
        setProfile(profileData)
      }
      
      setLoading(false)
    }

    fetchData()
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
    <div className="p-4 max-w-md mx-auto min-h-screen bg-gray-50 md:max-w-3xl md:py-8">
      {/* En-tête Profil */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
            <User size={32} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Bonjour, {profile?.full_name || user?.email}
            </h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Infos supplémentaires si disponibles */}
        {profile && (
          <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
            {profile.phone_number && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} /> {profile.phone_number}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className={`px-2 py-1 rounded text-xs font-bold ${profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {profile.role.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bouton Admin (Visible uniquement si role = admin) */}
      {profile?.role === 'admin' && (
        <Link
          href="/admin"
          className="flex items-center gap-3 bg-purple-600 p-4 rounded-xl mb-6 text-white font-bold shadow-lg shadow-purple-200 active:scale-95 transition"
        >
          <ShieldCheck size={24} /> Espace Admin
        </Link>
      )}

      {/* Contact Support */}
      <a
        href="https://wa.me/22890123892"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-green-50 border border-green-200 p-4 rounded-xl mb-6 text-green-700 font-bold active:scale-95 transition"
      >
        💬 Contacter le service client
      </a>

      {/* Déconnexion */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition border border-red-100"
      >
        <LogOut size={20} /> Se déconnecter
      </button>
    </div>
  )
}
