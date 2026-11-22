import React from 'react';
import { CapTableState, ExitWaterfallResult, GeneratedClause } from '../../types';
import { useCapTableMetrics } from '../../context/CapTableContext';
import { formatInt, formatMOIC, formatPct, formatSEK } from '../../utils/formatters';

export function ExecutiveTransactionMemo({
  state,
  metrics,
  waterfall,
  clauses,
}: {
  state: CapTableState;
  metrics: ReturnType<typeof useCapTableMetrics>;
  waterfall: ExitWaterfallResult;
  clauses: GeneratedClause[];
}) {
  const currentDate = new Date().toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-[#15233E] space-y-6 font-serif">
      {/* Header Memo Strip */}
      <div className="border-b-2 border-[#15233E] pb-4 flex items-start justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C6D46]">
            LegalTech & Venture Capital Transaction Memo
          </div>
          <h1 className="text-2xl font-bold text-[#15233E] mt-0.5">
            {state.company.name} (publ / AB)
          </h1>
          <div className="text-xs font-mono text-[#5A6475] mt-1">
            Org.nr {state.company.orgNumber} | Aktiekapital: {formatSEK(state.company.shareCapital)} | Scenario: {state.company.scenarioLabel}
          </div>
        </div>

        <div className="text-right text-xs font-mono text-[#667085]">
          <div>Date: {currentDate}</div>
          <div className="text-[#8C6D46] font-semibold">NordicCap Legal Engine</div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-[#F6F4EF] rounded border border-[#E5E0D5] font-sans text-xs">
        <div>
          <span className="text-[10px] uppercase text-[#667085] block">Issued Shares</span>
          <span className="font-mono font-bold text-sm text-[#15233E]">{formatInt(metrics.totalIssuedShares)}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-[#667085] block">Fully Diluted</span>
          <span className="font-mono font-bold text-sm text-[#15233E]">{formatInt(metrics.fullyDilutedShares)}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-[#667085] block">Post-Money Valuation</span>
          <span className="font-mono font-bold text-sm text-[#15233E]">{formatSEK(state.company.postMoneyValuation, true)}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-[#667085] block">Quota Value (Kvotvarde)</span>
          <span className="font-mono font-bold text-sm text-[#15233E]">{metrics.quotaValue.toFixed(4)} SEK</span>
        </div>
      </div>

      {/* Certified Aktiebok Schedule */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#15233E] border-b border-[#D8D1C3] pb-1">
          1. Shareholder Register (Aktiebok per ABL 5 kap.)
        </h2>
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-[#D8D1C3] text-[10px] uppercase text-[#5A6475]">
              <th className="py-1.5 font-semibold">Shareholder</th>
              <th className="py-1.5 font-semibold">Category</th>
              <th className="py-1.5 font-semibold">Class</th>
              <th className="py-1.5 text-right font-semibold">Shares</th>
              <th className="py-1.5 text-right font-semibold">Capital %</th>
              <th className="py-1.5 text-right font-semibold">Voting %</th>
              <th className="py-1.5 text-right font-semibold">FD %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E0D5]">
            {state.shareholders.map((sh) => {
              const cls = metrics.classMap.get(sh.shareClassId);
              const votes = sh.shares * (cls?.votesPerShare ?? 1);
              const capPct = metrics.totalIssuedShares > 0 ? (sh.shares / metrics.totalIssuedShares) * 100 : 0;
              const votePct = metrics.totalVotes > 0 ? (votes / metrics.totalVotes) * 100 : 0;
              const fdPct = metrics.fullyDilutedShares > 0 ? (sh.shares / metrics.fullyDilutedShares) * 100 : 0;

              return (
                <tr key={sh.id}>
                  <td className="py-1.5 font-medium">{sh.name}</td>
                  <td className="py-1.5 text-[#667085]">{sh.category}</td>
                  <td className="py-1.5 text-[#667085]">{cls?.name ?? 'Common'}</td>
                  <td className="py-1.5 text-right font-mono">{formatInt(sh.shares)}</td>
                  <td className="py-1.5 text-right font-mono">{formatPct(capPct)}</td>
                  <td className="py-1.5 text-right font-mono font-semibold">{formatPct(votePct)}</td>
                  <td className="py-1.5 text-right font-mono text-[#5A6475]">{formatPct(fdPct)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Exit Waterfall Schedule */}
      <div className="space-y-2 pt-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#15233E] border-b border-[#D8D1C3] pb-1">
          2. Exit Waterfall Distribution Schedule ({formatSEK(waterfall.exitValuation)} Valuation)
        </h2>
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-[#D8D1C3] text-[10px] uppercase text-[#5A6475]">
              <th className="py-1.5 font-semibold">Stakeholder</th>
              <th className="py-1.5 text-right font-semibold">Invested (SEK)</th>
              <th className="py-1.5 text-right font-semibold">Net Payout (SEK)</th>
              <th className="py-1.5 text-right font-semibold">Share %</th>
              <th className="py-1.5 text-right font-semibold">MOIC</th>
              <th className="py-1.5 text-right font-semibold">Mechanism</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E0D5]">
            {waterfall.payoutRows.map((r) => (
              <tr key={r.id}>
                <td className="py-1.5 font-medium">{r.name}</td>
                <td className="py-1.5 text-right font-mono">{formatSEK(r.investedCapital)}</td>
                <td className="py-1.5 text-right font-mono font-semibold">{formatSEK(r.netPayout)}</td>
                <td className="py-1.5 text-right font-mono">{formatPct(r.shareOfProceedsPct)}</td>
                <td className="py-1.5 text-right font-mono text-[#8C6D46]">{r.moic}</td>
                <td className="py-1.5 text-right text-[11px] text-[#5A6475]">{r.mechanism}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Commercial Clauses */}
      <div className="space-y-3 pt-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#15233E] border-b border-[#D8D1C3] pb-1">
          3. Principal SHA & Bolagsordning Clauses
        </h2>
        <div className="space-y-3">
          {clauses.slice(0, 3).map((clause) => (
            <div key={clause.id} className="text-xs space-y-1">
              <div className="font-bold text-[#15233E]">
                {clause.titleEN} ({clause.category})
              </div>
              <p className="text-[#344054] leading-relaxed text-[11px] whitespace-pre-line">
                {clause.bodyEN}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sign-off footer */}
      <div className="pt-8 border-t border-[#D8D1C3] flex justify-between text-xs font-mono text-[#7A8291]">
        <div>Generated by NordicCap Engine — ABL 2005:551 Compliant</div>
        <div>Confidential / Corporate Law Dossier</div>
      </div>
    </div>
  );
}
