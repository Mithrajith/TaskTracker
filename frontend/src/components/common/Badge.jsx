import React from 'react';

export const Badge = ({ status, className = '' }) => {
  const norm = (status || '').toLowerCase().replace(/[\s-]/g, '_');

  let style = 'bg-[#FAF8F0] text-[#71817B] border-[#DDE8DF]';
  let dotColor = 'bg-[#71817B]';
  let label = status || 'Unknown';

  switch (norm) {
    case 'approved':
      style = 'bg-[#EAF7EF] text-[#2D9B70] border-[#CDE5D6]';
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
      style = 'bg-[#FFF3EC] text-[#D46C38] border-[#FFDFD0]';
      dotColor = 'bg-[#FFA77E]';
      label = 'In Progress';
      break;
    case 'assigned':
      style = 'bg-[#EAF7EF] text-[#064E45] border-[#CDE5D6]';
      dotColor = 'bg-[#064E45]';
      label = 'Assigned';
      break;
    case 'published':
      style = 'bg-[#EAF7EF] text-[#2D806B] border-[#CDE5D6]';
      dotColor = 'bg-[#2D806B]';
      label = 'Published';
      break;
    case 'draft':
      style = 'bg-[#F2F4F2] text-[#71817B] border-[#DDE8DF]';
      dotColor = 'bg-[#71817B]';
      label = 'Draft';
      break;
    case 'active':
      style = 'bg-[#EAF7EF] text-[#2D9B70] border-[#CDE5D6]';
      dotColor = 'bg-[#2D9B70]';
      label = 'Active';
      break;
    case 'inactive':
      style = 'bg-[#FFF0ED] text-[#E86A5B] border-[#FAD3CC]';
      dotColor = 'bg-[#E86A5B]';
      label = 'Deactivated';
      break;
    case 'locked':
      style = 'bg-[#F0F2F0] text-[#8C9B95] border-[#DDE8DF]';
      dotColor = 'bg-[#A3B2AC]';
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

