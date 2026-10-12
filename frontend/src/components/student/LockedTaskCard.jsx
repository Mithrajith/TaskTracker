import React from 'react';
import { Card } from '../common/Card';
import { Lock, Sparkles } from 'lucide-react';

export const LockedTaskCard = ({ lockedTask }) => {
  return (
    <Card className="bg-slate-950/40 border-slate-800/60 opacity-80 hover:opacity-100 transition-opacity">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 text-slate-400">
          <Lock className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700/60">
              Task #{lockedTask.taskNumber}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60">
              Locked
            </span>
          </div>
          <h3 className="text-base font-semibold text-slate-300">
            {lockedTask.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {lockedTask.description}
          </p>
          <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span>{lockedTask.lockReason}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

