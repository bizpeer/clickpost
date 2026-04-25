import React from 'react';
import KpiCard from '@/components/admin/KpiCard';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Video, 
  Zap, 
  Monitor,
  Map as MapIcon,
  ShieldAlert,
  Fingerprint,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-slate-500 font-medium text-sm">시스템의 핵심 지표 및 실시간 활동을 모니터링합니다.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="총 광고 집행 금액" 
          value="$128,450" 
          trend="12.5%" 
          isPositive={true} 
          icon={DollarSign} 
          color="bg-indigo-500"
        />
        <KpiCard 
          title="누적 플랫폼 수익" 
          value="$38,535" 
          trend="8.2%" 
          isPositive={true} 
          icon={Zap} 
          color="bg-amber-500"
        />
        <KpiCard 
          title="활성 캠페인" 
          value="142" 
          trend="4.3%" 
          isPositive={true} 
          icon={Video} 
          color="bg-emerald-500"
        />
        <KpiCard 
          title="신규 가입자 (24h)" 
          value="1,204" 
          trend="2.4%" 
          isPositive={false} 
          icon={Users} 
          color="bg-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LBS Activity Map Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <MapIcon className="w-5 h-5 text-slate-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">LBS 기반 실시간 활동 지도</h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
              Live Updates
            </div>
          </div>
          <div className="flex-1 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.google.com/maps/about/images/home/home-map.jpg')] bg-cover opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative text-center">
              <p className="text-slate-400 font-medium mb-2">지도 라이브러리 연결 대기 중</p>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
                Google Maps API 세팅하기
              </button>
            </div>
          </div>
        </div>

        {/* API Cost Tracker */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Monitor className="w-5 h-5 text-slate-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">API 비용 트래커</h2>
          </div>
          
          <div className="space-y-6">
            {[
              { name: 'Gemini 1.5 Flash', usage: 78, cost: '$420.5', color: 'bg-indigo-500' },
              { name: 'NanoBanana Engine', usage: 45, cost: '$210.2', color: 'bg-amber-500' },
              { name: 'Google Veo (Video)', usage: 92, cost: '$1,240.8', color: 'bg-rose-500' },
            ].map((api) => (
              <div key={api.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-semibold text-slate-700">{api.name}</span>
                  <span className="text-xs font-bold text-slate-500">{api.cost} <span className="font-medium text-slate-400">/ mo</span></span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${api.color} rounded-full transition-all duration-1000`} 
                    style={{ width: `${api.usage}%` }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-slate-400">{api.usage}% Quota used</span>
                </div>
              </div>
            ))}

            <div className="mt-8 p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-rose-700 mb-1">Cost Defense Warning</p>
                <p className="text-[10px] text-rose-600 leading-relaxed font-medium">
                  Veo 자원이 90% 이상 소진되었습니다. 95% 도달 시 자동으로 미션 생성이 중단됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Tools & Management Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/seeds" className="group">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col h-full hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Fingerprint className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Seed ID 시뮬레이션</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              NanoBanana v2 엔진을 사용하여 유저의 개인정보로부터 고유한 페르소나 ID를 생성하고 비디오 프롬프트를 미리 확인합니다.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2">
              <div className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded uppercase tracking-wider">
                Stable Engine v2.0
              </div>
              <div className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-wider">
                Deterministic
              </div>
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col h-full opacity-60 cursor-not-allowed border-l-4 border-l-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-50 rounded-xl">
              <Sparkles className="w-6 h-6 text-slate-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-400 mb-2">AI 아바타 렌더링 팜</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            대규모 영상 제작 및 아바타 합성 리소스를 관리합니다. (준비 중)
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 flex flex-col h-full text-white shadow-lg shadow-indigo-200">
          <h3 className="text-xl font-bold mb-2">글로벌 서비스 상태</h3>
          <div className="flex-1 space-y-4 mt-4">
            {[
              { region: 'East Asia', status: 'Optimal', delay: '42ms' },
              { region: 'North America', status: 'Stable', delay: '128ms' },
              { region: 'Europe', status: 'Operational', delay: '165ms' },
            ].map((reg) => (
              <div key={reg.region} className="flex justify-between items-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <span className="text-sm font-bold">{reg.region}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-white/70">{reg.delay}</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
