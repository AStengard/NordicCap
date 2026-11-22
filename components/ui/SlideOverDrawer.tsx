import React from 'react';
import { X } from 'lucide-react';

export function SlideOverDrawer({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="no-print fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-[#15233E]/30 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#FCFBF9] border-l border-[#E5E0D5] h-full shadow-2xl flex flex-col">
        <div className="px-6 py-5 border-b border-[#E5E0D5] flex items-start justify-between">
          <div>
            <h3
              className="text-xl font-medium text-[#15233E]"
              style={{ fontFamily: "'Newsreader', Georgia, serif" }}
            >
              {title}
            </h3>
            {subtitle && <p className="text-xs text-[#5A6475] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-[#5A6475] hover:text-[#15233E] hover:bg-[#F6F4EF]"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" strokeWidth={1.6} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
