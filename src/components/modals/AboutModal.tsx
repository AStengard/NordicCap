import React, { useEffect } from 'react';
import {
  BookOpen,
  Calculator,
  CheckCircle2,
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
  const { state, dispatch, t } = useCapTable();
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
                  {isSV ? 'Så fungerar NordicCap' : 'About NordicCap & User Guide'}
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-mono tracking-wider uppercase rounded bg-[#8C6D46]/30 text-[#D8B98E] border border-[#8C6D46]/50">
                  ABL 2005:551
                </span>
              </div>
              <p className="text-xs text-[#D8D1C3] mt-0.5">
                {isSV
                  ? 'Svensk aktiebok, emissions- och waterfall-motor för tillväxtbolag & VC'
                  : 'Institutional Swedish Cap Table & VC Waterfall Engine for Ventures & Funds'}
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
          {/* Prominent FAQ Box: "Can I input my own information?" */}
          <div className="bg-[#F3EFE6] border-2 border-[#8C6D46]/60 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-[#15233E]">
              <div className="w-7 h-7 rounded-full bg-[#8C6D46] text-[#FCFBF9] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-base">
                {isSV
                  ? 'Kan jag mata in mina egna bolagsuppgifter och aktieägare?'
                  : 'Can I input my own company information and shareholders?'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#495264] leading-relaxed">
              {isSV
                ? 'Ja, absolut! Allt du ser i NordicCap är fullt redigerbart i realtid. Den förinlästa datan är bara ett realistiskt startexempel så att du inte möts av en tom skärm. Du kan fritt skapa, redigera och radera allt:'
                : 'Yes, absolutely! Everything you see in NordicCap is fully interactive and customizable in real time. The pre-loaded data is simply a realistic starting template so you do not begin with an empty screen. You can customize everything:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-white/80 border border-[#D8D1C3] rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#15233E]">
                  <Plus className="w-3.5 h-3.5 text-[#8C6D46]" />
                  <span>{isSV ? '1. Lägg till aktieägare & aktieslag' : '1. Add Shareholders & Classes'}</span>
                </div>
                <p className="text-[#5A6475]">
                  {isSV
                    ? 'Klicka på "+ Lägg till aktieägare", "Nytt aktieslag", "Ny konvertibel" eller "Nytt optionsprogram" i Aktieboken.'
                    : 'Click "+ Add Shareholder", "Add Class", "Add K-lån Note", or "Add Warrant" in the Cap Table tab.'}
                </p>
              </div>

              <div className="bg-white/80 border border-[#D8D1C3] rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#15233E]">
                  <Pencil className="w-3.5 h-3.5 text-[#8C6D46]" />
                  <span>{isSV ? '2. Redigera befintliga värden' : '2. Edit Values In-Place'}</span>
                </div>
                <p className="text-[#5A6475]">
                  {isSV
                    ? 'Klicka på penn-ikonen bredvid bolagsnamn, aktiekapital, värdering eller klicka på pennan i aktieägarlistan.'
                    : 'Click the pencil icon next to company name, share capital, or valuation, or click Edit in the shareholder list.'}
                </p>
              </div>

              <div className="bg-white/80 border border-[#D8D1C3] rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#15233E]">
                  <Sliders className="w-3.5 h-3.5 text-[#8C6D46]" />
                  <span>{isSV ? '3. Simulera och tillämpa emission' : '3. Simulate & Apply Rounds'}</span>
                </div>
                <p className="text-[#5A6475]">
                  {isSV
                    ? 'I emissionssimulatorn skriver du in dina egna rundvillkor och klickar "Verkställ runda" för att uppdatera aktieboken.'
                    : 'In the Round Simulator, input your round terms and click "Apply Round" to commit changes to the cap table.'}
                </p>
              </div>

              <div className="bg-white/80 border border-[#D8D1C3] rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#15233E]">
                  <RefreshCw className="w-3.5 h-3.5 text-[#8C6D46]" />
                  <span>{isSV ? '4. Starta från noll (Tom aktiebok)' : '4. Start From Scratch (Blank)'}</span>
                </div>
                <p className="text-[#5A6475]">
                  {isSV
                    ? 'Klicka på "Tom aktiebok" i sidhuvudet för att rensa exemplen och börja med ett rent 25 000 SEK-aktiebolag.'
                    : 'Click "Blank / New" in the top bar to wipe the sample data and start fresh with a clean 25,000 SEK private AB.'}
                </p>
              </div>
            </div>
          </div>

          {/* Overview of the 4 Tabs */}
          <div>
            <h3 className="font-semibold text-base text-[#15233E] mb-3">
              {isSV ? 'Översikt över de 4 flikarna' : 'How the 4 Workspace Tabs Work'}
            </h3>

            <div className="space-y-3">
              {/* Tab 1 */}
              <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 shadow-2xs flex gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#15233E]/10 text-[#15233E] flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-xs text-[#15233E]">
                    {isSV ? '1. Aktiebok & Ägande (Cap Table)' : '1. Cap Table & Ownership (Aktiebok)'}
                  </h4>
                  <p className="text-xs text-[#5A6475] leading-relaxed">
                    {isSV
                      ? 'Den officiella aktieboken enligt 5 kap. ABL. Hanterar Stam A (10 röster/aktie) och Stam B (1 röst), aktiva konvertibellån (K-lån) och optionsprogram (ESOP). Kontrollerar kontinuerligt att röstvärdesskillnaden inte överstiger lagens tak på 10:1 (4 kap. 5 § ABL) och att aktiekapitalet är minst 25 000 SEK.'
                      : 'The statutory share register under Chapter 5 ABL. Manages Class A shares (10 votes/share) vs Class B shares (1 vote), active convertible notes (K-lån), and employee option pools. Validates the 10:1 statutory voting ceiling (4:5 ABL) and minimum 25,000 SEK share capital.'}
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
                      ? 'Modellerar en nyemission (såsom Serie A). Löser cirkulär matematik för optionspool-top-up (pre-money ESOP shuffle) med en 40-iterationers numerisk lösare, konverterar utestående K-lån till lägsta av rabattkurs och värderingstak, och bevarar lagstadgat kvotvärde.'
                      : 'Models primary financing rounds (e.g. Seed, Series A). Resolves the circular pre-money option pool expansion (ESOP shuffle) using a 40-iteration fixed-point solver, converts bridge notes at min(Discount, Cap), and preserves statutory quota value.'}
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
                      ? 'Simulerar exakt vem som får vad vid en bolagsförsäljning (M&A). Dra reglaget från 0 till 300+ MSEK: motorn tillämpar senioritetsordning, 1x/2x preferenskapital, deltagandetak (participating caps) och beräknar den rationella brytpunkten där preferensaktier konverterar till stamaktier.'
                      : 'Simulates who gets paid what in an M&A exit. Drag the valuation slider from 0 to 300+ MSEK: the engine computes seniority tiers, 1x/2x preference returns, participating caps, and the rational threshold where preferred stock converts into common shares.'}
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
                      ? 'Kontrollerar skarpa bolagsrättsliga krav, inklusive Leo-lagen (16 kap. ABL) med 9/10 kvalificerad majoritet för personaloptioner. Genererar Bolagsverkets 6-delade registreringsdossier och skriver färdiga avtalsklausuler för aktieägaravtal (SHA) och bolagsordning.'
                      : 'Enforces strict Swedish statutory compliance, including Leo-lagen (Ch. 16 ABL) requiring a 90% supermajority for employee warrants. Generates the 6-document Bolagsverket filing dossier and live-drafts contractual clauses for your SHA.'}
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
                dispatch({ type: 'SET_TAB', payload: 'cap_table' });
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-medium text-[#15233E] bg-white border border-[#D8D1C3] hover:bg-[#ECE7DC] rounded-md transition-colors"
            >
              {isSV ? 'Skapa tom aktiebok (Börja från noll)' : 'Start Blank Cap Table'}
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'LOAD_SCENARIO', payload: createPreSeriesAScenario() });
                dispatch({ type: 'SET_TAB', payload: 'cap_table' });
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-medium text-[#5A6475] hover:text-[#15233E] hover:bg-white/80 rounded-md transition-colors"
            >
              {isSV ? 'Återställ Pre-Serie A-exempel' : 'Reset Pre-Series A Example'}
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
