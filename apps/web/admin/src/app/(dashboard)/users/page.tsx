'use client';

import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  RefreshCw, 
  Eye, 
  MapPin, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  Hash
} from 'lucide-react';

const users = [
  { 
    id: '1', 
    name: '김서연', 
    age: '24', 
    country: 'KR', 
    followers: '12,400', 
    isPro: true,
    seedId: '7284910283',
    status: 'ACTIVE',
    lastLocation: 'Seoul, KR',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60'
  },
  { 
    id: '2', 
    name: 'Michael Chen', 
    age: '28', 
    country: 'US', 
    followers: '500', 
    isPro: false,
    seedId: '1102938475',
    status: 'PENDING',
    lastLocation: 'CA, US',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60'
  }
];

export default function UsersPage() {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Persona Studio & Members</h2>
          <p className="text-slate-500 font-medium text-sm">회원별 고정 AI 아바타와 영향력을 관리합니다.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">전체 활성 회원</p>
            <p className="text-2xl font-black text-slate-800">42,850 <span className="text-xs font-bold text-emerald-500 ml-1">+12%</span></p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">인증된 프로 인플루언서</p>
            <p className="text-2xl font-black text-slate-800">1,240 <span className="text-xs font-bold text-amber-500 ml-1">Pending 12</span></p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-rose-50 rounded-xl">
            <Hash className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">아바타 생성 성공률</p>
            <p className="text-2xl font-black text-slate-800">99.8% <span className="text-xs font-bold text-rose-500 ml-1">2 Errors</span></p>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="회원 이름, Seed ID, 또는 위치 검색..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium"
              />
            </div>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              필터
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-50">
          {users.map((user) => (
            <div key={user.id} className="bg-white p-6 hover:bg-slate-50/50 transition-all group">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md" />
                  {user.isPro && (
                    <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 fill-indigo-50" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">{user.name}</h3>
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-black text-slate-500 uppercase">
                      ID: {user.id}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                    <span>{user.age} yrs</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>{user.country}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-indigo-600">{user.followers} Followers</span>
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                      <Hash className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600">Seed: {user.seedId}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600">{user.lastLocation}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-indigo-100">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all border border-transparent hover:border-emerald-100">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* NanoBanana Asset Grid Preview (Small) */}
              <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="shrink-0 w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all cursor-zoom-in">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Asset {i}</span>
                  </div>
                ))}
                <button className="shrink-0 w-12 h-12 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all">
                  <Plus className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
