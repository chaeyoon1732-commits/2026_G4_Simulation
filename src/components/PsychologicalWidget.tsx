import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { SimulationState } from '../geminiService';
import { motion } from 'motion/react';

interface Props {
  state: SimulationState;
}

export default function PsychologicalWidget({ state }: Props) {
  const data = [
    { subject: '라포 형성', A: state?.rapport ?? 50 },
    { subject: '현상 파악', A: state?.situation ?? 50 },
    { subject: '해결책 도출', A: state?.solution ?? 50 },
    { subject: '몰입도', A: state?.engagement ?? 50 },
  ];

  return (
    <div className="glass-card p-6 rounded-xl overflow-hidden flex flex-col items-center min-h-[400px]">
      <h3 className="text-[10px] font-black text-hyundai-blue mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
        <span className="w-2 h-2 bg-hyundai-gold rounded-full animate-pulse" />
        실시간 코칭 지표 (H-Radar)
      </h3>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#cbd5e1" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Coaching Metrics"
              dataKey="A"
              stroke="#002C5F"
              fill="#002C5F"
              fillOpacity={0.5}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full mt-4">
        {data.map((item) => (
          <motion.div 
            key={item.subject}
            className="flex flex-col p-2 bg-slate-50 rounded-lg border border-slate-100"
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">{item.subject}</span>
            <div className="flex items-end justify-between">
              <span className="text-lg font-black text-hyundai-blue">{item.A}</span>
              <span className="text-[10px] text-slate-400 mb-1">%</span>
            </div>
            <div className="w-full bg-slate-200 h-1 rounded-full mt-1 overflow-hidden">
              <motion.div 
                className="h-full bg-hyundai-blue"
                initial={{ width: 0 }}
                animate={{ width: `${item.A}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
