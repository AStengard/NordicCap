import React, { createContext, useContext, useMemo, useReducer } from 'react';
import {
  AppliedRoundRecord,
  CapTableSnapshot,
  CapTableState,
  CompanyProfile,
  ConvertibleNote,
  Language,
  RoundSimInputs,
  RoundSimulationResult,
  ShareClass,
  Shareholder,
  StakeholderCategory,
  WarrantProgram,
  WorkspaceTab,
} from '../types';
import { DICTIONARY } from '../constants/dictionary';
import { createPreSeriesAScenario } from '../constants/scenarios';
import { generateId } from '../utils/formatters';

export type CapTableAction =
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_TAB'; payload: WorkspaceTab }
  | { type: 'LOAD_SCENARIO'; payload: CapTableSnapshot }
  | { type: 'UPDATE_COMPANY'; payload: Partial<CompanyProfile> }
  | { type: 'UPSERT_SHARE_CLASS'; payload: ShareClass }
  | { type: 'DELETE_SHARE_CLASS'; payload: string }
  | { type: 'UPSERT_SHAREHOLDER'; payload: Shareholder }
  | { type: 'DELETE_SHAREHOLDER'; payload: string }
  | { type: 'UPSERT_NOTE'; payload: ConvertibleNote }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'UPSERT_WARRANT'; payload: WarrantProgram }
  | { type: 'DELETE_WARRANT'; payload: string }
  | { type: 'APPLY_SIMULATED_ROUND'; payload: { inputs: RoundSimInputs; simulation: RoundSimulationResult } }
  | { type: 'UNDO_LAST_ROUND' };

function extractSnapshot(state: CapTableState): CapTableSnapshot {
  return {
    company: { ...state.company },
    shareClasses: state.shareClasses.map((c) => ({ ...c })),
    shareholders: state.shareholders.map((s) => ({ ...s })),
    convertibleNotes: state.convertibleNotes.map((n) => ({ ...n })),
    warrantPrograms: state.warrantPrograms.map((w) => ({ ...w })),
    appliedRounds: state.appliedRounds.map((r) => ({ ...r })),
  };
}

