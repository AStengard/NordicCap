import React from 'react';
import { Check, CheckCircle2, ExternalLink, Globe, RotateCcw, X } from 'lucide-react';
import { useCapTable } from '../../context/CapTableContext';
import { useRecruiterDemo } from '../../context/RecruiterDemoContext';
import { BrandEmblem } from '../ui/BrandEmblem';

export function DemoCompletionModal() {
  const { state, t } = useCapTable();
  const { isCompleted, exitDemo, restartDemo } = useRecruiterDemo();

  if (!isCompleted) return null;
  const isSV = state.language === 'SV';

  const achievements = isSV
    ? [
        'Sida 2: Bolagsregistrering (25k+ SEK aktiekapital) och direkt inmatning av grundare och aktieslag verifierad.',
        'Aktiebok (10:1 Stam A/B), aktiva K-lan och ESOP-pool verifierade enligt ABL 4 kap. 5 §.',
        'Serie A-emission simulerad med cirkular Pre-Money ESOP-top-up och K-lan-konvertering.',
        'Exit Waterfall utvarderad over 15–120 MSEK med automatisk preferenskonvertering och in-the-money-optioner.',
        '16 kap. ABL (Leo-lagen 9/10-majoritet) och Bolagsverkets registreringshandlingar kontrollerade.',
        'Dynamiska klausuler (SHA & Bolagsordning), Excel CSV-export och juridiskt transaktions-PM bekraftade.',
      ]
    : [
        'Page 2: Swedish company registration (25k+ SEK capital) and live founder data entry verified.',
        'Dual-class Aktiebok (10:1 Class A/B), K-lan notes, and ESOP warrants validated under ABL 4 kap. 5 §.',
        'Series A round modeled with circular Pre-Money ESOP shuffle and K-lan conversion.',
        'Equilibrium Exit Waterfall swept across 15–120 MSEK showing rational preferred conversion and ITM warrants.',
        '16 kap. ABL (Leo-lagen 9/10 majority) and Bolagsverket corporate filing dossier verified live.',
        'Live Clause-to-Math SHA/Bolagsordning drafting, Excel CSV export, and PDF transaction brief confirmed.',
      ];

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#15233E]/40 backdrop-blur-[2px]" onClick={exitDemo} />
      <div className="relative z-10 w-full max-w-xl bg-[#FCFBF9] border border-[#E5E0D5] rounded-xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 bg-[#15233E] text-[#FCFBF9] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <BrandEmblem className="w-10 h-10 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#D8B98E]">
                {t.demoCompleteEyebrow}
              </div>
              <h3
                className="text-xl font-medium text-[#FCFBF9] mt-0.5"
                style={{ fontFamily: "'Newsreader', Georgia, serif" }}
              >
                {t.demoCompleteTitle}
              </h3>
            </div>
          </div>
          <button type="button" onClick={exitDemo} aria-label={t.ablClose} className="p-1 text-[#D8D1C3] hover:text-white">
            <X className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-[#495264] leading-relaxed">{t.demoCompleteSubtitle}</p>

          <div className="bg-[#F6F4EF] border border-[#E5E0D5] rounded-lg p-4 space-y-2.5">
            {achievements.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-[#15233E]">
                <CheckCircle2 className="w-4 h-4 text-[#3B5B4A] shrink-0 mt-0.5" strokeWidth={1.8} />
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={exitDemo}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#15233E] hover:bg-[#1E3156] text-[#FCFBF9] rounded-md transition-colors"
            >
              <Check className="w-4 h-4 text-[#D8B98E]" strokeWidth={2} />
              {t.demoExploreFreely}
            </button>
            <button
              type="button"
              onClick={restartDemo}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#F6F4EF] hover:bg-[#ECE7DC] text-[#15233E] border border-[#D8D1C3] rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#8C6D46]" strokeWidth={1.8} />
              {t.demoReplay}
            </button>
          </div>

          <div className="pt-4 border-t border-[#E5E0D5] flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#667085]">
              {t.demoConnectLabel}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#15233E] bg-white hover:bg-[#F6F4EF] border border-[#E5E0D5] rounded-md"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-[#7A8291]" strokeWidth={1.6} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#15233E] bg-white hover:bg-[#F6F4EF] border border-[#E5E0D5] rounded-md"
              >
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-[#7A8291]" strokeWidth={1.6} />
              </a>
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#15233E] bg-white hover:bg-[#F6F4EF] border border-[#E5E0D5] rounded-md"
              >
                <Globe className="w-3.5 h-3.5 text-[#8C6D46]" strokeWidth={1.7} />
                <span>Portfolio</span>
                <ExternalLink className="w-3 h-3 text-[#7A8291]" strokeWidth={1.6} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
