import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Briefcase,
  Building2,
  Download,
  FileText,
  Layers,
  Pencil,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { ShareClass, Shareholder, StakeholderCategory } from '../types';
import { useCapTable, useCapTableMetrics } from '../context/CapTableContext';
import { DEMO_STEPS, useRecruiterDemo } from '../context/RecruiterDemoContext';
import { formatInt, formatPct, formatPriceSEK, formatSEK } from '../utils/formatters';
import { exportCapTableToCSV } from '../utils/csvExport';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { DemoSpotlight } from '../components/demo/DemoSpotlight';
import { ShareholderDrawer } from '../components/drawers/ShareholderDrawer';
import { ShareClassDrawer } from '../components/drawers/ShareClassDrawer';
import { NoteDrawer } from '../components/drawers/NoteDrawer';
import { WarrantDrawer } from '../components/drawers/WarrantDrawer';

type DrawerMode =
  | { type: 'none' }
  | { type: 'shareholder'; item?: Shareholder }
  | { type: 'share_class'; item?: ShareClass }
  | { type: 'note'; item?: any }
  | { type: 'warrant'; item?: any };

export function CapTableTab() {
  const { state, dispatch, t } = useCapTable();
  const metrics = useCapTableMetrics();
  const demo = useRecruiterDemo();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [drawer, setDrawer] = useState<DrawerMode>({ type: 'none' });
  const [editingValuation, setEditingValuation] = useState(false);
  const [valDraft, setValDraft] = useState(String(state.company.postMoneyValuation));
  const [capDraft, setCapDraft] = useState(String(state.company.shareCapital));
  const [subPage, setSubPage] = useState<'ledger' | 'instruments'>('ledger');

  useEffect(() => {
    if (demo.isDemoActive && demo.currentStepIndex === 1) {
      setSubPage('ledger');
    }
  }, [demo.isDemoActive, demo.currentStepIndex]);

  useEffect(() => {
    setValDraft(String(state.company.postMoneyValuation));
    setCapDraft(String(state.company.shareCapital));
  }, [state.company.postMoneyValuation, state.company.shareCapital]);

  // Synthetic Interaction Engine — Step 1 (Typewriter filter in Aktiebok)
  useEffect(() => {
    if (!demo.isDemoActive || demo.currentStepIndex !== 1) return;

    let cancelled = false;
    const timers: number[] = [];
    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.push(id);
    };

    setCategoryFilter('ALL');
    setSearchQuery('');

    const sampleQuery = 'Astrid';
    for (let i = 1; i <= sampleQuery.length; i++) {
      schedule(() => setSearchQuery(sampleQuery.slice(0, i)), 450 + i * 115);
    }
    schedule(() => setSearchQuery(''), 2300);
    schedule(() => demo.markStepReady(1), 2750);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [demo.isDemoActive, demo.currentStepIndex, demo.demoRunId, demo.markStepReady]);

  const filteredShareholders = useMemo(
    () =>
      state.shareholders.filter((s) => {
        const matchesCat = categoryFilter === 'ALL' || s.category === categoryFilter;
        const matchesSearch =
          !searchQuery.trim() || s.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
        return matchesCat && matchesSearch;
      }),
    [state.shareholders, categoryFilter, searchQuery]
  );

  const saveCompanyNumbers = () => {
    const parsedVal = Number(valDraft);
    const parsedCap = Number(capDraft);
    dispatch({
      type: 'UPDATE_COMPANY',
      payload: {
        postMoneyValuation:
          Number.isFinite(parsedVal) && parsedVal >= 0 ? parsedVal : state.company.postMoneyValuation,
        shareCapital:
          Number.isFinite(parsedCap) && parsedCap >= 0 ? parsedCap : state.company.shareCapital,
      },
    });
    setEditingValuation(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub-Page Navigation Switcher for Step 3.1 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FCFBF9] border border-[#E5E0D5] rounded-xl p-2.5 shadow-2xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setSubPage('ledger')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              subPage === 'ledger'
                ? 'bg-[#15233E] text-[#FCFBF9] shadow-xs'
                : 'text-[#5A6475] hover:text-[#15233E] hover:bg-[#F6F4EF]'
            }`}
          >
            <Users className="w-4 h-4 text-[#D8B98E]" strokeWidth={1.8} />
            <span>{t.capSubLedger}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              subPage === 'ledger' ? 'bg-white/15 text-white' : 'bg-[#E5E0D5] text-[#5A6475]'
            }`}>
              {state.shareholders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubPage('instruments')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              subPage === 'instruments'
                ? 'bg-[#15233E] text-[#FCFBF9] shadow-xs'
                : 'text-[#5A6475] hover:text-[#15233E] hover:bg-[#F6F4EF]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#8C6D46]" strokeWidth={1.8} />
            <span>{t.capSubInstruments}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              subPage === 'instruments' ? 'bg-white/15 text-white' : 'bg-[#E5E0D5] text-[#5A6475]'
            }`}>
              {state.shareClasses.length} {state.language === 'SV' ? 'klasser' : 'classes'}
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#667085]">
          <span className="font-mono text-[11px] bg-[#F6F4EF] px-2 py-0.5 rounded border border-[#E5E0D5]">
            {state.language === 'SV' ? 'Kapitel 3.1 av 3.4' : 'Chapter 3.1 of 3.4'}
          </span>
        </div>
      </div>

      {/* ABL Compliance Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#15233E]">
          <Building2 className="w-4 h-4 text-[#8C6D46]" strokeWidth={1.6} />
          <span className="font-semibold">{state.company.name}</span>
          <span className="text-[#8A8F99]">|</span>
          <span className="font-mono tabular-nums text-[#5A6475]">Org.nr {state.company.orgNumber}</span>
          <span className="px-2 py-0.5 text-[11px] rounded bg-[#F6F4EF] border border-[#E5E0D5] text-[#8C6D46] font-medium">
            {state.company.scenarioLabel}
          </span>
        </div>

        <div className="text-xs">
          {metrics.ablVotingCompliant && metrics.ablCapitalCompliant ? (
            <span className="inline-flex items-center gap-1.5 text-[#3B5B4A] font-medium">
              <ShieldCheck className="w-4 h-4" strokeWidth={1.6} />
              {t.ablVoteRulePass}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[#9A342D] font-medium">
              <AlertTriangle className="w-4 h-4" strokeWidth={1.6} />
              {!metrics.ablVotingCompliant ? t.ablVoteRuleFail : t.ablCapitalRuleFail}
            </span>
          )}
        </div>
      </div>

      {/* SUB-PAGE 1: Shareholder Register & Voting Control */}
      {subPage === 'ledger' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#667085] font-medium">
            <span>{t.kpiIssuedShares}</span>
            <Layers className="w-4 h-4 text-[#8C6D46]" strokeWidth={1.5} />
          </div>
          <div className="mt-2.5 text-2xl font-semibold text-[#15233E] font-mono tabular-nums">
            {formatInt(metrics.totalIssuedShares)}
          </div>
          <div className="mt-1.5 text-xs text-[#667085] flex items-center justify-between">
            <span>{t.quotaValueLabel}:</span>
            <span className="font-mono tabular-nums text-[#15233E]">{metrics.quotaValue.toFixed(4)} SEK</span>
          </div>
        </div>

        <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#667085] font-medium">
            <span>{t.kpiFullyDiluted}</span>
            <Users className="w-4 h-4 text-[#8C6D46]" strokeWidth={1.5} />
          </div>
          <div className="mt-2.5 text-2xl font-semibold text-[#15233E] font-mono tabular-nums">
            {formatInt(metrics.fullyDilutedShares)}
          </div>
          <div className="mt-1.5 text-xs text-[#667085] flex items-center justify-between">
            <span className="font-mono tabular-nums">{formatInt(metrics.totalWarrants)}</span>
            <span>
              {t.warrantsOutstanding} ({formatPct(metrics.warrantPoolFdPct, 1)})
            </span>
          </div>
        </div>

        <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#667085] font-medium">
            <span>{t.kpiCapitalInvested}</span>
            <Briefcase className="w-4 h-4 text-[#8C6D46]" strokeWidth={1.5} />
          </div>
          <div className="mt-2.5 text-2xl font-semibold text-[#15233E] font-mono tabular-nums">
            {formatSEK(metrics.totalCapitalInvested, true)}
          </div>
          <div className="mt-1.5 text-xs text-[#667085] font-mono tabular-nums">
            {formatSEK(metrics.totalCapitalInvested)}{' '}
            {metrics.activeKlanPrincipal > 0 && (
              <span className="font-sans text-[#8C6D46]">({t.inclActiveKlan})</span>
            )}
          </div>
        </div>

        <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#667085] font-medium">
            <span>{t.kpiPostMoney}</span>
            <button
              type="button"
              onClick={() => setEditingValuation((v) => !v)}
              className="text-[#8C6D46] hover:text-[#15233E]"
              title={t.editValuation}
            >
              <Pencil className="w-3.5 h-3.5" strokeWidth={1.6} />
            </button>
          </div>

          {!editingValuation ? (
            <>
              <div className="mt-2.5 text-2xl font-semibold text-[#15233E] font-mono tabular-nums">
                {formatSEK(state.company.postMoneyValuation, true)}
              </div>
              <div className="mt-1.5 text-xs text-[#667085] flex items-center justify-between">
                <span>{t.shareCapitalLabel}:</span>
                <span className="font-mono tabular-nums text-[#15233E]">
                  {formatSEK(state.company.shareCapital)}
                </span>
              </div>
            </>
          ) : (
            <div className="mt-2 space-y-2">
              <div>
                <label className="block text-[10px] uppercase text-[#667085]">Valuation (SEK)</label>
                <input
                  type="number"
                  value={valDraft}
                  onChange={(e) => setValDraft(e.target.value)}
                  className="w-full px-2 py-1 text-xs font-mono bg-white border border-[#D8D1C3] rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[#667085]">{state.language === 'SV' ? 'Aktiekapital (SEK)' : 'Share Capital (SEK)'}</label>
                <input
                  type="number"
                  value={capDraft}
                  onChange={(e) => setCapDraft(e.target.value)}
                  className="w-full px-2 py-1 text-xs font-mono bg-white border border-[#D8D1C3] rounded"
                />
              </div>
              <div className="flex justify-end gap-1.5">
                <button type="button" onClick={() => setEditingValuation(false)} className="px-2 py-1 text-[11px] text-[#5A6475]">
                  Cancel
                </button>
                <button type="button" onClick={saveCompanyNumbers} className="px-2.5 py-1 text-[11px] bg-[#15233E] text-[#FCFBF9] rounded font-medium">
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spotlight Step 1: Voting Control Strip & Shareholder Register */}
      <DemoSpotlight
        stepIndex={1}
        badgeText={state.language === 'SV' ? DEMO_STEPS[1].badgeSV : DEMO_STEPS[1].badgeEN}
        className="space-y-6"
      >
        {/* Capital vs Voting Control Comparison Strip */}
        <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-base font-medium text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
              {t.votingControlSplit}
            </h2>
            <span className="text-xs font-mono tabular-nums text-[#667085]">
              Total Votes: {formatInt(metrics.totalVotes)} (Max Class Ratio: {metrics.votingRatio.toFixed(1)}:1)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(['capitalPct', 'votingPct'] as const).map((field) => (
              <div key={field}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-[#15233E]">
                    {field === 'capitalPct' ? `${t.capitalShare} (Issued)` : `${t.votingShare} (Issued)`}
                  </span>
                  <span className="font-mono text-[#667085]">100.00%</span>
                </div>
                <div className="h-3 w-full rounded-sm overflow-hidden flex bg-[#ECE7DC]">
                  {metrics.categoryBreakdown.map((item) => {
                    const pct = item[field];
                    if (pct <= 0) return null;
                    const colors: Record<StakeholderCategory, string> = {
                      Founder: 'bg-[#15233E]',
                      Angel: 'bg-[#8C6D46]',
                      VC: 'bg-[#36537C]',
                      ESOP: 'bg-[#5C6F68]',
                    };
                    return (
                      <div
                        key={item.category}
                        style={{ width: `${pct}%` }}
                        className={`${colors[item.category]} h-full border-r border-[#FCFBF9]/40`}
                        title={`${item.category}: ${formatPct(pct)}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3.5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#5A6475]">
            {metrics.categoryBreakdown.map((item) => {
              if (item.shares === 0) return null;
              const dots: Record<StakeholderCategory, string> = {
                Founder: 'bg-[#15233E]',
                Angel: 'bg-[#8C6D46]',
                VC: 'bg-[#36537C]',
                ESOP: 'bg-[#5C6F68]',
              };
              return (
                <div key={item.category} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-xs ${dots[item.category]}`} />
                  <span className="font-medium text-[#15233E]">{item.category}</span>
                  <span className="font-mono tabular-nums">
                    Cap {formatPct(item.capitalPct, 1)} / Vote {formatPct(item.votingPct, 1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Shareholder Register Ledger */}
        <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E0D5] flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
              {t.ledgerTitle}
            </h2>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#7A8291] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.6} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E5E0D5] rounded-md text-[#15233E] placeholder:text-[#8A92A0] focus:outline-none focus:border-[#15233E]"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-[#E5E0D5] rounded-md text-[#15233E]"
              >
                <option value="ALL">{t.allCategories}</option>
                <option value="Founder">Founder</option>
                <option value="Angel">Angel</option>
                <option value="VC">VC</option>
                <option value="ESOP">ESOP</option>
              </select>

              <button
                type="button"
                onClick={() => setDrawer({ type: 'shareholder' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#15233E] text-[#FCFBF9] rounded-md hover:bg-[#1E3156] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.8} />
                {t.addShareholder}
              </button>

              <div className="flex items-center gap-1.5 pl-1.5 border-l border-[#E5E0D5]">
                <button
                  type="button"
                  onClick={() => exportCapTableToCSV(state, metrics)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#15233E] bg-white border border-[#D8D1C3] hover:bg-[#F6F4EF] rounded-md transition-colors cursor-pointer shadow-2xs"
                  title={t.exportCsv}
                >
                  <Download className="w-3.5 h-3.5 text-[#8C6D46]" strokeWidth={1.8} />
                  <span>{t.exportCsv}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#15233E] bg-white border border-[#D8D1C3] hover:bg-[#F6F4EF] rounded-md transition-colors cursor-pointer shadow-2xs"
                  title={t.printMemo}
                >
                  <Printer className="w-3.5 h-3.5 text-[#8C6D46]" strokeWidth={1.8} />
                  <span>{t.printMemo}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E0D5] bg-[#F6F4EF]/70 text-[11px] uppercase tracking-wider text-[#5A6475]">
                  <th className="py-3 px-5 font-semibold">{t.colShareholder}</th>
                  <th className="py-3 px-3 font-semibold">{t.colCategory}</th>
                  <th className="py-3 px-3 font-semibold">{t.colShareClass}</th>
                  <th className="py-3 px-3 font-semibold text-right">{t.colShares}</th>
                  <th className="py-3 px-3 font-semibold text-right">{t.colCapitalPct}</th>
                  <th className="py-3 px-3 font-semibold text-right">{t.colVotingPct}</th>
                  <th className="py-3 px-3 font-semibold text-right">{t.colFullyDilutedPct}</th>
                  <th className="py-3 px-5 font-semibold text-right">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D5]/70 text-sm">
                {filteredShareholders.map((sh) => {
                  const cls = metrics.classMap.get(sh.shareClassId);
                  const votes = sh.shares * (cls?.votesPerShare ?? 1);
                  const capPct = metrics.totalIssuedShares > 0 ? (sh.shares / metrics.totalIssuedShares) * 100 : 0;
                  const votePct = metrics.totalVotes > 0 ? (votes / metrics.totalVotes) * 100 : 0;
                  const fdPct = metrics.fullyDilutedShares > 0 ? (sh.shares / metrics.fullyDilutedShares) * 100 : 0;
                  return (
                    <tr key={sh.id} className="hover:bg-[#F6F4EF]/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-[#15233E]">{sh.name}</div>
                        <div className="text-[11px] font-mono tabular-nums text-[#7A8291]">
                          Invested: {formatSEK(sh.investedAmount)}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <CategoryBadge category={sh.category} />
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="text-xs font-medium text-[#15233E]">{cls?.name ?? 'Unknown'}</div>
                        <div className="text-[11px] font-mono text-[#7A8291]">
                          {cls?.votesPerShare ?? 1}x vote
                          {cls?.isPreferred ? ` / ${cls.liquidationMultiple}x pref` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-[#15233E]">
                        {formatInt(sh.shares)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-[#15233E]">
                        {formatPct(capPct)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums font-medium text-[#15233E]">
                        {formatPct(votePct)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-[#5A6475]">
                        {formatPct(fdPct)}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setDrawer({ type: 'shareholder', item: sh })}
                            className="p-1.5 text-[#5A6475] hover:text-[#15233E] hover:bg-[#F6F4EF] rounded"
                            aria-label="Edit shareholder"
                          >
                            <Pencil className="w-3.5 h-3.5" strokeWidth={1.6} />
                          </button>
                          <button
                            type="button"
                            onClick={() => dispatch({ type: 'DELETE_SHAREHOLDER', payload: sh.id })}
                            className="p-1.5 text-[#5A6475] hover:text-[#9A342D] hover:bg-[#F6F4EF] rounded"
                            aria-label="Delete shareholder"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredShareholders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#5A6475]">
                      <div className="max-w-sm mx-auto space-y-3">
                        <Users className="w-8 h-8 text-[#8C6D46] mx-auto opacity-60" />
                        <div className="font-medium text-[#15233E]">
                          {searchQuery || categoryFilter !== 'ALL'
                            ? (state.language === 'SV' ? 'Inga aktieägare matchar filtreringen' : 'No shareholders match filter')
                            : (state.language === 'SV' ? 'Inga aktieägare registrerade än' : 'No shareholders registered yet')}
                        </div>
                        <p className="text-xs text-[#7A8291]">
                          {state.language === 'SV'
                            ? 'Aktieboken är tom. Klicka på knappen nedan för att lägga till din första grundare eller investerare.'
                            : 'The cap table is empty. Click the button below to add your first founder or investor.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setDrawer({ type: 'shareholder' })}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#15233E] text-[#FCFBF9] rounded-md hover:bg-[#1E3156] transition-colors shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.addShareholder}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {metrics.totalWarrants > 0 && categoryFilter === 'ALL' && !searchQuery.trim() && (
                  <tr className="bg-[#F6F4EF]/35">
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-[#44544E]">Unexercised Warrant Pool (Teckningsoptioner)</div>
                      <div className="text-[11px] text-[#7A8291]">{state.warrantPrograms.length} active program(s)</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <CategoryBadge category="ESOP Pool" />
                    </td>
                    <td className="py-3.5 px-3 text-xs text-[#667085]">Warrants (0 votes)</td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-[#44544E]">
                      {formatInt(metrics.totalWarrants)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-[#8A92A0]">0.00%</td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-[#8A92A0]">0.00%</td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums font-medium text-[#44544E]">
                      {formatPct(metrics.warrantPoolFdPct)}
                    </td>
                    <td className="py-3.5 px-5 text-right text-[11px] text-[#7A8291]">Pool</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#E5E0D5] bg-[#F6F4EF]/80 text-xs font-semibold text-[#15233E]">
                  <td colSpan={3} className="py-3 px-5">Total Fully Diluted Cap Table</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">{formatInt(metrics.fullyDilutedShares)}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">100.00%</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">100.00%</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">100.00%</td>
                  <td className="py-3 px-5" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </DemoSpotlight>
        </div>
      )}

      {/* SUB-PAGE 2: Share Classes, Convertible Notes & Warrants */}
      {subPage === 'instruments' && (
        <div className="space-y-6">
          <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                {state.language === 'SV' ? 'Aktieslag, Konvertibler & Optionsprogram' : 'Share Classes, Convertibles & Warrant Programs'}
              </h2>
              <p className="text-xs text-[#5A6475] mt-1 max-w-2xl">
                {state.language === 'SV'
                  ? 'Hantera bolagets stam- och preferensaktier (ABL 4 kap.), aktiva konvertibellån med ränta och tak (ABL 15 kap.), samt incitamentsprogram/ESOP för anställda.'
                  : 'Manage common and preferred share classes (ABL Ch. 4), active convertible notes with interest and caps (ABL Ch. 15), and employee warrant / ESOP pools.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawer({ type: 'share_class' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#15233E] text-[#FCFBF9] rounded-md hover:bg-[#1E3156] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span>{state.language === 'SV' ? '+ Nytt aktieslag' : '+ Share Class'}</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawer({ type: 'note' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#15233E] bg-white border border-[#D8D1C3] hover:bg-[#F6F4EF] rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#8C6D46]" strokeWidth={1.8} />
                <span>{state.language === 'SV' ? '+ K-lån' : '+ Convertible Note'}</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawer({ type: 'warrant' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#15233E] bg-white border border-[#D8D1C3] hover:bg-[#F6F4EF] rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#8C6D46]" strokeWidth={1.8} />
                <span>{state.language === 'SV' ? '+ Optioner' : '+ Warrants'}</span>
              </button>
            </div>
          </div>

          {/* Instruments Grid: Share Classes, Convertible Notes, Warrant Programs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Share Classes */}
        <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg flex flex-col">
          <div className="px-5 py-4 border-b border-[#E5E0D5] flex items-center justify-between">
            <h3 className="text-base font-medium text-[#15233E] flex items-center gap-2" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
              <Layers className="w-4 h-4 text-[#8C6D46]" strokeWidth={1.6} />
              {t.sectionShareClasses}
            </h3>
            <button
              type="button"
              onClick={() => setDrawer({ type: 'share_class' })}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#8C6D46] hover:text-[#15233E]"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.8} />
              Add
            </button>
          </div>
          <div className="divide-y divide-[#E5E0D5]/70 flex-1">
            {state.shareClasses.map((cls) => {
              const inUse =
                state.shareholders.some((s) => s.shareClassId === cls.id) ||
                state.warrantPrograms.some((w) => w.targetShareClassId === cls.id);
              return (
                <div key={cls.id} className="px-5 py-3.5 flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold text-[#15233E]">{cls.name}</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#F6F4EF] border border-[#E5E0D5] text-[#5A6475]">
                        {cls.votesPerShare}x vote
                      </span>
                      {cls.isPreferred && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#8C6D46]/12 text-[#745836]">
                          {cls.liquidationMultiple}x {cls.liquidationType === 'participating' ? 'Part.' : 'Non-Part.'}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs font-mono tabular-nums text-[#667085]">
                      Issue: {formatPriceSEK(cls.issuePrice)}
                      {cls.isPreferred && ` | ${cls.seniority === 'senior' ? 'Senior' : 'Pari Passu'}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDrawer({ type: 'share_class', item: cls })}
                      className="p-1 text-[#5A6475] hover:text-[#15233E]"
                    >
                      <Pencil className="w-3.5 h-3.5" strokeWidth={1.6} />
                    </button>
                    {state.shareClasses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'DELETE_SHARE_CLASS', payload: cls.id })}
                        className="p-1 text-[#5A6475] hover:text-[#9A342D]"
                        title="Delete share class"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Convertible Notes (K-lan) */}
        <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg flex flex-col">
          <div className="px-5 py-4 border-b border-[#E5E0D5] flex items-center justify-between">
            <h3 className="text-base font-medium text-[#15233E] flex items-center gap-2" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
              <FileText className="w-4 h-4 text-[#8C6D46]" strokeWidth={1.6} />
              {t.sectionConvertibles}
            </h3>
            <button
              type="button"
              onClick={() => setDrawer({ type: 'note' })}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#8C6D46] hover:text-[#15233E]"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.8} />
              Add
            </button>
          </div>
          <div className="divide-y divide-[#E5E0D5]/70 flex-1">
            {state.convertibleNotes.length === 0 ? (
              <div className="px-5 py-8 text-xs text-[#7A8291] text-center">
                {state.language === 'SV' ? 'Inga registrerade konvertibellån (K-lån).' : 'No convertible notes registered.'}
              </div>
            ) : (
              state.convertibleNotes.map((note) => (
                <div key={note.id} className="px-5 py-3.5 flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#15233E]">{note.holderName}</span>
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-medium uppercase rounded ${
                          note.status === 'active'
                            ? 'bg-[#8C6D46]/15 text-[#745836]'
                            : 'bg-[#3B5B4A]/15 text-[#3B5B4A]'
                        }`}
                      >
                        {note.status}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-mono tabular-nums text-[#15233E]">
                      {formatSEK(note.principal)} @ {note.interestRate}% ({note.accrualMonths}m)
                    </div>
                    <div className="mt-0.5 text-[11px] font-mono tabular-nums text-[#667085]">
                      Cap: {note.valuationCap > 0 ? formatSEK(note.valuationCap, true) : 'None'} | Discount: {note.discountRate}%
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDrawer({ type: 'note', item: note })}
                      className="p-1 text-[#5A6475] hover:text-[#15233E]"
                    >
                      <Pencil className="w-3.5 h-3.5" strokeWidth={1.6} />
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'DELETE_NOTE', payload: note.id })}
                      className="p-1 text-[#5A6475] hover:text-[#9A342D]"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Warrant Programs */}
        <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg flex flex-col">
          <div className="px-5 py-4 border-b border-[#E5E0D5] flex items-center justify-between">
            <h3 className="text-base font-medium text-[#15233E] flex items-center gap-2" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
              <Award className="w-4 h-4 text-[#8C6D46]" strokeWidth={1.6} />
              {t.sectionWarrants}
            </h3>
            <button
              type="button"
              onClick={() => setDrawer({ type: 'warrant' })}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#8C6D46] hover:text-[#15233E]"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.8} />
              Add
            </button>
          </div>
          <div className="divide-y divide-[#E5E0D5]/70 flex-1">
            {state.warrantPrograms.length === 0 ? (
              <div className="px-5 py-8 text-xs text-[#7A8291] text-center">No warrant programs registered.</div>
            ) : (
              state.warrantPrograms.map((wp) => {
                const targetCls = metrics.classMap.get(wp.targetShareClassId);
                return (
                  <div key={wp.id} className="px-5 py-3.5 flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-[#15233E]">{wp.name}</div>
                      <div className="mt-1 text-xs font-mono tabular-nums text-[#15233E]">
                        {formatInt(wp.totalWarrants)} warrants @ {formatPriceSEK(wp.strikePrice)}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#667085]">
                        Recipient: {wp.recipientCategory} | Target: {targetCls?.name ?? 'Common B'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setDrawer({ type: 'warrant', item: wp })}
                        className="p-1 text-[#5A6475] hover:text-[#15233E]"
                      >
                        <Pencil className="w-3.5 h-3.5" strokeWidth={1.6} />
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'DELETE_WARRANT', payload: wp.id })}
                        className="p-1 text-[#5A6475] hover:text-[#9A342D]"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )}

      {/* Chapter 3.1 Footer Navigation */}
      <div className="pt-4 border-t border-[#E5E0D5] flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'SET_TAB', payload: 'setup' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#5A6475] hover:text-[#15233E] bg-[#FCFBF9] hover:bg-[#F6F4EF] border border-[#D8D1C3] rounded-lg transition-colors cursor-pointer"
        >
          {t.navBackToSetup}
        </button>

        <div className="text-xs text-[#7A8291] font-mono">
          {state.language === 'SV' ? 'Kapitel 3.1 Aktiebok → 3.2 Nyemission' : 'Chapter 3.1 Cap Table → 3.2 Round Sim'}
        </div>

        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'SET_TAB', payload: 'round_sim' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#FCFBF9] bg-[#15233E] hover:bg-[#1E3156] rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          {t.navToRoundSim}
        </button>
      </div>

      {/* Slide-Over CRUD Drawers */}
      <ShareholderDrawer
        open={drawer.type === 'shareholder'}
        initial={drawer.type === 'shareholder' ? drawer.item : undefined}
        onClose={() => setDrawer({ type: 'none' })}
      />
      <ShareClassDrawer
        open={drawer.type === 'share_class'}
        initial={drawer.type === 'share_class' ? drawer.item : undefined}
        onClose={() => setDrawer({ type: 'none' })}
      />
      <NoteDrawer
        open={drawer.type === 'note'}
        initial={drawer.type === 'note' ? drawer.item : undefined}
        onClose={() => setDrawer({ type: 'none' })}
      />
      <WarrantDrawer
        open={drawer.type === 'warrant'}
        initial={drawer.type === 'warrant' ? drawer.item : undefined}
        onClose={() => setDrawer({ type: 'none' })}
      />
    </div>
  );
}
