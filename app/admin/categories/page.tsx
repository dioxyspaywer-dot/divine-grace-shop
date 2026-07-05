'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Plus, Trash2, Edit3, Save, Loader2, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react'

const emptyCat = { name: '', description: '', image_url: '', is_active: true, display_order: 0 }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(emptyCat)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const load = () => supabase.from('categories').select('*').order('display_order').then(({ data }) => setCategories(data || []))
  useEffect(() => { load() }, [])
  const openNew = () => { setForm({...emptyCat, display_order: categories.length}); setEditing('new') }
  const openEdit = (c: any) => { setForm(c); setEditing(c.id) }
  const cancel = () => { setEditing(null); setForm(emptyCat) }
  const save = async () => { if (!form.name) return alert('Nom obligatoire'); setSaving(true); let error; if (editing === 'new') ({ error } = await supabase.from('categories').insert(form)); else ({ error } = await supabase.from('categories').update(form).eq('id', editing)); setSaving(false); if (error) alert(error.message); else { alert('✅ Catégorie enregistrée !'); cancel(); load() } }
  const deleteCat = async (id: string) => { if (!confirm('Supprimer ?')) return; await supabase.from('categories').delete().eq('id', id); load() }
  const moveOrder = async (id: string, direction: 'up' | 'down') => { const idx = categories.findIndex(c => c.id === id); if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === categories.length - 1)) return; const swapIdx = direction === 'up' ? idx - 1 : idx + 1; const newCats = [...categories]; const tempOrder = newCats[idx].display_order; newCats[idx].display_order = newCats[swapIdx].display_order; newCats[swapIdx].display_order = tempOrder; await Promise.all([supabase.from('categories').update({ display_order: newCats[idx].display_order }).eq('id', newCats[idx].id), supabase.from('categories').update({ display_order: newCats[swapIdx].display_order }).eq('id', newCats[swapIdx].id)]); load() }

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">{editing === 'new' ? 'Nouvelle Catégorie' : 'Modifier Catégorie'}</h1><button onClick={cancel} className="text-gray-500 text-sm">Annuler</button></div>
        <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom *</label><input className="w-full p-2.5 border rounded-lg text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label><textarea className="w-full p-2.5 border rounded-lg text-sm" rows={3} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL</label><input className="w-full p-2.5 border rounded-lg text-sm" placeholder="https://..." value={form.image_url || ''} onChange={e => setForm({...form, image_url: e.target.value})} /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ordre d'affichage</label><input type="number" className="w-full p-2.5 border rounded-lg text-sm" value={form.display_order} onChange={e => setForm({...form, display_order: Number(e.target.value)})} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} /> Active</label>
          <button onClick={save} disabled={saving} className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-70">{saving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} {saving ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold text-gray-900">Catégories</h1><button onClick={openNew} className="bg-purple-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 active:scale-95"><Plus size={18}/> Nouvelle</button></div>
      <div className="space-y-3">{categories.map((c, i) => (<div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border flex gap-3 items-center"><div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">{c.image_url ? <img src={c.image_url} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20}/></div>}</div><div className="flex-1 min-w-0"><h3 className="font-semibold text-sm truncate">{c.name}</h3><p className="text-xs text-gray-500 truncate">{c.description || 'Pas de description'}</p><span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></div><div className="flex flex-col gap-1"><button onClick={() => moveOrder(c.id, 'up')} disabled={i===0} className="p-1 text-gray-400 hover:text-purple-600 disabled:opacity-30"><ArrowUp size={14}/></button><button onClick={() => moveOrder(c.id, 'down')} disabled={i===categories.length-1} className="p-1 text-gray-400 hover:text-purple-600 disabled:opacity-30"><ArrowDown size={14}/></button></div><div className="flex gap-1 ml-2"><button onClick={() => openEdit(c)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Edit3 size={16}/></button><button onClick={() => deleteCat(c.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button></div></div>))}{categories.length === 0 && <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed">Aucune catégorie.</div>}</div>
    </div>
  )
                                                                                                                                  }
