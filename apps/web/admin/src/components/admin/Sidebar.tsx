'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Video, 
  Users, 
  ShieldCheck, 
  Wallet, 
  Settings, 
  Activity,
  LogOut,
  ChevronRight,
  Fingerprint
} from 'lucide-react';

const menuItems = [
  { name: '대시보드', href: '/', icon: LayoutDashboard },
  { name: '캠페인 관리', href: '/campaigns', icon: Video },
  { name: '회원/아바타 관리', href: '/users', icon: Users },
  { name: 'Seed ID 시뮬레이션', href: '/seeds', icon: Fingerprint },
  { name: '콘텐츠 검증', href: '/verification', icon: ShieldCheck },
  { name: '정산 관리', href: '/finance', icon: Wallet },
  { name: '시스템 설정', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 h-screen bg-slate-950 border-r border-slate-800 text-slate-300">
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Activity className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">ClickPost <span className="text-indigo-400 text-sm">Admin</span></span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-[0_0_20px_rgba(79,70,229,0.1)]' 
                  : 'hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                <span className="font-medium">{item.name}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-900">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors group">
          <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400" />
          <span className="font-medium">로그아웃</span>
        </button>
      </div>
    </div>
  );
}
