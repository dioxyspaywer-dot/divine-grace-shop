'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Tag, Check, X } from 'lucide-react'

export default function CouponInput({ cartTotal, onApply }: { cartTotal: number; onApply: (discount: number, code: string) => void }) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'valid'|'invalid'>('idle')
  const supabase = createClient()

  const validate = async () => {
    if (!code.trim()) return
    setStatus('loading')
    const { data, error } = await supabase.from('coupons').select('*').eq('code', code.toUpperCase()).eq('is_active', true).single()
    if (error || !data) { setStatus('invalid'); return }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { setStatus('invalid'); return }
    if (data.max_uses > 0 && data.usage_count >= data.max_uses) { setStatus('invalid'); return }
    if (cartTotal < data.min_amount) { setStatus('invalid'); return }
    let discount = 0
    if (data.discount_type === 'percent') discount = Math.round(cartTotal * (data.discount_value / 100))
    else discount = Number(data.discount_value)
    onApply(discount, data.code)
    setStatus('valid')
  }

  return (
    <div className="flex gap-2 mt-4">
      <div className="relative flex-1"><Tag size={16} className="absolute left-3 top-3.5 text-gray-400"/><input placeholder="Code promo" className="w-full pl-9 pr-3 py-3 border rounded-lg text-sm uppercase" value={code} onChange={e => setCode(e.target.value)} disabled={status === 'valid'} /></div>
      <button onClick={validate} disabled={status !== 'idle'} className={`px-4 rounded-lg font-bold text-sm transition ${status === 'valid' ? 'bg-green-100 text-green-700' : status === 'invalid' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
        {status === 'loading' ? '...' : status === 'valid' ? <Check size={18}/> : status === 'invalid' ? <X size={18}/> : 'Appliquer'}
      </button>
    </div>
  )
      }
