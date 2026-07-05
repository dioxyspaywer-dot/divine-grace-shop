'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Plus, Trash2, Edit3, Save, Loader2, Package, Copy } from 'lucide-react'

const emptyProduct: {
  name: string; slug: string; description: string; short_description: string;
  sku: string; brand: string; price: number; promo_price: number | null;
  stock_quantity: number; images: string[]; video_url: string; colors: string[];
  sizes: string[]; weight: number | null; dimensions: string; warranty: string;
  category_id: string; is_recommended: boolean; is_popular: boolean; status: string;
  scheduled_at: string | null; promo_end_date: string | null; condition: string;
} = {
  name: '', slug: '', description: '', short_description: '', sku: '', brand: '',
  price: 0, promo_price: null, stock_quantity: 0, images: [], video_url: '',
  colors: [], sizes: [], weight: null, dimensions: '', warranty: '', category_id: '',
  is_recommended: false, is_popular: false, status: 'draft', scheduled_at: null,
  promo_end_date: null, condition: 'neuf'
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(emptyProduct)
  const [saving, setSaving] = useState(false)
  const [colorInput, setColorInput] = useState('')
  const [sizeInput, setSizeInput] = useState('')
  const [imageInput, setImageInput] = useState('')
  const supabase = createClient()

  const load = () => {
    supabase.from('products').select('*').order('created_at', { ascending: false }).then(({ data }) => setProducts(data || []))
    supabase.from('categories').select('*').eq('is_active', true).then(({ data }) => setCategories(data || []))
  }
  useEffect(() => { load() }, [])

  const openNew = () => { setForm({ ...emptyProduct }); setEditing('new') }
  const openEdit = (p: any) => { setForm({ ...p, promo_price: p.promo_price || null }); setEditing(p.id) }
  const cancel = () => { setEditing(null); setForm({ ...emptyProduct }) }

  const save = async () => {
    if (!form.name || !form.slug || !form.price) return alert('Nom, slug et prix obligatoires')
    setSaving(true)
    const payload = {
      ...form,
      promo_price: form.promo_price || null,
      weight: form.weight || null,
      scheduled_at: form.scheduled_at || null,
      promo_end_date: form.promo_end_date || null
    }
    let error
    if (editing === 'new') ({ error } = await supabase.from('products').insert(payload))
    else ({ error } = await supabase.from('products').update(payload).eq('id', editing))
    setSaving(false)
    if (error) alert(error.message)
    else { alert('✅ Produit enregistré !'); cancel(); load() }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  const duplicateProduct = async (p: any) => {
    const dup = {
      ...p, id: undefined, name: p.name + ' (copie)',
      slug: p.slug + '-copie-' + Date.now(), status: 'draft',
      created_at: undefined, published_at: undefined
    }
    const { error } = await supabase.from('products').insert(dup)
    if (error) alert(error.message)
    else { alert('✅ Dupliqué en brouillon !'); load() }
  }

  const addColor = () => { if (colorInput.trim()) { setForm({ ...form, colors: [...form.colors, colorInput.trim()] }); setColorInput('') } }
  const addSize = () => { if (sizeInput.trim()) { setForm({ ...form, sizes: [...form.sizes, sizeInput.trim()] }); setSizeInput('') } }
  const addImage = () => { if (imageInput.trim()) { setForm({ ...form, images: [...form.images, imageInput.trim()] }); setImageInput('') } }

  if (editing) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{editing === 'new' ? 'Nouveau Produit' : 'Modifier Produit'}</h1>
          <button onClick={cancel} className="text-gray-500 text-sm">Annuler</button>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
          {/* Nom + Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom *</label><input className="w-full p-2.5 border rounded-lg text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slug *</label><input className="w-full p-2.5 border rounded-lg text-sm font-mono" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
          </div>

          {/* Catégorie + Marque */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Catégorie</label><select className="w-full p-2.5 border rounded-lg text-sm" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}><option value="">-- Aucune --</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Marque</label><input className="w-full p-2.5 border rounded-lg text-sm" value={form.brand || ''} onChange={e => setForm({ ...form, brand: e.target.value })} /></div>
          </div>

          {/* Prix + Promo + Stock */}
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prix *</label><input type="number" className="w-full p-2.5 border rounded-lg text-sm" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prix Promo</label><input type="number" className="w-full p-2.5 border rounded-lg text-sm" value={form.promo_price ?? ''} onChange={e => setForm({ ...form, promo_price: e.target.value ? Number(e.target.value) : null })} /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock</label><input type="number" className="w-full p-2.5 border rounded-lg text-sm" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: Number(e.target.value) })} /></div>
          </div>

          {/* SKU + Garantie */}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKU</label><input className="w-full p-2.5 border rounded-lg text-sm font-mono" value={form.sku || ''} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Garantie</label><input className="w-full p-2.5 border rounded-lg text-sm" value={form.warranty || ''} onChange={e => setForm({ ...form, warranty: e.target.value })} /></div>
          </div>

          {/* État + Fin Promotion */}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">État</label><select className="w-full p-2.5 border rounded-lg text-sm" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}><option value="neuf">Neuf</option><option value="occasion">Occasion</option><option value="reconditionné">Reconditionné</option></select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fin Promotion</label><input type="datetime-local" className="w-full p-2.5 border rounded-lg text-sm" value={form.promo_end_date ? form.promo_end_date.slice(0, 16) : ''} onChange={e => setForm({ ...form, promo_end_date: e.target.value || null })} /></div>
          </div>

          {/* Poids + Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Poids (kg)</label><input type="number" step="0.01" className="w-full p-2.5 border rounded-lg text-sm" value={form.weight ?? ''} onChange={e => setForm({ ...form, weight: e.target.value ? Number(e.target.value) : null })} /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dimensions</label><input className="w-full p-2.5 border rounded-lg text-sm" value={form.dimensions || ''} onChange={e => setForm({ ...form, dimensions: e.target.value })} /></div>
          </div>

          {/* Programmer Publication */}
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Programmer Publication</label><input type="datetime-local" className="w-full p-2.5 border rounded-lg text-sm" value={form.scheduled_at ? form.scheduled_at.slice(0, 16) : ''} onChange={e => setForm({ ...form, scheduled_at: e.target.value || null })} /><p className="text-xs text-gray-400 mt-1">Laisser vide pour publier immédiatement</p></div>

          {/* Images */}
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Images (URLs)</label><div className="flex gap-2 mb-2"><input className="flex-1 p-2.5 border rounded-lg text-sm" placeholder="https://..." value={imageInput} onChange={e => setImageInput(e.target.value)} /><button onClick={addImage} className="bg-gray-100 px-3 rounded-lg text-sm font-bold">+</button></div><div className="flex gap-2 flex-wrap">{form.images.map((img, i) => (<div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border group"><img src={img} alt="" className="w-full h-full object-cover" /><button onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="absolute inset-0 bg-black/50 text-white hidden group-hover:flex items-center justify-center"><Trash2 size={14} /></button></div>))}</div></div>

          {/* Vidéo */}
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vidéo (URL)</label><input className="w-full p-2.5 border rounded-lg text-sm" value={form.video_url || ''} onChange={e => setForm({ ...form, video_url: e.target.value })} /></div>

          {/* Couleurs */}
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Couleurs</label><div className="flex gap-2 mb-2"><input className="flex-1 p-2.5 border rounded-lg text-sm" placeholder="Ex: Rouge" value={colorInput} onChange={e => setColorInput(e.target.value)} /><button onClick={addColor} className="bg-gray-100 px-3 rounded-lg text-sm font-bold">+</button></div><div className="flex gap-1 flex-wrap">{form.colors.map((c, i) => <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs flex items-center gap-1">{c} <button onClick={() => setForm({ ...form, colors: form.colors.filter((_, j) => j !== i) })}><Trash2 size={10} /></button></span>)}</div></div>

          {/* Tailles */}
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tailles</label><div className="flex gap-2 mb-2"><input className="flex-1 p-2.5 border rounded-lg text-sm" placeholder="Ex: XL" value={sizeInput} onChange={e => setSizeInput(e.target.value)} /><button onClick={addSize} className="bg-gray-100 px-3 rounded-lg text-sm font-bold">+</button></div><div className="flex gap-1 flex-wrap">{form.sizes.map((s, i) => <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs flex items-center gap-1">{s} <button onClick={() => setForm({ ...form, sizes: form.sizes.filter((_, j) => j !== i) })}><Trash2 size={10} /></button></span>)}</div></div>

          {/* Descriptions */}
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description courte</label><textarea className="w-full p-2.5 border rounded-lg text-sm" rows={2} value={form.short_description || ''} onChange={e => setForm({ ...form, short_description: e.target.value })} /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description complète</label><textarea className="w-full p-2.5 border rounded-lg text-sm" rows={4} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>

          {/* Options */}
          <div className="flex gap-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_popular} onChange={e => setForm({ ...form, is_popular: e.target.checked })} /> Populaire</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_recommended} onChange={e => setForm({ ...form, is_recommended: e.target.checked })} /> Recommandé</label></div>

          {/* Statut */}
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Statut</label><div className="flex gap-2"><button onClick={() => setForm({ ...form, status: 'draft' })} className={`flex-1 py-2.5 rounded-lg text-sm font-bold border ${form.status === 'draft' ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300'}`}>Brouillon</button><button onClick={() => setForm({ ...form, status: 'published' })} className={`flex-1 py-2.5 rounded-lg text-sm font-bold border ${form.status === 'published' ? 'bg-green-600 text-white border-green-600' : 'border-gray-300'}`}>Publié</button></div></div>

          {/* Bouton Sauvegarder */}
          <button onClick={save} disabled={saving} className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-70">{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {saving ? 'Enregistrement...' : 'Enregistrer le produit'}</button>
        </div>
      </div>
    )
  }

  // Liste des produits
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
        <button onClick={openNew} className="bg-purple-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 active:scale-95"><Plus size={18} /> Nouveau</button>
      </div>
      <div className="space-y-3">
        {products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border flex gap-3 items-center">
            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">{p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{p.name}</h3>
              <p className="text-purple-600 font-bold text-sm">{p.price.toLocaleString()} F</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.status === 'published' ? 'En ligne' : 'Brouillon'}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => duplicateProduct(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" title="Dupliquer"><Copy size={16} /></button>
              <button onClick={() => openEdit(p)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Edit3 size={16} /></button>
              <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {products.length === 0 && <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed">Aucun produit. Cliquez sur "Nouveau".</div>}
      </div>
    </div>
  )
          }
