'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Save, CreditCard, Loader2, LayoutGrid, Megaphone, Ticket } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({})
  const [payments, setPayments] = useState<any[]>([])
  const [coupons, setCoupons] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [savingSettings, setSavingSettings] = useState(false)
  const [savingPaymentId, setSavingPaymentId] = useState<string | null>(null)
  const [newCoupon, setNewCoupon] = useState({ code: '', discount_type: 'percent', discount_value: 0, min_amount: 0, max_uses: 0, expires_at: null as string | null, category_id: null as string | null })
  const supabase = createClient()

  useEffect(() => {
    supabase.from('site_settings').select('*').single().then(({ data }) => data && setSettings(data))
    supabase.from('payment_methods').select('*').then(({ data }) => data && setPayments(data || []))
    supabase.from('coupons').select('*').order('created_at', { ascending: false }).then(({ data }) => setCoupons(data || []))
    supabase.from('categories').select('id, name').eq('is_active', true).then(({ data }) => setCategories(data || []))
  }, [])

  const saveSettings = async () => { setSavingSettings(true); await supabase.from('site_settings').update(settings).eq('id', settings.id); setSavingSettings(false); alert('✅ Paramètres mis à jour !') }
  const updatePaymentField = (id: string, field: string, value: string) => { setPayments(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p)) }
  const savePayment = async (payment: any) => { setSavingPaymentId(payment.id); await supabase.from('payment_methods').update({ account_name: payment.account_name, phone_number: payment.phone_number }).eq('id', payment.id); setSavingPaymentId(null); alert(`✅ ${payment.operator_name} mis à jour !`) }
  
  const addCoupon = async () => {
    if (!newCoupon.code) return alert('Code requis')
    const { data: couponData, error } = await supabase.from('coupons').insert(newCoupon).select().single()
    if (error) { alert(error.message) }
    else {
      // ✅ Notification nouvelle promo à tous les clients
      const { data: clients } = await supabase.from('profiles').select('id').eq('role', 'client')
      if (clients && clients.length > 0) {
        const discountText = newCoupon.discount_type === 'percent' ? `-${newCoupon.discount_value}%` : `-${newCoupon.discount_value} F`
        const notifications = clients.map(c => ({
          user_id: c.id, type: 'new_promo', title: '🎉 Nouvelle promotion !',
          message: `Profitez de ${discountText} avec le code "${newCoupon.code}" sur Divine Grâce !`,
          related_id: couponData?.id || null
        }))
        for (let i = 0; i < notifications.length; i += 50) {
          await supabase.from('notifications').insert(notifications.slice(i, i + 50))
        }
      }
      setNewCoupon({ code: '', discount_type: 'percent', discount_value: 0, min_amount: 0, max_uses: 0, expires_at: null, category_id: null })
      supabase.from('coupons').select('*').order('created_at', { ascending: false }).then(({ data }) => setCoupons(data || []))
      alert('✅ Coupon créé et clients notifiés !')
    }
  }
  
  const toggleSection = (sectionId: string) => { const updated = settings.sections_config?.map((s: any) => s.id === sectionId ? {...s, active: !s.active} : s) || []; setSettings({...settings, sections_config: updated}) }

  return (
    <div className="space-y-8 max-w-3xl pb-20">
      <section className="bg-white p-6 rounded-xl shadow-sm border"><h2 className="text-xl font-bold mb-6 flex items-center gap-2">🎨 Apparence</h2><div className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Nom boutique</label><input className="w-full p-3 border rounded-lg" value={settings.shop_name || ''} onChange={e => setSettings({...settings, shop_name: e.target.value})} /></div>
        <div><label className="block text-sm font-medium mb-1">Couleur Principale</label><div className="flex gap-3"><input type="color" className="h-12 w-16 rounded border-0" value={settings.primary_color || '#8b5cf6'} onChange={e => setSettings({...settings, primary_color: e.target.value})} /><input className="flex-1 p-3 border rounded-lg font-mono" value={settings.primary_color || ''} onChange={e => setSettings({...settings, primary_color: e.target.value})} /></div></div>
        <div><label className="block text-sm font-medium mb-1">Police d'écriture</label><select className="w-full p-3 border rounded-lg" value={settings.font_family || 'Inter, sans-serif'} onChange={e => setSettings({...settings, font_family: e.target.value})}><option value="Inter, sans-serif">Inter (Défaut)</option><option value="Poppins, sans-serif">Poppins</option><option value="Playfair Display, serif">Playfair Display</option><option value="Roboto, sans-serif">Roboto</option></select></div>
        <div><label className="block text-sm font-medium mb-1">Texte Hero (Accueil)</label><textarea className="w-full p-3 border rounded-lg" rows={2} value={settings.hero_text || ''} onChange={e => setSettings({...settings, hero_text: e.target.value})} /></div>
        <div><label className="block text-sm font-medium mb-1">URL Favicon</label><input className="w-full p-3 border rounded-lg" placeholder="https://..." value={settings.favicon_url || ''} onChange={e => setSettings({...settings, favicon_url: e.target.value})} /></div>
        <div><label className="block text-sm font-medium mb-1">Adresse</label><input className="w-full p-3 border rounded-lg" value={settings.contact_address || ''} onChange={e => setSettings({...settings, contact_address: e.target.value})} /></div>
        <div><label className="block text-sm font-medium mb-1">Email</label><input className="w-full p-3 border rounded-lg" value={settings.contact_email || ''} onChange={e => setSettings({...settings, contact_email: e.target.value})} /></div>
        <div><label className="block text-sm font-medium mb-1">Réseaux Sociaux (JSON)</label><textarea className="w-full p-3 border rounded-lg font-mono text-xs" rows={3} value={JSON.stringify(settings.social_links || {}, null, 2)} onChange={e => { try { setSettings({...settings, social_links: JSON.parse(e.target.value)}) } catch {} }} /></div>
        <div><label className="block text-sm font-medium mb-1">Texte Footer</label><input className="w-full p-3 border rounded-lg" value={settings.footer_text || ''} onChange={e => setSettings({...settings, footer_text: e.target.value})} /></div>
        <button onClick={saveSettings} disabled={savingSettings} className="w-full bg-purple-600 text-white py-3.5 rounded-lg font-bold flex items-center justify-center gap-2">{savingSettings ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} Enregistrer</button>
      </div></section>

      <section className="bg-white p-6 rounded-xl shadow-sm border"><h2 className="text-xl font-bold mb-6 flex items-center gap-2"><LayoutGrid size={20}/> Sections Accueil</h2><div className="space-y-2">{settings.sections_config?.map((s: any) => (<div key={s.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border"><span className="font-medium capitalize">{s.id === 'popular' ? 'Populaires' : s.id === 'new' ? 'Nouveautés' : s.id === 'promo' ? 'Promotions' : s.id}</span><button onClick={() => toggleSection(s.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{s.active ? 'Activé' : 'Désactivé'}</button></div>))}</div></section>

      <section className="bg-white p-6 rounded-xl shadow-sm border"><h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Megaphone size={20}/> Bannières Promo</h2><div className="space-y-3">{(settings.promo_banners || []).map((b: any, i: number) => (<div key={i} className="p-3 bg-gray-50 rounded-lg border flex justify-between items-center"><span className="text-sm truncate flex-1 mr-4">{b.title || 'Sans titre'}</span><button onClick={() => { const updated = settings.promo_banners.filter((_: any, idx: number) => idx !== i); setSettings({...settings, promo_banners: updated}) }} className="text-red-500 text-xs font-bold">Supprimer</button></div>))}<button onClick={() => { const title = prompt('Titre :'); const url = prompt('URL image :'); if (title && url) setSettings({...settings, promo_banners: [...(settings.promo_banners || []), { title, url }]}) }} className="w-full border-2 border-dashed border-gray-300 p-3 rounded-lg text-gray-500 font-bold text-sm hover:border-purple-400 hover:text-purple-600 transition">+ Ajouter</button></div></section>

      <section className="bg-white p-6 rounded-xl shadow-sm border"><h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Ticket size={20}/> Coupons</h2>
        <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
          <input placeholder="CODE" className="p-2 border rounded text-sm uppercase" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} />
          <select className="p-2 border rounded text-sm" value={newCoupon.discount_type} onChange={e => setNewCoupon({...newCoupon, discount_type: e.target.value})}><option value="percent">% Pourcentage</option><option value="fixed">F Montant Fixe</option></select>
          <input type="number" placeholder="Valeur" className="p-2 border rounded text-sm" value={newCoupon.discount_value || ''} onChange={e => setNewCoupon({...newCoupon, discount_value: Number(e.target.value)})} />
          <input type="number" placeholder="Min. commande" className="p-2 border rounded text-sm" value={newCoupon.min_amount || ''} onChange={e => setNewCoupon({...newCoupon, min_amount: Number(e.target.value)})} />
          <input type="number" placeholder="Max utilisations (0=∞)" className="p-2 border rounded text-sm" value={newCoupon.max_uses || ''} onChange={e => setNewCoupon({...newCoupon, max_uses: Number(e.target.value)})} />
          <input type="datetime-local" className="p-2 border rounded text-sm" onChange={e => setNewCoupon({...newCoupon, expires_at: e.target.value || null})} />
          <select className="col-span-2 p-2 border rounded text-sm" value={newCoupon.category_id || ''} onChange={e => setNewCoupon({...newCoupon, category_id: e.target.value || null})}><option value="">Toutes catégories</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <button onClick={addCoupon} className="col-span-2 bg-teal-600 text-white py-2 rounded font-bold text-sm">Créer le coupon</button>
        </div>
        <div className="space-y-2">{coupons.map(c => (<div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border text-sm"><div><span className="font-bold font-mono">{c.code}</span> <span className="text-gray-500 ml-2">{c.discount_type === 'percent' ? `-${c.discount_value}%` : `-${c.discount_value}F`}</span></div><span className="text-xs text-gray-400">{c.usage_count}/{c.max_uses || '∞'}</span></div>))}</div>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-sm border"><h2 className="text-xl font-bold mb-6 flex items-center gap-2"><CreditCard size={20}/> Paiement USSD</h2><div className="space-y-4">{payments.map(p => (<div key={p.id} className="border p-4 rounded-xl bg-gray-50 space-y-3"><div className="flex justify-between"><span className="font-bold text-purple-700">{p.operator_name}</span><span className="text-xs bg-white px-2 py-1 rounded border">Actif</span></div><input className="w-full p-2.5 border rounded text-sm" value={p.account_name} onChange={e => updatePaymentField(p.id, 'account_name', e.target.value)} placeholder="Titulaire" /><input className="w-full p-2.5 border rounded text-sm font-mono" value={p.phone_number} onChange={e => updatePaymentField(p.id, 'phone_number', e.target.value)} placeholder="Numéro" /><code className="block bg-gray-200 p-2 rounded text-xs font-mono break-all">{p.ussd_template}</code><button onClick={() => savePayment(p)} disabled={savingPaymentId === p.id} className="w-full bg-teal-700 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2">{savingPaymentId === p.id ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Enregistrer {p.operator_name}</button></div>))}</div></section>
    </div>
  )
    }
