import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DemoStepConfig } from '../types';
import { useCapTable } from './CapTableContext';
import { createBlankScenario, createPreSeriesAScenario, createSeriesARecruiterDemoScenario } from '../constants/scenarios';

export const DEMO_STEPS: DemoStepConfig[] = [
  {
    index: 0,
    targetTab: 'setup',
    badgeEN: 'Page 2: Company Setup & Live Data Entry',
    badgeSV: 'Sida 2: Bolagsregistrering & Inmatning',
    titleEN: '1. Swedish Company Setup & Live Data Entry',
    titleSV: '1. Bolagsregistrering & Snabb Inmatning',
    actionLabelEN: 'Typing legal identity, share capital, and registering founders live...',
    actionLabelSV: 'Fyller i bolagsuppgifter, aktiekapital och registrerar grundarna live...',
    bulletsEN: [
      {
        label: 'Architecture Decision',
        text: 'Reactive form writes directly into normalized company and shareholder records with immediate quota value derivation and validation.',
      },
      {
        label: 'Commercial & Legal Impact',
        text: 'Enforces minimum 25,000 SEK capital, calculates quota value automatically, and sets up Class A (10 votes) & Class B (1 vote).',
      },
    ],
    bulletsSV: [
      {
        label: 'Arkitekturval',
        text: 'Reaktivt inmatningscenter uppdaterar bolagets aktiebok direkt med omedelbar kvotvärdesberäkning och fältvalidering.',
      },
      {
        label: 'Kommersiell & juridisk nytta',
        text: 'Uppfyller ABL 1:5 om minst 25 000 SEK aktiekapital och förbereder grundarallokering med Stam A (10 röster) och Stam B (1 röst).',
      },
    ],
  },
  {
    index: 1,
    targetTab: 'cap_table',
    badgeEN: 'Dual-Class Share Register & Statutory Guardrails',
    badgeSV: 'Aktiebok & ABL-vaktare',
    titleEN: '2. Swedish Dual-Class Equity & Live Ledger',
    titleSV: '2. Svensk aktiebok & 10:1-röstvärde',
    actionLabelEN: 'Filtering 10x Class A founder holdings and verifying ABL 4:5 10:1 limit...',
    actionLabelSV: 'Filtrerar 10x A-aktier i aktieboken och kontrollerar 10:1-gränsen...',
    bulletsEN: [
      {
        label: 'Architecture Decision',
        text: 'Single normalized Context + Reducer state models Common A (10x votes), Common B, K-lån notes, and ESOP warrants with zero stale derived values.',
      },
      {
        label: 'Commercial & Legal Impact',
        text: 'Continuously validates ABL 4 kap. 5 § (10:1 max voting ratio) and hosts one-click Excel CSV export and law-firm PDF memo printing.',
      },
    ],
    bulletsSV: [
      {
        label: 'Arkitekturval',
        text: 'Centraliserad Context + Reducer-motor hanterar Stam A (10x röster), Stam B, K-lån och teckningsoptioner utan redundanta beräkningar.',
      },
      {
        label: 'Kommersiell & juridisk nytta',
        text: 'Kontrollerar ABL 4 kap. 5 § (max 10:1 röstvärdesskillnad) och erbjuder direkt export till Excel CSV samt utskriftsanpassat transaktions-PM.',
      },
    ],
  },
  {
    index: 2,
    targetTab: 'round_sim',
    badgeEN: 'Series A & K-lån Conversion Engine',
    badgeSV: 'Serie A & K-lån-konvertering',
    titleEN: '3. Primary Round Modeling & Pool Shuffle',
    titleSV: '3. Nyemissionssimulering & Optionspool',
    actionLabelEN: 'Typing Series A terms, solving Pre-Money ESOP shuffle & applying round...',
    actionLabelSV: 'Skriver in Serie A-villkor, beräknar ESOP-top-up & verkställer runda...',
    bulletsEN: [
      {
        label: 'Architecture Decision',
        text: 'Iterative fixed-point solver resolves circular pre-money Option Pool Shuffle math alongside min(Discount, Cap) K-lån conversion while preserving Swedish Kvotvärde.',
      },
      {
        label: 'Commercial & Legal Impact',
        text: 'Committing the round updates the live Cap Table with an atomic Undo history stack, immediately feeding Exit Waterfall and ABL compliance.',
      },
    ],
    bulletsSV: [
      {
        label: 'Arkitekturval',
        text: 'Iterativ fixpunktslösare beräknar cirkulär Pre-Money Option Pool Shuffle samt lägsta kurs (rabatt/tak) för K-lån med bibehållet kvotvärde.',
      },
      {
        label: 'Kommersiell & juridisk nytta',
        text: 'Verkställd runda uppdaterar aktieboken med full ångra-historik och matar direkt Exit Waterfall samt ABL-modulen.',
      },
    ],
  },
  {
    index: 3,
    targetTab: 'waterfall',
    badgeEN: 'Equilibrium VC Waterfall Engine',
    badgeSV: 'Jämviktsbaserad Exit Waterfall',
    titleEN: '4. Liquidation Preferences & Exit Breakpoints',
    titleSV: '4. Likvidationspreferenser & Brytpunkter',
    actionLabelEN: 'Sweeping Exit Valuation: 15 MSEK -> 50 MSEK -> 120 MSEK...',
    actionLabelSV: 'Sveper exit-värdering: 15 MSEK -> 50 MSEK -> 120 MSEK...',
    bulletsEN: [
      {
        label: 'Architecture Decision',
        text: 'Pure TypeScript waterfall engine (zero React dependencies) solves seniority tiers, rational non-participating conversion breakpoints, and ITM warrant strike pools.',
      },
      {
        label: 'Commercial & Legal Impact',
        text: 'Eliminates opaque spreadsheet errors by pairing Recharts payout curves with a plain-language step-by-step audit trace and exact MOIC per investor.',
      },
    ],
    bulletsSV: [
      {
        label: 'Arkitekturval',
        text: 'Ren TypeScript-motor utan UI-beroenden löser prioritetsordningar, konverteringsbrytpunkter och in-the-money-optionslösen simultant.',
      },
      {
        label: 'Kommersiell & juridisk nytta',
        text: 'Ersätter felbenägna kalkylark med visuella brytpunktskurvor, steg-för-steg-spårning och exakt MOIC per aktieägare.',
      },
    ],
  },
  {
    index: 4,
    targetTab: 'abl_legal',
    badgeEN: 'Statutory Majority & Leo Act Rules Engine',
    badgeSV: 'ABL Majoritets- & Leo-lagen-motor',
    titleEN: '5. Swedish Companies Act (ABL) Formalia Check',
    titleSV: '5. ABL Majoritetskrav & Bolagsverket',
    actionLabelEN: 'Flagging Leo Act (90% supermajority) & verifying corporate filing dossier...',
    actionLabelSV: 'Flaggar 16 kap. ABL (Leo-lagen 9/10) & kontrollerar Bolagsverkets handlingar...',
    bulletsEN: [
      {
        label: 'Architecture Decision',
        text: 'Deterministic legal rules engine inspects warrant recipients and directed rounds to detect 9/10 Leo Act (Ch. 16 Companies Act) and 2/3 directed issue thresholds.',
      },
      {
        label: 'Commercial & Legal Impact',
        text: 'Prevents invalid general meeting resolutions and corporate registry rejections by mapping exact statutory majorities directly to current founder/investor voting shares.',
      },
    ],
    bulletsSV: [
      {
        label: 'Arkitekturval',
        text: 'Regelmotorn granskar optionsmottagare och riktade emissioner för att automatiskt larma vid 9/10 Leo-lagen (16 kap. ABL) och 2/3-krav.',
      },
      {
        label: 'Kommersiell & juridisk nytta',
        text: 'Förhindrar ogiltiga stämmobeslut och avslag hos Bolagsverket genom att koppla lagkraven direkt till bolagets faktiska röstfördelning.',
      },
    ],
  },
  {
    index: 5,
    targetTab: 'abl_legal',
    badgeEN: 'Live Clause-to-Math & Executive Memo',
    badgeSV: 'Klausul-till-matematik & PDF-PM',
    titleEN: '6. Dynamic SHA Clauses & Law-Firm PDF Export',
    titleSV: '6. Dynamiska klausuler & Transaktions-PM',
    actionLabelEN: 'Syncing Drag-Along & Liquidation Preference clauses to live math...',
    actionLabelSV: 'Synkar Drag-Along- och preferensklausuler mot aktuella nyckeltal...',
    bulletsEN: [
      {
        label: 'Architecture Decision',
        text: 'Reactive drafting templates bind Share Class math directly into bilingual SHA and Articles of Association clauses alongside an A4 @media print executive brief.',
      },
      {
        label: 'Commercial & Legal Impact',
        text: 'Bridges corporate lawyers and VC deal teams — exporting an Excel-ready Cap Table CSV or print-ready transaction memo in one click.',
      },
    ],
    bulletsSV: [
      {
        label: 'Arkitekturval',
        text: 'Reaktiva klausulmallar binder aktieslagens parametrar direkt till tvåspråkiga avtals- och bolagsordningstexter samt utskriftsanpassat A4-PM.',
      },
      {
        label: 'Kommersiell & juridisk nytta',
        text: 'Förenar bolagsjurister och VC-team med ett-klicks-export till Excel-kompatibel CSV och färdigt transaktions-PM i PDF.',
      },
    ],
  },
];

