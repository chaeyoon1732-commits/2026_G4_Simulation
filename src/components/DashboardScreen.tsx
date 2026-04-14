import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, TrendingUp, Award, Calendar, ChevronRight, 
  BarChart, LineChart
} from 'lucide-react';
import { LineChart as ReLineChart, Line as ReLine, XAxis as ReXAxis, YAxis as ReYAxis, CartesianGrid as ReCartesianGrid, Tooltip as ReTooltip, ResponsiveContainer as ReResponsiveContainer } from 'recharts';
import { getSimulationHistory } from '../firebase';
import { auth } from '../firebase';

interface Props {
  onBack: () => void;
}

export default function DashboardScreen({ onBack }: Props) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (auth.currentUser) {
        const data = await getSimulationHistory(auth.currentUser.uid);
        setHistory(data);
      }
      setLoading(false);
    }
    loadHistory();
  }, []);

  const stats = {
    total: history.length,
    avgScore: history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + (curr.score || 0), 0) / history.length) : 0,
    bestGrade: history.length > 0 ? [...new Set(history.map(h => h.grade))].sort()[0] : '-',
    recentTrend: history.slice(0, 5).reverse().map((h, i) => ({
      name: `T${i + 1}`,
      score: h.score
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-hyundai-blue dark:text-hyundai-light-blue" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-hyundai-blue dark:text-white mb-2">마이 대시보드 📊</h1>
              <p className="text-slate-500 dark:text-slate-400">지금까지 진행한 시뮬레이션 결과와 성장 추이를 확인하세요.</p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hyundai-blue mx-auto mb-4"></div>
            <p className="text-slate-500">데이터를 분석 중입니다...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl">
            <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">아직 완료된 시뮬레이션이 없습니다.</h2>
            <p className="text-slate-500 mb-8">첫 번째 시뮬레이션을 시작하고 당신의 리더십을 진단해 보세요!</p>
            <button onClick={onBack} className="hyundai-btn-primary rounded-sm">시작하기</button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-2xl border-b-4 border-hyundai-blue">
                <div className="flex items-center gap-3 text-slate-500 mb-4">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-wider">총 시뮬레이션</span>
                </div>
                <div className="text-4xl font-black text-hyundai-blue dark:text-white">{stats.total}<span className="text-lg ml-1">회</span></div>
              </div>
              <div className="glass-card p-6 rounded-2xl border-b-4 border-emerald-500">
                <div className="flex items-center gap-3 text-slate-500 mb-4">
                  <Award className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-wider">평균 종합 점수</span>
                </div>
                <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{stats.avgScore}<span className="text-lg ml-1">점</span></div>
              </div>
              <div className="glass-card p-6 rounded-2xl border-b-4 border-amber-500">
                <div className="flex items-center gap-3 text-slate-500 mb-4">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-wider">최고 등급</span>
                </div>
                <div className="text-4xl font-black text-amber-600 dark:text-amber-400">{stats.bestGrade}<span className="text-lg ml-1">Grade</span></div>
              </div>
            </div>

            {/* Trend Chart */}
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-hyundai-blue" /> 최근 성과 변화 추이
              </h3>
              <div className="h-80 w-full">
                <ReResponsiveContainer width="100%" height="100%" debounce={50}>
                  <ReLineChart data={stats.recentTrend}>
                    <ReCartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <ReXAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <ReYAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                    <ReTooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#002C5F', fontWeight: 'bold' }}
                    />
                    <ReLine 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#002C5F" 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: '#002C5F', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8, fill: '#0072C6' }}
                      animationDuration={1500}
                    />
                  </ReLineChart>
                </ReResponsiveContainer>
              </div>
            </div>

            {/* History List */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">시뮬레이션 히스토리</h3>
                <span className="text-xs text-slate-400">최근순</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((item, idx) => (
                  <div key={item.id || idx} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-inner ${
                        item.grade === 'S' ? 'bg-amber-100 text-amber-600' :
                        item.grade === 'A' ? 'bg-emerald-100 text-emerald-600' :
                        item.grade === 'B' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.grade}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white mb-1">{item.scenarioId}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{new Date(item.timestamp?.toDate ? item.timestamp.toDate() : item.timestamp).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{item.personaId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-800 dark:text-white">{item.score}점</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">종합 점수</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
