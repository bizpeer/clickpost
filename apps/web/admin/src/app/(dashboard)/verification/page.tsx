'use client';

import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  Search, 
  Filter,
  Activity,
  History,
  FileSearch, XCircle
} from 'lucide-react';

const verificationLogs = [
  { 
    id: 'L-8291',
    user: '김서연',
    campaign: '여름 시즌 다이어트',
    platform: 'TIKTOK',
    status: 'VERIFIED',
    dayStatus: 'Day 24/45',
    timestamp: '15 mins ago',
    message: 'Post is accessible and keywords detected.'
  },
  { 
    id: 'L-8290',
    user: 'Michael Chen',
    campaign: 'Volt-X Launch',
    platform: 'YOUTUBE',
    status: 'FLAGGED',
    dayStatus: 'Day 12/45',
    timestamp: '1 hour ago',
    message: 'Potential private video detected. Retrying in 1h.'
  },
  { 
    id: 'L-8289',
    user: 'Park Ji-hun',
    campaign: 'Logitech G Viral',
    platform: 'INSTA',
    status: 'DELETED',
    dayStatus: 'FAILED (Day 42)',
    timestamp: '3 hours ago',
    message: 'Post deleted by user before 45-day retention.'
  }
];

export default function VerificationPage() {
  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Content Verification Desk</h2>
        <p className="text-slate-500 font-medium text-sm">45일 유지 로직 및 콘텐츠 무결성을 실시간으로 확인합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <History className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">최근 검증 로그 (Real-time)</h3>
            </div>
          </div>

          <div className="space-y-4">
            {verificationLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-md transition-all">
                <div className={`p-2 rounded-lg ${
                  log.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-600' : 
                  log.status === 'FLAGGED' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                }`}>
                  {log.status === 'VERIFIED' ? <CheckCircle className="w-5 h-5" /> : 
                   log.status === 'FLAGGED' ? <AlertTriangle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">{log.user} <span className="font-medium text-slate-400 mx-2">•</span> {log.campaign}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{log.message}</p>
                </div>

                <div className="text-right">
                  <p className={`text-xs font-black uppercase tracking-tighter ${
                    log.status === 'VERIFIED' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>{log.dayStatus}</p>
                  <button className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:underline mt-1">
                    view post <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              미션 성공률 통계
            </h3>
            <div className="relative h-32 w-32 mx-auto">
              {/* Simple Chart Placeholder */}
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="364.4" strokeDashoffset="40" className="text-indigo-600" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 tracking-tight">88%</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">Retention Rate</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <FileSearch className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">자동 추적 시스템 상태</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Scraper Node #1</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Keyword Validator</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Retry Queue</span>
                <span className="text-[10px] font-bold text-amber-400 uppercase">12 Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
