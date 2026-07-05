import { createClient } from '@/lib/supabase'
import { ShoppingCart, Package, Users, TrendingUp, AlertTriangle, DollarSign, Eye } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = createClient()
  const [ordersRes, pendingRes, deliveredRes, productsRes, usersRes, outOfStockRes, revenueRes, topSoldRes, topViewedRes] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock_quantity', 0),
    supabase.from('orders').select('total_amount').eq('payment_status', 'paid'),
    supabase.rpc('get_top_sold_products', { limit_count: 5 }),
    supabase.from('product_views').select('product_id, products(name)').order('viewed_at', { ascending: false }).limit(5)
  ])
  const totalRevenue = revenueRes.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0
  const stats = [
    { label: 'Commandes', value: ordersRes.count || 0, icon: ShoppingCart, color: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-600' },
    { label: 'En Attente', value: pendingRes.count || 0, icon: TrendingUp, color: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-600' },
    { label: 'Livrées', value: deliveredRes.count || 0, icon: Package, color: 'border-green-500', bg: 'bg-green-50', text: 'text-green-600' },
    { label: 'Rupture Stock', value: outOfStockRes.count || 0, icon: AlertTriangle, color: 'border-red-500', bg: 'bg-red-50', text: 'text-red-600' },
    { label: 'Produits', value: productsRes.count || 0, icon: Package, color: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Clients', value: usersRes.count || 0, icon: Users, color: 'border-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-600' },
    { label: 'Revenus', value: `${totalRevenue.toLocaleString()} F`, icon: DollarSign, color: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  ]
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{stats.map(s => (<div key={s.label} className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${s.color}`}><div className={`${s.bg} ${s.text} p-2 rounded-lg inline-block mb-3`}><s.icon size={20} /></div><div className="text-2xl font-extrabold text-gray-900">{s.value}</div><div className="text-xs text-gray-500 font-medium mt-1">{s.label}</div></div>))}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border"><h2 className="text-lg font-bold mb-4 flex items-center gap-2"><ShoppingCart size={18} className="text-purple-600"/> Top Vendus</h2>{topSoldRes.data && topSoldRes.data.length > 0 ? (<div className="space-y-2">{topSoldRes.data.map((item: any, i: number) => (<div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="font-medium text-sm">{i+1}. {item.name}</span><span className="font-bold text-purple-600 text-sm">{item.total_sold} ventes</span></div>))}</div>) : <p className="text-gray-400 text-sm">Aucune donnée</p>}</div>
        <div className="bg-white p-6 rounded-xl shadow-sm border"><h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Eye size={18} className="text-blue-600"/> Top Consultés</h2>{topViewedRes.data && topViewedRes.data.length > 0 ? (<div className="space-y-2">{topViewedRes.data.map((item: any, i: number) => (<div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="font-medium text-sm">{i+1}. {item.products?.name || 'Supprimé'}</span></div>))}</div>) : <p className="text-gray-400 text-sm">Aucune donnée</p>}</div>
      </div>
    </div>
  )
}
