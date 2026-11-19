import React from 'react';
import { Check, ChevronLeft, ChevronRight, Loader2, Pause, Play, X } from 'lucide-react';
import { useCapTable } from '../../context/CapTableContext';
import { DEMO_STEPS, useRecruiterDemo } from '../../context/RecruiterDemoContext';

export function DemoPlayerBar() {
  const { t } = useCapTable();
  const {
    isDemoActive,
    currentStepIndex,
    totalSteps,
    isPlaying,
    isStepReady,
    togglePlay,
    prevStep,
    nextStep,
    exitDemo,
  } = useRecruiterDemo();

  if (!isDemoActive) return null;
  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div
      role="region"
      aria-label="Recruiter Demo Controls"
      className="no-print fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-1.5rem)]"
    >
      <div className="bg-[#15233E] text-[#FCFBF9] border border-[#8C6D46]/50 rounded-full shadow-2xl px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={togglePlay}
          title={isPlaying ? t.demoPlaying : t.demoPaused}
          aria-label={isPlaying ? 'Pause auto-play' : 'Resume auto-play'}
          className="w-8 h-8 rounded-full bg-[#FCFBF9]/10 hover:bg-[#FCFBF9]/20 flex items-center justify-center text-[#FCFBF9] transition-colors shrink-0"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" strokeWidth={2} /> : <Play className="w-3.5 h-3.5 ml-0.5" strokeWidth={2} />}
        </button>

        <div className="flex items-center gap-2 px-1">
          <div className="flex items-center gap-1.5">
            {DEMO_STEPS.map((step) => {
              const isCurrent = step.index === currentStepIndex;
              const isDone = step.index < currentStepIndex;
              return (
                <span
                  key={step.index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isCurrent ? 'w-5 bg-[#D8B98E]' : isDone ? 'w-2 bg-emerald-400' : 'w-2 bg-[#FCFBF9]/25'
                  }`}
                />
              );
            })}
          </div>
          <span className="hidden sm:inline text-[11px] font-mono tabular-nums text-[#D8D1C3] whitespace-nowrap">
            {t.demoStepOf} {currentStepIndex + 1} {t.demoOf} {totalSteps}
          </span>
        </div>

        <div className="h-4 w-px bg-[#FCFBF9]/15" />

        <button
          type="button"
          onClick={prevStep}
          disabled={currentStepIndex === 0}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-full text-[#E5E0D5] hover:bg-[#FCFBF9]/10 disabled:opacity-35 transition-colors shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">{t.demoBack}</span>
        </button>

        <button
          type="button"
          onClick={nextStep}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 shrink-0 ${
            isStepReady
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
              : 'bg-[#FCFBF9]/12 hover:bg-[#FCFBF9]/20 text-[#D8D1C3]'
          }`}
        >
          {!isStepReady && <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />}
          <span>{isLastStep ? t.demoFinish : t.demoNext}</span>
          {isStepReady &&
            (isLastStep ? <Check className="w-3.5 h-3.5" strokeWidth={2.2} /> : <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.2} />)}
        </button>

        <button
          type="button"
          onClick={exitDemo}
          aria-label="Exit demo"
          title="Exit (Esc)"
          className="w-7 h-7 rounded-full hover:bg-[#FCFBF9]/15 flex items-center justify-center text-[#D8D1C3] hover:text-white transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>

      <div className="hidden md:block text-center mt-1.5">
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FCFBF9]/90 border border-[#E5E0D5] text-[10px] font-mono text-[#5A6475]">
          {t.demoKeyboardHint}
        </span>
      </div>
    </div>
  );
}
