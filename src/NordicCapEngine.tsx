import React, { useEffect, useMemo, useState } from 'react';
import {
  Compass,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Layers,
  Play,
  Printer,
  RotateCcw,
  Scale,
  ShieldCheck,
  Sliders,
  TrendingUp,
  Users,
} from 'lucide-react';
import { WorkspaceTab } from './types';
import { useCapTable, useCapTableMetrics } from './context/CapTableContext';
import { useRecruiterDemo } from './context/RecruiterDemoContext';
import {
  createBlankScenario,
} from './constants/scenarios';
import { FAVICON_SVG_DATA_URI } from './constants/brand';
import { exportCapTableToCSV } from './utils/csvExport';
import { calculateExitWaterfall } from './engines/waterfallEngine';
import { generateLegalClauses } from './engines/ablLegalEngine';
import { BrandEmblem } from './components/ui/BrandEmblem';
import { DemoNarratorBox } from './components/demo/DemoNarratorBox';
import { DemoPlayerBar } from './components/demo/DemoPlayerBar';
import { DemoCompletionModal } from './components/demo/DemoCompletionModal';
import { AboutModal } from './components/modals/AboutModal';
import { StarterView } from './components/views/StarterView';
import { CompanySetupView } from './components/views/CompanySetupView';
import { ExecutiveTransactionMemo } from './components/memo/ExecutiveTransactionMemo';
import { CapTableTab } from './tabs/CapTableTab';
import { RoundSimulatorTab } from './tabs/RoundSimulatorTab';
import { WaterfallTab } from './tabs/WaterfallTab';
import { AblLegalTab } from './tabs/AblLegalTab';

