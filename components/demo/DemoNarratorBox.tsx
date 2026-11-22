import React from 'react';
import { Check, Compass, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { useCapTable } from '../../context/CapTableContext';
import { useRecruiterDemo } from '../../context/RecruiterDemoContext';

export function DemoNarratorBox() {
  const { state, t } = useCapTable();
  const { isDemoActive, currentStep, currentStepIndex, totalSteps, isStepReady } =
    useRecruiterDemo();

  if (!isDemoActive) return null;

  const isSV = state.language === 'SV';
  const title = isSV ? currentStep.titleSV : currentStep.titleEN;
  const actionLabel = isSV ? currentStep.actionLabelSV : currentStep.actionLabelEN;
  const bullets = isSV ? currentStep.bulletsSV : currentStep.bulletsEN;

  return (
    <aside
      aria-label="Recruiter Walkthrough Commentary"
      className="no-print fixed bottom-24 left-4 sm:left-6 z-40 w-[calc(100vw-2rem)] sm:w-[390px] bg-[#FCFBF9]/95 backdrop-blur-md border border-[#D8D1C3] rounded-xl shadow-2xl overflow-hidden"
    >
      <div className="px-4 py-3 bg-[#15233E] text-[#FCFBF9] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Compass className="w-4 h-4 text-[#D8B98E] shrink-0" strokeWidth={1.7} />
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#D8B98E] truncate">
            {t.demoStepOf} {currentStepIndex + 1} {t.demoOf} {totalSteps} — {t.demoWhyItMatters}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono shrink-0 ${
            isStepReady
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
              : 'bg-[#8C6D46]/30 text-[#F3DFC1] border border-[#8C6D46]/50'
          }`}
        >
          {isStepReady ? (
            <>
              <Check className="w-3 h-3" strokeWidth={2.2} />
              {t.demoStepReady}
            </>
          ) : (
            <>
              <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
              Live
            </>
          )}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h4
            className="text-base font-medium text-[#15233E]"
            style={{ fontFamily: "'Newsreader', Georgia, serif" }}
          >
            {title}
          </h4>
          {!isStepReady && <p className="text-[11px] font-mono text-[#8C6D46] mt-1">{actionLabel}</p>}
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
          <div className="pt-2.5 border-t border-[#E5E0D5] space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C6D46] font-semibold block">
              {isSV ? 'Projekt & Kontakt (Alfred Stengård):' : 'Connect & Author (Alfred Stengård):'}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <a
                href="https://github.com/AStengard/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#15233E] bg-[#F6F4EF] hover:bg-[#E5E0D5] rounded border border-[#D8D1C3] transition-colors"
              >
                <span>GitHub</span>
                <ExternalLink className="w-2.5 h-2.5 text-[#5A6475]" />
              </a>
              <a
                href="https://linkedin.com/in/alfredstengard/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#15233E] bg-[#F6F4EF] hover:bg-[#E5E0D5] rounded border border-[#D8D1C3] transition-colors"
              >
                <span>LinkedIn</span>
                <ExternalLink className="w-2.5 h-2.5 text-[#5A6475]" />
              </a>
              <a
                href="https://astengard.github.io/cv/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#15233E] bg-[#F6F4EF] hover:bg-[#E5E0D5] rounded border border-[#D8D1C3] transition-colors"
              >
                <FileText className="w-2.5 h-2.5 text-[#8C6D46]" />
                <span>Digital CV</span>
                <ExternalLink className="w-2.5 h-2.5 text-[#5A6475]" />
              </a>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
