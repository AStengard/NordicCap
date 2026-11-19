import React, { useEffect } from 'react';
import {
  ArrowRight,
  BookOpen,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronRight,
  FileText,
  HelpCircle,
  Layers,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Scale,
  Sliders,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useCapTable } from '../../context/CapTableContext';
import { useRecruiterDemo } from '../../context/RecruiterDemoContext';
import { createBlankScenario, createPreSeriesAScenario } from '../../constants/scenarios';
import { BrandEmblem } from '../ui/BrandEmblem';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { state, dispatch } = useCapTable();
  const demo = useRecruiterDemo();
  const isSV = state.language === 'SV';

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-3xl bg-[#FCFBF9] text-[#15233E] border border-[#D8D1C3] rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#15233E] text-[#FCFBF9] px-6 py-5 border-b border-[#8C6D46]/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <BrandEmblem className="w-8 h-8 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="text-lg font-bold text-[#FCFBF9]"
                  style={{ fontFamily: "'Newsreader', Georgia, serif" }}
                >
                  {isSV ? 'Hur du använder NordicCap' : 'How to use NordicCap'}
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-mono tracking-wider uppercase rounded bg-[#8C6D46]/30 text-[#D8B98E] border border-[#8C6D46]/50">
                  ABL 2005:551
                </span>
              </div>
              <p className="text-xs text-[#D8D1C3] mt-0.5">
                {isSV
                  ? 'Steg-för-steg-guide: Från inmatning av bolagsuppgifter till nyemission och exit-waterfall'
                  : 'Step-by-step guide: From entering company info to modeling equity rounds & exit waterfalls'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#D8D1C3] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm">
          {/* Section 1: The 3-Step Journey */}
          <div>
            <h3 className="font-semibold text-base text-[#15233E] mb-3">
              {isSV ? 'Strukturen i 3 steg' : 'The 3-Step Structure'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Step 1 */}
              <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#15233E] text-[#D8B98E] flex items-center justify-center font-mono font-bold text-xs">
                    1
                  </span>
                  <span className="text-[10px] font-mono text-[#8C6D46] uppercase tracking-wider font-semibold">
                    {isSV ? 'Start' : 'Starter'}
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-[#15233E]">
                  {isSV ? 'Startsida (Välj väg)' : 'Starter Page (Choose Path)'}
                </h4>
                <p className="text-[11px] text-[#5A6475] leading-relaxed">
                  {isSV
                    ? 'Välj om du vill bygga din egen aktiebok från grunden eller se den 60s guidade demon.'
                    : 'Choose whether you want to build your own cap table or watch the 60s guided demo.'}
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#F3EFE6] border-2 border-[#8C6D46] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#8C6D46] text-[#FCFBF9] flex items-center justify-center font-mono font-bold text-xs">
                    2
                  </span>
                  <span className="text-[10px] font-mono text-[#8C6D46] uppercase tracking-wider font-semibold">
                    {isSV ? 'Inmatning' : 'Input Hub'}
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-[#15233E]">
                  {isSV ? 'Bolagsuppgifter (Sida 2)' : 'Company Setup (Page 2)'}
                </h4>
                <p className="text-[11px] text-[#5A6475] leading-relaxed">
                  {isSV
                    ? 'Här matar du in all information: bolagsnamn, aktiekapital, Stam A/B och alla aktieägare.'
                    : 'Where you add all info: company name, share capital, Class A/B, and shareholders.'}
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#15233E] text-[#D8B98E] flex items-center justify-center font-mono font-bold text-xs">
                    3
                  </span>
                  <span className="text-[10px] font-mono text-[#8C6D46] uppercase tracking-wider font-semibold">
                    {isSV ? 'Analys' : 'Analytics'}
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-[#15233E]">
                  {isSV ? 'Aktiebok & Analys (Sida 3+)' : 'Cap Table & Analytics (Page 3+)'}
                </h4>
                <p className="text-[11px] text-[#5A6475] leading-relaxed">
                  {isSV
                    ? 'Granska lagstadgad aktiebok, simulera nyemissioner, testa exit-vattenfall och ABL-klausuler.'
                    : 'Review the legal ledger, simulate funding rounds, drag the exit slider, and inspect ABL clauses.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: How to Add Your Own Information */}
          <div className="bg-white border border-[#E5E0D5] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-[#15233E]">
              <div className="w-7 h-7 rounded-full bg-[#8C6D46] text-[#FCFBF9] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm">
                {isSV
                  ? 'Hur lägger jag in mitt eget bolag och mina aktieägare?'
                  : 'How do I input my own company and shareholders?'}
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-[#495264] leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#15233E]/10 text-[#15233E] font-bold font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-[#15233E]">
                    {isSV ? 'Gå till "Bolagsuppgifter" (Sida 2)' : 'Go to "Company Setup" (Page 2)'}
                  </strong>
                  : {isSV
                    ? 'Klicka på "Bolagsuppgifter" i toppmenyn eller på startsidan. Skriv in ditt bolagsnamn, organisationsnummer och aktiekapital (minst 25 000 SEK enligt ABL 1:5).'
                    : 'Click "Company Setup" in the top bar or starter page. Enter your company legal name, org number, and share capital (min 25,000 SEK per ABL 1:5).'}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#15233E]/10 text-[#15233E] font-bold font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-[#15233E]">
                    {isSV ? 'Klicka på "+ Lägg till aktieägare"' : 'Click "+ Add Shareholder"'}
                  </strong>
                  : {isSV
                    ? 'Lägg till grundare, anställda, ängelinvesterare eller VC. Välj aktieslag (t.ex. Stam A med 10 röster eller Stam B med 1 röst), antal aktier och investerat kapital.'
                    : 'Add founders, employees, angel investors, or VC funds. Choose their share class (Class A 10 votes, Class B 1 vote), share count, and invested capital.'}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#15233E]/10 text-[#15233E] font-bold font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-[#15233E]">
                    {isSV ? 'Klicka på "Gå till aktiebok & analys"' : 'Click "Proceed to Cap Table & Analytics"'}
                  </strong>
                  : {isSV
                    ? 'När dina uppgifter är inlagda navigerar du vidare till analyssidorna för att se ägarandelar, exportera CSV eller skriva ut ett färdigt transaktions-PM.'
                    : 'Once your details are entered, proceed to the analysis views to review ownership, export an Excel CSV, or print a transaction memo.'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: The 4 Analytics Views (Page 3 and beyond) */}
          <div>
            <h3 className="font-semibold text-base text-[#15233E] mb-3">
              {isSV ? 'Översikt över analysflikarna (Sida 3+)' : 'Overview of Analytics Tabs (Page 3 and beyond)'}
            </h3>

            <div className="space-y-3">
              {/* Tab 1 */}
              <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 shadow-2xs flex gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#15233E]/10 text-[#15233E] flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-xs text-[#15233E]">
                    {isSV ? '1. Aktiebok & Ägande (Share Register)' : '1. Cap Table & Ownership (Aktiebok)'}
                  </h4>
                  <p className="text-xs text-[#5A6475] leading-relaxed">
                    {isSV
                      ? 'Den officiella aktieboken enligt 5 kap. ABL. Visar kapitalandel vs. röstandel, kontrollerar 10:1-röstvärdestaket (4 kap. 5 § ABL), exporterar till CSV och skapar utskriftsanpassat transaktions-PM.'
                      : 'The statutory share register under Chapter 5 ABL. Compares economic ownership vs. voting control, validates the 10:1 voting ratio ceiling, and generates CSV / PDF exports.'}
                  </p>
                </div>
              </div>

              {/* Tab 2 */}
              <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 shadow-2xs flex gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#8C6D46]/10 text-[#8C6D46] flex items-center justify-center shrink-0 mt-0.5">
                  <Sliders className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-xs text-[#15233E]">
                    {isSV ? '2. Emissionssimulator (Round Simulator)' : '2. Financing Round Simulator (Nyemission)'}
                  </h4>
                  <p className="text-xs text-[#5A6475] leading-relaxed">
                    {isSV
                      ? 'Modellerar en investeringsrunda (t.ex. Seed eller Serie A). Löser cirkulär pre-money optionspool-top-up, konverterar K-lån och låter dig verkställa rundan direkt in i aktieboken.'
                      : 'Models financing rounds (Seed, Series A). Solves circular pre-money ESOP shuffle math, converts convertible notes, and lets you commit the round to the cap table.'}
                  </p>
                </div>
              </div>

              {/* Tab 3 */}
              <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 shadow-2xs flex gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#3B5984]/10 text-[#3B5984] flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-xs text-[#15233E]">
                    {isSV ? '3. Exit Waterfall (Likvidationspreferens)' : '3. Exit Waterfall (Liquidation Preferences)'}
                  </h4>
                  <p className="text-xs text-[#5A6475] leading-relaxed">
                    {isSV
                      ? 'Simulerar vem som får vad vid försäljning av bolaget. Dra exit-reglaget från 0 till 300+ MSEK för att se senioritetsordning, 1x preferensutdelning och brytpunkten för konvertering.'
                      : 'Simulates who gets paid what in an acquisition. Drag the exit slider from 0 to 300+ MSEK to see seniority tiers, 1x preference returns, and the common conversion point.'}
                  </p>
                </div>
              </div>

              {/* Tab 4 */}
              <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 shadow-2xs flex gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#5C6F68]/10 text-[#5C6F68] flex items-center justify-center shrink-0 mt-0.5">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-xs text-[#15233E]">
                    {isSV ? '4. ABL Juridik & Klausuler (Compliance & SHA)' : '4. ABL Legal & Clause Drafting (Aktiebolagslagen)'}
                  </h4>
                  <p className="text-xs text-[#5A6475] leading-relaxed">
                    {isSV
                      ? 'Kontrollerar Leo-lagen (16 kap. ABL, 90% majoritet för personaloptioner), sammanställer Bolagsverkets 6 registreringsdokument och live-skriver aktieägaravtalets klausuler.'
                      : 'Enforces Leo-lagen (Ch. 16 ABL, 90% voting supermajority for employee options), prepares the 6-document Bolagsverket filing package, and drafts SHA clauses.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#F6F4EF] border-t border-[#E5E0D5] px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'LOAD_SCENARIO', payload: createBlankScenario() });
                dispatch({ type: 'SET_TAB', payload: 'setup' });
                onClose();
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#15233E] hover:bg-[#1E3156] rounded-md transition-colors"
            >
              {isSV ? 'Gå till inmatning (Sida 2)' : 'Go to Company Setup (Page 2)'}
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'LOAD_SCENARIO', payload: createPreSeriesAScenario() });
                dispatch({ type: 'SET_TAB', payload: 'cap_table' });
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-medium text-[#5A6475] hover:text-[#15233E] hover:bg-white rounded-md transition-colors"
            >
              {isSV ? 'Ladda exempelbolag' : 'Load Sample Venture'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                demo.startDemo();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#8C6D46] hover:bg-[#A38054] text-white transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" strokeWidth={0} />
              <span>{isSV ? 'Starta 60s Demo' : 'Launch 60s Tour'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-[#15233E] bg-[#E5E0D5] hover:bg-[#D8D1C3] rounded-md transition-colors"
            >
              {isSV ? 'Stäng' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