export function capTableReducer(state: CapTableState, action: CapTableAction): CapTableState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'LOAD_SCENARIO':
      return { ...state, ...action.payload, history: [] };
    case 'UPDATE_COMPANY':
      return { ...state, company: { ...state.company, ...action.payload } };
    case 'UPSERT_SHARE_CLASS': {
      const exists = state.shareClasses.some((c) => c.id === action.payload.id);
      return {
        ...state,
        shareClasses: exists
          ? state.shareClasses.map((c) => (c.id === action.payload.id ? action.payload : c))
          : [...state.shareClasses, action.payload],
      };
    }
    case 'DELETE_SHARE_CLASS': {
      const inUse =
        state.shareholders.some((s) => s.shareClassId === action.payload) ||
        state.warrantPrograms.some((w) => w.targetShareClassId === action.payload);
      if (inUse) return state;
      return { ...state, shareClasses: state.shareClasses.filter((c) => c.id !== action.payload) };
    }
    case 'UPSERT_SHAREHOLDER': {
      const exists = state.shareholders.some((s) => s.id === action.payload.id);
      return {
        ...state,
        shareholders: exists
          ? state.shareholders.map((s) => (s.id === action.payload.id ? action.payload : s))
          : [...state.shareholders, action.payload],
      };
    }
    case 'DELETE_SHAREHOLDER':
      return { ...state, shareholders: state.shareholders.filter((s) => s.id !== action.payload) };
    case 'UPSERT_NOTE': {
      const exists = state.convertibleNotes.some((n) => n.id === action.payload.id);
      return {
        ...state,
        convertibleNotes: exists
          ? state.convertibleNotes.map((n) => (n.id === action.payload.id ? action.payload : n))
          : [...state.convertibleNotes, action.payload],
      };
    }
    case 'DELETE_NOTE':
      return { ...state, convertibleNotes: state.convertibleNotes.filter((n) => n.id !== action.payload) };
    case 'UPSERT_WARRANT': {
      const exists = state.warrantPrograms.some((w) => w.id === action.payload.id);
      return {
        ...state,
        warrantPrograms: exists
          ? state.warrantPrograms.map((w) => (w.id === action.payload.id ? action.payload : w))
          : [...state.warrantPrograms, action.payload],
      };
    }
    case 'DELETE_WARRANT':
      return { ...state, warrantPrograms: state.warrantPrograms.filter((w) => w.id !== action.payload) };
    case 'APPLY_SIMULATED_ROUND': {
      const { inputs, simulation } = action.payload;
      if (!simulation.valid) return state;

      const snapshotBefore = extractSnapshot(state);
      const maxRank = state.shareClasses.reduce((acc, cls) => Math.max(acc, cls.seniorityRank), 0);
      const newRank = inputs.seniority === 'senior' ? maxRank + 1 : Math.max(1, maxRank);

      const newClassId = generateId('cls');
      const code = inputs.newShareClassName.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || 'PR';

      const newShareClass: ShareClass = {
        id: newClassId,
        name: inputs.newShareClassName.trim() || `${inputs.roundName} Pref`,
        code,
        isPreferred: true,
        votesPerShare: inputs.votesPerShare,
        issuePrice: Number(simulation.sharePrice.toFixed(4)),
        liquidationMultiple: inputs.liquidationMultiple,
        liquidationType: inputs.liquidationType,
        participationCap: inputs.liquidationType === 'participating' ? inputs.participationCap : null,
        seniority: inputs.seniority,
        seniorityRank: newRank,
        antiDilution: inputs.antiDilution,
      };

      const updatedShareClasses = [...state.shareClasses, newShareClass];
      const updatedShareholders = [...state.shareholders];

      if (simulation.newInvestorShares > 0) {
        updatedShareholders.push({
          id: generateId('sh'),
          name: inputs.investorName.trim() || `${inputs.roundName} Lead Investor`,
          category: 'VC',
          shareClassId: newClassId,
          shares: simulation.newInvestorShares,
          investedAmount: inputs.investmentAmount,
        });
      }

      const convertedIds = new Set(simulation.convertedNotes.map((cn) => cn.note.id));
      const updatedNotes = state.convertibleNotes.map((note) => {
        if (!convertedIds.has(note.id)) return note;
        const match = simulation.convertedNotes.find((cn) => cn.note.id === note.id);
        if (!match) return note;
        return {
          ...note,
          status: 'converted' as const,
          convertedShares: match.sharesIssued,
          convertedRoundName: inputs.roundName,
        };
      });

      simulation.convertedNotes.forEach((cn) => {
        if (cn.sharesIssued <= 0) return;
        const shadowClassId = generateId('cls_conv');
        updatedShareClasses.push({
          id: shadowClassId,
          name: `${newShareClass.name} (Conv.)`,
          code: `${code}C`,
          isPreferred: true,
          votesPerShare: inputs.votesPerShare,
          issuePrice: Number(cn.effectivePrice.toFixed(4)),
          liquidationMultiple: inputs.liquidationMultiple,
          liquidationType: inputs.liquidationType,
          participationCap: inputs.liquidationType === 'participating' ? inputs.participationCap : null,
          seniority: 'pari_passu',
          seniorityRank: newRank,
          antiDilution: inputs.antiDilution,
        });
        updatedShareholders.push({
          id: generateId('sh'),
          name: `${cn.note.holderName.replace(/\s*\(K-lan\)/i, '')} (Converted)`,
          category: cn.note.category,
          shareClassId: shadowClassId,
          shares: cn.sharesIssued,
          investedAmount: Math.round(cn.totalConversionAmount),
        });
      });

      const updatedWarrants = [...state.warrantPrograms];
      if (simulation.optionPoolTopUpShares > 0) {
        const commonB =
          state.shareClasses.find((c) => !c.isPreferred && c.votesPerShare === 1) ||
          state.shareClasses[0];
        updatedWarrants.push({
          id: generateId('wp'),
          name: `TO ${inputs.roundName} Pool Top-Up`,
          recipientCategory: 'Employees',
          totalWarrants: simulation.optionPoolTopUpShares,
          strikePrice: Number(simulation.sharePrice.toFixed(2)),
          targetShareClassId: commonB?.id || newClassId,
        });
      }

      const roundRecord: AppliedRoundRecord = {
        id: generateId('rnd'),
        roundName: inputs.roundName,
        shareClassName: newShareClass.name,
        investorName: inputs.investorName,
        investmentAmount: inputs.investmentAmount,
        preMoneyValuation: inputs.preMoneyValuation,
        postMoneyValuation: Math.round(simulation.postMoneyValuation),
        sharePrice: Number(simulation.sharePrice.toFixed(2)),
        newSharesIssued: simulation.totalNewIssuedShares,
        appliedAt: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
      };

      return {
        ...state,
        company: {
          ...state.company,
          shareCapital: Math.round(state.company.shareCapital + simulation.shareCapitalIncrease),
          postMoneyValuation: Math.round(simulation.postMoneyValuation),
          scenarioLabel: `${inputs.roundName} Applied`,
        },
        shareClasses: updatedShareClasses,
        shareholders: updatedShareholders,
        convertibleNotes: updatedNotes,
        warrantPrograms: updatedWarrants,
        appliedRounds: [...state.appliedRounds, roundRecord],
        history: [...state.history, snapshotBefore],
      };
    }
    case 'UNDO_LAST_ROUND': {
      if (state.history.length === 0) return state;
      const previous = state.history[state.history.length - 1];
      return { ...state, ...previous, history: state.history.slice(0, -1) };
    }
    default:
      return state;
  }
}

