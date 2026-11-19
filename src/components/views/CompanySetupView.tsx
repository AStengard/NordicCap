import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  Layers,
  Pencil,
  Plus,
  Scale,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { ShareClass, Shareholder, StakeholderCategory } from '../../types';
import { useCapTable, useCapTableMetrics } from '../../context/CapTableContext';
import { formatInt, formatPct, formatSEK } from '../../utils/formatters';
import { CategoryBadge } from '../ui/CategoryBadge';
import { ShareholderDrawer } from '../drawers/ShareholderDrawer';
import { ShareClassDrawer } from '../drawers/ShareClassDrawer';
import { NoteDrawer } from '../drawers/NoteDrawer';
import { WarrantDrawer } from '../drawers/WarrantDrawer';

type DrawerMode =
  | { type: 'none' }
  | { type: 'shareholder'; item?: Shareholder }
  | { type: 'share_class'; item?: ShareClass }
  | { type: 'note'; item?: any }
  | { type: 'warrant'; item?: any };

export function CompanySetupView() {
  const { state, dispatch, t } = useCapTable();
  const metrics = useCapTableMetrics();
  const isSV = state.language === 'SV';

  const [drawer, setDrawer] = useState<DrawerMode>({ type: 'none' });

  // Company profile form fields
  const [compName, setCompName] = useState(state.company.name);
  const [orgNum, setOrgNum] = useState(state.company.orgNumber);
  const [shareCap, setShareCap] = useState(String(state.company.shareCapital));
  const [postVal, setPostVal] = useState(String(state.company.postMoneyValuation));
  const [isSavedToast, setIsSavedToast] = useState(false);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({
      type: 'UPDATE_COMPANY',
      payload: {
        name: compName.trim() || 'Mitt Bolag AB',
        orgNumber: orgNum.trim() || '559000-0000',
        shareCapital: Math.max(25_000, Number(shareCap) || 25_000),
        postMoneyValuation: Math.max(0, Number(postVal) || 0),
      },
    });
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2400);
  };

  const handleProceedToCapTable = () => {
    dispatch({ type: 'SET_TAB', payload: 'cap_table' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 px-4 space-y-8">
      {/* Page Header & Navigation Breadcrumb */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-[#5A6475]">
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_TAB', payload: 'starter' })}
            className="hover:text-[#15233E] hover:underline"
          >
            {isSV ? '1. Start' : '1. Starter'}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#8C6D46]" />
          <span className="font-semibold text-[#8C6D46]">
            {isSV ? '2. Mata in bolagsuppgifter' : '2. Company Setup & Input'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#D8D1C3]" />
          <span className="text-[#A5A096]">
            {isSV ? '3. Aktiebok & Analys' : '3. Cap Table & Analytics'}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-[#15233E]"
              style={{ fontFamily: "'Newsreader', Georgia, serif" }}
            >
              {isSV ? 'Bolagsuppgifter & Inmatningscenter' : 'Company Setup & Input Center'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5A6475] mt-1">
              {isSV
                ? 'Här matar du in alla grunduppgifter: bolagsnamn, aktieslag, grundare, investerare och eventuella optioner.'
                : 'Here is where you add all company info: profile, share classes, founders, investors, and option pools.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleProceedToCapTable}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#15233E] hover:bg-[#1E3156] text-[#FCFBF9] text-xs font-semibold shadow-md transition-all group"
          >
            <span>{isSV ? 'Gå till aktiebok & analys' : 'Proceed to Cap Table & Analytics'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* SECTION 1: Company Profile Form */}
      <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#15233E] text-[#FCFBF9] flex items-center justify-center text-xs font-bold font-mono">
              1
            </span>
            <h2 className="text-base font-bold text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
              {isSV ? 'Bolagsprofil & Aktiekapital' : 'Company Profile & Share Capital'}
            </h2>
          </div>
          {isSavedToast && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isSV ? 'Sparat!' : 'Saved!'}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveCompany} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">
              {isSV ? 'Bolagsnamn' : 'Company Legal Name'}
            </label>
            <input
              type="text"
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
              placeholder="Mitt Bolag AB"
              className="w-full px-3 py-2 text-xs bg-white border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">
              {isSV ? 'Organisationsnummer' : 'Org. Number'}
            </label>
            <input
              type="text"
              value={orgNum}
              onChange={(e) => setOrgNum(e.target.value)}
              placeholder="559000-0000"
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">
              {isSV ? 'Aktiekapital (SEK)' : 'Share Capital (SEK)'}
            </label>
            <input
              type="number"
              min={25000}
              step={1000}
              value={shareCap}
              onChange={(e) => setShareCap(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-white border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
            />
            <span className="text-[10px] text-[#7A8291] mt-0.5 block">
              {isSV ? 'Minst 25 000 SEK (ABL 1:5)' : 'Min 25 000 SEK (ABL 1:5)'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">
              {isSV ? 'Indikativ värdering (SEK)' : 'Current Valuation (SEK)'}
            </label>
            <input
              type="number"
              min={0}
              step={1000000}
              value={postVal}
              onChange={(e) => setPostVal(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-white border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
            />
            <span className="text-[10px] text-[#7A8291] mt-0.5 block">
              {formatSEK(Number(postVal) || 0, true)}
            </span>
          </div>

          <div className="sm:col-span-2 md:col-span-4 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-[#15233E] hover:bg-[#1E3156] text-[#FCFBF9] rounded-md transition-colors"
            >
              {isSV ? 'Spara bolagsuppgifter' : 'Save Company Details'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Share Classes */}
      <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E0D5] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#8C6D46] text-[#FCFBF9] flex items-center justify-center text-xs font-bold font-mono">
              2
            </span>
            <div>
              <h2 className="text-base font-bold text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                {isSV ? 'Aktieslag & Röstvärden' : 'Share Classes & Voting Rights'}
              </h2>
              <span className="text-xs text-[#5A6475]">
                {isSV
                  ? `Nuvarande röstvärdesskillnad: ${metrics.votingRatio.toFixed(1)}:1 (Max 10:1 enligt 4 kap. 5 § ABL)`
                  : `Voting ratio: ${metrics.votingRatio.toFixed(1)}:1 (Max 10:1 ceiling per 4:5 ABL)`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDrawer({ type: 'share_class' })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-[#D8D1C3] text-[#15233E] hover:bg-[#F6F4EF] rounded-md shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#8C6D46]" />
            <span>{isSV ? 'Lägg till aktieslag' : 'Add Share Class'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {state.shareClasses.map((cls) => (
            <div key={cls.id} className="bg-white border border-[#E5E0D5] rounded-xl p-4 space-y-2 relative group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-[#15233E]/10 text-[#15233E] font-mono font-bold text-xs flex items-center justify-center">
                    {cls.code}
                  </span>
                  <span className="font-semibold text-xs text-[#15233E]">{cls.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawer({ type: 'share_class', item: cls })}
                  className="p-1 text-[#5A6475] hover:text-[#15233E] rounded"
                  title="Edit share class"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5A6475] font-mono pt-1 border-t border-[#E5E0D5]/60">
                <div>Röster: <strong className="text-[#15233E]">{cls.votesPerShare}x</strong></div>
                <div>Typ: <strong className="text-[#15233E]">{cls.isPreferred ? `${cls.liquidationMultiple}x Pref` : 'Stam'}</strong></div>
                <div>Kvotkurs: <strong className="text-[#15233E]">{cls.issuePrice} SEK</strong></div>
                <div>Senioritet: <strong className="text-[#15233E]">{cls.seniority}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Shareholders & Founders (Where you add people) */}
      <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E0D5] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#3B5984] text-[#FCFBF9] flex items-center justify-center text-xs font-bold font-mono">
              3
            </span>
            <div>
              <h2 className="text-base font-bold text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                {isSV ? 'Aktieägare (Grundare, Änglar & VC)' : 'Shareholders (Founders, Angels & VC)'}
              </h2>
              <span className="text-xs text-[#5A6475]">
                {isSV
                  ? `${state.shareholders.length} registrerade aktieägare • ${formatInt(metrics.totalIssuedShares)} utgivna aktier`
                  : `${state.shareholders.length} registered shareholders • ${formatInt(metrics.totalIssuedShares)} issued shares`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDrawer({ type: 'shareholder' })}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#15233E] text-[#FCFBF9] hover:bg-[#1E3156] rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isSV ? '+ Lägg till aktieägare' : '+ Add Shareholder'}</span>
          </button>
        </div>

        {state.shareholders.length === 0 ? (
          <div className="py-12 text-center bg-white border border-dashed border-[#D8D1C3] rounded-xl p-6 space-y-3">
            <Users className="w-8 h-8 text-[#8C6D46] mx-auto opacity-70" />
            <div className="font-semibold text-sm text-[#15233E]">
              {isSV ? 'Inga aktieägare inlagda än' : 'No shareholders added yet'}
            </div>
            <p className="text-xs text-[#7A8291] max-w-sm mx-auto">
              {isSV
                ? 'Börja med att lägga till grundarna och deras aktier (t.ex. 25 000 Stam A-aktier).'
                : 'Start by adding your founders and their shareholdings (e.g. 25,000 Class A shares).'}
            </p>
            <button
              type="button"
              onClick={() => setDrawer({ type: 'shareholder' })}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#15233E] text-[#FCFBF9] hover:bg-[#1E3156] rounded-md shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSV ? 'Lägg till grundare' : 'Add First Founder'}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-[#E5E0D5] rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F6F4EF]/70 border-b border-[#E5E0D5] text-[10px] uppercase tracking-wider text-[#5A6475]">
                  <th className="py-2.5 px-4 font-semibold">{t.colShareholder}</th>
                  <th className="py-2.5 px-3 font-semibold">{t.colCategory}</th>
                  <th className="py-2.5 px-3 font-semibold">{t.colShareClass}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{t.colShares}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{t.colCapitalPct}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{t.colVotingPct}</th>
                  <th className="py-2.5 px-4 font-semibold text-right">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D5]/70">
                {state.shareholders.map((sh) => {
                  const cls = metrics.classMap.get(sh.shareClassId);
                  const votes = sh.shares * (cls?.votesPerShare ?? 1);
                  const capPct = metrics.totalIssuedShares > 0 ? (sh.shares / metrics.totalIssuedShares) * 100 : 0;
                  const votePct = metrics.totalVotes > 0 ? (votes / metrics.totalVotes) * 100 : 0;

                  return (
                    <tr key={sh.id} className="hover:bg-[#F6F4EF]/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-[#15233E]">
                        {sh.name}
                        <div className="text-[10px] font-mono text-[#7A8291]">
                          Investerat: {formatSEK(sh.investedAmount)}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <CategoryBadge category={sh.category} />
                      </td>
                      <td className="py-3 px-3 text-xs text-[#495264]">{cls?.name ?? 'Stam'}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-[#15233E]">
                        {formatInt(sh.shares)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-[#15233E]">
                        {formatPct(capPct)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-[#15233E]">
                        {formatPct(votePct)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setDrawer({ type: 'shareholder', item: sh })}
                            className="p-1 text-[#5A6475] hover:text-[#15233E] rounded"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => dispatch({ type: 'DELETE_SHAREHOLDER', payload: sh.id })}
                            className="p-1 text-[#5A6475] hover:text-[#9A342D] rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 4: Optional Convertible Notes & Warrants */}
      <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#E5E0D5] pb-3">
          <span className="w-7 h-7 rounded-lg bg-[#5C6F68] text-[#FCFBF9] flex items-center justify-center text-xs font-bold font-mono">
            4
          </span>
          <div>
            <h2 className="text-base font-bold text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
              {isSV ? 'Konvertibellån (K-lån) & Optioner (ESOP)' : 'Convertible Debt & Options (Optional)'}
            </h2>
            <span className="text-xs text-[#5A6475]">
              {isSV ? 'Valfritt: lägg till brygglån eller personaloptionsprogram' : 'Optional: bridge loans or warrant incentive programs'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-[#15233E]">
                {isSV ? 'Konvertibellån (K-lån)' : 'Convertible Notes (K-lån)'}
              </div>
              <div className="text-[11px] text-[#5A6475]">
                {state.convertibleNotes.length} {isSV ? 'registrerade lån' : 'notes active'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDrawer({ type: 'note' })}
              className="px-3 py-1.5 text-xs font-medium text-[#15233E] bg-[#F6F4EF] hover:bg-[#E5E0D5] rounded-md transition-colors"
            >
              + {isSV ? 'Lägg till lån' : 'Add Note'}
            </button>
          </div>

          <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-[#15233E]">
                {isSV ? 'Teckningsoptioner (ESOP)' : 'Warrant Pools (ESOP)'}
              </div>
              <div className="text-[11px] text-[#5A6475]">
                {state.warrantPrograms.length} {isSV ? 'optionsprogram' : 'programs active'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDrawer({ type: 'warrant' })}
              className="px-3 py-1.5 text-xs font-medium text-[#15233E] bg-[#F6F4EF] hover:bg-[#E5E0D5] rounded-md transition-colors"
            >
              + {isSV ? 'Lägg till optioner' : 'Add Warrants'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="bg-[#15233E] text-[#FCFBF9] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-semibold text-sm text-[#FCFBF9] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D8B98E]" />
            <span>
              {isSV ? 'Redo att granska aktieboken & simulera?' : 'Ready to review your live cap table & run models?'}
            </span>
          </div>
          <p className="text-xs text-[#D8D1C3]">
            {state.company.name} • {state.shareholders.length} {isSV ? 'aktieägare' : 'shareholders'} • {formatInt(metrics.totalIssuedShares)} {isSV ? 'aktier' : 'shares'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleProceedToCapTable}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8C6D46] hover:bg-[#A38054] text-white font-semibold text-sm shadow-md transition-all group"
        >
          <span>{isSV ? 'Gå till aktiebok & analys (Sida 3)' : 'Proceed to Cap Table & Analytics (Page 3)'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Drawers */}
      <ShareholderDrawer
        isOpen={drawer.type === 'shareholder'}
        onClose={() => setDrawer({ type: 'none' })}
        item={drawer.type === 'shareholder' ? drawer.item : undefined}
      />
      <ShareClassDrawer
        isOpen={drawer.type === 'share_class'}
        onClose={() => setDrawer({ type: 'none' })}
        item={drawer.type === 'share_class' ? drawer.item : undefined}
      />
      <NoteDrawer
        isOpen={drawer.type === 'note'}
        onClose={() => setDrawer({ type: 'none' })}
        item={drawer.type === 'note' ? drawer.item : undefined}
      />
      <WarrantDrawer
        isOpen={drawer.type === 'warrant'}
        onClose={() => setDrawer({ type: 'none' })}
        item={drawer.type === 'warrant' ? drawer.item : undefined}
      />
    </div>
  );
}
