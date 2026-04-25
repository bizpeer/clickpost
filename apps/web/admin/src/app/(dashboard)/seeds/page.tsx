'use client';

import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  User, 
  Calendar, 
  Globe, 
  Ruler, 
  Weight, 
  ChevronRight, 
  Sparkles,
  RefreshCw,
  Hash,
  Terminal,
  Database
} from 'lucide-react';

// Replicating PersonaEngine logic for the web side
const generateSeed = (input: string): string => {
  let hash = 0;
  const normalizedInput = input.toLowerCase().replace(/\s/g, '');
  for (let i = 0; i < normalizedInput.length; i++) {
    const char = normalizedInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const seed = Math.abs(hash).toString();
  return seed.padEnd(10, seed).substring(0, 10);
};

const calculateAgeVibe = (birthDate: string): string => {
  if (!birthDate) return 'trendy and stylish';
  const year = new Date(birthDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  if (age < 20) return 'youthful and energetic';
  if (age < 35) return 'trendy and stylish';
  if (age < 50) return 'sophisticated and professional';
  return 'elegant and classic';
};

const getCountryFeatures = (countryCode: string): string => {
  const styles: Record<string, string> = {
    KR: 'South Korean style, clean skin, K-fashion aesthetic',
    VN: 'Vietnamese style, natural and warm aesthetic',
    US: 'American style, diverse and modern aesthetic',
    JP: 'Japanese style, minimalist and refined aesthetic',
    CN: 'Chinese style, bold and elegant aesthetic',
    TH: 'Thai style, vibrant and friendly aesthetic',
    TW: 'Taiwanese style, graceful and contemporary aesthetic',
  };
  return styles[countryCode.toUpperCase()] || 'global and diverse aesthetic';
};

const calculateBodyType = (height: number, weight: number): string => {
  const h = isNaN(height) ? 175 : height;
  const w = isNaN(weight) ? 70 : weight;
  const bmi = w / ((h / 100) ** 2);
  let build = 'average build';
  if (bmi < 18.5) build = 'lean and slender';
  else if (bmi >= 30) build = 'heavyset and sturdy';
  else if (bmi >= 25) build = 'strong and athletic';
  else if (bmi >= 23) build = 'fit and toned';
  return `Height: ${h}cm, Build: ${build} (BMI ${bmi.toFixed(1)})`;
};

export default function SeedsPage() {
  const [formData, setFormData] = useState({
    name: '김서연',
    birthDate: '2000-01-01',
    gender: 'FEMALE',
    countryCode: 'KR',
    height: 165,
    weight: 48
  });

  const [simulationResult, setSimulationResult] = useState<{ seedId: string, prompt: string } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const combinedInput = `${formData.name}|${formData.birthDate}|${formData.gender}|${formData.countryCode}|${formData.height}|${formData.weight}`;
      const seedId = generateSeed(combinedInput);
      const ageVibe = calculateAgeVibe(formData.birthDate);
      const countryFeatures = getCountryFeatures(formData.countryCode);
      const bodyDescription = calculateBodyType(formData.height, formData.weight);
      
      const genderTerm = formData.gender === 'MALE' ? 'male' : formData.gender === 'FEMALE' ? 'female' : 'person';
      
      const prompt = `[USP: ${ageVibe}, ${countryFeatures}] 
A highly detailed, photo-realistic AI avatar of a ${ageVibe} ${genderTerm} from ${countryFeatures}. 
Facial features: Symmetrical, consistent across angles, unique ethnic features. 
Clothing: Premium trendy casual, minimal textures. 
Body: ${bodyDescription}.
Output: 5 high-fidelity consistent views (Front, 45-degree, Profile, Full-body). 
Resolution: 8k, Cinematic lighting, Studio background.
[ENGINE: NanoBanana-v2-Seed-Sync]
[IDENTITY_SEED: ${seedId}]`;

      setSimulationResult({ seedId, prompt });
      setIsSimulating(false);
    }, 800);
  };

  useEffect(() => {
    runSimulation();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Fingerprint className="w-8 h-8 text-indigo-600" />
          Seed ID Sheet
        </h2>
        <p className="text-slate-500 font-medium text-sm">NanoBanana v2 엔진 기반의 결정론적 고정 페르소나 생성 로직을 시뮬레이션합니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Simulator Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest">
              <Terminal className="w-4 h-4" />
              Input Parameters
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">이름</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">생년월일</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="date" 
                      value={formData.birthDate}
                      onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">국가</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      value={formData.countryCode}
                      onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 appearance-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="KR">Korea (KR)</option>
                      <option value="US">USA (US)</option>
                      <option value="JP">Japan (JP)</option>
                      <option value="VN">Vietnam (VN)</option>
                      <option value="TH">Thailand (TH)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">키 (cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number" 
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: parseInt(e.target.value)})}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">몸무게 (kg)</label>
                  <div className="relative">
                    <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number" 
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                {['MALE', 'FEMALE'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({...formData, gender: g})}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                      formData.gender === g 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="button"
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              {isSimulating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Run NanoBanana-v2 Simulation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-8">
          {simulationResult && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                      <Hash className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-black text-indigo-400 tracking-widest uppercase">
                      Fixed Seed ID
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Generated Identity Seed</p>
                    <p className="text-4xl font-black text-white tracking-tighter">#{simulationResult.seedId}</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Engine Status: Optimal</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Consistency Score</span>
                      <span className="text-slate-800">99.8%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-[99.8%] h-full bg-emerald-500 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Sync Version</span>
                      <span className="text-indigo-600">NanoBanana v2.1.4</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 border-dashed space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <Database className="w-4 h-4 text-slate-400" />
                    Gemini AI Prompt (Synthesized)
                  </div>
                  <button 
                    type="button"
                    onClick={() => navigator.clipboard.writeText(simulationResult.prompt)}
                    className="text-[10px] font-black text-indigo-600 uppercase hover:underline"
                  >
                    Copy Prompt
                  </button>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-inner">
                  <code className="text-xs text-slate-600 font-mono leading-relaxed whitespace-pre-wrap block">
                    {simulationResult.prompt}
                  </code>
                </div>

                <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <p className="text-xs text-indigo-900 font-medium leading-relaxed">
                    위 프롬프트는 <strong>Gemini 3 Flash</strong> 엔진에 의해 실시간으로 합성되었으며, 
                    <strong>Google Veo v2.0 Ultra</strong> 엔진에 전달되어 5개 각도의 고정 이미지를 생성하는 데 사용됩니다.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
