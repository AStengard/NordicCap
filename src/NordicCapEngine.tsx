import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Compass,
  Download,
  HelpCircle,
  Layers,
  Play,
  Printer,
  RotateCcw,
  Scale,
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
import { formatSEK } from './utils/formatters';
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
        <nav className="bg-[#FCFBF9] border-b border-[#E5E0D5] sticky top-0 z-30 shadow-xs">
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

        {/* Workspace Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
          {state.activeTab === 'starter' && <StarterView />}
          {state.activeTab === 'setup' && <CompanySetupView />}
          {state.activeTab === 'cap_table' && <CapTableTab />}
          {state.activeTab === 'round_sim' && <RoundSimulatorTab />}
          {state.activeTab === 'waterfall' && <WaterfallTab />}
          {state.activeTab === 'abl_legal' && <AblLegalTab />}
        </main>

        {/* Global Demo & About Overlays */}
        <DemoNarratorBox />
        <DemoPlayerBar />
        <DemoCompletionModal />
        <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      </div>
    </div>
  );
}