interface RecruiterDemoContextValue {
  isDemoActive: boolean;
  currentStepIndex: number;
  isPlaying: boolean;
  isStepReady: boolean;
  isCompleted: boolean;
  totalSteps: number;
  currentStep: DemoStepConfig;
  demoRunId: number;
  startDemo: () => void;
  exitDemo: () => void;
  nextStep: () => void;
  prevStep: () => void;
  togglePlay: () => void;
  restartDemo: () => void;
  markStepReady: (stepIndex: number) => void;
}

const RecruiterDemoContext = createContext<RecruiterDemoContextValue | null>(null);

export function RecruiterDemoProvider({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useCapTable();
  const stateRef = useRef(state);
  stateRef.current = state;

  const [isDemoActive, setIsDemoActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStepReady, setIsStepReady] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [demoRunId, setDemoRunId] = useState(0);

  const navigateForStep = useCallback(
    (stepIdx: number) => {
      const step = DEMO_STEPS[stepIdx];
      if (!step) return;

      if (stepIdx === 0) {
        // Step 0: Page 2 live filling starts with clean blank setup
        dispatch({ type: 'LOAD_SCENARIO', payload: createBlankScenario() });
      } else if (stepIdx === 1) {
        // Step 1: Cap table view
        if (stateRef.current.shareholders.length < 2) {
          dispatch({ type: 'LOAD_SCENARIO', payload: createPreSeriesAScenario() });
        }
      } else if (stepIdx === 2 && stateRef.current.appliedRounds.length > 0) {
        // Step 2: Round simulator reset
        dispatch({ type: 'LOAD_SCENARIO', payload: createPreSeriesAScenario() });
      } else if (stepIdx >= 3 && stateRef.current.appliedRounds.length === 0) {
        // Steps 3, 4, 5: Series A VC scenario active for Waterfall and ABL
        dispatch({ type: 'LOAD_SCENARIO', payload: createSeriesARecruiterDemoScenario() });
      }

      dispatch({ type: 'SET_TAB', payload: step.targetTab });
    },
    [dispatch]
  );

  const startDemo = useCallback(() => {
    setIsCompleted(false);
    setIsDemoActive(true);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setIsStepReady(false);
    setDemoRunId((id) => id + 1);
    navigateForStep(0);
  }, [navigateForStep]);

  const restartDemo = useCallback(() => startDemo(), [startDemo]);

  const exitDemo = useCallback(() => {
    setIsDemoActive(false);
    setIsCompleted(false);
    setIsPlaying(false);
    setIsStepReady(false);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev >= DEMO_STEPS.length - 1) {
        setIsDemoActive(false);
        setIsPlaying(false);
        setIsCompleted(true);
        return prev;
      }
      const next = prev + 1;
      setIsStepReady(false);
      navigateForStep(next);
      return next;
    });
  }, [navigateForStep]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev <= 0) return 0;
      const target = prev - 1;
      setIsStepReady(false);
      navigateForStep(target);
      return target;
    });
  }, [navigateForStep]);

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const markStepReady = useCallback((stepIndex: number) => {
    setCurrentStepIndex((current) => {
      if (current === stepIndex) setIsStepReady(true);
      return current;
    });
  }, []);

  useEffect(() => {
    if (!isDemoActive || !isPlaying || !isStepReady || isCompleted) return;
    const dwellMs = currentStepIndex === DEMO_STEPS.length - 1 ? 6500 : 5800;
    const timer = window.setTimeout(() => nextStep(), dwellMs);
    return () => window.clearTimeout(timer);
  }, [isDemoActive, isPlaying, isStepReady, isCompleted, currentStepIndex, nextStep]);

  useEffect(() => {
    if (!isDemoActive && !isCompleted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isEditingField =
        tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable;

      if (e.key === 'Escape') {
        e.preventDefault();
        exitDemo();
        return;
      }
      if (!isDemoActive || isEditingField) return;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDemoActive, isCompleted, exitDemo, togglePlay, nextStep, prevStep]);

  const value = useMemo<RecruiterDemoContextValue>(
    () => ({
      isDemoActive,
      currentStepIndex,
      isPlaying,
      isStepReady,
      isCompleted,
      totalSteps: DEMO_STEPS.length,
      currentStep: DEMO_STEPS[currentStepIndex] ?? DEMO_STEPS[0],
      demoRunId,
      startDemo,
      exitDemo,
      nextStep,
      prevStep,
      togglePlay,
      restartDemo,
      markStepReady,
    }),
    [
      isDemoActive,
      currentStepIndex,
      isPlaying,
      isStepReady,
      isCompleted,
      demoRunId,
      startDemo,
      exitDemo,
      nextStep,
      prevStep,
      togglePlay,
      restartDemo,
      markStepReady,
    ]
  );

  return <RecruiterDemoContext.Provider value={value}>{children}</RecruiterDemoContext.Provider>;
}

export function useRecruiterDemo() {
  const ctx = useContext(RecruiterDemoContext);
  if (!ctx) throw new Error('useRecruiterDemo must be used within RecruiterDemoProvider');
  return ctx;
}
