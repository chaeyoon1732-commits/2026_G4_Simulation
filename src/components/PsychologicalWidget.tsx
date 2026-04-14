import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { SimulationState } from '../geminiService';
import { motion } from 'motion/react';

interface Props {
  state: SimulationState;
}

export default function PsychologicalWidget({ state }: Props) {
  const data = [
    { subject: '신뢰도', A: state.trust },
    { subject: '수용성', A: state.acceptance },
    { subject: '안정감', A: state.stability },
    { subject: '몰입도', A: state.engagement },
  ];

  return (
    <div className="glass-card p-6 rounded-xl overflow-hidden flex flex-col items-center">
      <h3 className="text-[10px] font-black text-hyundai-blue dark:text-hyundai-light-blue mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
        <span className="w-2 h-2 bg-hyundai-gold rounded-full animate-pulse" />
        실시간 심리 분석 (H-Radar)
      </h3>
      
      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Persona State"
              dataKey="A"
              stroke="#002C5F"
              fill="#002C5F"
              fillOpacity={0.4}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full mt-4">
        {data.map((item) => (
          <motion.div 
            key={item.subject}
            className="flex flex-col p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700"
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">{item.subject}</span>
            <div className="flex items-end justify-between">
              <span className="text-lg font-black text-hyundai-blue dark:text-hyundai-light-blue">{item.A}</span>
              <span className="text-[10px] text-slate-400 mb-1">%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-1 overflow-hidden">
              <motion.div 
                className="h-full bg-hyundai-blue dark:bg-hyundai-light-blue"
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
