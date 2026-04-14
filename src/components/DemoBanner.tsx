import React from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Users, ShieldCheck, LogOut, Info } from 'lucide-react';

interface DemoBannerProps {
  role: 'user' | 'admin';
  onSwitchRole: () => void;
  onReset: () => void;
  onExit: () => void;
}

export default function DemoBanner({ role, onSwitchRole, onReset, onExit }: DemoBannerProps) {
  return (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-[1000] bg-hyundai-blue text-white py-2 px-4 shadow-lg border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-hyundai-gold text-hyundai-blue px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
            Demo Mode
          </div>
          <p className="text-xs font-medium text-white/80 hidden sm:block">
            현재 <span className="text-white font-bold">{role === 'admin' ? '관리자' : '사용자'}</span> 권한으로 체험 중입니다. 모든 데이터는 가상이며 원본에 영향을 주지 않습니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onSwitchRole}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          >
            {role === 'admin' ? <Users className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            {role === 'admin' ? '사용자 화면으로' : '관리자 화면으로'}
          </button>
          
          <button 
            onClick={onReset}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            데이터 초기화
          </button>

          <div className="w-px h-4 bg-white/20 mx-1" />

          <button 
            onClick={onExit}
            className="flex items-center gap-1.5 bg-red-500/80 hover:bg-red-500 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            데모 종료
          </button>
        </div>
      </div>
    </motion.div>
  );
}
