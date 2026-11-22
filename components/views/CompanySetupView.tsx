import React, { useEffect, useState } from 'react';
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
  X,
} from 'lucide-react';
import { ShareClass, Shareholder, StakeholderCategory } from '../../types';
import { useCapTable, useCapTableMetrics } from '../../context/CapTableContext';
import { DEMO_STEPS, useRecruiterDemo } from '../../context/RecruiterDemoContext';
import { createPreSeriesAScenario, createSeriesARecruiterDemoScenario } from '../../constants/scenarios';
import { formatInt, formatPct, formatSEK, generateId } from '../../utils/formatters';
import { CategoryBadge } from '../ui/CategoryBadge';
import { DemoSpotlight } from '../demo/DemoSpotlight';
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
  const demo = useRecruiterDemo();
  const isSV = state.language === 'SV';

  const [drawer, setDrawer] = useState<DrawerMode>({ type: 'none' });

  // Company profile form fields
  const [compName, setCompName] = useState(state.company.name);
  const [orgNum, setOrgNum] = useState(state.company.orgNumber);
  const [shareCap, setShareCap] = useState(String(state.company.shareCapital));
  const [postVal, setPostVal] = useState(String(state.company.postMoneyValuation));
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [classToast, setClassToast] = useState<string | null>(null);

  // Sync state if scenario changes externally
  useEffect(() => {
    setCompName(state.company.name);
    setOrgNum(state.company.orgNumber);
    setShareCap(String(state.company.shareCapital));
    setPostVal(String(state.company.postMoneyValuation));
  }, [state.company]);

  // Inline Quick-Add Shareholder state
  const [showInlineShareholder, setShowInlineShareholder] = useState(state.shareholders.length === 0);
  const [shName, setShName] = useState('');
  const [shCategory, setShCategory] = useState<StakeholderCategory>('Founder');
  const [shClassId, setShClassId] = useState(state.shareClasses[0]?.id ?? '');
  const [shShares, setShShares] = useState('25000');
  const [shInvested, setShInvested] = useState('25000');

  // Synthetic Interaction Engine — Step 0 (Live fill-in on Page 2)
  useEffect(() => {
    if (!demo.isDemoActive || demo.currentStepIndex !== 0) return;

    let cancelled = false;
    const timers: number[] = [];
    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.push(id);
    };

    // Reset local state to empty/initial for live typing demonstration
    setCompName('');
    setOrgNum('');
    setShareCap('25000');
    setPostVal('0');
    setShowInlineShareholder(true);
    setShName('');

    // Phase 1: Type company name
    const targetName = 'NordicTech Health AB';
    for (let i = 1; i <= targetName.length; i++) {
      schedule(() => setCompName(targetName.slice(0, i)), 150 + i * 35);
    }

    // Phase 2: Type org number
    const targetOrg = '559123-4567';
    const orgStartMs = 150 + targetName.length * 35 + 80;
    for (let i = 1; i <= targetOrg.length; i++) {
      schedule(() => setOrgNum(targetOrg.slice(0, i)), orgStartMs + i * 40);
    }

    // Phase 3: Set share capital & valuation and save company
    const saveCompMs = orgStartMs + targetOrg.length * 40 + 120;
    schedule(() => {
      setShareCap('50000');
      setPostVal('12000000');
      dispatch({
        type: 'UPDATE_COMPANY',
        payload: {
          name: 'NordicTech Health AB',
          orgNumber: '559123-4567',
          shareCapital: 50000,
          postMoneyValuation: 12000000,
        },
      });
      setIsSavedToast(true);
    }, saveCompMs);

    schedule(() => setIsSavedToast(false), saveCompMs + 1800);

    // Phase 4: Type first founder in inline quick-add form
    const f1StartMs = saveCompMs + 300;
    const f1Name = 'Astrid Lindgren (Grundare)';
    for (let i = 1; i <= f1Name.length; i++) {
      schedule(() => setShName(f1Name.slice(0, i)), f1StartMs + i * 30);
    }
    const f1CommitMs = f1StartMs + f1Name.length * 30 + 150;
    schedule(() => {
      setShShares('60000');
      setShInvested('30000');
      setShCategory('Founder');
      const classAId = state.shareClasses[0]?.id || 'cls_common_a';
      setShClassId(classAId);
      dispatch({
        type: 'UPSERT_SHAREHOLDER',
        payload: {
          id: 'sh_founder_1',
          name: 'Astrid Lindgren (Grundare)',
          category: 'Founder',
          shareClassId: classAId,
          shares: 60000,
          investedAmount: 30000,
        },
      });
      setShName('');
    }, f1CommitMs);

    // Phase 5: Type second founder in inline quick-add form
    const f2StartMs = f1CommitMs + 300;
    const f2Name = 'Erik Karlsson (Grundare)';
    for (let i = 1; i <= f2Name.length; i++) {
      schedule(() => setShName(f2Name.slice(0, i)), f2StartMs + i * 30);
    }
    const f2CommitMs = f2StartMs + f2Name.length * 30 + 150;
    schedule(() => {
      setShShares('40000');
      setShInvested('20000');
      setShCategory('Founder');
      const classB = state.shareClasses.find((c) => !c.isPreferred && c.id !== (state.shareClasses[0]?.id || 'cls_common_a')) || state.shareClasses[1];
      const classBId = classB?.id || 'cls_common_b';
      setShClassId(classBId);
      dispatch({
        type: 'UPSERT_SHAREHOLDER',
        payload: {
          id: 'sh_founder_2',
          name: 'Erik Karlsson (Grundare)',
          category: 'Founder',
          shareClassId: classBId,
          shares: 40000,
          investedAmount: 20000,
        },
      });
      setShName('');
      demo.markStepReady(0);
    }, f2CommitMs);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [demo.isDemoActive, demo.currentStepIndex, demo.demoRunId, demo.markStepReady, dispatch, state.shareClasses]);

  useEffect(() => {
    if ((!shClassId || !state.shareClasses.some((c) => c.id === shClassId)) && state.shareClasses.length > 0) {
      setShClassId(state.shareClasses[0].id);
    }
  }, [state.shareClasses, shClassId]);

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

  const handleQuickAddShareholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shName.trim()) return;

    const chosenClassId = shClassId || state.shareClasses[0]?.id || 'cls_common_a';
    const numShares = Math.max(1, Math.round(Number(shShares) || 25000));
    const numInvested = Math.max(0, Math.round(Number(shInvested) || 25000));

    dispatch({
      type: 'UPSERT_SHAREHOLDER',
      payload: {
        id: generateId('sh'),
        name: shName.trim(),
        category: shCategory,
        shareClassId: chosenClassId,
        shares: numShares,
        investedAmount: numInvested,
      },
    });

    // Reset inputs for fast next entry
    setShName('');
    setShShares('25000');
    setShInvested('25000');
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

      {/* Sample Companies Quick-Loader */}
      <div className="bg-[#FCFBF9] border border-[#8C6D46]/30 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-xl">
          <span className="w-9 h-9 rounded-xl bg-[#8C6D46]/15 text-[#8C6D46] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#15233E]">
                {isSV ? 'Förifyll med ett exempelbolag' : 'Pre-fill with a Sample Company'}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-[#8C6D46]/15 text-[#8C6D46] font-semibold">
                {isSV ? 'Exempel' : 'Samples'}
              </span>
            </div>
            <p className="text-xs text-[#5A6475] mt-1 leading-relaxed">
              {isSV
                ? 'Vill du se ett färdigt bolag i aktieboken? Klicka på ett exempel för att automatiskt ladda in bolagsuppgifter, aktieslag och investerare.'
                : 'Want to explore realistic data? Click a sample company below to instantly populate founders, share classes, and investments.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'LOAD_SCENARIO', payload: createPreSeriesAScenario() });
              if (demo.isDemoActive) demo.exitDemo();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#15233E] bg-[#F6F4EF] hover:bg-[#EAE5D9] border border-[#D8D1C3] rounded-lg transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
            title={t.sampleSeedTooltip}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#8C6D46] shrink-0" />
            <span>{isSV ? 'Såddbolag (Seed)' : 'Seed Stage Sample'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'LOAD_SCENARIO', payload: createSeriesARecruiterDemoScenario() });
              if (demo.isDemoActive) demo.exitDemo();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#FCFBF9] bg-[#15233E] hover:bg-[#1E3156] rounded-lg transition-all cursor-pointer shadow-xs group"
            title={t.sampleSeriesATooltip}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#D8B98E] shrink-0" />
            <span>{isSV ? 'Serie A VC-bolag' : 'Series A VC Sample'}</span>
          </button>
        </div>
      </div>

      {/* Spotlight Step 0: Company Setup & Live Data Entry */}
      <DemoSpotlight
        stepIndex={0}
        badgeText={isSV ? DEMO_STEPS[0].badgeSV : DEMO_STEPS[0].badgeEN}
        className="space-y-8"
      >
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
              className="px-4 py-2 text-xs font-semibold bg-[#15233E] hover:bg-[#1E3156] text-[#FCFBF9] rounded-md transition-colors cursor-pointer"
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

          <div className="flex items-center gap-2">
            {classToast && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {classToast}
              </span>
            )}
            <button
              type="button"
              onClick={() => setDrawer({ type: 'share_class' })}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white border border-[#8C6D46] text-[#15233E] hover:bg-[#F6F4EF] rounded-md shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#8C6D46]" />
              <span>{isSV ? 'Lägg till aktieslag' : 'Add Share Class'}</span>
            </button>
          </div>
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
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDrawer({ type: 'share_class', item: cls })}
                    className="p-1 text-[#5A6475] hover:text-[#15233E] rounded cursor-pointer"
                    title="Edit share class"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {state.shareClasses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({ type: 'DELETE_SHARE_CLASS', payload: cls.id });
                        setClassToast(isSV ? `Aktieslag ${cls.name} togs bort` : `Share class ${cls.name} removed`);
                        setTimeout(() => setClassToast(null), 2500);
                      }}
                      className="p-1 text-[#5A6475] hover:text-[#9A342D] rounded cursor-pointer"
                      title={isSV ? `Ta bort ${cls.name}` : `Delete ${cls.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
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

      {/* SECTION 3: Shareholders & Founders */}
      <div className="bg-[#FCFBF9] border border-[#E5E0D5] rounded-2xl p-6 shadow-xs space-y-5">
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowInlineShareholder((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-[#D8D1C3] text-[#15233E] hover:bg-[#F6F4EF] rounded-md shadow-2xs transition-colors cursor-pointer"
            >
              {showInlineShareholder ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>{isSV ? 'Dölj snabbformulär' : 'Hide Quick Form'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-[#8C6D46]" />
                  <span>{isSV ? 'Öppna snabbformulär' : 'Quick Form'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setDrawer({ type: 'shareholder' })}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#15233E] text-[#FCFBF9] hover:bg-[#1E3156] rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSV ? 'Fullständig dialog' : 'Full Drawer Form'}</span>
            </button>
          </div>
        </div>

        {/* INLINE QUICK-ADD FORM */}
        {showInlineShareholder && (
          <form
            onSubmit={handleQuickAddShareholder}
            className="bg-white border-2 border-[#8C6D46]/40 rounded-xl p-4 sm:p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#15233E] uppercase tracking-wider font-mono">
                {isSV ? '+ Lägg till aktieägare (Snabbformulär)' : '+ Add Shareholder (Fast Input)'}
              </span>
              <span className="text-[11px] text-[#7A8291]">
                {isSV ? 'Fyll i och klicka spara' : 'Fill in and click save'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-[#15233E] mb-1">
                  {isSV ? 'Aktieägarens namn / Bolag' : 'Shareholder Name / Entity'} *
                </label>
                <input
                  type="text"
                  required
                  value={shName}
                  onChange={(e) => setShName(e.target.value)}
                  placeholder={isSV ? 't.ex. Astrid Lindholm (VD)' : 'e.g. Astrid Lindholm (CEO)'}
                  className="w-full px-3 py-1.5 text-xs bg-[#FCFBF9] border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#15233E] mb-1">
                  {isSV ? 'Kategori' : 'Category'}
                </label>
                <select
                  value={shCategory}
                  onChange={(e) => setShCategory(e.target.value as StakeholderCategory)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#FCFBF9] border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                >
                  <option value="Founder">Founder</option>
                  <option value="Angel">Angel</option>
                  <option value="VC">VC</option>
                  <option value="ESOP">ESOP</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#15233E] mb-1">
                  {isSV ? 'Aktieslag' : 'Share Class'}
                </label>
                <select
                  value={shClassId}
                  onChange={(e) => setShClassId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#FCFBF9] border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                >
                  {state.shareClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.votesPerShare}x {isSV ? 'röster' : 'votes'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#15233E] mb-1">
                  {isSV ? 'Antal aktier' : 'Share Count'}
                </label>
                <input
                  type="number"
                  min={1}
                  step={1000}
                  value={shShares}
                  onChange={(e) => setShShares(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono tabular-nums bg-[#FCFBF9] border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="w-48">
                <label className="block text-[10px] text-[#5A6475] mb-0.5">
                  {isSV ? 'Investerat belopp (SEK)' : 'Invested Amount (SEK)'}
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={shInvested}
                  onChange={(e) => setShInvested(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs font-mono tabular-nums bg-[#FCFBF9] border border-[#D8D1C3] rounded-md"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-[#8C6D46] hover:bg-[#A38054] text-white rounded-md transition-colors shadow-xs cursor-pointer"
              >
                + {isSV ? 'Spara och lägg till i aktieboken' : 'Save & Add Shareholder'}
              </button>
            </div>
          </form>
        )}

        {/* SHAREHOLDERS TABLE */}
        {state.shareholders.length === 0 ? (
          <div className="py-10 text-center bg-white border border-dashed border-[#D8D1C3] rounded-xl p-6 space-y-3">
            <Users className="w-8 h-8 text-[#8C6D46] mx-auto opacity-70" />
            <div className="font-semibold text-sm text-[#15233E]">
              {isSV ? 'Inga aktieägare inlagda än' : 'No shareholders added yet'}
            </div>
            <p className="text-xs text-[#7A8291] max-w-sm mx-auto">
              {isSV
                ? 'Använd snabbformuläret ovan eller klicka på knappen för att registrera grundarna.'
                : 'Use the quick form above or click below to register your founders.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setShowInlineShareholder(true);
                setDrawer({ type: 'shareholder' });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#15233E] text-[#FCFBF9] hover:bg-[#1E3156] rounded-md shadow-xs transition-colors cursor-pointer"
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
                            className="p-1 text-[#5A6475] hover:text-[#15233E] rounded cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => dispatch({ type: 'DELETE_SHAREHOLDER', payload: sh.id })}
                            className="p-1 text-[#5A6475] hover:text-[#9A342D] rounded cursor-pointer"
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
      </DemoSpotlight>

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
              className="px-3 py-1.5 text-xs font-medium text-[#15233E] bg-[#F6F4EF] hover:bg-[#E5E0D5] rounded-md transition-colors cursor-pointer"
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
              className="px-3 py-1.5 text-xs font-medium text-[#15233E] bg-[#F6F4EF] hover:bg-[#E5E0D5] rounded-md transition-colors cursor-pointer"
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
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8C6D46] hover:bg-[#A38054] text-white font-semibold text-sm shadow-md transition-all group cursor-pointer"
        >
          <span>{isSV ? 'Gå till aktiebok & analys (Sida 3)' : 'Proceed to Cap Table & Analytics (Page 3)'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Slide-Over Drawers with CORRECT open and initial props */}
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
