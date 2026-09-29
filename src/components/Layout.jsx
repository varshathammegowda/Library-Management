import { Link, NavLink, Outlet } from "react-router-dom";
import { BookOpen, Home, LibraryBig, LogOut, Menu, ShieldCheck, UserCircle, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = [
    ["/", "Home", Home],
    ["/books", "Books", BookOpen],
    ["/digital-resources", "Digital Resources", LibraryBig],
    ["/my-books", "My Books", BookOpen],
    ["/profile", "Profile", UserCircle],
  ];
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white"><BookOpen size={20}/></div>
            <div><div className="font-bold text-slate-900">Library Portal</div><div className="text-[11px] text-slate-500">College Digital Library</div></div>
          </Link>
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
          <nav className={`${open ? "absolute left-0 right-0 top-full flex" : "hidden"} flex-col gap-1 border-b border-slate-200 bg-white p-4 lg:static lg:flex lg:flex-row lg:border-0 lg:bg-transparent lg:p-0`}>
            {nav.map(([to, label, Icon]) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({isActive}) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100"}`}><Icon size={17}/>{label}</NavLink>)}
            {isAdmin && <NavLink to="/admin" className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"><ShieldCheck size={17}/>Admin</NavLink>}
            <button onClick={signOut} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"><LogOut size={17}/>Logout</button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8"><Outlet /></main>
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">College Library & Digital Resource Management System</footer>
    </div>
  );
}
