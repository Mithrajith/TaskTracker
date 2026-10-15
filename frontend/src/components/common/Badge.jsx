import React from 'react';

export const Badge = ({ status, className = '' }) => {
  const norm = (status || '').toLowerCase().replace(/[\s-]/g, '_');

  let style = 'bg-[#F5F0E8] text-[#77766F] border-[#D6CEC1]';
  let dotColor = 'bg-[#77766F]';
  let label = status || 'Unknown';

  switch (norm) {
    case 'approved':
      style = 'bg-[#E5DED2] text-[#2D9B70] border-[#D6CEC1]';
      dotColor = 'bg-[#2D9B70]';
      label = 'Approved';
      break;
    case 'submitted':
    case 'under_review':
    case 'pending':
      style = 'bg-[#FFF8EA] text-[#D88918] border-[#FCE6BD]';
      dotColor = 'bg-[#F3B74F]';
      label = 'Pending Review';
      break;
    case 'changes_requested':
      style = 'bg-[#FFF0ED] text-[#E86A5B] border-[#FAD3CC]';
      dotColor = 'bg-[#E86A5B]';
      label = 'Changes Requested';
      break;
    case 'rejected':
      style = 'bg-[#FFF0ED] text-[#E86A5B] border-[#FAD3CC]';
      dotColor = 'bg-[#E86A5B]';
      label = 'Rejected';
      break;
    case 'in_progress':
      style = 'bg-[#E5DED2] text-[#233DFF] border-[#D6CEC1]';
      dotColor = 'bg-[#233DFF]';
      label = 'In Progress';
      break;
    case 'assigned':
      style = 'bg-[#E5DED2] text-[#233DFF] border-[#D6CEC1]';
      dotColor = 'bg-[#233DFF]';
      label = 'Assigned';
      break;
    case 'published':
      style = 'bg-[#E5DED2] text-[#233DFF] border-[#D6CEC1]';
      dotColor = 'bg-[#233DFF]';
      label = 'Published';
      break;
    case 'draft':
      style = 'bg-[#EFEAE0] text-[#77766F] border-[#D6CEC1]';
      dotColor = 'bg-[#77766F]';
      label = 'Draft';
      break;
    case 'active':
      style = 'bg-[#E5DED2] text-[#2D9B70] border-[#D6CEC1]';
      dotColor = 'bg-[#2D9B70]';
      label = 'Active';
      break;
    case 'inactive':
      style = 'bg-[#FFF0ED] text-[#E86A5B] border-[#FAD3CC]';
      dotColor = 'bg-[#E86A5B]';
      label = 'Deactivated';
      break;
    case 'locked':
      style = 'bg-[#EFEAE0] text-[#8A887F] border-[#D6CEC1]';
      dotColor = 'bg-[#9A9890]';
      label = 'Locked';
      break;
    default:
      label = status;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
};

