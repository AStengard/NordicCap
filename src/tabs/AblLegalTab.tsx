import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  FileText,
  Info,
  Scale,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useCapTable, useCapTableMetrics } from '../context/CapTableContext';
import { DEMO_STEPS, useRecruiterDemo } from '../context/RecruiterDemoContext';
import {
  evaluateABLCompliance,
  generateBolagsverketChecklist,
  generateLegalClauses,
} from '../engines/ablLegalEngine';
import { DemoSpotlight } from '../components/demo/DemoSpotlight';

export function AblLegalTab() {
  const { state, t } = useCapTable();
  const metrics = useCapTableMetrics();
  const demo = useRecruiterDemo();

  const [dragThreshold, setDragThreshold] = useState<number>(75);
  const [selectedPrefClassId, setSelectedPrefClassId] = useState<string>(() => {
    const pref = state.shareClasses.find((c) => c.isPreferred);
    return pref?.id ?? '';
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState<boolean>(false);
  const [subPage, setSubPage] = useState<'governance' | 'clauses'>('governance');

  useEffect(() => {
    const pref = state.shareClasses.find((c) => c.isPreferred);
    if (pref && !selectedPrefClassId) {
      setSelectedPrefClassId(pref.id);
    }
  }, [state.shareClasses, selectedPrefClassId]);

  // Synthetic Interaction Engine — Steps 4 & 5
  useEffect(() => {
    if (!demo.isDemoActive) return;
    if (demo.currentStepIndex === 4) {
      setSubPage('governance');
      const timer = window.setTimeout(() => demo.markStepReady(4), 2400);
      return () => window.clearTimeout(timer);
    }
    if (demo.currentStepIndex === 5) {
      setSubPage('clauses');
      const timer = window.setTimeout(() => demo.markStepReady(5), 2400);
      return () => window.clearTimeout(timer);
    }
  }, [demo.isDemoActive, demo.currentStepIndex, demo.demoRunId, demo.markStepReady]);

  const rules = useMemo(() => evaluateABLCompliance(state, metrics), [state, metrics]);
  const bolagsverketDocs = useMemo(() => generateBolagsverketChecklist(state), [state]);
  const prefClass = useMemo(
    () =>
      state.shareClasses.find((c) => c.id === selectedPrefClassId) ||
      state.shareClasses.find((c) => c.isPreferred) ||
      null,
    [state.shareClasses, selectedPrefClassId]
  );
  const clauses = useMemo(
    () => generateLegalClauses(state, prefClass, dragThreshold),
    [state, prefClass, dragThreshold]
  );

  const copyToClipboard = (text: string, id: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const copyAllClauses = () => {
    const fullText = clauses
      .map(
        (c) =>
          `### ${c.titleEN} / ${c.titleSV}\n*${c.mathSummary}*\n\n[ENGLISH]\n${c.bodyEN}\n\n[SVENSKA]\n${c.bodySV}`
      )
      .join('\n\n---\n\n');
    copyToClipboard(fullText, 'ALL');
  };

  const isSV = state.language === 'SV';

  return (
    <div className="space-y-6">
      {/* Sub-Page Navigation Switcher for Step 3.4 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FCFBF9] border border-[#E5E0D5] rounded-xl p-2.5 shadow-2xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setSubPage('governance')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              subPage === 'governance'
                ? 'bg-[#15233E] text-[#FCFBF9] shadow-xs'
                : 'text-[#5A6475] hover:text-[#15233E] hover:bg-[#F6F4EF]'
            }`}
          >
            <Scale className="w-4 h-4 text-[#D8B98E]" strokeWidth={1.8} />
            <span>{t.ablSubGovernance}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              subPage === 'governance' ? 'bg-white/15 text-white' : 'bg-[#E5E0D5] text-[#5A6475]'
            }`}>
              {rules.length} kontroller
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubPage('clauses')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              subPage === 'clauses'
                ? 'bg-[#15233E] text-[#FCFBF9] shadow-xs'
                : 'text-[#5A6475] hover:text-[#15233E] hover:bg-[#F6F4EF]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#8C6D46]" strokeWidth={1.8} />
            <span>{t.ablSubClauses}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              subPage === 'clauses' ? 'bg-white/15 text-white' : 'bg-[#E5E0D5] text-[#5A6475]'
            }`}>
              {clauses.length} klausuler
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#667085]">
          <span className="font-mono text-[11px] bg-[#F6F4EF] px-2 py-0.5 rounded border border-[#E5E0D5]">
            {state.language === 'SV' ? 'Kapitel 3.4 av 3.4' : 'Chapter 3.4 of 3.4'}
          </span>
        </div>
      </div>

      {/* Title & Action Strip */}
      <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg px-5 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
            {t.ablTitle}
          </h2>
          <p className="text-xs text-[#5A6475] mt-0.5">{t.ablSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowMethodology(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#15233E] bg-[#F6F4EF] hover:bg-[#ECE7DC] border border-[#D8D1C3] rounded-md transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-[#8C6D46]" strokeWidth={1.8} />
            {t.ablMethodologyBtn}
          </button>
          <button
            type="button"
            onClick={copyAllClauses}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#15233E] text-[#FCFBF9] rounded-md hover:bg-[#1E3156] transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-[#D8B98E]" strokeWidth={1.8} />
            {copiedId === 'ALL' ? t.ablCopied : t.ablCopyAll}
          </button>
        </div>
      </div>

      {/* SUB-PAGE 1: ABL Majority & Bolagsverket Checklist */}
      {subPage === 'governance' && (
        <div className="space-y-6">
          <DemoSpotlight
            stepIndex={4}
            badgeText={isSV ? DEMO_STEPS[4].badgeSV : DEMO_STEPS[4].badgeEN}
            className="space-y-6"
          >
        {/* ABL Rules Grid */}
        <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-5">
          <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3 mb-4">
            <h3 className="text-base font-medium text-[#15233E] flex items-center gap-2" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
              <Scale className="w-4 h-4 text-[#8C6D46]" strokeWidth={1.6} />
              {t.ablCheckerTitle}
            </h3>
            <span className="text-[11px] font-mono text-[#667085]">
              Aktiebolagslagen (2005:551)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rules.map((rule) => {
              const title = isSV ? rule.titleSV : rule.titleEN;
              const explanation = isSV ? rule.explanationSV : rule.explanationEN;

              const borderStyles =
                rule.severity === 'critical'
                  ? 'border-[#9A342D]/40 bg-[#9A342D]/[0.03]'
                  : rule.severity === 'warning'
                    ? 'border-[#8C6D46]/40 bg-[#8C6D46]/[0.03]'
                    : 'border-[#3B5B4A]/30 bg-[#3B5B4A]/[0.02]';

              const badgeStyles =
                rule.severity === 'critical'
                  ? 'bg-[#9A342D]/15 text-[#9A342D] border-[#9A342D]/30'
                  : rule.severity === 'warning'
                    ? 'bg-[#8C6D46]/15 text-[#745836] border-[#8C6D46]/30'
                    : 'bg-[#3B5B4A]/15 text-[#284234] border-[#3B5B4A]/30';

              const Icon =
                rule.severity === 'critical' ? ShieldAlert : rule.severity === 'warning' ? AlertTriangle : ShieldCheck;

              return (
                <div key={rule.id} className={`p-4 rounded-lg border ${borderStyles} flex flex-col justify-between space-y-3`}>
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-mono font-semibold text-[#8C6D46]">{rule.statute}</span>
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                    </div>

                    <h4 className="text-xs font-semibold text-[#15233E] leading-snug">{title}</h4>
                    <p className="text-[11px] text-[#495264] mt-1.5 leading-relaxed">{explanation}</p>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D5]/70 flex items-center justify-between text-[11px]">
                    <span className="text-[#667085]">Majority Required:</span>
                    <span className={`px-2 py-0.5 rounded font-mono font-semibold border ${badgeStyles}`}>
                      {rule.majorityRequired}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bolagsverket Registration Checklist */}
        <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E0D5] flex items-center justify-between">
            <h3 className="text-base font-medium text-[#15233E] flex items-center gap-2" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
              <FileText className="w-4 h-4 text-[#8C6D46]" strokeWidth={1.6} />
              {t.ablChecklistTitle}
            </h3>
            <span className="text-[11px] font-mono text-[#667085]">
              Bolagsverket Registration Dossier
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F6F4EF]/70 border-b border-[#E5E0D5] text-[10px] uppercase tracking-wider text-[#5A6475]">
                  <th className="py-2.5 px-5 font-semibold">Document (Handling)</th>
                  <th className="py-2.5 px-3 font-semibold">ABL Statute</th>
                  <th className="py-2.5 px-3 font-semibold">Requirement</th>
                  <th className="py-2.5 px-5 font-semibold">Filing Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D5]/70">
                {bolagsverketDocs.map((doc) => {
                  const title = isSV ? doc.titleSV : doc.titleEN;
                  const note = isSV ? doc.noteSV : doc.noteEN;

                  return (
                    <tr key={doc.id} className="hover:bg-[#F6F4EF]/40">
                      <td className="py-3 px-5 font-medium text-[#15233E]">{title}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#8C6D46]">{doc.statute}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded border ${
                            doc.required
                              ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                          }`}
                        >
                          {doc.required ? 'Mandatory' : 'Conditional'}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-[#495264] text-[11px] leading-relaxed">{note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </DemoSpotlight>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setSubPage('clauses');
            window.scrollTo({ top: 300, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#15233E] bg-[#FCFBF9] hover:bg-[#F6F4EF] border border-[#D8D1C3] rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          <span>{state.language === 'SV' ? 'Visa avtalsklausuler & PM-villkor →' : 'View Legal Clauses & SHA Preview →'}</span>
        </button>
      </div>
    </div>
  )}

  {/* SUB-PAGE 2: Dynamic Legal Clauses & SHA Preview */}
  {subPage === 'clauses' && (
    <DemoSpotlight
      stepIndex={5}
      badgeText={isSV ? DEMO_STEPS[5].badgeSV : DEMO_STEPS[5].badgeEN}
      className="space-y-5"
    >
        <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-lg p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E0D5] pb-4">
            <div>
              <h3 className="text-base font-medium text-[#15233E]" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                {t.ablClauseTitle}
              </h3>
              <p className="text-xs text-[#5A6475] mt-0.5">
                Dynamic legal clauses synchronized in real time with the active Cap Table and preference terms.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-[#15233E]">Preference Class:</label>
                <select
                  value={selectedPrefClassId}
                  onChange={(e) => setSelectedPrefClassId(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#D8D1C3] rounded-md font-medium"
                >
                  {state.shareClasses.filter((c) => c.isPreferred).length === 0 ? (
                    <option value="">No Preference Classes</option>
                  ) : (
                    state.shareClasses
                      .filter((c) => c.isPreferred)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.liquidationMultiple}x {c.liquidationType})
                        </option>
                      ))
                  )}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-[#15233E]">Drag Trigger:</label>
                <select
                  value={dragThreshold}
                  onChange={(e) => setDragThreshold(Number(e.target.value))}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#D8D1C3] rounded-md font-mono"
                >
                  <option value={66.7}>66.7% (2/3 ABL)</option>
                  <option value={75}>75.0% (Nordic Standard)</option>
                  <option value={80}>80.0% (Conservative)</option>
                  <option value={90}>90.0% (9/10 ABL)</option>
                </select>
              </div>
            </div>
          </div>

          {!prefClass && (
            <div className="bg-[#8C6D46]/10 border border-[#8C6D46]/30 rounded-lg p-3.5 text-xs text-[#745836] flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              <span>{t.ablNoPrefHint}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {clauses.map((clause) => {
              const title = isSV ? clause.titleSV : clause.titleEN;
              const body = isSV ? clause.bodySV : clause.bodyEN;
              const isCopied = copiedId === clause.id;

              return (
                <div
                  key={clause.id}
                  className="bg-white border border-[#E5E0D5] rounded-lg p-4 flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-mono font-medium rounded ${
                            clause.category === 'SHA'
                              ? 'bg-[#15233E]/10 text-[#15233E]'
                              : 'bg-[#8C6D46]/15 text-[#745836]'
                          }`}
                        >
                          {clause.category}
                        </span>
                        <h4 className="text-xs font-semibold text-[#15233E]">{title}</h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(`### ${title}\n*${clause.mathSummary}*\n\n${body}`, clause.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8C6D46] hover:text-[#15233E]"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">{t.ablCopied}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{t.ablCopyClause}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="px-2.5 py-1 bg-[#F6F4EF] rounded border border-[#E5E0D5] text-[10px] font-mono text-[#5A6475]">
                      {clause.mathSummary}
                    </div>

                    <div className="text-xs text-[#344054] leading-relaxed whitespace-pre-line font-serif bg-[#FCFBF9] p-3 rounded border border-[#E5E0D5]/60">
                      {body}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DemoSpotlight>
    )}

      {/* Chapter 3.4 Footer Navigation */}
      <div className="pt-4 border-t border-[#E5E0D5] flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'SET_TAB', payload: 'waterfall' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#5A6475] hover:text-[#15233E] bg-[#FCFBF9] hover:bg-[#F6F4EF] border border-[#D8D1C3] rounded-lg transition-colors cursor-pointer"
        >
          {t.navBackToWaterfall}
        </button>

        <div className="text-xs text-[#7A8291] font-mono">
          {state.language === 'SV' ? 'Kapitel 3.4 ABL Juridik & Klausuler' : 'Chapter 3.4 ABL Legal & Governance'}
        </div>

        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'SET_TAB', payload: 'cap_table' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#FCFBF9] bg-[#15233E] hover:bg-[#1E3156] rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <span>{state.language === 'SV' ? '↺ Tillbaka till 3.1 Aktiebok' : '↺ Back to 3.1 Cap Table'}</span>
        </button>
      </div>

      {/* Methodology & Legal Disclaimer Modal */}
      {showMethodology && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#15233E]/40 backdrop-blur-[2px]" onClick={() => setShowMethodology(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-[#FCFBF9] border border-[#E5E0D5] rounded-xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 bg-[#15233E] text-[#FCFBF9] flex items-center justify-between">
              <h3 className="text-lg font-medium" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                {t.ablMethodologyTitle}
              </h3>
              <button
                type="button"
                onClick={() => setShowMethodology(false)}
                className="p-1 text-[#D8D1C3] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#344054] leading-relaxed">
              <div>
                <h4 className="font-semibold text-[#15233E] text-sm">1. Pre-Money Option Pool Shuffle Mathematics</h4>
                <p className="mt-1">
                  When creating an unallocated option pool pre-money, the option pool size is defined as a percentage of the <em>post-money</em> fully diluted capital:
                </p>
                <div className="bg-[#F6F4EF] p-2.5 rounded font-mono text-[11px] my-1.5 border border-[#E5E0D5]">
                  Target Pool % = Total Warrants / (Pre-Money Shares + New Investor Shares + Converted Note Shares + New Warrants)
                </div>
                <p>
                  Because the share price depends on the pre-money share count including the new warrants, this creates circularity. NordicCap solves this using an iterative fixed-point algorithm converging within 40 passes to &plusmn;1 share accuracy.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#15233E] text-sm">2. Convertible Notes (Konvertibellan) min(Cap, Discount)</h4>
                <p className="mt-1">
                  Under Chapter 15 ABL, convertible notes convert into equity with interest accrued over the holding period:
                </p>
                <div className="bg-[#F6F4EF] p-2.5 rounded font-mono text-[11px] my-1.5 border border-[#E5E0D5]">
                  Conversion Price = min( Round Share Price &times; (1 &minus; Discount Rate), Valuation Cap / Pre-Money Shares )
                </div>
                <p>
                  NordicCap models both mechanisms and issues shadow or separate share classes preserving statutory Swedish Kvotvarde.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#15233E] text-sm">3. Equilibrium Exit Waterfall & Rational Conversion</h4>
                <p className="mt-1">
                  Investors holding non-participating preferred shares will elect the higher of their 1.0x (or multiple) liquidation preference or their pro-rata as-converted common share value. Because one shareholder converting alters the residual pool for all other holders, NordicCap resolves this using an iterative game-theoretic equilibrium solver.
                </p>
              </div>

              <div className="pt-3 border-t border-[#E5E0D5]">
                <h4 className="font-semibold text-[#9A342D] text-xs uppercase tracking-wider">Statutory Disclaimer</h4>
                <p className="mt-1 text-[11px] text-[#667085]">
                  NordicCap is a legaltech modeling simulation engine designed for educational and decision-support purposes. It does not constitute formal legal or financial advice under the Swedish Bar Association (*Sveriges advokatsamfund*) rules.
                </p>
              </div>
            </div>

            <div className="px-6 py-3 bg-[#F6F4EF] border-t border-[#E5E0D5] flex justify-end">
              <button
                type="button"
                onClick={() => setShowMethodology(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-[#15233E] text-[#FCFBF9] rounded-md"
              >
                {t.ablClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
