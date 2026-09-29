import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";

export default function BookCard({ book }) {
  return <div className="card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
    <div className="aspect-[4/3] bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-6 text-white">
      {book.cover_image_url ? <img src={book.cover_image_url} alt="" className="h-full w-full rounded-lg object-cover"/> : <div className="flex h-full flex-col justify-between"><BookOpen size={30}/><div><div className="text-xs uppercase tracking-widest text-teal-300">{book.category}</div><div className="mt-1 text-lg font-bold">{book.title}</div></div></div>}
    </div>
    <div className="p-5"><div className="text-xs font-semibold uppercase tracking-wider text-teal-600">{book.category}</div><h3 className="mt-1 line-clamp-1 font-bold text-slate-900">{book.title}</h3><p className="mt-1 text-sm text-slate-500">{book.author}</p><div className="mt-4 flex items-center justify-between"><span className={`text-xs font-semibold ${book.available_copies > 0 ? "text-emerald-600" : "text-rose-600"}`}>{book.available_copies > 0 ? `${book.available_copies} available` : "Unavailable"}</span><Link to={`/books/${book.id}`} className="text-sm font-semibold text-slate-700 hover:text-teal-700">View <ArrowRight className="inline" size={15}/></Link></div></div>
  </div>
}
