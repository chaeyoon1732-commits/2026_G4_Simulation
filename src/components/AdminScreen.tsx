import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Database, BarChart3, Lock, ChevronRight, Plus, 
  Trash2, Save, X, Settings, TrendingUp, Award, MessageSquare, Download, FileText, Sparkles, Loader2
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import * as XLSX from 'xlsx';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { 
  db, getAllSimulationResults, updatePersona, updateScenario, 
  fetchPersonasFromFirestore, fetchScenariosFromFirestore 
} from '../firebase';
import { Persona, Scenario, Category } from '../constants';
import ReportScreen from './ReportScreen';
import { generateAIPersona, generateAIScenario, generatePersonaImage } from '../geminiService';

interface Props {
  onClose: () => void;
  personas: Persona[];
  scenarios: Scenario[];
  isDemoMode?: boolean;
  demoData?: any;
  onUpdateDemoData?: (newData: any) => void;
}

export default function AdminScreen({ onClose, personas, scenarios, isDemoMode, demoData, onUpdateDemoData }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState(isDemoMode || false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scenarios' | 'users'>('dashboard');
  const [results, setResults] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedResultForReport, setSelectedResultForReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (isDemoMode && demoData) {
        setResults(demoData.simulations);
        setLoading(false);
        return;
      }
      setLoading(true);
      const q = query(collection(db, 'simulations'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const res = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setResults(res);
        setLoading(false);
      }, (error) => {
        console.error("Error subscribing to results:", error);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'hyundai2026') {
      setIsAuthenticated(true);
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  const handleSavePersona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode && demoData && onUpdateDemoData) {
      const updatedPersonas = demoData.personas.map((p: any) => p.id === editingItem.id ? editingItem : p);
      if (!demoData.personas.find((p: any) => p.id === editingItem.id)) {
        updatedPersonas.push(editingItem);
      }
      onUpdateDemoData({ ...demoData, personas: updatedPersonas });
      alert('데모 페르소나가 저장되었습니다.');
      setEditingItem(null);
      return;
    }
    const success = await updatePersona(editingItem);
    if (success) {
      alert('페르소나가 저장되었습니다.');
      setEditingItem(null);
    }
  };

  const handleSaveScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode && demoData && onUpdateDemoData) {
      const updatedScenarios = demoData.scenarios.map((s: any) => s.id === editingItem.id ? editingItem : s);
      if (!demoData.scenarios.find((s: any) => s.id === editingItem.id)) {
        updatedScenarios.push(editingItem);
      }
      onUpdateDemoData({ ...demoData, scenarios: updatedScenarios });
      alert('데모 시나리오가 저장되었습니다.');
      setEditingItem(null);
      return;
    }
    const success = await updateScenario(editingItem);
    if (success) {
      alert('시나리오가 저장되었습니다.');
      setEditingItem(null);
    }
  };

  const handleExportExcel = () => {
    const exportData = results.map(r => ({
      '학습자 이메일': r.userId,
      '시나리오': r.scenarioId,
      '페르소나': r.personaId,
      '점수': r.score,
      '등급': r.grade,
      '날짜': r.timestamp?.toDate().toLocaleString() || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'LearningStatus');
    XLSX.writeFile(wb, `H-Coaching_LearningStatus_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleGenerateAIPersona = async () => {
    setIsGenerating(true);
    try {
      const dept = editingItem.department || '영업';
      const aiPersona = await generateAIPersona(dept);
      if (aiPersona) {
        const imageUrl = await generatePersonaImage(aiPersona);
        setEditingItem({
          ...editingItem,
          ...aiPersona,
          imageUrl,
          id: `pers-${Date.now()}`
        });
      }
    } catch (error) {
      console.error("Error generating AI persona:", error);
      alert("AI 페르소나 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAIScenario = async () => {
    setIsGenerating(true);
    try {
      const category = editingItem.category || '영업';
      const aiScenario = await generateAIScenario(category);
      if (aiScenario) {
        setEditingItem({
          ...editingItem,
          ...aiScenario,
          id: `scen-${Date.now()}`
        });
      }
    } catch (error) {
      console.error("Error generating AI scenario:", error);
      alert("AI 시나리오 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-hyundai-blue flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-hyundai-blue/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-hyundai-blue" />
            </div>
            <h2 className="text-2xl font-black text-hyundai-blue">Admin Access</h2>
            <p className="text-slate-500 text-sm">관리자 비밀번호를 입력하세요.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-hyundai-blue outline-none transition-all"
              autoFocus
            />
            <button className="hyundai-btn-primary w-full py-4 text-lg">
              로그인
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full py-2 text-slate-400 text-sm hover:text-slate-600 transition-colors"
            >
              돌아가기
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Dashboard Stats
  const avgScore = results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length) : 0;
  const gradeDist = results.reduce((acc: any, r) => {
    acc[r.grade] = (acc[r.grade] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(gradeDist).map(grade => ({ name: grade, value: gradeDist[grade] }));
  const COLORS = ['#002C5F', '#0072C6', '#A36B4F', '#64748b', '#94a3b8'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col font-hyundai">
      {/* Admin Header */}
      <header className="bg-hyundai-blue text-white px-8 py-4 flex items-center justify-between shadow-xl border-b">
        <div className="flex items-center gap-4">
          <Settings className="w-6 h-6 text-hyundai-gold" />
          <h1 className="text-xl font-black tracking-tight">H-Coaching Admin System</h1>
        </div>
        <div className="flex items-center gap-6">
          <nav className="flex gap-1 bg-white/10 p-1 rounded-lg">
            {[
              { id: 'dashboard', icon: BarChart3, label: '대시보드' },
              { id: 'scenarios', icon: Database, label: '시나리오 빌더' },
              { id: 'users', icon: Users, label: '학습 현황' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-bold ${
                  activeTab === tab.id ? 'bg-white text-hyundai-blue shadow-lg' : 'hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </nav>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="전체 학습 횟수" value={results.length} icon={TrendingUp} color="blue" />
                <StatCard title="평균 코칭 점수" value={`${avgScore}점`} icon={Award} color="gold" />
                <StatCard title="등록 페르소나" value={personas.length} icon={Users} color="slate" />
                <StatCard title="등록 시나리오" value={scenarios.length} icon={Database} color="slate" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8 rounded-2xl">
                  <h3 className="text-lg font-black text-hyundai-blue mb-6">등급별 분포 (Grade Distribution)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%" debounce={50}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="glass-card p-8 rounded-2xl">
                  <h3 className="text-lg font-black text-hyundai-blue mb-6">최근 학습 트렌드</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%" debounce={50}>
                      <BarChart data={results.slice(0, 10).reverse()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="timestamp" tick={false} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="score" fill="#002C5F" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'scenarios' && (
            <motion.div 
              key="scenarios"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-hyundai-blue">Scenario Builder</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={async () => {
                      if (isDemoMode) {
                        alert('데모 모드에서는 초기화 기능을 사용할 수 없습니다. 상단 배너의 초기화 버튼을 이용해 주세요.');
                        return;
                      }
                      if (confirm('모든 페르소나와 시나리오를 기본 데이터로 초기화하시겠습니까? (기존 데이터 덮어쓰기)')) {
                        const { seedInitialData } = await import('../firebase');
                        await seedInitialData();
                        alert('데이터가 초기화되었습니다.');
                      }
                    }}
                    className="flex items-center gap-2 border border-hyundai-blue text-hyundai-blue px-4 py-2 rounded-lg text-sm font-bold hover:bg-hyundai-blue hover:text-white transition-all"
                  >
                    <Database className="w-4 h-4" /> 기본 데이터로 초기화
                  </button>
                  <button 
                    onClick={() => setEditingItem({ id: `pers-${Date.now()}`, name: '', role: '', department: '영업', description: '', traits: [], mbti: '', difficulty: '중', recentIssue: '', type: 'persona' })}
                    className="flex items-center gap-2 bg-hyundai-blue text-white px-4 py-2 rounded-lg text-sm font-bold"
                  >
                    <Plus className="w-4 h-4" /> 페르소나 추가
                  </button>
                  <button 
                    onClick={() => setEditingItem({ id: `scen-${Date.now()}`, category: '영업', title: '', description: '', guide: '', goals: [], type: 'scenario' })}
                    className="flex items-center gap-2 bg-hyundai-gold text-white px-4 py-2 rounded-lg text-sm font-bold"
                  >
                    <Plus className="w-4 h-4" /> 시나리오 추가
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-black text-slate-400 uppercase text-xs tracking-widest">Personas</h3>
                  {personas.map(p => (
                    <div key={p.id} className="glass-card p-4 rounded-xl flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        {p.imageUrl && (
                          <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
                        )}
                        <div>
                          <div className="font-bold text-hyundai-blue">{p.name}</div>
                          <div className="text-xs text-slate-500">{p.role} | {p.department}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setEditingItem({ ...p, type: 'persona' })}
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                        </button>
                        <button 
                          onClick={async () => {
                            if (isDemoMode && demoData && onUpdateDemoData) {
                              if (confirm(`'${p.name}' 데모 페르소나를 삭제하시겠습니까?`)) {
                                const updatedPersonas = demoData.personas.filter((pers: any) => pers.id !== p.id);
                                onUpdateDemoData({ ...demoData, personas: updatedPersonas });
                              }
                              return;
                            }
                            if (confirm(`'${p.name}' 페르소나를 삭제하시겠습니까?`)) {
                              const { deletePersona } = await import('../firebase');
                              await deletePersona(p.id);
                            }
                          }}
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h3 className="font-black text-slate-400 uppercase text-xs tracking-widest">Scenarios</h3>
                  {scenarios.map(s => (
                    <div key={s.id} className="glass-card p-4 rounded-xl flex items-center justify-between group">
                      <div>
                        <div className="font-bold text-hyundai-blue">{s.title}</div>
                        <div className="text-xs text-slate-500">{s.category}</div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setEditingItem({ ...s, type: 'scenario' })}
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                        </button>
                        <button 
                          onClick={async () => {
                            if (isDemoMode && demoData && onUpdateDemoData) {
                              if (confirm(`'${s.title}' 데모 시나리오를 삭제하시겠습니까?`)) {
                                const updatedScenarios = demoData.scenarios.filter((scen: any) => scen.id !== s.id);
                                onUpdateDemoData({ ...demoData, scenarios: updatedScenarios });
                              }
                              return;
                            }
                            if (confirm(`'${s.title}' 시나리오를 삭제하시겠습니까?`)) {
                              const { deleteScenario } = await import('../firebase');
                              await deleteScenario(s.id);
                            }
                          }}
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-hyundai-blue">Learning Status</h2>
                <button 
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg"
                >
                  <Download className="w-4 h-4" /> Excel 추출
                </button>
              </div>
              <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">학습자</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">시나리오</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">점수</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">등급</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">날짜</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">리포트</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-hyundai-blue">{r.userId.split('@')[0]}</div>
                          <div className="text-[10px] text-slate-400">{r.userId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600">{r.scenarioId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-hyundai-blue">{r.score}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black ${
                            r.grade === 'S' ? 'bg-hyundai-gold text-white' : 'bg-hyundai-blue/10 text-hyundai-blue'
                          }`}>
                            {r.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {r.timestamp?.toDate().toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => setSelectedResultForReport(r)}
                            className="p-2 hover:bg-hyundai-blue/10 rounded-lg transition-all text-hyundai-blue"
                            title="리포트 보기"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Editor Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-hyundai-blue">
                  {editingItem.type === 'persona' ? 'Persona Editor' : 'Scenario Editor'}
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={editingItem.type === 'persona' ? handleGenerateAIPersona : handleGenerateAIScenario}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-lg disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    AI 자동 생성
                  </button>
                  <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={editingItem.type === 'persona' ? handleSavePersona : handleSaveScenario} className="space-y-6 pb-8">
                {editingItem.type === 'persona' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">이름</label>
                        <input 
                          value={editingItem.name} 
                          onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">직함 (Title)</label>
                        <input 
                          value={editingItem.role} 
                          onChange={e => setEditingItem({...editingItem, role: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">부문 (Category)</label>
                        <select 
                          value={editingItem.department} 
                          onChange={e => setEditingItem({...editingItem, department: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200"
                        >
                          <option value="영업">영업</option>
                          <option value="서비스">서비스</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">난이도</label>
                        <select 
                          value={editingItem.difficulty} 
                          onChange={e => setEditingItem({...editingItem, difficulty: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200"
                        >
                          <option value="하">하</option>
                          <option value="중">중</option>
                          <option value="상">상</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">MBTI</label>
                        <input 
                          value={editingItem.mbti} 
                          onChange={e => setEditingItem({...editingItem, mbti: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">설명 (Persona Script)</label>
                      <textarea 
                        value={editingItem.description} 
                        onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 h-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">최근 이슈</label>
                      <input 
                        value={editingItem.recentIssue} 
                        onChange={e => setEditingItem({...editingItem, recentIssue: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">특징 (쉼표로 구분)</label>
                      <input 
                        value={editingItem.traits?.join(', ')} 
                        onChange={e => setEditingItem({...editingItem, traits: e.target.value.split(',').map((t: string) => t.trim())})}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200"
                        placeholder="예: 자부심, 보수적, 변화 거부"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">카테고리</label>
                        <select 
                          value={editingItem.category} 
                          onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200"
                        >
                          <option value="영업">영업</option>
                          <option value="서비스">서비스</option>
                          <option value="목표/평가">목표/평가</option>
                          <option value="인사통보">인사통보</option>
                          <option value="직원케어">직원케어</option>
                          <option value="성과관리">성과관리</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">제목</label>
                        <input 
                          value={editingItem.title} 
                          onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">상황 설명</label>
                      <textarea 
                        value={editingItem.description} 
                        onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 h-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">코칭 가이드</label>
                      <textarea 
                        value={editingItem.guide} 
                        onChange={e => setEditingItem({...editingItem, guide: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 h-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">면담 목표 (쉼표로 구분)</label>
                      <input 
                        value={editingItem.goals?.join(', ')} 
                        onChange={e => setEditingItem({...editingItem, goals: e.target.value.split(',').map((g: string) => g.trim())})}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200"
                        placeholder="예: 목표 합의, 실행 방안 도출"
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 hyundai-btn-primary py-3 flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" /> 저장하기
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 border border-slate-200 py-3 rounded-lg font-bold text-slate-400 hover:bg-slate-50"
                  >
                    취소
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {selectedResultForReport && (
          <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex flex-col">
            <div className="p-4 flex justify-end">
              <button 
                onClick={() => setSelectedResultForReport(null)}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ReportScreen 
                history={selectedResultForReport.history}
                persona={personas.find(p => p.id === selectedResultForReport.personaId) || personas[0]}
                scenario={scenarios.find(s => s.id === selectedResultForReport.scenarioId) || scenarios[0]}
                onRestart={() => setSelectedResultForReport(null)}
                isDemoMode={isDemoMode}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorClasses: any = {
    blue: 'bg-hyundai-blue text-white',
    gold: 'bg-hyundai-gold text-white',
    slate: 'bg-slate-100 text-slate-600'
  };

  return (
    <div className={`p-6 rounded-2xl shadow-lg flex flex-col justify-between ${colorClasses[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{title}</span>
        <Icon className="w-5 h-5 opacity-50" />
      </div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  );
}
