import { Link, NavLink, Outlet } from "react-router-dom";
import { BarChart3, BookOpen, FileText, GraduationCap, LibraryBig, LogOut, Menu, RotateCcw, ShieldCheck, Users, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { signOut, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = [
    ["/admin", "Dashboard", BarChart3],
    ["/admin/books", "Books", BookOpen],
    ["/admin/borrow-requests", "Borrow Requests", FileText],
    ["/admin/issued-books", "Issued Books", ShieldCheck],
    ["/admin/returned-books", "Returned Books", RotateCcw],
    ["/admin/students", "Students", Users],
    ["/admin/digital-resources", "Digital Resources", LibraryBig],
  ];
  return <div className="min-h-screen bg-slate-100">
    <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-slate-950 text-white transition lg:translate-x-0`}>
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <Link to="/admin" className="flex items-center gap-3 font-bold"><ShieldCheck/> Librarian Console</Link>
        <button className="lg:hidden" onClick={() => setOpen(false)}><X/></button>
      </div>
      <div className="p-4">
        <div className="mb-5 rounded-xl bg-white/5 p-3 text-xs text-slate-300"><div className="font-semibold text-white">{profile?.full_name || "Administrator"}</div><div className="mt-1 truncate">{profile?.email}</div></div>
        <nav className="space-y-1">{nav.map(([to,label,Icon]) => <NavLink key={to} end={to === "/admin"} to={to} onClick={() => setOpen(false)} className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? "bg-teal-500 text-slate-950" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}><Icon size={18}/>{label}</NavLink>)}</nav>
      </div>
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4"><button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5"><LogOut size={18}/>Logout</button></div>
    </aside>
    <div className="lg:pl-72">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
        <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)}><Menu/></button>
        <div className="ml-auto flex items-center gap-2 text-sm text-slate-500"><GraduationCap size={18}/> Admin / Librarian</div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8"><Outlet/></main>
    </div>
  </div>
}
