'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Star, Send } from 'lucide-react'

export default function ReviewForm({ productId, onSuccess }: { productId: string; onSuccess: () => void }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const submit = async () => {
    if (rating === 0) return alert('Veuillez noter le produit')
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('Connectez-vous pour laisser un avis')
    const { error } = await supabase.from('reviews').insert({ product_id: productId, user_id: user.id, rating, comment })
    setLoading(false)
    if (error) alert(error.message)
    else { setRating(0); setComment(''); onSuccess() }
  }

  return (
    <div className="bg-gray-50 p-4 rounded-xl border mt-4">
      <h4 className="font-bold text-sm mb-3">Laisser un avis</h4>
      <div className="flex gap-1 mb-3">{[1,2,3,4,5].map(i => (<button key={i} onClick={() => setRating(i)} className={`p-1 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}><Star size={24} fill={i <= rating ? "currentColor" : "none"} /></button>))}</div>
      <textarea placeholder="Votre commentaire..." className="w-full p-3 border rounded-lg text-sm mb-3" rows={3} value={comment} onChange={e => setComment(e.target.value)} />
      <button onClick={submit} disabled={loading} className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"><Send size={16}/> {loading ? 'Envoi...' : 'Publier l\'avis'}</button>
    </div>
  )
                                                                }
