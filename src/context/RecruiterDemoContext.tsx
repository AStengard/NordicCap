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
import { createPreSeriesAScenario, createSeriesARecruiterDemoScenario } from '../constants/scenarios';

export const DEMO_STEPS: DemoStepConfig[] = [
  {
    index: 0,
    targetTab: 'cap_table',
    badgeEN: 'Dual-Class Aktiebok & ABL Guardrails',
    badgeSV: 'Aktiebok & ABL-vaktare',
    titleEN: '1. Swedish Dual-Class Equity & Live Ledger',
    titleSV: '1. Svensk aktiebok & 10:1-rostvarde',
    actionLabelEN: 'Filtering 10x Class A founder holdings in the Aktiebok...',
    actionLabelSV: 'Filtrerar 10x A-aktier i aktieboken...',
    bulletsEN: [
      {
        label: 'Architecture Decision',
        text: 'Single normalized Context + Reducer state models Common A (10x votes), Common B, K-lan notes, and ESOP warrants with zero stale derived values.',
      },
      {
        label: 'Commercial & Legal Impact',
        text: 'Continuously validates ABL 4 kap. 5 § (10:1 max voting ratio) and ABL 1 kap. 5 § (25 000 SEK minimum Aktiekapital) in real time.',
      },
    ],
    bulletsSV: [
      {
        label: 'Arkitekturval',
        text: 'Centraliserad Context + Reducer-motor hanterar Stam A (10x roster), Stam B, K-lan och teckningsoptioner utan redundanta berakningar.',
      },
      {
        label: 'Kommersiell & juridisk nytta',
        text: 'Kontrollerar ABL 4 kap. 5 § (max 10:1 rostvardesskillnad) och ABL 1 kap. 5 § (min 25 000 SEK aktiekapital) i realtid.',
      },
    ],
  },
  {
    index: 1,
    targetTab: 'round_sim',
    badgeEN: 'Series A & K-lan Conversion Engine',
    badgeSV: 'Serie A & K-lan-konvertering',
    titleEN: '2. Primary Round Modeling & Pool Shuffle',
    titleSV: '2. Nyemissionssimulering & Optionspool',
    actionLabelEN: 'Typing Series A terms, solving Pre-Money ESOP shuffle & applying round...',
    actionLabelSV: 'Skriver in Serie A-villkor, beraknar ESOP-top-up & verkstaller runda...',
    bulletsEN: [
      {
        label: 'Architecture Decision',
        text: 'Iterative fixed-point solver resolves circular pre-money Option Pool Shuffle math alongside min(Discount, Cap) K-lan conversion while preserving Swedish Kvotvarde.',
      },
      {
        label: 'Commercial & Legal Impact',
        text: 'Committing the round updates the live Cap Table with an atomic Undo history stack, immediately feeding Exit Waterfall and ABL compliance.',
      },
    ],
    bulletsSV: [
      {
        label: 'Arkitekturval',
        text: 'Iterativ fixpunktslosare beraknar cirkular Pre-Money Option Pool Shuffle samt lagsta kurs (rabatt/tak) for K-lan med bibehallet kvotvarde.',
      },
      {
        label: 'Kommersiell & juridisk nytta',
        text: 'Verkstalld runda uppdaterar aktieboken med full angra-historik och matar direkt Exit Waterfall samt ABL-modulen.',
      },
    ],
  },
  {
    index: 2,
    targetTab: 'waterfall',
    badgeEN: 'Equilibrium VC Waterfall Engine',
    badgeSV: 'Jamviktsbaserad Exit Waterfall',
    titleEN: '3. Liquidation Preferences & Exit Breakpoints',
    titleSV: '3. Likvidationspreferenser & Brytpunkter',
    actionLabelEN: 'Sweeping Exit Valuation: 15 MSEK -> 50 MSEK -> 120 MSEK...',
    actionLabelSV: 'Sveper exit-vardering: 15 MSEK -> 50 MSEK -> 120 MSEK...',
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
        text: 'Ren TypeScript-motor utan UI-beroenden laser prioritetsordningar, konverteringsbrytpunkter och in-the-money-optionslosen simultant.',
      },
      {
        label: 'Kommersiell & juridisk nytta',
        text: 'Ersatter felbenagna kalkylark med visuella brytpunktskurvor, steg-for-steg-sparning och exakt MOIC per aktieagare.',
      },
    ],
  },
  {
    index: 3,
    targetTab: 'abl_legal',
    badgeEN: 'ABL Majority & Leo-lagen Rules Engine',
    badgeSV: 'ABL Majoritets- & Leo-lagen-motor',
    titleEN: '4. Swedish Companies Act (ABL) Formalia Check',
    titleSV: '4. ABL Majoritetskrav & Bolagsverket',
    actionLabelEN: 'Flagging 16 kap. ABL (Leo-lagen 9/10) & verifying Bolagsverket dossier...',
    actionLabelSV: 'Flaggar 16 kap. ABL (Leo-lagen 9/10) & kontrollerar Bolagsverkets handlingar...',
    bulletsEN: [
      {
        label: 'Architecture Decision',
        text: 'Deterministic legal rules engine inspects warrant recipients and directed rounds to detect 9/10 Leo-lagen (16 kap. ABL) and 2/3 directed issue thresholds.',
      },
      {
        label: 'Commercial & Legal Impact',
        text: 'Prevents invalid general meeting resolutions and Bolagsverket rejections by mapping exact statutory majorities directly to current founder/investor voting shares.',
      },
    ],
    bulletsSV: [
      {
        label: 'Arkitekturval',
        text: 'Regelmotorn granskar optionsmottagare och riktade emissioner for att automatiskt larma vid 9/10 Leo-lagen (16 kap. ABL) och 2/3-krav.',
      },
      {
        label: 'Kommersiell & juridisk nytta',
        text: 'Forhindrar ogiltiga stammobeslut och avslag hos Bolagsverket genom att koppla lagkraven direkt till bolagets faktiska rostfordelning.',
      },
    ],
  },
  {
    index: 4,
    targetTab: 'abl_legal',
    badgeEN: 'Live Clause-to-Math & Executive Memo',
    badgeSV: 'Klausul-till-matematik & PDF-PM',
    titleEN: '5. Dynamic SHA Clauses & Law-Firm PDF Export',
    titleSV: '5. Dynamiska klausuler & Transaktions-PM',
    actionLabelEN: 'Syncing Drag-Along & Liquidation Preference clauses to live math...',
    actionLabelSV: 'Synkar Drag-Along- och preferensklausuler mot aktuella nyckeltal...',
    bulletsEN: [
      {
        label: 'Architecture Decision',
        text: 'Reactive drafting templates bind Share Class math directly into bilingual SHA and Bolagsordning clauses alongside an A4 @media print executive brief.',
      },
      {
        label: 'Commercial & Legal Impact',
        text: 'Bridges corporate lawyers and VC deal teams — exporting an Excel-ready Aktiebok CSV or print-ready transaction memo in one click.',
      },
    ],
    bulletsSV: [
      {
        label: 'Arkitekturval',
        text: 'Reaktiva klausulmallar binder aktieslagens parametrar direkt till tvasprakiga avtals- och bolagsordningstexter samt utskriftsanpassat A4-PM.',
      },
      {
        label: 'Kommersiell & juridisk nytta',
        text: 'Forenar bolagsjurister och VC-team med ett-klicks-export till Excel-kompatibel CSV och fardigt transaktions-PM i PDF.',
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
        dispatch({ type: 'LOAD_SCENARIO', payload: createPreSeriesAScenario() });
      } else if (stepIdx === 1 && stateRef.current.appliedRounds.length > 0) {
        dispatch({ type: 'LOAD_SCENARIO', payload: createPreSeriesAScenario() });
      } else if (stepIdx >= 2 && stateRef.current.appliedRounds.length === 0) {
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
