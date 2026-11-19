import React, { useEffect, useMemo } from 'react';
import { Download, Layers, Play, Printer, Scale, Sliders, TrendingUp } from 'lucide-react';
import { WorkspaceTab } from './types';
import { useCapTable, useCapTableMetrics } from './context/CapTableContext';
import { useRecruiterDemo } from './context/RecruiterDemoContext';
import { createPreSeriesAScenario, createSeriesARecruiterDemoScenario } from './constants/scenarios';
import { FAVICON_SVG_DATA_URI } from './constants/brand';
import { formatSEK } from './utils/formatters';
import { exportCapTableToCSV } from './utils/csvExport';
import { calculateExitWaterfall } from './engines/waterfallEngine';
import { generateLegalClauses } from './engines/ablLegalEngine';
import { BrandEmblem } from './components/ui/BrandEmblem';
import { DemoNarratorBox } from './components/demo/DemoNarratorBox';
import { DemoPlayerBar } from './components/demo/DemoPlayerBar';
import { DemoCompletionModal } from './components/demo/DemoCompletionModal';
import { ExecutiveTransactionMemo } from './components/memo/ExecutiveTransactionMemo';
import { CapTableTab } from './tabs/CapTableTab';
import { RoundSimulatorTab } from './tabs/RoundSimulatorTab';
import { WaterfallTab } from './tabs/WaterfallTab';
import { AblLegalTab } from './tabs/AblLegalTab';

export function NordicCapEngine() {
  const { state, dispatch, t } = useCapTable();
  const metrics = useCapTableMetrics();
  const demo = useRecruiterDemo();

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandEmblem className="w-8 h-8 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    className="text-xl font-bold tracking-tight text-[#FCFBF9]"
                    style={{ fontFamily: "'Newsreader', Georgia, serif" }}
                  >
                    NordicCap
                  </h1>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-wider uppercase rounded bg-[#8C6D46]/30 text-[#D8B98E] border border-[#8C6D46]/50">
                    ABL 2005:551
                  </span>
                </div>
                <p className="text-xs text-[#D8D1C3] hidden sm:block mt-0.5">{t.appSubtitle}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Recruiter Demo Launcher */}
              <button
                type="button"
                onClick={demo.startDemo}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full shadow-md transition-all ${
                  demo.isDemoActive
                    ? 'bg-[#8C6D46] text-[#FCFBF9] ring-2 ring-[#D8B98E]'
                    : 'bg-[#D8B98E] hover:bg-[#C9A676] text-[#15233E]'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" strokeWidth={0} />
                <span>{demo.isDemoActive ? t.demoLauncherActive : t.demoLauncher}</span>
              </button>

              {/* Scenario Quick Loaders */}
              <div className="hidden lg:flex items-center gap-1.5 bg-[#1F2F4E] p-1 rounded-md border border-[#8C6D46]/30">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'LOAD_SCENARIO', payload: createPreSeriesAScenario() })}
                  className="px-2.5 py-1 text-[11px] text-[#D8D1C3] hover:text-white rounded hover:bg-[#FCFBF9]/10"
                >
                  {t.resetPreSeriesA}
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'LOAD_SCENARIO', payload: createSeriesARecruiterDemoScenario() })}
                  className="px-2.5 py-1 text-[11px] text-[#D8D1C3] hover:text-white rounded hover:bg-[#FCFBF9]/10"
                >
                  {t.loadRecruiterDemo}
                </button>
              </div>

              {/* Language Switcher */}
              <div className="inline-flex rounded-md border border-[#8C6D46]/40 p-0.5 bg-[#1F2F4E]">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: 'EN' })}
                  className={`px-2 py-0.5 text-xs font-mono font-medium rounded transition-colors ${
                    state.language === 'EN' ? 'bg-[#8C6D46] text-white' : 'text-[#D8D1C3] hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: 'SV' })}
                  className={`px-2 py-0.5 text-xs font-mono font-medium rounded transition-colors ${
                    state.language === 'SV' ? 'bg-[#8C6D46] text-white' : 'text-[#D8D1C3] hover:text-white'
                  }`}
                >
                  SV
                </button>
              </div>

              {/* CSV Export & Print */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => exportCapTableToCSV(state, metrics)}
                  title={t.exportCsv}
                  className="p-1.5 rounded text-[#D8D1C3] hover:text-white hover:bg-[#FCFBF9]/10 border border-[#8C6D46]/30"
                  aria-label={t.exportCsv}
                >
                  <Download className="w-3.5 h-3.5" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  title={t.printMemo}
                  className="p-1.5 rounded text-[#D8D1C3] hover:text-white hover:bg-[#FCFBF9]/10 border border-[#8C6D46]/30"
                  aria-label={t.printMemo}
                >
                  <Printer className="w-3.5 h-3.5" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Workspace Navigation Bar */}
        <nav className="bg-[#FCFBF9] border-b border-[#E5E0D5] sticky top-0 z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto">
            <div className="flex space-x-1 sm:space-x-4 py-2">
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
                    className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-[#15233E] text-[#FCFBF9] shadow-xs'
                        : 'text-[#5A6475] hover:text-[#15233E] hover:bg-[#F6F4EF]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-3 text-xs font-mono text-[#5A6475] py-2 shrink-0">
              <span>{state.company.name}</span>
              <span className="text-[#D8D1C3]">|</span>
              <span>Aktiekapital: {formatSEK(state.company.shareCapital)}</span>
            </div>
          </div>
        </nav>

        {/* Workspace Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
          {state.activeTab === 'cap_table' && <CapTableTab />}
          {state.activeTab === 'round_sim' && <RoundSimulatorTab />}
          {state.activeTab === 'waterfall' && <WaterfallTab />}
          {state.activeTab === 'abl_legal' && <AblLegalTab />}
        </main>

        {/* Global Demo Overlays */}
        <DemoNarratorBox />
        <DemoPlayerBar />
        <DemoCompletionModal />
      </div>
    </div>
  );
}
