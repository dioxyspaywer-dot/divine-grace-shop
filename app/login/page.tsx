'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [show, setShow] = useState(false)
  const [creds, setCreds] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    if (!creds.email || !creds.password) return alert('Email et mot de passe requis')
    if (creds.password.length < 6) return alert('Min 6 caractères')
    
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: creds.email,
      password: creds.password,
    })
    setLoading(false)

    if (error) {
      // Message plus clair pour l'utilisateur
      if (error.message.includes('Email not confirmed')) {
        alert('Erreur : Votre compte n\'est pas encore confirmé. Veuillez vérifier votre boîte mail ou contacter le support.')
      } else {
        alert(error.message)
      }
      return
    }
    
    router.push('/profile')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-white">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-purple-700">Bienvenue</h1>
          <p className="text-gray-500 mt-2">Connectez-vous à Divine Grace</p>
        </div>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Adresse e-mail"
            className="w-full p-4 rounded-xl border focus:border-purple-500 outline-none"
            value={creds.email}
            onChange={(e) => setCreds({ ...creds, email: e.target.value })}
          />
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              placeholder="Mot de passe (6 car. min.)"
              className="w-full p-4 rounded-xl border pr-12 focus:border-purple-500 outline-none"
              value={creds.password}
              onChange={(e) => setCreds({ ...creds, password: e.target.value })}
            />
            <button onClick={() => setShow(!show)} className="absolute right-4 top-4 text-gray-400">
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition disabled:opacity-70"
        >
          {loading ? 'Connexion...' : 'SE CONNECTER'}
        </button>
        <p className="text-center text-sm text-gray-600">
          Pas de compte ? <Link href="/register" className="text-purple-600 font-bold">S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}
