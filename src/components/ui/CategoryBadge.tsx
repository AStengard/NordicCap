import React from 'react';
import { StakeholderCategory } from '../../types';

export function CategoryBadge({ category }: { category: StakeholderCategory | 'ESOP Pool' }) {
  const styles: Record<string, string> = {
    Founder: 'bg-[#15233E]/10 text-[#15233E] border-[#15233E]/20',
    Angel: 'bg-[#8C6D46]/12 text-[#745836] border-[#8C6D46]/25',
    VC: 'bg-[#2E476E]/12 text-[#233859] border-[#2E476E]/25',
    ESOP: 'bg-[#5C6F68]/12 text-[#44544E] border-[#5C6F68]/25',
    'ESOP Pool': 'bg-[#5C6F68]/12 text-[#44544E] border-[#5C6F68]/25',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide rounded border ${
        styles[category] ?? 'bg-[#E5E0D5]/60 text-[#15233E] border-[#E5E0D5]'
      }`}
    >
      {category}
    </span>
  );
}
