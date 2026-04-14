import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Target, MessageSquare, ShieldCheck, TrendingUp, 
  AlertCircle, Lightbulb, CheckCircle2, RefreshCcw, Download,
  BarChart3, Brain, UserCheck, Zap, ShieldAlert
} from 'lucide-react';
import { ChatMessage, generateReportAnalysis } from '../geminiService';
import { Persona, Scenario } from '../constants';
import { saveSimulationResult, auth } from '../firebase';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';

interface Props {
  history: ChatMessage[];
  persona: Persona;
  scenario: Scenario;
  onRestart: () => void;
  isDemoMode?: boolean;
  onSaveDemoResult?: (result: any) => void;
}

export default function ReportScreen({ history, persona, scenario, onRestart, isDemoMode, onSaveDemoResult }: Props) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getAnalysis() {
      const result = await generateReportAnalysis(history, persona, scenario);
      if (result) {
        // Calculate score
        const lastMetadata = history[history.length - 1]?.metadata;
        const goalsAchievedCount = lastMetadata?.goalsAchieved?.length || 0;
        const goalScore = (goalsAchievedCount / scenario.goals.length) * 100;
        const aiScore = result.quantitative.speechRatio > 30 && result.quantitative.speechRatio < 70 ? 90 : 70; 
        
        const finalScore = Math.round((goalScore * 0.5) + (aiScore * 0.5));
        let grade = 'B';
        if (finalScore >= 95) grade = 'S';
        else if (finalScore >= 85) grade = 'A';
        else if (finalScore >= 70) grade = 'B';
        else if (finalScore >= 50) grade = 'C';
        else grade = 'D';

        const finalAnalysis = { ...result, finalScore, grade };
        setAnalysis(finalAnalysis);

        // Save Result
        const resultToSave = {
          userId: isDemoMode ? 'demo-user-id' : (auth.currentUser?.email || auth.currentUser?.uid),
          userName: isDemoMode ? '데모 사용자' : (auth.currentUser?.displayName || '사용자'),
          personaId: persona.id,
          personaName: persona.name,
          scenarioId: scenario.id,
          scenarioTitle: scenario.title,
          score: finalScore,
          grade,
          metrics: lastMetadata,
          analysis: result,
          history: history.map(h => ({ role: h.role, content: h.content })),
          timestamp: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }
        };

        if (isDemoMode && onSaveDemoResult) {
          onSaveDemoResult(resultToSave);
        } else if (!isDemoMode && auth.currentUser) {
          saveSimulationResult(resultToSave);
        }
      }
      setLoading(false);
    }
    getAnalysis();
  }, [history, persona, scenario, isDemoMode]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <RefreshCcw className="w-12 h-12 text-hyundai-blue" />
        </motion.div>
        <h2 className="text-2xl font-bold text-hyundai-blue mb-2">AI 면담 분석 중... 🧠</h2>
        <p className="text-slate-500">대화 내용을 바탕으로 상세 리포트를 생성하고 있습니다.</p>
      </div>
    );
  }

  if (!analysis) return <div className="p-8 text-center">분석 결과를 불러오는 데 실패했습니다.</div>;

  const radarData = [
    { subject: '라포 형성', A: history[history.length-1]?.metadata?.rapport || 50, fullMark: 100 },
    { subject: '현상 파악', A: history[history.length-1]?.metadata?.situation || 50, fullMark: 100 },
    { subject: '해결책 도출', A: history[history.length-1]?.metadata?.solution || 50, fullMark: 100 },
    { subject: '몰입도', A: history[history.length-1]?.metadata?.engagement || 50, fullMark: 100 },
  ];

  const trendData = analysis.quantitative.safetyTrend.map((val: number, i: number) => ({
    name: `T${i+1}`,
    value: val
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-hyundai transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-hyundai-blue mb-2">면담 시뮬레이션 결과 리포트 📊</h1>
            <p className="text-slate-500">
              {persona.name} {persona.role} | {scenario.title}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white text-slate-600 px-4 py-2 rounded-sm border border-slate-200 hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4" /> PDF 저장
            </button>
            <button 
              onClick={onRestart}
              className="flex items-center gap-2 bg-hyundai-blue text-white px-6 py-2 rounded-sm hover:opacity-90 transition-all shadow-lg"
            >
              <RefreshCcw className="w-4 h-4" /> 다시 시작하기
            </button>
          </div>
        </div>

        {/* Top Section: Score & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Trophy className="w-12 h-12 text-hyundai-blue/10" />
            </div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Overall Score</h3>
            <div className="relative mb-4">
              <svg className="w-32 h-32">
                <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                <circle className="text-hyundai-blue" strokeWidth="8" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * analysis.finalScore) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-hyundai-blue">{analysis.finalScore}</span>
                <span className="text-xs font-bold text-slate-400">/ 100</span>
              </div>
            </div>
            <div className="text-6xl font-black text-hyundai-blue mb-2">{analysis.grade}</div>
            <p className="text-sm font-bold text-slate-500">종합 등급</p>
          </div>

          <div className="lg:col-span-2 glass-card p-8 rounded-2xl border-l-8 border-hyundai-blue">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-hyundai-blue flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" /> 종합 총평 (Overall Assessment)
              </h3>
              <div className="bg-hyundai-gold/10 text-hyundai-gold px-4 py-1 rounded-full text-xs font-black">
                {analysis.coachingStyle}
              </div>
            </div>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              {analysis.summary}
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">발화 비중</div>
                <div className="text-xl font-black text-hyundai-blue">{analysis.quantitative.speechRatio}%</div>
                <div className="text-[10px] text-slate-500">리더 발화량</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">핵심 키워드</div>
                <div className="flex flex-wrap gap-1">
                  {analysis.quantitative.keywords.map((k: string, i: number) => (
                    <span key={i} className="text-[10px] font-bold text-hyundai-blue">#{k}</span>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">목표 달성</div>
                <div className="text-xl font-black text-emerald-600">{history[history.length-1]?.metadata?.goalsAchieved?.length || 0} / {scenario.goals.length}</div>
                <div className="text-[10px] text-slate-500">체크리스트 완료</div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Quantitative Analysis */}
          <div className="glass-card p-8 rounded-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-hyundai-blue" /> 정량적 분석 (Quantitative)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar name="Score" dataKey="A" stroke="#002C5F" fill="#002C5F" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">심리적 안전감 변화 추이</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#0072C6" strokeWidth={3} dot={{ r: 4, fill: '#0072C6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Psychological & Leadership */}
          <div className="space-y-8">
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" /> 팀원 심리 반응 분석
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {analysis.psychologicalResponse}
              </p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-500" /> 리더십 스타일 진단
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {analysis.leadershipDiagnosis}
              </p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-red-500" /> 팀원 니즈 파악 (Needs Identification)
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {analysis.teamMemberNeeds}
              </p>
            </div>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100">
            <h3 className="text-lg font-bold text-emerald-700 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6" /> 소통상의 강점 (Strengths)
            </h3>
            <p className="text-sm text-emerald-800 leading-relaxed">
              {analysis.strengths}
            </p>
          </div>
          <div className="bg-amber-50 p-8 rounded-2xl border border-amber-100">
            <h3 className="text-lg font-bold text-amber-700 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" /> 개선 포인트 (Improvements)
            </h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              {analysis.improvements}
            </p>
          </div>
        </div>

        {/* Actionable Insights */}
        <div className="glass-card p-8 rounded-2xl mb-8">
          <h3 className="text-2xl font-bold text-hyundai-blue mb-8 flex items-center gap-3">
            <Zap className="w-8 h-8" /> 실전 가이드 및 액션 플랜 (Actionable Insights)
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-hyundai-light-blue" /> 추천 대화 예시
              </h4>
              <div className="bg-slate-50 p-4 rounded-xl italic text-sm text-slate-600 border-l-4 border-hyundai-light-blue">
                "{analysis.recommendedDialogue}"
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" /> 리더십 행동 가이드
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {analysis.actionGuide}
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" /> 리스크 관리 방안
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {analysis.riskManagement}
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center py-12">
          <p className="text-slate-500 mb-6">
            이 결과는 Firebase에 저장되어 향후 실습 결과와 비교 분석할 수 있습니다.
          </p>
          <button
            onClick={onRestart}
            className="hyundai-btn-primary px-12 py-4 text-lg shadow-2xl"
          >
            새로운 시뮬레이션 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
