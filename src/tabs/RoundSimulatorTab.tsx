import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Check,
  CheckCircle2,
  Lock,
  RefreshCw,
  Sliders,
  Undo2,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AntiDilutionType,
  LiquidationPrefType,
  LiquidationSeniority,
  RoundSimInputs,
  TooltipPayloadEntry,
} from '../types';
import { useCapTable, useCapTableMetrics } from '../context/CapTableContext';
import { DEMO_STEPS, useRecruiterDemo } from '../context/RecruiterDemoContext';
import { simulateFinancingRound } from '../engines/roundSimulator';
import {
  formatBps,
  formatDeltaPct,
  formatInt,
  formatPct,
  formatPriceSEK,
  formatSEK,
} from '../utils/formatters';
import { DemoSpotlight } from '../components/demo/DemoSpotlight';

const CHART_SERIES = [
  { key: 'Founders', label: 'Founders', color: '#15233E' },
  { key: 'Angels', label: 'Angels', color: '#8C6D46' },
  { key: 'ExistingVC', label: 'Existing VC', color: '#3B5984' },
  { key: 'ConvertedNotes', label: 'Converted K-lan', color: '#B59870' },
  { key: 'NewInvestor', label: 'New Investor', color: '#6E85A3' },
  { key: 'ESOP', label: 'ESOP Pool', color: '#5C6F68' },
] as const;

function CustomOwnershipTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const visible = payload.filter((entry) => (entry.value ?? 0) > 0);
  return (
    <div className="bg-[#FCFBF9] border border-[#E5E0D5] shadow-lg rounded-md px-3.5 py-2.5 text-xs">
      <div className="font-semibold text-[#15233E] mb-1.5 border-b border-[#E5E0D5] pb-1">{label}</div>
      <div className="space-y-1">
        {visible.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[#495264]">
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-mono tabular-nums font-medium text-[#15233E]">
              {formatPct(entry.value ?? 0, 2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RoundSimulatorTab() {
  const { state, dispatch, t } = useCapTable();
  const metrics = useCapTableMetrics();
  const demo = useRecruiterDemo();
  const stateRef = useRef(state);
  stateRef.current = state;

  const [inputs, setInputs] = useState<RoundSimInputs>({
    roundName: 'Series A',
    newShareClassName: 'Pref A',
    investorName: 'Svea Ventures Fund III AB',
    preMoneyValuation: 45_000_000,
    investmentAmount: 15_000_000,
    votesPerShare: 1,
    enableOptionPoolTopUp: true,
    targetPoolPct: 10,
    poolTiming: 'pre_money',
    autoConvertNotes: true,
    liquidationMultiple: 1.0,
    liquidationType: 'non_participating',
    participationCap: 3.0,
    seniority: 'senior',
    antiDilution: 'broad_based_wa',
  });

  const [justAppliedToast, setJustAppliedToast] = useState<string | null>(null);
  const simulation = useMemo(() => simulateFinancingRound(state, inputs), [state, inputs]);

  // Synthetic Interaction Engine — Step 2 (Auto-type Series A terms & commit round)
  useEffect(() => {
    if (!demo.isDemoActive || demo.currentStepIndex !== 2) return;

    let cancelled = false;
    const timers: number[] = [];
    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.push(id);
    };

    const targetRound = 'Series A';
    const targetClass = 'Pref A';
    const targetInvestor = 'Svea Ventures Fund III AB';

    const finalInputs: RoundSimInputs = {
      roundName: targetRound,
      newShareClassName: targetClass,
      investorName: targetInvestor,
      preMoneyValuation: 45_000_000,
      investmentAmount: 15_000_000,
      votesPerShare: 1,
      enableOptionPoolTopUp: true,
      targetPoolPct: 10,
      poolTiming: 'pre_money',
      autoConvertNotes: true,
      liquidationMultiple: 1.0,
      liquidationType: 'non_participating',
      participationCap: 3.0,
      seniority: 'senior',
      antiDilution: 'broad_based_wa',
    };

    setJustAppliedToast(null);
    setInputs({
      ...finalInputs,
      roundName: '',
      newShareClassName: '',
      investorName: '',
      preMoneyValuation: 35_000_000,
      investmentAmount: 10_000_000,
    });

    let cursorMs = 280;
    for (let i = 1; i <= targetRound.length; i++) {
      cursorMs += 55;
      const slice = targetRound.slice(0, i);
      schedule(() => setInputs((prev) => ({ ...prev, roundName: slice })), cursorMs);
    }
    cursorMs += 100;
    for (let i = 1; i <= targetClass.length; i++) {
      cursorMs += 55;
      const slice = targetClass.slice(0, i);
      schedule(() => setInputs((prev) => ({ ...prev, newShareClassName: slice })), cursorMs);
    }
    cursorMs += 100;
    for (let i = 1; i <= targetInvestor.length; i++) {
      cursorMs += 32;
      const slice = targetInvestor.slice(0, i);
      schedule(() => setInputs((prev) => ({ ...prev, investorName: slice })), cursorMs);
    }
    cursorMs += 240;
    schedule(() => {
      setInputs((prev) => ({ ...prev, preMoneyValuation: 45_000_000, investmentAmount: 15_000_000 }));
    }, cursorMs);

    cursorMs += 850;
    schedule(() => {
      if (stateRef.current.appliedRounds.length === 0) {
        const simResult = simulateFinancingRound(stateRef.current, finalInputs);
        if (simResult.valid) {
          dispatch({
            type: 'APPLY_SIMULATED_ROUND',
            payload: { inputs: finalInputs, simulation: simResult },
          });
          setJustAppliedToast(targetRound);
        }
      }
      demo.markStepReady(2);
    }, cursorMs);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [demo.isDemoActive, demo.currentStepIndex, demo.demoRunId, demo.markStepReady, dispatch]);

  const updateInput = <K extends keyof RoundSimInputs>(key: K, value: RoundSimInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyRound = () => {
    if (!simulation.valid) return;
    const appliedName = inputs.roundName;
    dispatch({ type: 'APPLY_SIMULATED_ROUND', payload: { inputs, simulation } });
    setJustAppliedToast(appliedName);

    const nextRoundName =
      appliedName === 'Series A'
        ? 'Series B'
        : appliedName === 'Series B'
          ? 'Series C'
          : 'Follow-On Round';
    const nextClassName =
      appliedName === 'Series A'
        ? 'Pref B'
        : appliedName === 'Series B'
          ? 'Pref C'
          : 'Pref Next';
    setInputs((prev) => ({
      ...prev,
      roundName: nextRoundName,
      newShareClassName: nextClassName,
      investorName: 'Nordic Growth Equity AB',
      preMoneyValuation: Math.round(simulation.postMoneyValuation * 1.5),
      investmentAmount: Math.round(prev.investmentAmount * 1.5),
    }));
  };

  const resetInputsToSeriesA = () => {
    setInputs({
      roundName: 'Series A',
      newShareClassName: 'Pref A',
      investorName: 'Svea Ventures Fund III AB',
      preMoneyValuation: 45_000_000,
      investmentAmount: 15_000_000,
      votesPerShare: 1,
      enableOptionPoolTopUp: true,
      targetPoolPct: 10,
      poolTiming: 'pre_money',
      autoConvertNotes: true,
      liquidationMultiple: 1.0,
      liquidationType: 'non_participating',
      participationCap: 3.0,
      seniority: 'senior',
      antiDilution: 'broad_based_wa',
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg px-5 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
            {t.simTitle}
          </h2>
          <p className="text-xs text-[#5A6475] mt-0.5">{t.simSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {state.history.length > 0 && (
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'UNDO_LAST_ROUND' });
                setJustAppliedToast(null);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#FCFBF9] text-[#15233E] border border-[#D8D1C3] rounded-md hover:bg-[#F6F4EF]"
            >
              <Undo2 className="w-3.5 h-3.5 text-[#8C6D46]" strokeWidth={1.7} />
              {t.simUndoBtn} ({state.history.length})
            </button>
          )}
          <button
            type="button"
            onClick={resetInputsToSeriesA}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#5A6475] hover:text-[#15233E] border border-transparent hover:border-[#E5E0D5] rounded-md"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.6} />
            Reset Inputs
          </button>
          <button
            type="button"
            disabled={!simulation.valid}
            onClick={handleApplyRound}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#15233E] text-[#FCFBF9] rounded-md hover:bg-[#1E3156] disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5 text-[#D8B98E]" strokeWidth={2} />
            {t.simApplyBtn}
          </button>
        </div>
      </div>

      {justAppliedToast && (
        <div className="bg-[#3B5B4A]/10 border border-[#3B5B4A]/30 rounded-lg px-4 py-3 flex items-center justify-between text-xs text-[#284234]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#3B5B4A]" strokeWidth={1.7} />
            <span>
              <strong>{justAppliedToast}</strong> committed to the live Cap Table, updating Aktiekapital, Preference Classes, and K-lan status for Exit Waterfall and ABL Legal modules.
            </span>
          </div>
          <button type="button" onClick={() => setJustAppliedToast(null)} className="text-[#3B5B4A] hover:text-[#15233E]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!simulation.valid && (
        <div className="bg-[#8C6D46]/10 border border-[#8C6D46]/40 rounded-lg p-4 flex items-center gap-3 text-xs text-[#15233E]">
          <Sliders className="w-4 h-4 text-[#8C6D46] shrink-0" />
          <span>
            {state.shareholders.length === 0
              ? (state.language === 'SV'
                  ? 'Aktieboken är tom. Lägg till minst en aktieägare i flik 1 (Aktiebok) innan du kan simulera en nyemission.'
                  : 'The cap table is empty. Please add at least one shareholder in Tab 1 (Cap Table) before simulating a new financing round.')
              : simulation.errorMessage}
          </span>
        </div>
      )}

      <DemoSpotlight
        stepIndex={2}
        badgeText={state.language === 'SV' ? DEMO_STEPS[2].badgeSV : DEMO_STEPS[2].badgeEN}
      >
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* LEFT PANEL: Financing Round Controls */}
          <div className="xl:col-span-5 space-y-5">
            <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3">
                <h3 className="text-base font-medium text-[#15233E] flex items-center gap-2" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                  <Sliders className="w-4 h-4 text-[#8C6D46]" strokeWidth={1.6} />
                  {t.simRoundTerms}
                </h3>
                <span className="text-[11px] font-mono text-[#667085]">ABL 13 kap.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#15233E] mb-1">{t.simRoundName}</label>
                  <input
                    type="text"
                    value={inputs.roundName}
                    onChange={(e) => updateInput('roundName', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C3] rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#15233E] mb-1">{t.simNewClassName}</label>
                  <input
                    type="text"
                    value={inputs.newShareClassName}
                    onChange={(e) => updateInput('newShareClassName', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C3] rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#15233E] mb-1">{t.simInvestorName}</label>
                <input
                  type="text"
                  value={inputs.investorName}
                  onChange={(e) => updateInput('investorName', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C3] rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#15233E] mb-1">{t.simPreMoney}</label>
                  <input
                    type="number"
                    step={1_000_000}
                    min={1_000_000}
                    value={inputs.preMoneyValuation}
                    onChange={(e) => updateInput('preMoneyValuation', Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-[#D8D1C3] rounded-md"
                  />
                  <div className="text-[11px] font-mono text-[#667085] mt-1">{formatSEK(inputs.preMoneyValuation, true)}</div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#15233E] mb-1">{t.simInvestment}</label>
                  <input
                    type="number"
                    step={500_000}
                    min={0}
                    value={inputs.investmentAmount}
                    onChange={(e) => updateInput('investmentAmount', Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-[#D8D1C3] rounded-md"
                  />
                  <div className="text-[11px] font-mono text-[#667085] mt-1">{formatSEK(inputs.investmentAmount, true)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-[#15233E] mb-1">{t.simVotesPerShare}</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={inputs.votesPerShare}
                    onChange={(e) => updateInput('votesPerShare', Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                    className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D8D1C3] rounded-md"
                  />
                </div>
                <div className="text-[11px] text-[#667085] pb-2">
                  Default 1 vote/share per standard Swedish VC term sheet practice.
                </div>
              </div>
            </div>

            {/* Option Pool & K-lan Card */}
            <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-5 space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                    {t.simOptionPoolHeader}
                  </h3>
                  <span className="text-[11px] font-mono text-[#667085]">Current: {formatPct(metrics.warrantPoolFdPct, 1)}</span>
                </div>

                <label className="flex items-center gap-2.5 text-xs font-medium text-[#15233E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inputs.enableOptionPoolTopUp}
                    onChange={(e) => updateInput('enableOptionPoolTopUp', e.target.checked)}
                  />
                  {t.simEnableTopUp}
                </label>

                {inputs.enableOptionPoolTopUp && (
                  <div className="p-3.5 bg-[#F6F4EF] border border-[#E5E0D5] rounded-md space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-[#15233E]">{t.simTargetPool}</span>
                        <span className="font-mono font-semibold text-[#8C6D46]">{inputs.targetPoolPct.toFixed(1)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={25}
                        step={0.5}
                        value={inputs.targetPoolPct}
                        onChange={(e) => updateInput('targetPoolPct', Number(e.target.value))}
                        className="w-full accent-[#15233E]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateInput('poolTiming', 'pre_money')}
                        className={`px-2.5 py-2 text-xs font-medium rounded border text-left ${
                          inputs.poolTiming === 'pre_money'
                            ? 'bg-[#15233E] text-[#FCFBF9] border-[#15233E]'
                            : 'bg-white text-[#495264] border-[#D8D1C3]'
                        }`}
                      >
                        {t.simPoolPreMoney}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateInput('poolTiming', 'post_money')}
                        className={`px-2.5 py-2 text-xs font-medium rounded border text-left ${
                          inputs.poolTiming === 'post_money'
                            ? 'bg-[#15233E] text-[#FCFBF9] border-[#15233E]'
                            : 'bg-white text-[#495264] border-[#D8D1C3]'
                        }`}
                      >
                        {t.simPoolPostMoney}
                      </button>
                    </div>
                    <div className="text-[11px] font-mono text-[#5A6475] flex justify-between pt-1">
                      <span>Top-Up Warrants Created:</span>
                      <span className="font-semibold text-[#15233E]">+{formatInt(simulation.optionPoolTopUpShares)} warrants</span>
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-[#E5E0D5]" />

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                    {t.simKlanHeader}
                  </h3>
                  <span className="text-[11px] font-mono text-[#8C6D46]">{metrics.activeNotes.length} active</span>
                </div>
                <label className="flex items-center gap-2.5 text-xs font-medium text-[#15233E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inputs.autoConvertNotes}
                    onChange={(e) => updateInput('autoConvertNotes', e.target.checked)}
                  />
                  {t.simAutoConvert}
                </label>
                <p className="text-[11px] text-[#667085] leading-relaxed">
                  Conversion price = min(Round Price * (1 - Discount), Valuation Cap / Pre-Money Shares) applied to Principal + Accrued Interest.
                </p>
              </div>
            </div>

            {/* Liquidation Preference Card */}
            <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3">
                <h3 className="text-base font-medium text-[#15233E] flex items-center gap-2" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                  <Lock className="w-4 h-4 text-[#8C6D46]" strokeWidth={1.6} />
                  {t.simLiqPrefHeader}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#15233E] mb-1">{t.simLiqMultiple}</label>
                  <select
                    value={inputs.liquidationMultiple}
                    onChange={(e) => updateInput('liquidationMultiple', Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D8D1C3] rounded-md"
                  >
                    <option value={1}>1.0x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2.0x</option>
                    <option value={3}>3.0x</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#15233E] mb-1">{t.simLiqType}</label>
                  <select
                    value={inputs.liquidationType}
                    onChange={(e) => updateInput('liquidationType', e.target.value as LiquidationPrefType)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D8D1C3] rounded-md"
                  >
                    <option value="non_participating">{t.simNonParticipating}</option>
                    <option value="participating">{t.simParticipating}</option>
                  </select>
                </div>
              </div>
              {inputs.liquidationType === 'participating' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step={0.5}
                    min={1}
                    disabled={inputs.participationCap === null}
                    value={inputs.participationCap ?? ''}
                    onChange={(e) => updateInput('participationCap', e.target.value ? Number(e.target.value) : null)}
                    placeholder="3.0"
                    className="flex-1 px-3 py-1.5 text-sm font-mono bg-white border border-[#D8D1C3] rounded-md disabled:bg-[#F6F4EF]"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-[#5A6475]">
                    <input
                      type="checkbox"
                      checked={inputs.participationCap === null}
                      onChange={(e) => updateInput('participationCap', e.target.checked ? null : 3.0)}
                    />
                    {t.simUncapped}
                  </label>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#15233E] mb-1">{t.simSeniority}</label>
                  <select
                    value={inputs.seniority}
                    onChange={(e) => updateInput('seniority', e.target.value as LiquidationSeniority)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D8D1C3] rounded-md"
                  >
                    <option value="senior">{t.simSenior}</option>
                    <option value="pari_passu">{t.simPariPassu}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#15233E] mb-1">{t.simAntiDilution}</label>
                  <select
                    value={inputs.antiDilution}
                    onChange={(e) => updateInput('antiDilution', e.target.value as AntiDilutionType)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D8D1C3] rounded-md"
                  >
                    <option value="none">{t.simAdNone}</option>
                    <option value="broad_based_wa">{t.simAdBroadWa}</option>
                    <option value="full_ratchet">{t.simAdFullRatchet}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Real-Time Dilution Impact */}
          <div className="xl:col-span-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-4">
                <div className="text-[11px] uppercase tracking-wider text-[#667085] font-medium">{t.simSharePrice}</div>
                <div className="mt-2 text-2xl font-semibold text-[#15233E] font-mono tabular-nums">{formatPriceSEK(simulation.sharePrice)}</div>
                <div className="mt-1 text-[11px] font-mono text-[#667085]">Pre-Money Base: {formatInt(simulation.preMoneySharesEffective)} sh</div>
              </div>
              <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-4">
                <div className="text-[11px] uppercase tracking-wider text-[#667085] font-medium">{t.simPostMoneyVal}</div>
                <div className="mt-2 text-2xl font-semibold text-[#15233E] font-mono tabular-nums">{formatSEK(simulation.postMoneyValuation, true)}</div>
                <div className="mt-1 text-[11px] font-mono text-[#667085]">{formatSEK(simulation.postMoneyValuation)}</div>
              </div>
              <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-4">
                <div className="text-[11px] uppercase tracking-wider text-[#667085] font-medium">{t.simNewSharesIssued}</div>
                <div className="mt-2 text-2xl font-semibold text-[#8C6D46] font-mono tabular-nums">{formatInt(simulation.newInvestorShares)}</div>
                <div className="mt-1 text-[11px] font-mono text-[#667085]">
                  New Investor: {formatPct(simulation.newInvestorOwnershipPct)} FD
                  {simulation.totalConvertedNoteShares > 0 && ` (+${formatInt(simulation.totalConvertedNoteShares)} K-lan)`}
                </div>
              </div>
            </div>

            {simulation.convertedNotes.length > 0 && (
              <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#E5E0D5] flex items-center justify-between">
                  <h3 className="text-base font-medium text-[#15233E] flex items-center gap-2" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                    <Calculator className="w-4 h-4 text-[#8C6D46]" strokeWidth={1.6} />
                    {t.simKlanBreakdown}
                  </h3>
                  <span className="text-[11px] font-mono text-[#667085]">Total: {formatInt(simulation.totalConvertedNoteShares)} shares</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F6F4EF]/70 border-b border-[#E5E0D5] text-[10px] uppercase tracking-wider text-[#5A6475]">
                        <th className="py-2.5 px-4 font-semibold">Noteholder</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Principal + Int.</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Discount Price</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Cap Price</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Conv. Price</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Shares</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E0D5]/70">
                      {simulation.convertedNotes.map((cn) => (
                        <tr key={cn.note.id}>
                          <td className="py-2.5 px-4 font-medium text-[#15233E]">{cn.note.holderName}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatSEK(cn.totalConversionAmount)}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#667085]">{formatPriceSEK(cn.discountPrice)}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#667085]">{cn.capPrice !== null ? formatPriceSEK(cn.capPrice) : 'N/A'}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-[#8C6D46]">
                            {formatPriceSEK(cn.effectivePrice)} ({cn.mechanism})
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-[#15233E]">{formatInt(cn.sharesIssued)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recharts Horizontal Stacked Ownership Chart */}
            <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-base font-medium text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                  {t.simBeforeAfterChart}
                </h3>
                <span className="text-[11px] font-mono tabular-nums text-[#667085]">Post-Money Pool: {formatPct(simulation.postMoneyPoolPct, 2)}</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={simulation.chartData} layout="vertical" margin={{ top: 8, right: 16, left: 10, bottom: 4 }} barSize={30}>
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#5A6475', fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#E5E0D5' }} tickLine={false} />
                    <YAxis type="category" dataKey="stage" width={106} tick={{ fontSize: 12, fill: '#15233E', fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomOwnershipTooltip />} cursor={{ fill: '#F6F4EF' }} />
                    {CHART_SERIES.map((series) => (
                      <Bar key={series.key} dataKey={series.key} name={series.label} stackId="ownership" fill={series.color} isAnimationActive={false} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 pt-3 border-t border-[#E5E0D5]/70 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[#495264]">
                {CHART_SERIES.map((series) => (
                  <div key={series.key} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: series.color }} />
                    <span>{series.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dilution Impact Table */}
            <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E0D5] flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-medium text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                  {t.simDilutionTable}
                </h3>
                <span className="text-[11px] font-mono tabular-nums text-[#667085]">
                  Aktiekapital +{formatSEK(simulation.shareCapitalIncrease)} (Kvotvarde {simulation.quotaValue.toFixed(4)} SEK)
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F6F4EF]/70 border-b border-[#E5E0D5] text-[10px] uppercase tracking-wider text-[#5A6475]">
                      <th className="py-3 px-4 font-semibold">Stakeholder</th>
                      <th className="py-3 px-3 font-semibold text-right">
                        Capital % ({t.simColBefore} <ArrowRight className="inline w-3 h-3" /> {t.simColAfter})
                      </th>
                      <th className="py-3 px-3 font-semibold text-right">{t.simColDelta}</th>
                      <th className="py-3 px-4 font-semibold text-right">
                        Voting % ({t.simColBefore} <ArrowRight className="inline w-3 h-3" /> {t.simColAfter})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D5]/70">
                    {simulation.stakeholderRows.map((row) => {
                      const isPos = row.capitalDeltaPct > 0.005;
                      const isNeg = row.capitalDeltaPct < -0.005;
                      return (
                        <tr key={row.id} className={row.isNew ? 'bg-[#8C6D46]/[0.05]' : 'hover:bg-[#F6F4EF]/40'}>
                          <td className="py-3 px-4">
                            <div className="font-medium text-[#15233E]">{row.name}</div>
                            <div className="text-[11px] text-[#667085] font-mono">{row.shareClassLabel} | {formatInt(row.sharesAfter)} sh</div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                            <span className="text-[#7A8291]">{formatPct(row.capitalPctBefore)}</span>
                            <span className="mx-1.5 text-[#B5AEA0]">-&gt;</span>
                            <span className="font-semibold text-[#15233E]">{formatPct(row.capitalPctAfter)}</span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                            <div className={`inline-flex items-center gap-0.5 font-medium ${isPos ? 'text-[#3B5B4A]' : isNeg ? 'text-[#9A342D]' : 'text-[#667085]'}`}>
                              {isPos && <ArrowUpRight className="w-3 h-3" />}
                              {isNeg && <ArrowDownRight className="w-3 h-3" />}
                              {formatDeltaPct(row.capitalDeltaPct)}
                            </div>
                            <div className="text-[10px] text-[#7A8291]">{formatBps(row.capitalDeltaBps)}</div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                            <span className="text-[#7A8291]">{formatPct(row.votingPctBefore)}</span>
                            <span className="mx-1.5 text-[#B5AEA0]">-&gt;</span>
                            <span className="font-semibold text-[#15233E]">{formatPct(row.votingPctAfter)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </DemoSpotlight>
    </div>
  );
}
