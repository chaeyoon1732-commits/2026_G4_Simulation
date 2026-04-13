import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  allGoals: string[];
  achievedGoals: string[];
}

export default function GoalChecklist({ allGoals, achievedGoals }: Props) {
  return (
    <div className="glass-card p-4">
      <h3 className="text-xs font-bold text-hyundai-blue mb-4 uppercase tracking-widest">Interview Goals</h3>
      <div className="space-y-3">
        {allGoals.map((goal, index) => {
          const isAchieved = achievedGoals.includes(goal);
          return (
            <motion.div
              key={index}
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-3 p-2 rounded transition-colors ${
                isAchieved ? 'bg-hyundai-blue/10' : 'bg-transparent'
              }`}
            >
              {isAchieved ? (
                <CheckCircle2 className="w-5 h-5 text-hyundai-blue" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300" />
              )}
              <span className={`text-sm font-medium ${isAchieved ? 'text-hyundai-blue' : 'text-slate-500'}`}>
                {goal}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
