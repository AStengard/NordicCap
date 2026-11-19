import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Layers,
  Pencil,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sliders,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useCapTable } from '../../context/CapTableContext';
import { useRecruiterDemo } from '../../context/RecruiterDemoContext';
import { createBlankScenario, createPreSeriesAScenario } from '../../constants/scenarios';
import { WorkspaceTab } from '../../types';
import { BrandEmblem } from '../ui/BrandEmblem';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GuideTab = 'overview' | 'step1' | 'step2' | 'step3';

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { state, dispatch } = useCapTable();
  const demo = useRecruiterDemo();
  const isSV = state.language === 'SV';

  const [activeGuideTab, setActiveGuideTab] = useState<GuideTab>('overview');

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

  const navigateToTab = (tab: WorkspaceTab) => {
    dispatch({ type: 'SET_TAB', payload: tab });
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-4xl bg-[#FCFBF9] text-[#15233E] border border-[#D8D1C3] rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#15233E] text-[#FCFBF9] px-6 py-4 sm:py-5 border-b border-[#8C6D46]/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <BrandEmblem className="w-8 h-8 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="text-lg sm:text-xl font-bold text-[#FCFBF9]"
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
                  ? 'Steg-för-steg-guide: Klicka på valfri sida nedan för att hoppa direkt till den vyn i appen'
                  : 'Interactive user guide: Click any step below to jump directly to that page in NordicCap'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#D8D1C3] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-Page Navigation Tabs */}
        <div className="bg-[#1F2F4E] px-6 py-2.5 border-b border-[#8C6D46]/30 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#D8B98E] mr-1 hidden sm:inline">
              {isSV ? 'Välj sida:' : 'Guide Page:'}
            </span>

            {[
              { id: 'overview', label: isSV ? 'Översikt (Alla 3 steg)' : 'Overview (All 3 Steps)', icon: BookOpen },
              { id: 'step1', label: isSV ? 'Sida 1: Startsida' : 'Page 1: Starter', icon: Compass },
              { id: 'step2', label: isSV ? 'Sida 2: Bolagsuppgifter' : 'Page 2: Company Setup', icon: Users },
              { id: 'step3', label: isSV ? 'Sida 3: Aktiebok & Analys' : 'Page 3: Cap Table & Analytics', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeGuideTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveGuideTab(tab.id as GuideTab)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#8C6D46] text-white shadow-xs font-semibold'
                      : 'text-[#D8D1C3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-[#D8D1C3] font-mono hidden md:block">
            {isSV ? 'Klicka på ett kort för att gå till sidan' : 'Click any card to open that view'}
          </div>
        </div>

        {/* Modal Body with Tabbed Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm flex-1">
          {/* TAB 1: OVERVIEW OF ALL 3 STEPS */}
          {activeGuideTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-base text-[#15233E]">
                    {isSV ? 'De 3 stegen i NordicCap' : 'The 3 Main Steps in NordicCap'}
                  </h3>
                  <span className="text-xs text-[#8C6D46] font-medium">
                    {isSV ? 'Klicka på en ruta för att öppna den sidan' : 'Click any box to jump directly to that page'}
                  </span>
                </div>
                <p className="text-xs text-[#5A6475] mb-4">
                  {isSV
                    ? 'NordicCap är uppdelat i en linjär, pedagogisk process så att du enkelt kan skapa din egen aktiebok och göra VC-analyser.'
                    : 'NordicCap is organized into a clean 3-step workflow so you can build your legal ledger and run equity modeling.'}
                </p>

                {/* 3 Step Interactive Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Step 1 Card */}
                  <div
                    onClick={() => navigateToTab('starter')}
                    className="bg-white border-2 border-[#E5E0D5] hover:border-[#15233E] rounded-xl p-5 space-y-3 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="w-7 h-7 rounded-full bg-[#15233E] text-[#D8B98E] flex items-center justify-center font-mono font-bold text-xs">
                          1
                        </span>
                        <span className="text-[10px] font-mono text-[#8C6D46] uppercase tracking-wider font-semibold">
                          {isSV ? 'Steg 1' : 'Step 1'}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-[#15233E] group-hover:text-[#8C6D46] transition-colors flex items-center justify-between">
                        <span>{isSV ? 'Startsida (Välj väg)' : 'Starter Page (Choose Path)'}</span>
                        <ChevronRight className="w-4 h-4 text-[#8C6D46] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-xs text-[#5A6475] leading-relaxed">
                        {isSV
                          ? 'Välj mellan att skapa din egen aktiebok från grunden eller titta på den 60s guidade demon.'
                          : 'Choose between building your cap table from scratch or watching the 60s tour.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E5E0D5]/70 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveGuideTab('step1');
                        }}
                        className="text-[11px] text-[#8C6D46] hover:underline font-medium"
                      >
                        {isSV ? 'Läs guide →' : 'Read guide →'}
                      </button>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-[#15233E] text-white rounded group-hover:bg-[#1E3156] transition-colors">
                        <span>{isSV ? 'Öppna Sida 1' : 'Open Page 1'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Step 2 Card */}
                  <div
                    onClick={() => navigateToTab('setup')}
                    className="bg-[#FCFAF6] border-2 border-[#8C6D46] rounded-xl p-5 space-y-3 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="w-7 h-7 rounded-full bg-[#8C6D46] text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                          2
                        </span>
                        <span className="text-[10px] font-mono text-[#8C6D46] uppercase tracking-wider font-semibold">
                          {isSV ? 'Steg 2 • Inmatning' : 'Step 2 • Input Hub'}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-[#15233E] group-hover:text-[#8C6D46] transition-colors flex items-center justify-between">
                        <span>{isSV ? 'Bolagsuppgifter & Ägare' : 'Company Setup & Owners'}</span>
                        <ChevronRight className="w-4 h-4 text-[#8C6D46] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-xs text-[#5A6475] leading-relaxed">
                        {isSV
                          ? 'Mata in bolagsnamn, aktiekapital, konfigurera Stam A/B och lägg till grundare & investerare med snabbformuläret.'
                          : 'Enter company details, share capital, configure Stam A/B, and add founders with the fast inline form.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#8C6D46]/20 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveGuideTab('step2');
                        }}
                        className="text-[11px] text-[#8C6D46] hover:underline font-medium"
                      >
                        {isSV ? 'Läs guide →' : 'Read guide →'}
                      </button>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-[#8C6D46] text-white rounded group-hover:bg-[#A38054] transition-colors">
                        <span>{isSV ? 'Öppna Sida 2' : 'Open Page 2'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Step 3 Card */}
                  <div
                    onClick={() => navigateToTab('cap_table')}
                    className="bg-white border-2 border-[#E5E0D5] hover:border-[#15233E] rounded-xl p-5 space-y-3 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="w-7 h-7 rounded-full bg-[#15233E] text-[#D8B98E] flex items-center justify-center font-mono font-bold text-xs">
                          3
                        </span>
                        <span className="text-[10px] font-mono text-[#8C6D46] uppercase tracking-wider font-semibold">
                          {isSV ? 'Steg 3 • Analys' : 'Step 3 • Analytics'}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-[#15233E] group-hover:text-[#8C6D46] transition-colors flex items-center justify-between">
                        <span>{isSV ? 'Aktiebok & Analysflikar' : 'Cap Table & Analytics'}</span>
                        <ChevronRight className="w-4 h-4 text-[#8C6D46] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-xs text-[#5A6475] leading-relaxed">
                        {isSV
                          ? 'Se officiell aktiebok, simulera nyemission, kör exit-waterfall, exportera CSV och skriv ut juridisk dokumentation.'
                          : 'View the legal share register, model funding rounds, test exit waterfalls, and export CSV / print PM.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E5E0D5]/70 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveGuideTab('step3');
                        }}
                        className="text-[11px] text-[#8C6D46] hover:underline font-medium"
                      >
                        {isSV ? 'Läs guide →' : 'Read guide →'}
                      </button>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-[#15233E] text-white rounded group-hover:bg-[#1E3156] transition-colors">
                        <span>{isSV ? 'Öppna Sida 3' : 'Open Page 3'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Jump to Analytics Views */}
              <div className="bg-white border border-[#E5E0D5] rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-[#15233E] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#8C6D46]" />
                    <span>{isSV ? 'Direktlänkar till analysflikarna (Sida 3+)' : 'Direct links to Analytics tabs (Page 3+)'}</span>
                  </h4>
                  <span className="text-[11px] text-[#5A6475]">
                    {isSV ? 'Klicka på en flik för att öppna direkt' : 'Click to jump directly into the tool'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => navigateToTab('cap_table')}
                    className="p-3 bg-[#FCFBF9] hover:bg-[#F6F4EF] border border-[#E5E0D5] hover:border-[#15233E] rounded-lg text-left transition-all flex items-start gap-3 group cursor-pointer"
                  >
                    <Layers className="w-5 h-5 text-[#15233E] mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-xs text-[#15233E] group-hover:text-[#8C6D46] flex items-center gap-1">
                        <span>{isSV ? '1. Aktiebok & Ägande' : '1. Cap Table & Ownership'}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[11px] text-[#5A6475] mt-0.5">
                        {isSV ? 'Officiell aktiebok, kapital vs. röster, CSV & utskrift' : 'Official register, capital vs votes, CSV & print'}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToTab('round_sim')}
                    className="p-3 bg-[#FCFBF9] hover:bg-[#F6F4EF] border border-[#E5E0D5] hover:border-[#15233E] rounded-lg text-left transition-all flex items-start gap-3 group cursor-pointer"
                  >
                    <Sliders className="w-5 h-5 text-[#8C6D46] mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-xs text-[#15233E] group-hover:text-[#8C6D46] flex items-center gap-1">
                        <span>{isSV ? '2. Emissionssimulator' : '2. Round Simulator'}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[11px] text-[#5A6475] mt-0.5">
                        {isSV ? 'Modellera nyemission, ESOP pool-shuffle och K-lån' : 'Model equity round, ESOP top-up and convertible debt'}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToTab('waterfall')}
                    className="p-3 bg-[#FCFBF9] hover:bg-[#F6F4EF] border border-[#E5E0D5] hover:border-[#15233E] rounded-lg text-left transition-all flex items-start gap-3 group cursor-pointer"
                  >
                    <TrendingUp className="w-5 h-5 text-[#3B5984] mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-xs text-[#15233E] group-hover:text-[#8C6D46] flex items-center gap-1">
                        <span>{isSV ? '3. Exit Waterfall' : '3. Exit Waterfall'}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[11px] text-[#5A6475] mt-0.5">
                        {isSV ? 'Likvidationspreferens, senioritet och M&A-kurva' : 'Liquidation preference, seniority and exit proceeds'}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToTab('abl_legal')}
                    className="p-3 bg-[#FCFBF9] hover:bg-[#F6F4EF] border border-[#E5E0D5] hover:border-[#15233E] rounded-lg text-left transition-all flex items-start gap-3 group cursor-pointer"
                  >
                    <Scale className="w-5 h-5 text-[#5C6F68] mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-xs text-[#15233E] group-hover:text-[#8C6D46] flex items-center gap-1">
                        <span>{isSV ? '4. ABL Juridik & Klausuler' : '4. ABL Legal & Clauses'}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[11px] text-[#5A6475] mt-0.5">
                        {isSV ? 'Leo-lagen (16 kap. ABL) & Bolagsverket-dossier' : 'Leo-lagen 90% voting guardrails & filing exhibits'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEP 1 GUIDE (STARTER PAGE) */}
          {activeGuideTab === 'step1' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-[#15233E] text-white p-5 rounded-xl space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8B98E]">
                  {isSV ? 'Steg 1 av 3' : 'Step 1 of 3'}
                </span>
                <h3 className="text-lg font-bold" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                  {isSV ? 'Startsidan (Välj din ingång)' : 'The Starter Page (Choose Your Path)'}
                </h3>
                <p className="text-xs text-[#D8D1C3] leading-relaxed">
                  {isSV
                    ? 'Startsidan ger dig tre tydliga vägar beroende på om du vill mata in ditt eget bolag eller se en färdig demonstration.'
                    : 'The starter page gives you three clear choices depending on whether you want to build your own cap table or explore a demo.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#15233E] text-white flex items-center justify-center font-bold text-xs">
                    A
                  </div>
                  <h4 className="font-semibold text-xs text-[#15233E]">
                    {isSV ? 'Skapa min egen aktiebok' : 'Build My Cap Table'}
                  </h4>
                  <p className="text-xs text-[#5A6475]">
                    {isSV
                      ? 'Tar dig direkt till Sida 2 där du fyller i bolagsnamn, aktiekapital och lägger in dina aktieägare.'
                      : 'Leads directly to Page 2 where you enter company info, share capital, and shareholders.'}
                  </p>
                </div>

                <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#8C6D46] text-white flex items-center justify-center font-bold text-xs">
                    B
                  </div>
                  <h4 className="font-semibold text-xs text-[#15233E]">
                    {isSV ? 'Se 60s Interaktiv Demo' : 'Watch 60s Tour'}
                  </h4>
                  <p className="text-xs text-[#5A6475]">
                    {isSV
                      ? 'Laddar ett komplett svenskt VC-scenario och guidar dig steg för steg med talarrutor och spotlight.'
                      : 'Loads a complete VC venture scenario and guides you step-by-step with spotlights.'}
                  </p>
                </div>

                <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#3B5984] text-white flex items-center justify-center font-bold text-xs">
                    C
                  </div>
                  <h4 className="font-semibold text-xs text-[#15233E]">
                    {isSV ? 'Utforska exempelbolag' : 'Explore Sample Venture'}
                  </h4>
                  <p className="text-xs text-[#5A6475]">
                    {isSV
                      ? 'Hoppar direkt till aktieboken med ett förifyllt såddbolag (2 grundare + konvertibellån).'
                      : 'Jumps directly to the cap table with a pre-filled seed startup (2 founders + convertible note).'}
                  </p>
                </div>
              </div>

              {/* Navigation Bar inside modal */}
              <div className="pt-4 border-t border-[#E5E0D5] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveGuideTab('overview')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#5A6475] hover:text-[#15233E] rounded-md transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{isSV ? 'Tillbaka till översikt' : 'Back to Overview'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigateToTab('starter')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#15233E] text-white rounded-lg hover:bg-[#1E3156] transition-colors"
                  >
                    <span>{isSV ? 'Gå till Startsidan (Sida 1) nu' : 'Go to Starter Page (Page 1) now'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveGuideTab('step2')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#8C6D46] hover:underline"
                  >
                    <span>{isSV ? 'Nästa: Sida 2' : 'Next: Page 2'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STEP 2 GUIDE (COMPANY SETUP & INPUT) */}
          {activeGuideTab === 'step2' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-[#8C6D46] text-white p-5 rounded-xl space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#FCFBF9]/80">
                  {isSV ? 'Steg 2 av 3 • Inmatningscenter' : 'Step 2 of 3 • Input Hub'}
                </span>
                <h3 className="text-lg font-bold" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                  {isSV ? 'Bolagsuppgifter & Inmatning (Sida 2)' : 'Company Setup & Input Center (Page 2)'}
                </h3>
                <p className="text-xs text-[#FCFBF9]/90 leading-relaxed">
                  {isSV
                    ? 'Här matar du in all information för ditt bolag: grunddata, aktieslag (Stam A & B), aktieägare, konvertibler och optioner.'
                    : 'Where you enter all company info: legal details, share classes (Stam A & B), shareholders, convertibles, and warrants.'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 flex gap-3.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#15233E] text-[#D8B98E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#15233E]">
                      {isSV ? 'Bolagsnamn & Aktiekapital (Minst 25 000 SEK)' : 'Company Name & Share Capital (Min 25,000 SEK)'}
                    </h4>
                    <p className="text-xs text-[#5A6475] mt-1">
                      {isSV
                        ? 'Enligt ABL 1:5 måste ett svenskt privat aktiebolag ha minst 25 000 SEK i aktiekapital. Systemet räknar automatiskt ut kvotvärdet (aktiekapital / antal aktier).'
                        : 'Under Ch. 1 ABL, a Swedish private company requires at least 25,000 SEK capital. The engine computes quota value automatically.'}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 flex gap-3.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#15233E] text-[#D8B98E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#15233E]">
                      {isSV ? 'Aktieslag & Röstvärdestaket (Max 10:1)' : 'Share Classes & Voting Ratio (Max 10:1)'}
                    </h4>
                    <p className="text-xs text-[#5A6475] mt-1">
                      {isSV
                        ? 'Konfigurera Stam A (t.ex. 10 röster) och Stam B (1 röst). Systemet vaktar automatiskt mot brott mot ABL 4:5 (röstskillnaden får ej överstiga 10:1).'
                        : 'Configure Stam A (10 votes) and Stam B (1 vote). The engine guards against ABL 4:5 violations (voting ratio cannot exceed 10:1).'}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 flex gap-3.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#15233E] text-[#D8B98E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#15233E]">
                      {isSV ? 'Snabbformulär: Lägg till aktieägare' : 'Quick Inline Form: Add Shareholders'}
                    </h4>
                    <p className="text-xs text-[#5A6475] mt-1">
                      {isSV
                        ? 'Använd det smidiga snabbformuläret direkt på sidan för att skriva in namn, välja kategori (Grundare, Ängel, VC), aktieslag, antal aktier och investerat belopp.'
                        : 'Use the quick form right on the page to type names, pick category (Founder, Angel, VC), assign shares, and log capital.'}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 flex gap-3.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#15233E] text-[#D8B98E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#15233E]">
                      {isSV ? 'Konvertibler (K-lån) & Teckningsoptioner' : 'Convertible Notes (K-lån) & Warrants'}
                    </h4>
                    <p className="text-xs text-[#5A6475] mt-1">
                      {isSV
                        ? 'Lägg till brygglån med värderingstak (valuation cap) och rabatt, eller optionspooler för personal och styrelse.'
                        : 'Register bridge debt with valuation caps and discounts, or option pools for employees.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Bar inside modal */}
              <div className="pt-4 border-t border-[#E5E0D5] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveGuideTab('step1')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#5A6475] hover:text-[#15233E] rounded-md transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{isSV ? 'Föregående: Sida 1' : 'Previous: Page 1'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigateToTab('setup')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#8C6D46] text-white rounded-lg hover:bg-[#A38054] transition-colors"
                  >
                    <span>{isSV ? 'Gå till Bolagsuppgifter (Sida 2) nu' : 'Go to Company Setup (Page 2) now'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveGuideTab('step3')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#8C6D46] hover:underline"
                  >
                    <span>{isSV ? 'Nästa: Sida 3' : 'Next: Page 3'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STEP 3 GUIDE (CAP TABLE & 4 ANALYTICS VIEWS) */}
          {activeGuideTab === 'step3' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-[#15233E] text-white p-5 rounded-xl space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8B98E]">
                  {isSV ? 'Steg 3 av 3 • Analys och Utfall' : 'Step 3 of 3 • Cap Table & Analytics'}
                </span>
                <h3 className="text-lg font-bold" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                  {isSV ? 'Aktiebok, Nyemissioner & Exit-Waterfall (Sida 3+)' : 'Cap Table, Equity Rounds & Exit Waterfalls (Page 3+)'}
                </h3>
                <p className="text-xs text-[#D8D1C3] leading-relaxed">
                  {isSV
                    ? 'När du lagt in dina bolagsuppgifter har du full tillgång till fyra kraftfulla analysverktyg, inklusive Excel-export och utskrift av legalt PM.'
                    : 'Once your details are entered, you unlock four institutional modeling modules with CSV export and print memo capabilities.'}
                </p>
              </div>

              <div className="space-y-3">
                {/* 1. Aktiebok */}
                <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-3 max-w-xl">
                    <Layers className="w-5 h-5 text-[#15233E] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-xs text-[#15233E]">
                        {isSV ? '1. Aktiebok & Ägande (Officiell aktiebok enligt 5 kap. ABL)' : '1. Cap Table & Ownership (Statutory ledger Ch. 5 ABL)'}
                      </h4>
                      <p className="text-xs text-[#5A6475] mt-1">
                        {isSV
                          ? 'Visar kapitalandel vs röstandel, utspädning vid optionsinlösen, samt knapparna för att exportera CSV och skriva ut transaktions-PM.'
                          : 'Displays economic vs voting power, fully diluted equity, and hosts the Excel CSV and PDF print memo buttons.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToTab('cap_table')}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#15233E] text-white rounded-md hover:bg-[#1E3156] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {isSV ? 'Öppna Aktiebok →' : 'Open Cap Table →'}
                  </button>
                </div>

                {/* 2. Round Simulator */}
                <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-3 max-w-xl">
                    <Sliders className="w-5 h-5 text-[#8C6D46] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-xs text-[#15233E]">
                        {isSV ? '2. Nyemissionssimulator (Round Simulator)' : '2. Financing Round Simulator'}
                      </h4>
                      <p className="text-xs text-[#5A6475] mt-1">
                        {isSV
                          ? 'Modellera investeringsrundor (Seed, Serie A). Löser cirkulär pre-money optionspool-top-up, konverterar K-lån och låter dig verkställa rundan in i aktieboken.'
                          : 'Models equity rounds (Seed, Series A). Solves circular pre-money ESOP math, converts convertible notes, and commits rounds.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToTab('round_sim')}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#8C6D46] text-white rounded-md hover:bg-[#A38054] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {isSV ? 'Öppna Simulator →' : 'Open Simulator →'}
                  </button>
                </div>

                {/* 3. Exit Waterfall */}
                <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-3 max-w-xl">
                    <TrendingUp className="w-5 h-5 text-[#3B5984] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-xs text-[#15233E]">
                        {isSV ? '3. Exit Waterfall (M&A-likvidationspreferenser)' : '3. Exit Waterfall (M&A Liquidation Preferences)'}
                      </h4>
                      <p className="text-xs text-[#5A6475] mt-1">
                        {isSV
                          ? 'Dra i exit-reglaget (0–300+ MSEK) för att se hur köpeskillingen fördelas mellan preferensaktieägare och grundare, inklusive brytpunkten för konvertering.'
                          : 'Drag the exit slider (0-300+ MSEK) to see how proceeds flow across seniority tiers, 1x prefs, and conversion breakpoints.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToTab('waterfall')}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#3B5984] text-white rounded-md hover:bg-[#2A4367] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {isSV ? 'Öppna Waterfall →' : 'Open Waterfall →'}
                  </button>
                </div>

                {/* 4. ABL Legal */}
                <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-3 max-w-xl">
                    <Scale className="w-5 h-5 text-[#5C6F68] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-xs text-[#15233E]">
                        {isSV ? '4. ABL Juridik & Klausuler (Leo-lagen & Bolagsverket)' : '4. ABL Legal & Clause Drafting (Aktiebolagslagen)'}
                      </h4>
                      <p className="text-xs text-[#5A6475] mt-1">
                        {isSV
                          ? 'Verifierar 90% majoritet för personaloptioner enligt Leo-lagen (16 kap. ABL), genererar 6 Bolagsverket-handlingar och skriver live-klausuler för aktieägaravtalet.'
                          : 'Enforces Leo-lagen 90% majorities (Ch. 16 ABL), prepares 6 Bolagsverket filing exhibits, and drafts SHA clauses.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToTab('abl_legal')}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#5C6F68] text-white rounded-md hover:bg-[#485752] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {isSV ? 'Öppna ABL Juridik →' : 'Open ABL Legal →'}
                  </button>
                </div>
              </div>

              {/* Navigation Bar inside modal */}
              <div className="pt-4 border-t border-[#E5E0D5] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveGuideTab('step2')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#5A6475] hover:text-[#15233E] rounded-md transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{isSV ? 'Föregående: Sida 2' : 'Previous: Page 2'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('cap_table')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#15233E] text-white rounded-lg hover:bg-[#1E3156] transition-colors"
                >
                  <span>{isSV ? 'Gå till Aktiebok & Analys (Sida 3) nu' : 'Go to Cap Table & Analytics (Page 3) now'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="bg-[#F6F4EF] border-t border-[#E5E0D5] px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'LOAD_SCENARIO', payload: createBlankScenario() });
                navigateToTab('setup');
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#15233E] hover:bg-[#1E3156] rounded-md transition-colors cursor-pointer"
            >
              {isSV ? 'Börja mata in (Sida 2)' : 'Start Setup (Page 2)'}
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'LOAD_SCENARIO', payload: createPreSeriesAScenario() });
                navigateToTab('cap_table');
              }}
              className="px-3 py-1.5 text-xs font-medium text-[#5A6475] hover:text-[#15233E] hover:bg-white rounded-md transition-colors cursor-pointer"
            >
              {isSV ? 'Ladda exempelbolag (Sida 3)' : 'Load Sample Venture (Page 3)'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                demo.startDemo();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#8C6D46] hover:bg-[#A38054] text-white transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" strokeWidth={0} />
              <span>{isSV ? 'Starta 60s Demo' : 'Launch 60s Tour'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-[#15233E] bg-[#E5E0D5] hover:bg-[#D8D1C3] rounded-md transition-colors cursor-pointer"
            >
              {isSV ? 'Stäng' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
