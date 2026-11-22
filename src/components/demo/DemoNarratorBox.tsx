import React from 'react';
import { Compass, ExternalLink, FileText } from 'lucide-react';
import { useCapTable } from '../../context/CapTableContext';
import { useRecruiterDemo } from '../../context/RecruiterDemoContext';

export function DemoNarratorBox() {
  const { state, t } = useCapTable();
  const { isDemoActive, currentStep, currentStepIndex, totalSteps } =
    useRecruiterDemo();

  if (!isDemoActive) return null;

  const isSV = state.language === 'SV';
  const title = isSV ? currentStep.titleSV : currentStep.titleEN;
  const bullets = isSV ? currentStep.bulletsSV : currentStep.bulletsEN;

  return (
    <aside
      aria-label="Recruiter Walkthrough Commentary"
      className="no-print fixed bottom-20 sm:bottom-24 left-3 sm:left-6 z-40 w-[calc(100vw-1.5rem)] sm:w-[350px] lg:w-[380px] max-h-[min(520px,calc(100vh-7.5rem))] flex flex-col bg-[#FCFBF9]/95 backdrop-blur-md border border-[#D8D1C3] rounded-xl shadow-2xl overflow-hidden"
    >
      <div className="px-4 py-2.5 bg-[#15233E] text-[#FCFBF9] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Compass className="w-4 h-4 text-[#D8B98E] shrink-0" strokeWidth={1.7} />
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#D8B98E] truncate">
            {t.demoStepOf} {currentStepIndex + 1} {t.demoOf} {totalSteps}
          </span>
        </div>
      </div>

      <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto">
        <div>
          <h4
            className="text-base font-medium text-[#15233E]"
            style={{ fontFamily: "'Newsreader', Georgia, serif" }}
          >
            {title}
          </h4>
        </div>

        <ul className="space-y-2.5">
          {bullets.map((b) => (
            <li key={b.label} className="text-xs leading-relaxed text-[#344054] flex gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D46] mt-1.5 shrink-0" />
              <div>
                <span className="font-semibold text-[#15233E]">{b.label}: </span>
                <span>{b.text}</span>
              </div>
            </li>
          ))}
        </ul>

        {currentStepIndex === totalSteps - 1 && (
        )}
      </div>
    </aside>
  );
}