export function NordicCapEngine() {
  const { state, dispatch, t } = useCapTable();
  const metrics = useCapTableMetrics();
  const demo = useRecruiterDemo();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const isSV = state.language === 'SV';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'NordicCap — Swedish Cap Table & VC Waterfall Engine';
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/svg+xml';
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.href = FAVICON_SVG_DATA_URI;
    }
  }, []);

  const prefClass = useMemo(
    () => state.shareClasses.find((c) => c.isPreferred) || null,
    [state.shareClasses]
  );
  const waterfallResult = useMemo(
    () => calculateExitWaterfall(state, state.company.postMoneyValuation, true),
    [state]
  );
  const legalClauses = useMemo(
    () => generateLegalClauses(state, prefClass, 75),
    [state, prefClass]
  );

  return (
    <div className="min-h-screen bg-[#F6F4EF] text-[#15233E] font-sans antialiased selection:bg-[#8C6D46]/20 selection:text-[#15233E]">
      {/* Print View for Law-firm / VC Transaction PM */}
      <div className="hidden print:block">
        <ExecutiveTransactionMemo
          state={state}
          metrics={metrics}
          waterfall={waterfallResult}
          clauses={legalClauses}
        />
      </div>

      {/* Screen View */}
      <div className="print:hidden">
        {/* Sticky Header & Navigation Container (Keeps both Top Bar & Workspace Tabs visible on scroll) */}
        <div className="sticky top-0 z-30 shadow-xs">
          {/* Top Editorial Header */}
          <header className="bg-[#15233E] text-[#FCFBF9] border-b border-[#8C6D46]/30 shadow-md">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-y-2 gap-x-2 sm:gap-x-3">
              {/* Logo & Site Name */}
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'SET_TAB', payload: 'starter' });
                  if (demo.isDemoActive) demo.exitDemo();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 group cursor-pointer focus:outline-none shrink-0"
                title="NordicCap Home (Starter Page)"
              >
                <BrandEmblem className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 transition-transform group-hover:scale-105" />
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span
                    className="text-base sm:text-lg font-bold tracking-tight text-[#FCFBF9] group-hover:text-[#D8B98E] transition-colors leading-none"
                    style={{ fontFamily: "'Newsreader', Georgia, serif" }}
                  >
                    NordicCap
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-wider uppercase rounded bg-[#8C6D46]/30 text-[#D8B98E] border border-[#8C6D46]/50 shrink-0">
                    By Alfred Stengard
                  </span>
                </div>
              </button>

              {/* Top Navigation Menu (Compact, uncluttered, visible on all screens with zero side-scroll) */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
                {/* About & Instructions Modal Launcher */}
                <button
                  type="button"
                  onClick={() => setIsAboutOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-[#1F2F4E] hover:bg-[#2A3F68] text-[#D8B98E] hover:text-white border border-[#8C6D46]/50 transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
                  title={t.howItWorksTitle}
                >
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.guideBtn || 'Guide'}</span>
                </button>

                {/* Start Over Button (Goes back to Page 1 Starter with blank clean state) */}
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'LOAD_SCENARIO', payload: createBlankScenario() });
                    dispatch({ type: 'SET_TAB', payload: 'starter' });
                    if (demo.isDemoActive) demo.exitDemo();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-[#1F2F4E] hover:bg-[#2A3F68] text-[#FCFBF9] hover:text-[#D8B98E] border border-[#8C6D46]/50 transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
                  title={t.startOverTooltip}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#D8B98E] shrink-0" />
                  <span>{t.startOverBtn || 'Start Over'}</span>
                </button>

                {/* Recruiter Demo Launcher */}
                <button
                  type="button"
                  onClick={demo.startDemo}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${demo.isDemoActive
                    ? 'bg-[#8C6D46] text-[#FCFBF9] ring-2 ring-[#D8B98E]'
                    : 'bg-[#D8B98E] hover:bg-[#C9A676] text-[#15233E]'
                    }`}
                  title={t.demoLauncher}
                >
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" strokeWidth={0} />
                  <span>{demo.isDemoActive ? (t.demoLauncherActiveShort || 'Demo Active') : (t.demoLauncherShort || '60s Demo')}</span>
                </button>

                {/* Language Switcher */}
                <div className="inline-flex rounded-full border border-[#8C6D46]/40 p-0.5 bg-[#1F2F4E] shrink-0">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: 'EN' })}
                    className={`px-2 py-0.5 text-xs font-mono font-medium rounded-full transition-colors cursor-pointer ${state.language === 'EN' ? 'bg-[#8C6D46] text-white shadow-2xs' : 'text-[#D8D1C3] hover:text-white'
                      }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: 'SV' })}
                    className={`px-2 py-0.5 text-xs font-mono font-medium rounded-full transition-colors cursor-pointer ${state.language === 'SV' ? 'bg-[#8C6D46] text-white shadow-2xs' : 'text-[#D8D1C3] hover:text-white'
                      }`}
                  >
                    SV
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Workspace Navigation Bar */}
          <nav className="bg-[#FCFBF9] border-b border-[#E5E0D5]">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-y-2 gap-x-2 sm:gap-x-4 py-1.5 sm:py-2">
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                {/* Step 1 & Step 2 */}
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_TAB', payload: 'starter' })}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${state.activeTab === 'starter'
                    ? 'bg-[#15233E] text-[#FCFBF9] shadow-xs font-semibold'
                    : 'text-[#5A6475] hover:text-[#15233E] hover:bg-[#F6F4EF]'
                    }`}
                  title={t.tabStarter}
                >
                  <Compass className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
                  <span>{t.tabStarter}</span>
                </button>

                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_TAB', payload: 'setup' })}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${state.activeTab === 'setup'
                    ? 'bg-[#15233E] text-[#FCFBF9] shadow-xs font-semibold'
                    : 'text-[#5A6475] hover:text-[#15233E] hover:bg-[#F6F4EF]'
                    }`}
                  title={isSV ? 'Sida 2: Bolagsuppgifter & Inmatning' : 'Page 2: Company Setup & Input'}
                >
                  <Users className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
                  <span>{t.tabSetup}</span>
                </button>

                <div className="h-4 w-px bg-[#E5E0D5] mx-0.5 sm:mx-1 shrink-0" />

                {/* Step 3 Analytics Suite Group */}
                <div className="flex flex-wrap items-center bg-[#F6F4EF] p-0.5 rounded-lg border border-[#E5E0D5] gap-0.5 sm:gap-1">
                  {[
                    { id: 'cap_table', label: t.tabCapTable, icon: Layers },
                    { id: 'round_sim', label: t.tabRoundSim, icon: Sliders },
                    { id: 'waterfall', label: t.tabWaterfall, icon: TrendingUp },
                    { id: 'abl_legal', label: t.tabAblLegal, icon: Scale },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = state.activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id as WorkspaceTab })}
                        className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all cursor-pointer ${isActive
                          ? 'bg-[#15233E] text-[#FCFBF9] shadow-xs font-semibold'
                          : 'text-[#5A6475] hover:text-[#15233E] hover:bg-white/60'
                          }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Actions on Step 3 analytics views */}
              {['cap_table', 'round_sim', 'waterfall', 'abl_legal'].includes(state.activeTab) && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => exportCapTableToCSV(state, metrics)}
                    title={t.exportCsv}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-sans font-medium text-[#15233E] bg-[#F6F4EF] hover:bg-[#E5E0D5] border border-[#D8D1C3] transition-colors cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-[#8C6D46] shrink-0" strokeWidth={1.8} />
                    <span>{t.exportCsvShort || 'CSV'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    title={t.printMemo}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-sans font-medium text-[#15233E] bg-[#F6F4EF] hover:bg-[#E5E0D5] border border-[#D8D1C3] transition-colors cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#8C6D46] shrink-0" strokeWidth={1.8} />
                    <span>{t.printMemoShort || 'Print'}</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Workspace Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
          {state.activeTab === 'starter' && <StarterView />}
          {state.activeTab === 'setup' && <CompanySetupView />}
          {state.activeTab === 'cap_table' && <CapTableTab />}
          {state.activeTab === 'round_sim' && <RoundSimulatorTab />}
          {state.activeTab === 'waterfall' && <WaterfallTab />}
          {state.activeTab === 'abl_legal' && <AblLegalTab />}
        </main>

        {/* Institutional Footer */}
        <footer className="bg-[#15233E] text-[#FCFBF9] border-t border-[#8C6D46]/40 mt-12 pb-24 sm:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-8 border-b border-[#8C6D46]/30">
              {/* Brand & Creator Column */}
              <div className="md:col-span-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <BrandEmblem className="w-7 h-7 shrink-0" />
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xl font-bold tracking-tight text-[#FCFBF9]"
                      style={{ fontFamily: "'Newsreader', Georgia, serif" }}
                    >
                      NordicCap
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded bg-[#8C6D46]/30 text-[#D8B98E] border border-[#8C6D46]/50">
                      By Alfred Stengard
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#D8D1C3] leading-relaxed max-w-md">
                  {isSV
                    ? 'Specialiserat finansiellt & legalt modelleringsverktyg för svenska aktiebolag (AB). Konstruerat för grundare, VC-investerare och affärsjurister med strikt efterlevnad av Aktiebolagslagen (ABL 2005:551).'
                    : 'Specialized financial & legal modeling platform for Swedish private limited companies (AB). Engineered for founders, venture investors, and legal counsel with rigorous compliance under the Swedish Companies Act (ABL 2005:551).'}
                </p>

                {/* Creator Social / Profile Links */}
                <div className="pt-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#D8B98E] mb-2 font-semibold">
                    {isSV ? 'Skapad av Alfred Stengård:' : 'Created by Alfred Stengard:'}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href="https://github.com/AStengard/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FCFBF9] bg-[#1F2F4E] hover:bg-[#2A3F68] hover:text-[#D8B98E] border border-[#8C6D46]/40 rounded-md transition-colors"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="w-3 h-3 text-[#D8B98E]" strokeWidth={1.6} />
                    </a>
                    <a
                      href="https://linkedin.com/in/alfredstengard/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FCFBF9] bg-[#1F2F4E] hover:bg-[#2A3F68] hover:text-[#D8B98E] border border-[#8C6D46]/40 rounded-md transition-colors"
                    >
                      <span>LinkedIn</span>
                      <ExternalLink className="w-3 h-3 text-[#D8B98E]" strokeWidth={1.6} />
                    </a>
                    <a
                      href="https://astengard.github.io/cv/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FCFBF9] bg-[#1F2F4E] hover:bg-[#2A3F68] hover:text-[#D8B98E] border border-[#8C6D46]/40 rounded-md transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#D8B98E]" strokeWidth={1.7} />
                      <span>Digital CV</span>
                      <ExternalLink className="w-3 h-3 text-[#D8B98E]" strokeWidth={1.6} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Statutory Guardrails & Compliance Column */}
              <div className="md:col-span-4 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#D8B98E] font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#D8B98E]" />
                  <span>{isSV ? 'Juridiska Ramverk & ABL' : 'Legal Engine & Statutory Rules'}</span>
                </h4>
                <ul className="space-y-2 text-xs text-[#D8D1C3]">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D46] mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-white font-medium">{isSV ? 'ABL 2005:551:' : 'Companies Act (ABL):'}</strong>{' '}
                      {isSV
                        ? 'Fullständig integration med svensk bolagsrätt och Bolagsverket-standarder.'
                        : 'Full statutory alignment with Swedish company law and corporate registry standards.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D46] mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-white font-medium">{isSV ? 'Leo-lagen (16 kap. ABL):' : 'Leo Act (Ch. 16):'}</strong>{' '}
                      {isSV
                        ? '90 % kvalificerad röstmajoritet vid emission av personalwarranter.'
                        : '90% qualified supermajority required for insider warrant programs.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D46] mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-white font-medium">{isSV ? 'Max 10:1 Röstvärdestak (4:5 ABL):' : 'Max 10:1 Voting Ratio Cap (Ch. 4 § 5):'}</strong>{' '}
                      {isSV
                        ? 'Inget aktieslag får överstiga tio gånger röstvärdet för annat aktieslag.'
                        : 'No share class may carry voting rights exceeding 10x that of any other.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D46] mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-white font-medium">ESOP Solver:</strong>{' '}
                      {isSV
                        ? 'Numerisk lösare för pre-money cirkulära optionstilldelningar.'
                        : 'Numerical solver for iterative pre-money option pool shuffles.'}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Navigation & Fast Links Column */}
              <div className="md:col-span-3 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#D8B98E] font-semibold flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#D8B98E]" />
                  <span>{isSV ? 'Navigering' : 'Navigation'}</span>
                </h4>

                <div className="flex flex-col gap-2 text-xs text-[#D8D1C3]">
                  <button
                    type="button"
                    onClick={() => setIsAboutOpen(true)}
                    className="inline-flex items-center gap-1.5 text-left hover:text-[#D8B98E] transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#D8B98E]" />
                    <span>{isSV ? 'Interaktiv användarguide' : 'Interactive User Guide'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={demo.startDemo}
                    className="inline-flex items-center gap-1.5 text-left hover:text-[#D8B98E] transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-[#D8B98E]" />
                    <span>{isSV ? 'Starta 60s rekryteringsdemo' : 'Start 60s Guided Demo'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Disclaimer & Copyright */}
            <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#A4ADC0]">
              <div className="flex flex-wrap items-center gap-2 text-center md:text-left">
                <span>© {new Date().getFullYear()} NordicCap.</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-[#D8B98E] font-medium">By Alfred Stengard</span>
                <span className="hidden sm:inline">•</span>
                <span>
                  {isSV
                    ? 'Byggd för svenska tillväxtbolag & VC-transaktioner'
                    : 'Built for Swedish venture transactions'}
                </span>
              </div>

              <div className="text-[11px] font-mono text-[#7A8291]">
                Aktiebolagslagen (2005:551) • Swedish Jurisdiction
              </div>
            </div>
          </div>
        </footer>

        {/* Global Demo & About Overlays */}
        <DemoNarratorBox />
        <DemoPlayerBar />
        <DemoCompletionModal />
        <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      </div>
    </div>
  );
}
