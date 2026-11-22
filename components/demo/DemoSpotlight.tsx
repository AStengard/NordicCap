import React, { useEffect, useRef } from 'react';
import { useRecruiterDemo } from '../../context/RecruiterDemoContext';

export function DemoSpotlight({
  stepIndex,
  badgeText,
  children,
  className = '',
}: {
  stepIndex: number;
  badgeText: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { isDemoActive, currentStepIndex } = useRecruiterDemo();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isActive = isDemoActive && currentStepIndex === stepIndex;

  useEffect(() => {
    if (isActive && containerRef.current) {
      const timer = window.setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 120);
      return () => window.clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      className={`relative rounded-lg transition-shadow duration-300 ${
        isActive ? 'ring-2 ring-[#8C6D46] ring-offset-4 ring-offset-[#F6F4EF] shadow-lg' : ''
      } ${className}`}
    >
      {isActive && (
        <div className="no-print pointer-events-none absolute -top-3.5 left-4 z-20 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#15233E] text-[#FCFBF9] border border-[#8C6D46] text-[10px] font-mono font-medium tracking-wide shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D8B98E]" />
          <span>{badgeText}</span>
        </div>
      )}
      {children}
    </div>
  );
}
