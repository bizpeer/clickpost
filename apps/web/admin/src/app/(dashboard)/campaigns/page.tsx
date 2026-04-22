'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  FileText, 
  Settings, 
  Users,
  Target,
  Edit3
} from 'lucide-react';

const campaigns = [
  { 
    id: '1', 
    name: '여름 시즌 글로벌 다이어트 챌린지', 
    advertiser: 'NutriGlobal Inc.', 
    budget: '$50,000', 
    spent: '$42,500', 
    spentPercent: 85,
    status: 'ACTIVE',
    platform: 'TIKTOK',
    scripts: 124,
    targets: 'KR, VN, US'
  },
  { 
    id: '2', 
    name: '신형 전기차 "Volt-X" 런칭 캠페인', 
    advertiser: 'NextAuto', 
    budget: '$120,000', 
    spent: '$24,000', 
    spentPercent: 20,
    status: 'ACTIVE',
    platform: 'YOUTUBE',
    scripts: 85,
    targets: 'DE, US, CN'
  },
  { 
    id: '3', 
    name: '글로벌 게이밍 키보드 바이럴', 
    advertiser: 'Logitech G', 
    budget: '$15,000', 
    spent: '$14,800', 
    spentPercent: 98,
    status: 'ENDING SOON',
    platform: 'INSTA',
    scripts: 210,
    targets: 'Global'
  }
];

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Campaign & AI Orchestration</h1>
          <p className="text-slate-500 font-medium text-sm">광고 캠페인 및 AI 스크립트 생성 환경을 제어합니다.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-[0_10px_20px_rgba(79,70,229,0.2)] hover:bg-indigo-700 hover:shadow-none transition-all">
          <Plus className="w-5 h-5" />
          신규 캠페인 생성
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex-1 flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
          <input 
            type="text" 
            placeholder="캠페인명 또는 광고주 검색..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
          <Filter className="w-4 h-4" />
          상세 필터
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-50 bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">캠페인 정보</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">예산 소진 현황</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">AI 스크립트</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">타겟 설정</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase text-xs">{campaign.advertiser}</span>
                    <span className="text-sm font-medium text-slate-600 line-clamp-1">{campaign.name}</span>
                    <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                      campaign.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="w-48 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      <span>{campaign.spent}</span>
                      <span>Total {campaign.budget}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          campaign.spentPercent > 80 ? 'bg-rose-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${campaign.spentPercent}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-slate-600">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold">{campaign.scripts} <span className="font-medium text-slate-400">Gen</span></span>
                    <button className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600">{campaign.targets}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all shadow-none hover:shadow-sm">
                      <Settings className="w-4 h-4 text-slate-500" />
                    </button>
                    <button className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all shadow-none hover:shadow-sm">
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
