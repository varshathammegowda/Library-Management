export default function StatCard({ icon: Icon, label, value }) {
  return <div className="card p-5"><div className="flex items-start justify-between"><div><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-bold text-slate-900">{value}</div></div><div className="rounded-xl bg-teal-50 p-3 text-teal-700"><Icon size={20}/></div></div></div>
}
