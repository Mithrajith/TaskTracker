import React from 'react';
import { Card } from '../common/Card';
import { Lock } from 'lucide-react';

export const LockedTaskCard = ({ lockedTask }) => {
  return (
    <Card className="bg-white/80 border-[#DDE8DF] hover:border-[#2D806B]/40 transition-colors shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#FAF8F0] border border-[#DDE8DF] flex items-center justify-center shrink-0 text-[#71817B]">
          <Lock className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71817B] bg-[#FAF8F0] px-2.5 py-0.5 rounded-md border border-[#DDE8DF]">
              Task #{lockedTask.taskNumber}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-[#71817B] bg-[#FAF8F0] border border-[#DDE8DF]">
              Locked
            </span>
          </div>
          <h3 className="text-base font-bold text-[#064E45]">{lockedTask.title}</h3>
          <p className="text-xs text-[#71817B] mt-1 line-clamp-2">{lockedTask.description}</p>
          <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF8EA] border border-[#FCE6BD] text-xs text-[#F3B74F] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F3B74F] shrink-0" />
            <span className="text-[#172E2A]">{lockedTask.lockReason}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
