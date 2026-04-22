'use client';

import React from 'react';
import { 
  Search, 
  Bell, 
  User,
  Settings,
  Shield
} from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-xl w-96 group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
        <input 
          type="text" 
          placeholder="데이터, 회원, 캠페인 검색..." 
          className="bg-transparent border-none outline-none text-sm w-full text-slate-600 placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 animate-pulse">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Cost Defense Active</span>
        </div>

        <button className="relative p-2 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2" />

        <button className="flex items-center gap-3 pl-3 pr-4 py-1.5 hover:bg-slate-50 rounded-xl transition-all group">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden group-hover:border-indigo-200 transition-all">
            <User className="text-slate-400 w-5 h-5 group-hover:text-indigo-500" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-slate-700 leading-tight">Admin Master</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">System Controller</span>
          </div>
        </button>
      </div>
    </header>
  );
}