interface CapTableContextValue {
  state: CapTableState;
  dispatch: React.Dispatch<CapTableAction>;
  t: (typeof DICTIONARY)['EN'];
}

const CapTableContext = createContext<CapTableContextValue | null>(null);

export function CapTableProvider({ children }: { children: React.ReactNode }) {
  const initialScenario = useMemo(() => createPreSeriesAScenario(), []);
  const [state, dispatch] = useReducer(capTableReducer, {
    ...initialScenario,
    language: 'EN',
    activeTab: 'cap_table',
    history: [],
  });

  const value = useMemo(() => ({ state, dispatch, t: DICTIONARY[state.language] }), [state]);
  return <CapTableContext.Provider value={value}>{children}</CapTableContext.Provider>;
}

export function useCapTable() {
  const ctx = useContext(CapTableContext);
  if (!ctx) throw new Error('useCapTable must be used within CapTableProvider');
  return ctx;
}

export function useCapTableMetrics() {
  const { state } = useCapTable();

  return useMemo(() => {
    const classMap = new Map<string, ShareClass>();
    state.shareClasses.forEach((c) => classMap.set(c.id, c));

    const totalIssuedShares = state.shareholders.reduce((sum, s) => sum + s.shares, 0);
    const totalWarrants = state.warrantPrograms.reduce((sum, w) => sum + w.totalWarrants, 0);
    const fullyDilutedShares = totalIssuedShares + totalWarrants;

    const totalVotes = state.shareholders.reduce((sum, s) => {
      const cls = classMap.get(s.shareClassId);
      return sum + s.shares * (cls?.votesPerShare ?? 1);
    }, 0);

    const equityCapitalInvested = state.shareholders.reduce((sum, s) => sum + s.investedAmount, 0);
    const activeNotes = state.convertibleNotes.filter((n) => n.status === 'active');
    const activeKlanPrincipal = activeNotes.reduce((sum, n) => sum + n.principal, 0);
    const totalCapitalInvested = equityCapitalInvested + activeKlanPrincipal;

    const quotaValue = totalIssuedShares > 0 ? state.company.shareCapital / totalIssuedShares : 0;

    const votePowers = state.shareClasses.map((c) => c.votesPerShare).filter((v) => v > 0);
    const maxVote = votePowers.length > 0 ? Math.max(...votePowers) : 1;
    const minVote = votePowers.length > 0 ? Math.min(...votePowers) : 1;
    const votingRatio = minVote > 0 ? maxVote / minVote : 1;
    const ablVotingCompliant = votingRatio <= 10;
    const ablCapitalCompliant = state.company.shareCapital >= 25_000;

    const categories: StakeholderCategory[] = ['Founder', 'Angel', 'VC', 'ESOP'];
    const categoryBreakdown = categories.map((cat) => {
      const catShares = state.shareholders
        .filter((s) => s.category === cat)
        .reduce((sum, s) => sum + s.shares, 0);
      const catVotes = state.shareholders
        .filter((s) => s.category === cat)
        .reduce((sum, s) => {
          const cls = classMap.get(s.shareClassId);
          return sum + s.shares * (cls?.votesPerShare ?? 1);
        }, 0);
      return {
        category: cat,
        shares: catShares,
        capitalPct: totalIssuedShares > 0 ? (catShares / totalIssuedShares) * 100 : 0,
        votingPct: totalVotes > 0 ? (catVotes / totalVotes) * 100 : 0,
        fullyDilutedPct: fullyDilutedShares > 0 ? (catShares / fullyDilutedShares) * 100 : 0,
      };
    });

    const warrantPoolFdPct = fullyDilutedShares > 0 ? (totalWarrants / fullyDilutedShares) * 100 : 0;

    return {
      classMap,
      totalIssuedShares,
      totalWarrants,
      fullyDilutedShares,
      totalVotes,
      equityCapitalInvested,
      activeNotes,
      activeKlanPrincipal,
      totalCapitalInvested,
      quotaValue,
      votingRatio,
      ablVotingCompliant,
      ablCapitalCompliant,
      categoryBreakdown,
      warrantPoolFdPct,
    };
  }, [state]);
}
