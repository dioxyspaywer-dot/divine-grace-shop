'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) return alert('Tous les champs sont obligatoires')
    if (form.password.length < 6) return alert('Le mot de passe doit contenir au moins 6 caractères')
    if (!form.email.includes('@')) return alert('Veuillez entrer une adresse e-mail valide')

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } }
    })
    setLoading(false)

    if (!error) {
      alert('✅ Compte créé avec succès ! Connectez-vous maintenant.')
      router.push('/login')
    } else {
      alert('Erreur : ' + error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-white">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-purple-700">Inscription</h1>
          <p className="text-gray-500 mt-2">Créez votre compte Divine Grâce</p>
        </div>
        <div className="space-y-3">
          <input
            placeholder="Nom et prénom"
            className="w-full p-4 rounded-xl border border-gray-200 focus:border-purple-500 outline-none"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Adresse e-mail"
            className="w-full p-4 rounded-xl border border-gray-200 focus:border-purple-500 outline-none"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Mot de passe (6 caractères min.)"
              className="w-full p-4 rounded-xl border border-gray-200 pr-12 focus:border-purple-500 outline-none"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
            <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-4 text-gray-400">
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-200 active:scale-95 transition disabled:opacity-70"
        >
          {loading ? 'Création...' : 'CRÉER MON COMPTE'}
        </button>
        <p className="text-center text-sm text-gray-600">
          Déjà inscrit ? <Link href="/login" className="text-purple-600 font-bold">Se connecter</Link>
        </p>
      </div>
    </div>
  )
    }
