import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TooltipPayloadEntry, WaterfallPayoutMechanism } from '../types';
import { useCapTable } from '../context/CapTableContext';
import { DEMO_STEPS, useRecruiterDemo } from '../context/RecruiterDemoContext';
import {
  calculateExitWaterfall,
  generateWaterfallCurve,
} from '../engines/waterfallEngine';
import {
  formatInt,
  formatMOIC,
  formatPct,
  formatPriceSEK,
  formatSEK,
} from '../utils/formatters';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { DemoSpotlight } from '../components/demo/DemoSpotlight';

function CustomWaterfallTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string | number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const total = payload.reduce((sum, p) => sum + (p.value ?? 0), 0);
  return (
    <div className="bg-[#FCFBF9] border border-[#E5E0D5] shadow-lg rounded-md px-3.5 py-2.5 text-xs">
      <div className="font-semibold text-[#15233E] mb-1.5 border-b border-[#E5E0D5] pb-1">
        Exit Valuation: {label} MSEK
      </div>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[#495264]">
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-mono tabular-nums font-medium text-[#15233E]">
              {entry.value?.toFixed(2)} MSEK {total > 0 && `(${formatPct(((entry.value ?? 0) / total) * 100, 1)})`}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-1.5 border-t border-[#E5E0D5] flex justify-between font-semibold text-[#15233E]">
        <span>Total:</span>
        <span className="font-mono tabular-nums">{total.toFixed(2)} MSEK</span>
      </div>
    </div>
  );
}

export function WaterfallTab() {
  const { state, t } = useCapTable();
  const demo = useRecruiterDemo();
  const [exitValuation, setExitValuation] = useState<number>(50_000_000);
  const [includeWarrants, setIncludeWarrants] = useState<boolean>(true);
  const [chartMode, setChartMode] = useState<'line' | 'area'>('line');

  // Synthetic Interaction Engine — Step 2 (Sweep exit valuation: 15M -> 50M -> 120M)
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

    setIncludeWarrants(true);
    schedule(() => setExitValuation(15_000_000), 200);
    schedule(() => setExitValuation(50_000_000), 1600);
    schedule(() => setExitValuation(120_000_000), 3000);
    schedule(() => demo.markStepReady(2), 3700);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [demo.isDemoActive, demo.currentStepIndex, demo.demoRunId, demo.markStepReady]);

  const waterfallResult = useMemo(
    () => calculateExitWaterfall(state, exitValuation, includeWarrants),
    [state, exitValuation, includeWarrants]
  );

  const curveData = useMemo(
    () => generateWaterfallCurve(state, includeWarrants, Math.max(300_000_000, exitValuation * 1.5)),
    [state, includeWarrants, exitValuation]
  );

  const exitValMSEK = Number((exitValuation / 1_000_000).toFixed(1));

  const breakdownBarData = useMemo(() => [
    { name: 'Founders', payout: Number((waterfallResult.categoryTotals.Founders / 1_000_000).toFixed(2)), color: '#15233E' },
    { name: 'Angels', payout: Number((waterfallResult.categoryTotals.Angels / 1_000_000).toFixed(2)), color: '#8C6D46' },
    { name: 'VC', payout: Number((waterfallResult.categoryTotals.VC / 1_000_000).toFixed(2)), color: '#3B5984' },
    { name: 'ESOP', payout: Number((waterfallResult.categoryTotals.ESOP / 1_000_000).toFixed(2)), color: '#5C6F68' },
  ], [waterfallResult]);

  return (
    <div className="space-y-6">
      {/* Title & Presets Header Strip */}
      <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg px-5 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
            {t.wfTitle}
          </h2>
          <p className="text-xs text-[#5A6475] mt-0.5">{t.wfSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setExitValuation(15_000_000)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              exitValuation === 15_000_000
                ? 'bg-[#15233E] text-[#FCFBF9] border-[#15233E]'
                : 'bg-white text-[#495264] border-[#D8D1C3] hover:bg-[#F6F4EF]'
            }`}
          >
            {t.wfPresetDistressed}
          </button>
          <button
            type="button"
            onClick={() => setExitValuation(50_000_000)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              exitValuation === 50_000_000
                ? 'bg-[#15233E] text-[#FCFBF9] border-[#15233E]'
                : 'bg-white text-[#495264] border-[#D8D1C3] hover:bg-[#F6F4EF]'
            }`}
          >
            {t.wfPresetFlat}
          </button>
          <button
            type="button"
            onClick={() => setExitValuation(120_000_000)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              exitValuation === 120_000_000
                ? 'bg-[#15233E] text-[#FCFBF9] border-[#15233E]'
                : 'bg-white text-[#495264] border-[#D8D1C3] hover:bg-[#F6F4EF]'
            }`}
          >
            {t.wfPresetStrong}
          </button>
          <button
            type="button"
            onClick={() => setExitValuation(250_000_000)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              exitValuation === 250_000_000
                ? 'bg-[#15233E] text-[#FCFBF9] border-[#15233E]'
                : 'bg-white text-[#495264] border-[#D8D1C3] hover:bg-[#F6F4EF]'
            }`}
          >
            {t.wfPresetOutlier}
          </button>
        </div>
      </div>

      {/* Valuation Slider & KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5 bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs uppercase tracking-wider text-[#667085] font-medium">
                {t.wfExitValLabel}
              </label>
              <span className="text-xs font-mono font-bold text-[#8C6D46]">
                {formatSEK(exitValuation, true)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={300_000_000}
                step={2_500_000}
                value={exitValuation}
                onChange={(e) => setExitValuation(Number(e.target.value))}
                className="w-full accent-[#15233E] h-2 bg-[#ECE7DC] rounded-lg appearance-none cursor-pointer"
              />
              <div className="w-32 shrink-0">
                <input
                  type="number"
                  step={1_000_000}
                  min={0}
                  value={exitValuation}
                  onChange={(e) => setExitValuation(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-2.5 py-1 text-xs font-mono tabular-nums bg-white border border-[#D8D1C3] rounded text-right font-medium"
                />
              </div>
            </div>

            <div className="flex justify-between text-[10px] font-mono text-[#8A92A0] mt-1">
              <span>0 SEK</span>
              <span>75 MSEK</span>
              <span>150 MSEK</span>
              <span>225 MSEK</span>
              <span>300 MSEK</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E0D5] flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-medium text-[#15233E] cursor-pointer">
              <input
                type="checkbox"
                checked={includeWarrants}
                onChange={(e) => setIncludeWarrants(e.target.checked)}
              />
              <span>{t.wfWarrantToggle}</span>
            </label>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-4">
            <div className="text-[11px] uppercase tracking-wider text-[#667085] font-medium">
              Gross Distributable Pool
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#15233E] font-mono tabular-nums">
              {formatSEK(waterfallResult.totalDistributablePool, true)}
            </div>
            <div className="mt-1 text-[11px] font-mono text-[#667085]">
              {waterfallResult.warrantStrikeProceeds > 0 ? (
                <span className="text-[#3B5B4A]">
                  +{formatSEK(waterfallResult.warrantStrikeProceeds, true)} strike cash
                </span>
              ) : (
                'Pure equity proceeds'
              )}
            </div>
          </div>

          <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-4">
            <div className="text-[11px] uppercase tracking-wider text-[#667085] font-medium">
              Implied Common Share Price
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#8C6D46] font-mono tabular-nums">
              {formatPriceSEK(waterfallResult.impliedCommonSharePrice)}
            </div>
            <div className="mt-1 text-[11px] font-mono text-[#667085]">
              per Common share net
            </div>
          </div>

          <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-4">
            <div className="text-[11px] uppercase tracking-wider text-[#667085] font-medium">
              ITM Warrants Exercised
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#5C6F68] font-mono tabular-nums">
              {formatInt(waterfallResult.exercisedWarrantCount)}
            </div>
            <div className="mt-1 text-[11px] font-mono text-[#667085]">
              {includeWarrants ? 'Auto-exercised' : 'Exercise toggled off'}
            </div>
          </div>
        </div>
      </div>

      {/* Spotlight Step 2: Exit Curve & Stakeholder Proceeds */}
      <DemoSpotlight
        stepIndex={2}
        badgeText={state.language === 'SV' ? DEMO_STEPS[2].badgeSV : DEMO_STEPS[2].badgeEN}
        className="space-y-6"
      >
        {/* Waterfall Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Breakpoint Curve Chart */}
          <div className="lg:col-span-8 bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-base font-medium text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                  {t.wfChartCurveTitle}
                </h3>
                <p className="text-[11px] text-[#667085] mt-0.5">
                  Visualizes rational conversion thresholds, seniority payouts, and equity crossover points.
                </p>
              </div>

              <div className="inline-flex items-center rounded-md border border-[#D8D1C3] p-0.5 bg-[#F6F4EF]">
                <button
                  type="button"
                  onClick={() => setChartMode('line')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    chartMode === 'line' ? 'bg-white text-[#15233E] shadow-xs' : 'text-[#5A6475] hover:text-[#15233E]'
                  }`}
                >
                  {t.wfLineMode}
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('area')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    chartMode === 'area' ? 'bg-white text-[#15233E] shadow-xs' : 'text-[#5A6475] hover:text-[#15233E]'
                  }`}
                >
                  {t.wfAreaMode}
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === 'line' ? (
                  <LineChart data={curveData} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D5" vertical={false} />
                    <XAxis
                      dataKey="exitValMSEK"
                      tickFormatter={(v) => `${v}M`}
                      tick={{ fontSize: 11, fill: '#5A6475', fontFamily: 'JetBrains Mono' }}
                      axisLine={{ stroke: '#E5E0D5' }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => `${v}M`}
                      tick={{ fontSize: 11, fill: '#5A6475', fontFamily: 'JetBrains Mono' }}
                      axisLine={{ stroke: '#E5E0D5' }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomWaterfallTooltip />} />
                    <ReferenceLine
                      x={exitValMSEK}
                      stroke="#9A342D"
                      strokeDasharray="4 4"
                      label={{
                        value: `${exitValMSEK}M`,
                        fill: '#9A342D',
                        fontSize: 10,
                        position: 'top',
                      }}
                    />
                    <Line type="monotone" dataKey="Founders" stroke="#15233E" strokeWidth={2.4} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="Angels" stroke="#8C6D46" strokeWidth={1.8} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="VC" stroke="#3B5984" strokeWidth={2.4} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="ESOP" stroke="#5C6F68" strokeWidth={1.8} dot={false} isAnimationActive={false} />
                  </LineChart>
                ) : (
                  <AreaChart data={curveData} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D5" vertical={false} />
                    <XAxis
                      dataKey="exitValMSEK"
                      tickFormatter={(v) => `${v}M`}
                      tick={{ fontSize: 11, fill: '#5A6475', fontFamily: 'JetBrains Mono' }}
                      axisLine={{ stroke: '#E5E0D5' }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => `${v}M`}
                      tick={{ fontSize: 11, fill: '#5A6475', fontFamily: 'JetBrains Mono' }}
                      axisLine={{ stroke: '#E5E0D5' }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomWaterfallTooltip />} />
                    <ReferenceLine x={exitValMSEK} stroke="#9A342D" strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="VC" stackId="wf" stroke="#3B5984" fill="#3B5984" fillOpacity={0.85} isAnimationActive={false} />
                    <Area type="monotone" dataKey="Angels" stackId="wf" stroke="#8C6D46" fill="#8C6D46" fillOpacity={0.85} isAnimationActive={false} />
                    <Area type="monotone" dataKey="Founders" stackId="wf" stroke="#15233E" fill="#15233E" fillOpacity={0.85} isAnimationActive={false} />
                    <Area type="monotone" dataKey="ESOP" stackId="wf" stroke="#5C6F68" fill="#5C6F68" fillOpacity={0.85} isAnimationActive={false} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="mt-3 pt-3 border-t border-[#E5E0D5]/70 flex flex-wrap items-center justify-between gap-3 text-xs text-[#495264]">
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#15233E]" />
                  <span className="font-medium text-[#15233E]">Founders</span>
                  <span className="font-mono tabular-nums text-[#667085]">
                    ({formatSEK(waterfallResult.categoryTotals.Founders, true)})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#8C6D46]" />
                  <span className="font-medium text-[#15233E]">Angels</span>
                  <span className="font-mono tabular-nums text-[#667085]">
                    ({formatSEK(waterfallResult.categoryTotals.Angels, true)})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#3B5984]" />
                  <span className="font-medium text-[#15233E]">VC</span>
                  <span className="font-mono tabular-nums text-[#667085]">
                    ({formatSEK(waterfallResult.categoryTotals.VC, true)})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#5C6F68]" />
                  <span className="font-medium text-[#15233E]">ESOP</span>
                  <span className="font-mono tabular-nums text-[#667085]">
                    ({formatSEK(waterfallResult.categoryTotals.ESOP, true)})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#9A342D]">
                <span className="inline-block w-2.5 h-0.5 bg-[#9A342D]" />
                <span>Selected Exit: {exitValMSEK} MSEK</span>
              </div>
            </div>
          </div>

          {/* Current Proceeds Breakdown Bar Card */}
          <div className="lg:col-span-4 bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-medium text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                {t.wfChartBreakdownTitle}
              </h3>
              <p className="text-[11px] text-[#667085] mt-0.5">
                Proceeds at {formatSEK(exitValuation)} exit value.
              </p>

              <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdownBarData} margin={{ top: 8, right: 10, left: -15, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D5" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#15233E', fontWeight: 500 }} axisLine={{ stroke: '#E5E0D5' }} tickLine={false} />
                    <YAxis tickFormatter={(v) => `${v}M`} tick={{ fontSize: 10, fill: '#5A6475', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(2)} MSEK`, 'Payout']} />
                    <Bar dataKey="payout" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                      {breakdownBarData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E0D5] space-y-2">
              {breakdownBarData.map((b) => {
                const sharePct = exitValuation > 0 ? (b.payout * 1_000_000 / exitValuation) * 100 : 0;
                return (
                  <div key={b.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[#344054]">
                      <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: b.color }} />
                      {b.name}
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-[#15233E]">
                      {b.payout.toFixed(2)} MSEK <span className="text-[10px] text-[#667085] font-normal">({formatPct(sharePct, 1)})</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Stakeholder Payout & MOIC Table */}
        <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E0D5] flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-medium text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
              {t.wfPayoutTableTitle}
            </h3>
            <span className="text-xs font-mono tabular-nums text-[#667085]">
              Gross Exit Proceeds: {formatSEK(waterfallResult.totalDistributablePool)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F6F4EF]/70 border-b border-[#E5E0D5] text-[10px] uppercase tracking-wider text-[#5A6475]">
                  <th className="py-3 px-5 font-semibold">{t.colShareholder}</th>
                  <th className="py-3 px-3 font-semibold">{t.colCategory}</th>
                  <th className="py-3 px-3 font-semibold">{t.colShareClass}</th>
                  <th className="py-3 px-3 font-semibold text-right">{t.wfColInvested}</th>
                  <th className="py-3 px-3 font-semibold text-right">{t.wfColPayout}</th>
                  <th className="py-3 px-3 font-semibold text-right">{t.wfColShare}</th>
                  <th className="py-3 px-3 font-semibold text-right">{t.wfColMoic}</th>
                  <th className="py-3 px-5 font-semibold text-right">{t.wfColStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D5]/70">
                {waterfallResult.payoutRows.map((row) => {
                  const mechanismBadgeStyles: Record<WaterfallPayoutMechanism, string> = {
                    'Liquidation Preference': 'bg-[#8C6D46]/15 text-[#745836] border-[#8C6D46]/30',
                    'Converted to Common': 'bg-[#15233E]/10 text-[#15233E] border-[#15233E]/20',
                    'Participating (Capped)': 'bg-[#3B5984]/15 text-[#2E476E] border-[#3B5984]/30',
                    'Participating (Uncapped)': 'bg-[#3B5984]/15 text-[#2E476E] border-[#3B5984]/30',
                    'Common Pro-Rata': 'bg-[#F6F4EF] text-[#5A6475] border-[#D8D1C3]',
                    'Warrants Exercised (ITM)': 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30',
                    'Warrants Out-of-the-Money': 'bg-neutral-100 text-neutral-400 border-neutral-200',
                  };

                  return (
                    <tr key={row.id} className="hover:bg-[#F6F4EF]/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-[#15233E]">{row.name}</div>
                        <div className="text-[11px] font-mono text-[#7A8291]">
                          {formatInt(row.shares)} shares/warrants
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <CategoryBadge category={row.category} />
                      </td>
                      <td className="py-3.5 px-3 text-xs text-[#495264]">{row.shareClassName}</td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-[#667085]">
                        {formatSEK(row.investedCapital)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums font-semibold text-[#15233E]">
                        {formatSEK(row.netPayout)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-[#495264]">
                        {formatPct(row.shareOfProceedsPct, 2)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums font-medium text-[#8C6D46]">
                        {row.moic}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded border ${
                            mechanismBadgeStyles[row.mechanism] ?? 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {row.mechanism}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {waterfallResult.payoutRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-[#5A6475]">
                      <div className="max-w-sm mx-auto space-y-2">
                        <TrendingUp className="w-7 h-7 text-[#8C6D46] mx-auto opacity-60" />
                        <div className="font-medium text-[#15233E]">
                          {state.language === 'SV' ? 'Inga aktieägare att fördela likvid till' : 'No shareholders registered yet'}
                        </div>
                        <p className="text-xs text-[#7A8291]">
                          {state.language === 'SV'
                            ? 'Lägg till aktieägare i Aktieboken för att se waterfall-utfall.'
                            : 'Add shareholders in the Cap Table tab to view exit payouts.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#E5E0D5] bg-[#F6F4EF]/80 text-xs font-semibold text-[#15233E]">
                  <td colSpan={3} className="py-3.5 px-5">Total Exit Proceeds Distributed</td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                    {formatSEK(waterfallResult.payoutRows.reduce((sum, r) => sum + r.investedCapital, 0))}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums text-base font-bold text-[#15233E]">
                    {formatSEK(waterfallResult.payoutRows.reduce((sum, r) => sum + r.netPayout, 0))}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums">100.00%</td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums text-[#8C6D46]">
                    {formatMOIC(
                      waterfallResult.payoutRows.reduce((sum, r) => sum + r.netPayout, 0),
                      waterfallResult.payoutRows.reduce((sum, r) => sum + r.investedCapital, 0)
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right font-normal text-[11px] text-[#667085]">Equilibrium Solved</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Step-by-Step Audit Trace Card */}
        <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-5">
          <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3 mb-4">
            <h3 className="text-base font-medium text-[#15233E] flex items-center gap-2" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
              <TrendingUp className="w-4 h-4 text-[#8C6D46]" strokeWidth={1.6} />
              {t.wfTraceTitle}
            </h3>
            <span className="text-[11px] font-mono text-[#667085]">
              {waterfallResult.trace.length} Sequential Steps
            </span>
          </div>

          <div className="space-y-3.5">
            {waterfallResult.trace.map((step) => {
              const isSV = state.language === 'SV';
              const title = isSV ? step.titleSV : step.titleEN;
              const detail = isSV ? step.detailSV : step.detailEN;

              return (
                <div
                  key={step.stepNumber}
                  className="p-3.5 bg-[#F6F4EF]/70 border border-[#E5E0D5] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#15233E] text-[#FCFBF9] flex items-center justify-center text-xs font-mono font-semibold shrink-0 mt-0.5">
                      {step.stepNumber}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-[#15233E]">{title}</div>
                      <p className="text-xs text-[#495264] mt-0.5 leading-relaxed">{detail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono tabular-nums shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E5E0D5]">
                    <div>
                      <span className="text-[10px] uppercase text-[#7A8291] block">Allocated</span>
                      <span className="font-semibold text-[#15233E]">{formatSEK(step.allocatedAmount)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[#7A8291] block">Remaining Pool</span>
                      <span className="text-[#667085]">{formatSEK(step.remainingPool)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DemoSpotlight>
    </div>
  );
}
