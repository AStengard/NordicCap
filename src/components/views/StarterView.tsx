import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Layers,
  Play,
  Scale,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useCapTable } from '../../context/CapTableContext';
import { useRecruiterDemo } from '../../context/RecruiterDemoContext';
import {
  createBlankScenario,
} from '../../constants/scenarios';
import { BrandEmblem } from '../ui/BrandEmblem';

export function StarterView() {
  const { state, dispatch } = useCapTable();
  const demo = useRecruiterDemo();
  const isSV = state.language === 'SV';

  const handleStartOwn = () => {
    dispatch({ type: 'LOAD_SCENARIO', payload: createBlankScenario() });
    dispatch({ type: 'SET_TAB', payload: 'setup' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartDemo = () => {
    demo.startDemo();
  };

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 space-y-12">
      {/* Hero Headline */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#15233E]/10 text-[#15233E] border border-[#8C6D46]/30 text-xs font-mono font-medium">
          <BrandEmblem className="w-3.5 h-3.5" />
          <span>{isSV ? 'Aktiebolagslagen (2005:551) Verifierad' : 'Companies Act (ABL 2005:551) Verified'}</span>
        </div>

        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#15233E]"
          style={{ fontFamily: "'Newsreader', Georgia, serif" }}
        >
          {isSV ? 'Välkommen till NordicCap' : 'Welcome to NordicCap'}
        </h1>

        <p className="text-base sm:text-lg text-[#5A6475] leading-relaxed max-w-2xl mx-auto">
          {isSV
            ? 'Det institutionella verktyget för svensk aktiebokshantering, nyemissionssimulering och M&A-likvidationspreferenser.'
            : 'Institutional-grade modeling for Swedish dual-class share ledgers, venture capital financing rounds, and equilibrium M&A exit waterfalls.'}
        </p>

        <p className="text-xs uppercase font-mono tracking-widest text-[#8C6D46] font-semibold">
          {isSV ? 'Hur vill du börja?' : 'How would you like to get started?'}
        </p>
      </div>

      {/* Main Choice Cards (Use vs Watch Demo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* OPTION 1: Build My Cap Table (Page 2 flow) */}
        <div className="relative bg-[#FCFBF9] border-2 border-[#15233E] rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow group">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="w-12 h-12 rounded-xl bg-[#15233E] text-[#D8B98E] flex items-center justify-center shadow-md">
                <Users className="w-6 h-6" />
              </span>
              <span className="px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider rounded bg-[#8C6D46]/20 text-[#8C6D46] border border-[#8C6D46]/40">
                {isSV ? 'Steg 1 av 3' : 'Step 1 of 3'}
              </span>
            </div>

            <div>
              <h2
                className="text-2xl font-bold text-[#15233E] group-hover:text-[#8C6D46] transition-colors"
                style={{ fontFamily: "'Newsreader', Georgia, serif" }}
              >
                {isSV ? 'Skapa min egen aktiebok' : 'Build My Cap Table'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5A6475] mt-1.5 leading-relaxed">
                {isSV
                  ? 'Mata in bolagsuppgifter, registrera grundare och investerare, och konfigurera Stam A- och B-aktier steg för steg.'
                  : 'Enter your company info, add founders and investors, and configure your dual-class share classes in a clean setup center.'}
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-[#495264] border-t border-[#E5E0D5] pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isSV ? 'Starta med rent bord (tom aktiebok)' : 'Start completely clean with a blank table'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isSV ? 'Stam A (10x röster) & Stam B (1x röst)' : 'Class A (10 votes) & Class B (1 vote) ready'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isSV ? 'Simulera nyemission och M&A-utfall' : 'Model equity rounds & M&A exit proceeds'}</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={handleStartOwn}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#15233E] hover:bg-[#1E3156] text-[#FCFBF9] font-semibold text-sm shadow-md transition-all group-hover:ring-2 group-hover:ring-[#8C6D46]"
            >
              <span>{isSV ? 'Börja mata in bolagsuppgifter' : 'Set Up My Company (Page 2)'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* OPTION 2: Watch 60s Demo */}
        <div className="relative bg-[#FCFBF9] border-2 border-[#8C6D46] rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow group">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="w-12 h-12 rounded-xl bg-[#8C6D46] text-[#FCFBF9] flex items-center justify-center shadow-md">
                <Play className="w-6 h-6 fill-current" strokeWidth={0} />
              </span>
              <span className="px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider rounded bg-[#15233E]/10 text-[#15233E] border border-[#15233E]/20">
                {isSV ? '60s Genomgång' : '60s Tour'}
              </span>
            </div>

            <div>
              <h2
                className="text-2xl font-bold text-[#15233E] group-hover:text-[#8C6D46] transition-colors"
                style={{ fontFamily: "'Newsreader', Georgia, serif" }}
              >
                {isSV ? 'Se interaktiv demo' : 'Watch Guided Demo'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5A6475] mt-1.5 leading-relaxed">
                {isSV
                  ? 'Följ en automatiserad visning från inmatning av bolagsuppgifter och aktieägare till Serie A-emission och exit-vattenfall.'
                  : 'Experience an automated walkthrough from entering company info and shareholders to Series A round modeling and exit waterfalls.'}
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-[#495264] border-t border-[#E5E0D5] pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D46] shrink-0" />
                <span>{isSV ? 'Se bolagsuppgifter & grundare fyllas i live (Sida 2)' : 'Watch company setup & founders fill in live (Page 2)'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D46] shrink-0" />
                <span>{isSV ? 'Se optionspool-top-up & K-lån lösas numeriskt' : 'Watch pre-money ESOP shuffle solve live'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8C6D46] shrink-0" />
                <span>{isSV ? 'Leo-lagen (16 kap. ABL) & Bolagsverket-dossier' : 'Leo Act 90% voting check & SHA drafting'}</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={handleStartDemo}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#8C6D46] hover:bg-[#A38054] text-[#FCFBF9] font-semibold text-sm shadow-md transition-all group-hover:ring-2 group-hover:ring-[#15233E]"
            >
              <Play className="w-4 h-4 fill-current" strokeWidth={0} />
              <span>{isSV ? 'Starta interaktiv demo' : 'Launch 60s Demo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trust & Legal Guardrails Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-[#E5E0D5] pt-8">
        <div className="space-y-1">
          <div className="text-xs font-bold font-mono text-[#8C6D46] uppercase">{isSV ? 'ABL 4 kap. 5 §' : 'Ch. 4 § 5 ABL'}</div>
          <div className="text-xs text-[#15233E] font-medium">{isSV ? 'Max 10:1 Röstvärdestak' : 'Max 10:1 Voting Ratio'}</div>
          <div className="text-[11px] text-[#7A8291]">{isSV ? 'Statutär kontroll' : 'Statutory guardrail'}</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-bold font-mono text-[#8C6D46] uppercase">{isSV ? 'ABL 16 kap.' : 'Ch. 16 ABL'}</div>
          <div className="text-xs text-[#15233E] font-medium">{isSV ? 'Leo-lagen (90% majoritet)' : 'Leo Act (90% Majority)'}</div>
          <div className="text-[11px] text-[#7A8291]">{isSV ? 'Personaloptioner' : 'Insider warrant protection'}</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-bold font-mono text-[#8C6D46] uppercase">{isSV ? 'ABL 1 kap. 5 §' : 'Ch. 1 § 5 ABL'}</div>
          <div className="text-xs text-[#15233E] font-medium">{isSV ? 'Minst 25 000 SEK kapital' : 'Min 25,000 SEK Capital'}</div>
          <div className="text-[11px] text-[#7A8291]">{isSV ? 'Privata aktiebolag' : 'Private Limited Company'}</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-bold font-mono text-[#8C6D46] uppercase">{isSV ? 'Bolagsverket' : 'Registry'}</div>
          <div className="text-xs text-[#15233E] font-medium">{isSV ? '6 Registreringsdokument' : '6 Filing Dossiers'}</div>
          <div className="text-[11px] text-[#7A8291]">{isSV ? 'Exportfärdiga bilagor' : 'Export-ready exhibits'}</div>
        </div>
      </div>
    </div>
  );
}
