import React from 'react';
import { Card } from '../common/Card';
import { Lock } from 'lucide-react';

export const LockedTaskCard = ({ lockedTask }) => {
  return (
    <Card className="bg-white/70 border-[#D6CEC1] hover:border-[#D6CEC1] transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#EFEAE0] border border-[#D6CEC1] flex items-center justify-center shrink-0 text-[#8A887F]">
          <Lock className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#77766F] bg-[#EFEAE0] px-2.5 py-0.5 rounded-md border border-[#D6CEC1]">
              Task #{lockedTask.taskNumber}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-[#8A887F] bg-[#EFEAE0] border border-[#D6CEC1]">
              Locked
            </span>
          </div>
          <h3 className="text-base font-bold text-[#233DFF]">{lockedTask.title}</h3>
          <p className="text-xs text-[#77766F] mt-1 line-clamp-2">{lockedTask.description}</p>
          <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF8EA] border border-[#FCE6BD] text-xs text-[#D88918] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F3B74F] shrink-0" />
            <span>{lockedTask.lockReason}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
