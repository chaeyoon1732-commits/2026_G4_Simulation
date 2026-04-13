import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { SimulationState } from '../geminiService';

interface Props {
  state: SimulationState;
}

export default function PsychologicalWidget({ state }: Props) {
  const data = [
    { subject: '신뢰도', A: state.trust, fullMark: 100 },
    { subject: '수용성', A: state.acceptance, fullMark: 100 },
    { subject: '안정감', A: state.stability, fullMark: 100 },
    { subject: '몰입도', A: state.engagement, fullMark: 100 },
  ];

  return (
    <div className="glass-card p-4 h-64 flex flex-col items-center">
      <h3 className="text-xs font-bold text-hyundai-blue mb-2 uppercase tracking-widest">Psychological Analysis</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#002C5F22" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#002C5F', fontSize: 10, fontWeight: 600 }} />
          <Radar
            name="State"
            dataKey="A"
            stroke="#002C5F"
            fill="#002C5F"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 w-full mt-2">
        {data.map((item) => (
          <div key={item.subject} className="flex justify-between items-center px-2 py-1 bg-hyundai-blue/5 rounded">
            <span className="text-[10px] font-semibold text-hyundai-blue">{item.subject}</span>
            <span className="text-[10px] font-bold text-hyundai-blue">{item.A}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
