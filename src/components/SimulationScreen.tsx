import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, User, Bot, Loader2, Clock, MessageCircle, Target, Info, ShieldCheck } from 'lucide-react';
import { Persona, Scenario } from '../constants';
import { createChatSession, sendMessage, ChatMessage, SimulationState } from '../geminiService';
import PsychologicalWidget from './PsychologicalWidget';
import GoalChecklist from './GoalChecklist';

interface Props {
  persona: Persona;
  scenario: Scenario;
  onBack: () => void;
  onFinish: (history: ChatMessage[]) => void;
}

export default function SimulationScreen({ persona, scenario, onBack, onFinish }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const [currentState, setCurrentState] = useState<SimulationState>({
    trust: 50,
    acceptance: 50,
    stability: 50,
    engagement: 50,
    goalsAchieved: []
  });
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const session = createChatSession(persona, scenario);
      setChatSession(session);
      
      setLoading(true);
      const response = await sendMessage(session, "안녕하세요. 면담을 시작해 주세요.");
      setMessages([{ role: 'model', content: response.content, metadata: response.metadata }]);
      if (response.metadata) setCurrentState(response.metadata);
      setLoading(false);
    }
    init();
  }, [persona, scenario]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    setLoading(true);
    const response = await sendMessage(chatSession, userMsg);
    setMessages(prev => [...prev, { role: 'model', content: response.content, metadata: response.metadata }]);
    if (response.metadata) setCurrentState(response.metadata);
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const userTurns = messages.filter(m => m.role === 'user').length;
  const isFinishable = userTurns >= 5; // Reduced for testing, but instruction said 10 turns total (user+model)

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-hyundai-blue dark:bg-slate-900 text-white p-4 flex items-center justify-between shadow-lg z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{scenario.title} 💬</h1>
            <p className="text-xs text-white/70">{persona.name} {persona.role} | {scenario.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-bold">{userTurns} / 10 턴</span>
          </div>
          {isFinishable && (
            <button 
              onClick={() => onFinish(messages)}
              className="bg-white text-hyundai-blue px-4 py-2 text-sm font-bold hover:bg-slate-100 transition-all rounded-sm shadow-lg"
            >
              면담 종료 및 리포트 확인 ✨
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Left: Chat Area */}
        <div className="flex-1 flex flex-col glass-card overflow-hidden rounded-xl">
          {/* Mission Banner */}
          <div className="bg-hyundai-light-blue/10 dark:bg-hyundai-light-blue/20 p-4 border-b border-hyundai-light-blue/20">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-hyundai-light-blue shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-hyundai-blue dark:text-hyundai-light-blue uppercase mb-1">당신의 미션 🎯</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  위의 상황과 팀원의 성향을 고려하여, 1:1 면담을 성공적으로 이끌어주세요. 
                  우측의 <b>'면담 목표'</b>를 달성하는 것이 이번 시뮬레이션의 핵심 과제입니다.
                </p>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/30 dark:bg-slate-900/30">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                      msg.role === 'user' ? 'bg-hyundai-light-blue text-white' : 'bg-hyundai-blue text-white'
                    }`}>
                      {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-hyundai-light-blue text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-3 items-center text-slate-400">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                  <span className="text-xs font-medium">상대방이 답변을 작성 중입니다... ✍️</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="상대방의 마음을 여는 대화를 시작하세요..."
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 focus:outline-none focus:border-hyundai-blue dark:focus:border-hyundai-light-blue transition-colors dark:text-white rounded-sm"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-hyundai-blue dark:bg-hyundai-light-blue text-white p-3 hover:bg-opacity-90 disabled:opacity-50 transition-all rounded-sm shadow-lg"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Widgets */}
        <div className="w-96 flex flex-col gap-6 overflow-y-auto pr-1">
          {/* Detailed Info Card */}
          <div className="glass-card p-5 rounded-xl border-l-4 border-hyundai-blue">
            <h3 className="text-xs font-bold text-hyundai-blue dark:text-hyundai-light-blue mb-4 uppercase tracking-widest flex items-center gap-2">
              <Info className="w-4 h-4" /> 대상자 상세 정보
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-2 rounded">
                <span className="text-[11px] font-bold text-slate-500">성향 (MBTI)</span>
                <span className="text-xs font-bold text-hyundai-blue dark:text-hyundai-light-blue">{persona.mbti}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">최근 이슈</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {persona.recentIssue}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {persona.traits.map((t, i) => (
                  <span key={i} className="text-[10px] bg-hyundai-blue/5 dark:bg-hyundai-light-blue/10 text-hyundai-blue dark:text-hyundai-light-blue px-2 py-0.5 rounded">#{t}</span>
                ))}
              </div>
            </div>
          </div>

          <PsychologicalWidget state={currentState} />
          
          <GoalChecklist allGoals={scenario.goals} achievedGoals={currentState.goalsAchieved} />
          
          <div className="glass-card p-5 rounded-xl">
            <h3 className="text-xs font-bold text-hyundai-blue dark:text-hyundai-light-blue mb-4 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4" /> 면담 가이드
            </h3>
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 border-l-2 border-amber-400 rounded-r">
                <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed italic">
                  "{scenario.guide}"
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase">추천 화법</h4>
                <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                  <li>"~에 대해 어떻게 생각하시나요?" (개방형 질문)</li>
                  <li>"그동안 고생 많으셨습니다." (공감과 인정)</li>
                  <li>"우리가 함께 해결할 수 있는 방법은 무엇일까요?" (협력적 제안)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
