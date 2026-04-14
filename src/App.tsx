import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Persona, Scenario, Category } from './constants';
import SimulationScreen from './components/SimulationScreen';
import ReportScreen from './components/ReportScreen';
import DashboardScreen from './components/DashboardScreen';
import { ChatMessage } from './geminiService';
import AdminScreen from './components/AdminScreen';
import { auth, signIn, signOut, seedInitialData, fetchPersonasFromFirestore, fetchScenariosFromFirestore, handleRedirectResult, checkIsAdmin } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  ChevronRight, Users, MessageSquare, ShieldCheck, HeartHandshake, 
  ArrowLeft, Sun, Moon, Type, LogOut, LogIn, Star, Target, Info, LayoutDashboard, Settings
} from 'lucide-react';

type Screen = 'HOME' | 'PERSONA_SELECT' | 'SCENARIO_SELECT' | 'SIMULATION' | 'REPORT' | 'DASHBOARD' | 'ADMIN';

export default function App() {
  const [screen, setScreen] = useState<Screen>('HOME');
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(18); // Increased default
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<Category>('목표/평가');
  
  // Firestore에서 가져온 데이터를 저장할 상태
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    // 한국어 주석: 리다이렉트 로그인 결과를 확인합니다.
    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setIsAdmin(checkIsAdmin(u.email));
        // 1. 사용자가 로그인하면 초기 데이터를 Firestore에 시드(seed)합니다.
        // 한국어 주석: 앱 실행 시 한 번만 실행되도록 설계할 수도 있지만, 여기서는 로그인 시 확인합니다.
        await seedInitialData();
        
        // 2. Firestore에서 데이터를 읽어옵니다.
        const pData = await fetchPersonasFromFirestore();
        const sData = await fetchScenariosFromFirestore();
        setPersonas(pData);
        setScenarios(sData);
        setLoadingData(false);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-size', `${fontSize}px`);
  }, [fontSize]);

  const handleStart = () => {
    if (!user) {
      signIn();
    } else {
      setScreen('PERSONA_SELECT');
    }
  };
  
  const handlePersonaSelect = (p: Persona) => {
    setSelectedPersona(p);
    setScreen('SCENARIO_SELECT');
  };

  const handleScenarioSelect = (s: Scenario) => {
    setSelectedScenario(s);
    setScreen('SIMULATION');
  };

  const handleFinish = (chatHistory: ChatMessage[]) => {
    setHistory(chatHistory);
    setScreen('REPORT');
  };

  const handleRestart = () => {
    setScreen('HOME');
    setSelectedPersona(null);
    setSelectedScenario(null);
    setHistory([]);
  };

  const categories: Category[] = ['목표/평가', '인사통보', '직원케어', '성과관리'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-hyundai transition-colors duration-300">
      {/* Global Controls */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-4 bg-white dark:bg-slate-800 shadow-2xl rounded-full text-hyundai-blue dark:text-hyundai-light-blue hover:scale-110 transition-all border border-slate-200 dark:border-slate-700"
          title="다크모드 전환"
        >
          {isDarkMode ? <Sun className="w-7 h-7" /> : <Moon className="w-7 h-7" />}
        </button>
        <div className="flex flex-col bg-white dark:bg-slate-800 shadow-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setFontSize(prev => Math.min(prev + 2, 32))}
            className="p-4 text-hyundai-blue dark:text-hyundai-light-blue hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex flex-col items-center"
            title="글씨 크게"
          >
            <Type className="w-7 h-7" />
            <span className="text-[10px] font-black mt-1">BIG</span>
          </button>
          <button 
            onClick={() => setFontSize(prev => Math.max(prev - 2, 14))}
            className="p-4 text-hyundai-blue dark:text-hyundai-light-blue hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border-t border-slate-100 dark:border-slate-700 flex flex-col items-center"
            title="글씨 작게"
          >
            <Type className="w-5 h-5" />
            <span className="text-[10px] font-black mt-1">SMALL</span>
          </button>
        </div>
      </div>

      {/* Top Navigation for Logged In Users */}
      {user && screen !== 'SIMULATION' && screen !== 'ADMIN' && (
        <div className="fixed top-6 right-6 flex gap-3 z-50">
          {isAdmin && (
            <button 
              onClick={() => setScreen('ADMIN')}
              className="flex items-center gap-2 bg-hyundai-blue text-white px-5 py-2.5 rounded-full shadow-xl font-bold hover:scale-105 transition-all border border-white/10"
            >
              <Settings className="w-5 h-5 text-hyundai-gold" />
              관리자 모드
            </button>
          )}
          <button 
            onClick={() => setScreen('DASHBOARD')}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 text-hyundai-blue dark:text-white px-5 py-2.5 rounded-full shadow-xl font-bold hover:scale-105 transition-all border border-slate-200 dark:border-slate-800"
          >
            <LayoutDashboard className="w-5 h-5" />
            대시보드
          </button>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-xl border border-slate-200 dark:border-slate-800">
            <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border-2 border-hyundai-blue" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{user.displayName}님</span>
            <button onClick={signOut} className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {screen === 'HOME' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex flex-col items-center justify-center bg-hyundai-blue dark:bg-slate-950 text-white p-6 relative overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-hyundai-light-blue rounded-full blur-[120px]" />
            </div>

            <div className="z-10 text-center max-w-3xl">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex justify-center mb-6">
                  {user ? (
                    <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full">
                      <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full" />
                      <span className="text-sm font-medium">{user.displayName}님 환영합니다</span>
                      <button onClick={signOut} className="text-white/50 hover:text-white transition-colors">
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={signIn} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-all">
                      <LogIn className="w-4 h-4" />
                      <span className="text-sm font-medium">로그인이 필요합니다</span>
                    </button>
                  )}
                </div>
                <h2 className="text-hyundai-light-blue font-bold tracking-[0.3em] uppercase mb-4">Hyundai Motor Group</h2>
                <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                  현장 리더 AI ✨<br />면담 시뮬레이터
                </h1>
                <p className="text-lg md:text-xl text-white/70 mb-12 leading-relaxed">
                  현대자동차 국내사업본부 리더를 위한 실전형 코칭 시뮬레이션.<br />
                  AI 페르소나와의 대화를 통해 당신의 면담 역량을 진단하고 강화하세요. 🚀
                </p>
                <button
                  onClick={handleStart}
                  className="bg-white text-hyundai-blue px-12 py-5 text-xl font-bold hover:bg-slate-100 transition-all flex items-center gap-3 mx-auto group shadow-2xl"
                >
                  {user ? '시뮬레이션 시작하기' : 'Google로 로그인하여 시작'}
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {screen === 'PERSONA_SELECT' && (
          <motion.div
            key="persona_select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-8 max-w-6xl mx-auto"
          >
            <div className="mb-12 flex items-center gap-4">
              <button onClick={() => setScreen('HOME')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-hyundai-blue dark:text-hyundai-light-blue" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-hyundai-blue dark:text-white mb-2">대화 상대 선택 👥</h1>
                <p className="text-slate-500 dark:text-slate-400">면담을 진행할 팀원의 페르소나를 선택해 주세요.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {loadingData ? (
                <div className="col-span-2 text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hyundai-blue mx-auto mb-4"></div>
                  <p className="text-slate-500">데이터를 불러오는 중입니다...</p>
                </div>
              ) : (
                ['영업', '서비스'].map(dept => (
                  <div key={dept} className="space-y-6">
                    <h2 className="text-xl font-bold text-hyundai-blue dark:text-hyundai-light-blue border-b border-slate-200 dark:border-slate-800 pb-2">
                      {dept === '영업' ? '영업 부문 💼' : '서비스 부문 🛠️'}
                    </h2>
                    <div className="grid gap-4">
                      {personas.filter(p => p.department === dept).map(p => (
                        <button
                          key={p.id}
                          onClick={() => handlePersonaSelect(p)}
                          className="text-left p-6 glass-card border-2 border-transparent hover:border-hyundai-blue dark:hover:border-hyundai-light-blue group relative overflow-hidden"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                p.difficulty === '상' ? 'bg-red-100 text-red-600' : 
                                p.difficulty === '중' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                              }`}>난이도 {p.difficulty}</span>
                              <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded">{p.mbti}</span>
                            </div>
                            <span className="text-xs font-medium text-slate-400">{p.role}</span>
                          </div>
                          <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-2">{p.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{p.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {p.traits.map((t, i) => (
                              <span key={i} className="text-[10px] bg-hyundai-blue/5 dark:bg-hyundai-light-blue/10 text-hyundai-blue dark:text-hyundai-light-blue px-2 py-1 rounded">#{t}</span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {screen === 'SCENARIO_SELECT' && (
          <motion.div
            key="scenario_select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-8 max-w-6xl mx-auto"
          >
            <div className="mb-12 flex items-center gap-4">
              <button onClick={() => setScreen('PERSONA_SELECT')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-hyundai-blue dark:text-hyundai-light-blue" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-hyundai-blue dark:text-white mb-2">면담 상황 선택 📋</h1>
                <p className="text-slate-500 dark:text-slate-400">진행할 면담의 카테고리와 구체적인 상황을 선택해 주세요.</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-6 py-3 font-bold text-sm whitespace-nowrap transition-all border-b-4 ${
                    activeTab === cat 
                      ? 'border-hyundai-blue dark:border-hyundai-light-blue text-hyundai-blue dark:text-hyundai-light-blue' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingData ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hyundai-blue mx-auto mb-4"></div>
                  <p className="text-slate-500">데이터를 불러오는 중입니다...</p>
                </div>
              ) : (
                scenarios.filter(s => s.category === activeTab).map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleScenarioSelect(s)}
                    className="text-left p-6 glass-card border-2 border-transparent hover:border-hyundai-blue dark:hover:border-hyundai-light-blue flex flex-col h-full"
                  >
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-3">{s.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1">{s.description}</p>
                    
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-hyundai-blue dark:text-hyundai-light-blue uppercase mb-1">
                          <Target className="w-3 h-3" /> Goals
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {s.goals.map((g, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">{g}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase mb-1">
                          <Info className="w-3 h-3" /> Guide
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic leading-tight">{s.guide}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}

        {screen === 'SIMULATION' && selectedPersona && selectedScenario && (
          <SimulationScreen
            persona={selectedPersona}
            scenario={selectedScenario}
            onBack={() => setScreen('SCENARIO_SELECT')}
            onFinish={handleFinish}
          />
        )}

        {screen === 'REPORT' && selectedPersona && selectedScenario && (
          <ReportScreen 
            history={history} 
            persona={selectedPersona}
            scenario={selectedScenario}
            onRestart={handleRestart} 
          />
        )}

        {screen === 'DASHBOARD' && (
          <DashboardScreen onBack={() => setScreen('HOME')} />
        )}
        {screen === 'ADMIN' && (
          <AdminScreen onClose={() => setScreen('HOME')} />
        )}
      </AnimatePresence>
    </div>
  );
}
