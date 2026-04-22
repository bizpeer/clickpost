import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: LucideIcon;
  color: string;
}

export default function KpiCard({ title, value, trend, isPositive, icon: Icon, color }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? '+' : ''}{trend}
          <span className="text-[10px] font-medium text-slate-400 ml-1 underline decoration-slate-200">vs last month</span>
        </div>
      </div>
      
      <div className="flex flex-col">
        <span className="text-slate-500 text-sm font-medium mb-1">{title}</span>
        <span className="text-3xl font-bold text-slate-800 tracking-tight">{value}</span>
      </div>
    </div>
  );
}
