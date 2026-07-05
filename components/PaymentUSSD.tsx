'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Copy, Phone } from 'lucide-react'
import type { PaymentMethod } from '@/types/database'

export default function PaymentUSSD({ totalAmount }: { totalAmount: number }) {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [selected, setSelected] = useState<PaymentMethod | null>(null)
  const [generatedCode, setGeneratedCode] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.from('payment_methods').select('*').eq('is_active', true).then(({ data }) => {
      if (data && data.length > 0) { setMethods(data as PaymentMethod[]); setSelected(data[0] as PaymentMethod) }
    })
  }, [])

  useEffect(() => {
    if (selected && totalAmount > 0) {
      let code = selected.ussd_template
      code = code.replace('{amount}', Math.round(totalAmount).toString())
      code = code.replace(/{phone}/g, selected.phone_number)
      setGeneratedCode(code)
    }
  }, [selected, totalAmount])

  const copy = (text: string) => { navigator.clipboard.writeText(text); alert('Copié !') }
  if (!selected) return <div className="p-6 text-center text-gray-500">Chargement...</div>

  return (
    <div className="space-y-4 p-5 bg-teal-900 rounded-xl text-white shadow-lg">
      <div className="flex gap-2 mb-2">
        {methods.map(m => (<button key={m.id} onClick={() => setSelected(m)} className={`px-5 py-2.5 rounded-lg font-bold transition-all ${selected.id === m.id ? 'bg-purple-600 shadow-md scale-105' : 'bg-teal-800 opacity-80'}`}>{m.operator_name}</button>))}
      </div>
      <div className="bg-teal-800/80 p-4 rounded-lg space-y-3 border border-teal-700">
        <div className="flex justify-between items-center"><span className="text-teal-200 text-sm">Titulaire</span><span className="font-bold">{selected.account_name}</span></div>
        <div className="flex justify-between items-center"><span className="text-teal-200 text-sm">Numéro</span><div className="flex items-center gap-2"><span className="font-bold text-lg tracking-wide">{selected.phone_number}</span><button onClick={() => copy(selected.phone_number)} className="bg-purple-600 px-2 py-1 rounded text-xs font-medium active:scale-95">Copier</button></div></div>
      </div>
      <div className="bg-black/40 p-5 rounded-lg border border-teal-600 text-center">
        <p className="text-yellow-400 font-mono text-2xl mb-4 break-all leading-relaxed">{generatedCode}</p>
        <div className="flex gap-3">
          <a href={`tel:${encodeURIComponent(generatedCode)}`} className="flex-1 bg-black text-white py-3.5 rounded-lg flex items-center justify-center gap-2 font-bold active:scale-95 transition"><Phone size={20} /> Composez</a>
          <button onClick={() => copy(generatedCode)} className="flex-1 bg-gray-800 text-white py-3.5 rounded-lg flex items-center justify-center gap-2 font-bold active:scale-95 transition"><Copy size={20} /> Copier</button>
        </div>
        <p className="text-xs text-teal-300 mt-4 leading-relaxed">1. Cliquez sur "Composez"<br/>2. Validez l'appel et saisissez votre code secret<br/>3. Revenez ici et cliquez sur "SOUMETTRE"</p>
      </div>
    </div>
  )
        }
