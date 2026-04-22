'use client';

import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  RefreshCcw, 
  ShieldAlert, 
  Settings2,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

const payoutRequests = [
  { id: 'P-102', user: '김서연', amount: '₩125,000', method: 'Naver Pay', status: 'PENDING', date: '2 hours ago' },
  { id: 'P-101', user: 'Michael Chen', amount: '$450.00', method: 'Grab Pay', status: 'APPROVED', date: '5 hours ago' },
];

export default function FinancePage() {
  const [costDefenseEnabled, setCostDefenseEnabled] = useState(true);

  return (
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Finance & Cost Defense</h2>
        <p className="text-slate-500 font-medium text-sm">정산 시스템 관리 및 AI 생성 비용 방어 전략을 설정합니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payout Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">출금 신청 승인 대기열</h3>
              </div>
              <button className="text-xs font-bold text-indigo-600 hover:underline">전체 보기</button>
            </div>
            
            <div className="divide-y divide-slate-50">
              {payoutRequests.map((req) => (
                <div key={req.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                      {req.user[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{req.user}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{req.method} • {req.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-800">{req.amount}</p>
                      <span className={`text-[10px] font-bold uppercase ${req.status === 'PENDING' ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {req.status}
                      </span>
                    </div>
                    
                    {req.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all border border-transparent hover:border-emerald-100">
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-all border border-transparent hover:border-rose-100">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4 text-slate-400" />
                  실시간 글로벌 환율
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Updated 2m ago</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs font-bold text-slate-600">USD / KRW</span>
                  <span className="text-sm font-black text-slate-800">1,342.50</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs font-bold text-slate-600">USD / VND</span>
                  <span className="text-sm font-black text-slate-800">24,530.0</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  플랫폼 누적 수익
                </h3>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">$38,534.20</p>
              <div className="mt-4 flex items-center gap-1.5 text-emerald-500">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs font-bold">+15.4% <span className="text-slate-400 font-medium ml-1">this week</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Defense Panel */}
        <div className="space-y-6">
          <div className={`p-1 rounded-[2.5rem] transition-all duration-500 ${
            costDefenseEnabled ? 'bg-gradient-to-br from-rose-500 to-amber-500 p-1 shadow-2xl shadow-rose-200' : 'bg-slate-200'
          }`}>
            <div className="bg-white rounded-[2.25rem] p-8 h-full">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className={`p-5 rounded-3xl transition-all duration-500 ${
                  costDefenseEnabled ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-400'
                }`}>
                  <ShieldAlert className="w-12 h-12" />
                </div>
                
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Cost Defense Mode</h3>
                  <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed px-4">
                    예산의 95% 도달 시 모든 유료 API(Veo, Gemini) 기반의 신규 미션 생성을 자동으로 차단합니다.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold uppercase tracking-widest ${!costDefenseEnabled ? 'text-slate-600' : 'text-slate-300'}`}>OFF</span>
                  <button 
                    onClick={() => setCostDefenseEnabled(!costDefenseEnabled)}
                    className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                      costDefenseEnabled ? 'bg-rose-500' : 'bg-slate-200'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm ${
                      costDefenseEnabled ? 'left-9' : 'left-1'
                    }`} />
                  </button>
                  <span className={`text-xs font-bold uppercase tracking-widest ${costDefenseEnabled ? 'text-rose-600' : 'text-slate-300'}`}>ON</span>
                </div>

                {costDefenseEnabled && (
                  <div className="w-full pt-4 space-y-4">
                    <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-rose-600 uppercase">Auto-Stop Threshold</span>
                        <span className="text-xs font-black text-rose-700">95%</span>
                      </div>
                      <div className="h-1.5 bg-rose-200 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 w-[95%]" />
                      </div>
                    </div>
                    <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
                      <Settings2 className="w-4 h-4" />
                      상세 정책 설정
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs font-bold text-slate-600 tracking-tight uppercase">Emergency Policy</h4>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              시스템 관리자는 비용 방어 모드가 활성화된 상태에서도 강제로 단일 영상을 생성할 수 있는 권한을 가집니다. (테스트 목적)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
