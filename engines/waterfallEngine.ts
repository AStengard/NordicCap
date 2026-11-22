import {
  CapTableSnapshot,
  ExitWaterfallResult,
  ShareClass,
  Shareholder,
  WaterfallCurvePoint,
  WaterfallPayoutMechanism,
  WaterfallPayoutRow,
  WaterfallTraceStep,
} from '../types';
import { formatInt, formatMOIC, formatPriceSEK, formatSEK } from '../utils/formatters';

export function calculateExitWaterfall(
  snapshot: CapTableSnapshot,
  exitValuation: number,
  includeWarrants: boolean
): ExitWaterfallResult {
  const safeExit = Math.max(0, Number.isFinite(exitValuation) ? exitValuation : 0);
  const classMap = new Map<string, ShareClass>();
  snapshot.shareClasses.forEach((c) => classMap.set(c.id, c));

  interface EquityHolderInternal {
    sh: Shareholder;
    cls: ShareClass;
    isPref: boolean;
    prefClaim: number;
    capLimit: number | null;
  }

  const holders: EquityHolderInternal[] = snapshot.shareholders.map((sh) => {
    const cls = classMap.get(sh.shareClassId) ?? snapshot.shareClasses[0];
    const isPref = Boolean(cls?.isPreferred && (cls?.liquidationMultiple ?? 0) > 0);
    const baseInvested = sh.investedAmount > 0 ? sh.investedAmount : sh.shares * (cls?.issuePrice ?? 0);
    const prefClaim = isPref ? baseInvested * (cls?.liquidationMultiple ?? 1) : 0;
    const capLimit =
      isPref && cls?.liquidationType === 'participating' && cls.participationCap !== null
        ? baseInvested * cls.participationCap
        : null;
    return { sh, cls, isPref, prefClaim, capLimit };
  });

  const convertedSet = new Set<string>();
  const exercisedWarrantSet = new Set<string>();

  interface PassOutcome {
    prefPayout: Map<string, number>;
    commonPayout: Map<string, number>;
    warrantGross: Map<string, number>;
    warrantStrike: Map<string, number>;
    mechanism: Map<string, WaterfallPayoutMechanism>;
    impliedCommonPrice: number;
    totalStrikeProceeds: number;
    tierAllocations: { rank: number; names: string[]; claim: number; paid: number; remaining: number }[];
    residualToCommonPool: number;
  }

  const runPass = (convSet: Set<string>, exWarrants: Set<string>): PassOutcome => {
    const prefPayout = new Map<string, number>();
    const commonPayout = new Map<string, number>();
    const warrantGross = new Map<string, number>();
    const warrantStrike = new Map<string, number>();
    const mechanism = new Map<string, WaterfallPayoutMechanism>();

    let totalStrikeProceeds = 0;
    snapshot.warrantPrograms.forEach((wp) => {
      if (includeWarrants && exWarrants.has(wp.id) && wp.totalWarrants > 0) {
        const strike = wp.totalWarrants * wp.strikePrice;
        totalStrikeProceeds += strike;
        warrantStrike.set(wp.id, strike);
      } else {
        warrantStrike.set(wp.id, 0);
      }
    });

    let remaining = safeExit + totalStrikeProceeds;

    // Step 1: Distribute Liquidation Preferences by Seniority Rank (descending)
    const activePrefHolders = holders.filter((h) => h.isPref && !convSet.has(h.sh.id));
    const uniqueRanks = Array.from(
      new Set(activePrefHolders.map((h) => h.cls.seniorityRank))
    ).sort((a, b) => b - a);

    const tierAllocations: PassOutcome['tierAllocations'] = [];

    for (const rank of uniqueRanks) {
      const tierHolders = activePrefHolders.filter((h) => h.cls.seniorityRank === rank);
      const tierClaim = tierHolders.reduce((sum, h) => sum + h.prefClaim, 0);
      const tierPaid = Math.min(remaining, tierClaim);
      const ratio = tierClaim > 0 ? tierPaid / tierClaim : 0;

      tierHolders.forEach((h) => {
        prefPayout.set(h.sh.id, h.prefClaim * ratio);
      });

      remaining = Math.max(0, remaining - tierPaid);
      tierAllocations.push({
        rank,
        names: Array.from(new Set(tierHolders.map((h) => h.cls.name))),
        claim: tierClaim,
        paid: tierPaid,
        remaining,
      });
    }

    // Step 2 & 3: Distribute remaining proceeds among Common, Converted Pref, ITM Warrants, and Participating Pref
    const residualStart = remaining;

    interface ResidualParticipant {
      id: string;
      kind: 'holder' | 'warrant';
      shares: number;
      maxAdditional: number;
      received: number;
    }

    const participants: ResidualParticipant[] = [];

    holders.forEach((h) => {
      if (!h.isPref || convSet.has(h.sh.id)) {
        participants.push({
          id: h.sh.id,
          kind: 'holder',
          shares: h.sh.shares,
          maxAdditional: Infinity,
          received: 0,
        });
      } else if (h.cls.liquidationType === 'participating') {
        const alreadyPaid = prefPayout.get(h.sh.id) ?? 0;
        const maxAdd = h.capLimit !== null ? Math.max(0, h.capLimit - alreadyPaid) : Infinity;
        participants.push({
          id: h.sh.id,
          kind: 'holder',
          shares: h.sh.shares,
          maxAdditional: maxAdd,
          received: 0,
        });
      }
    });

    snapshot.warrantPrograms.forEach((wp) => {
      if (includeWarrants && exWarrants.has(wp.id) && wp.totalWarrants > 0) {
        participants.push({
          id: wp.id,
          kind: 'warrant',
          shares: wp.totalWarrants,
          maxAdditional: Infinity,
          received: 0,
        });
      }
    });

    // Water-filling loop to honor participating caps accurately
    let residualLeft = remaining;
    for (let guard = 0; guard < 15 && residualLeft > 1e-4; guard++) {
      const uncapped = participants.filter((p) => p.maxAdditional - p.received > 1e-4 && p.shares > 0);
      const totalShares = uncapped.reduce((sum, p) => sum + p.shares, 0);
      if (totalShares <= 0) break;

      let cappedAny = false;
      const priceStep = residualLeft / totalShares;

      for (const p of uncapped) {
        const headroom = p.maxAdditional - p.received;
        const shareAlloc = p.shares * priceStep;
        if (shareAlloc > headroom + 1e-4) {
          p.received += headroom;
          residualLeft -= headroom;
          cappedAny = true;
        }
      }

      if (!cappedAny) {
        for (const p of uncapped) {
          p.received += p.shares * priceStep;
        }
        residualLeft = 0;
      }
    }

    const uncappedCommonParticipants = participants.filter((p) => p.maxAdditional === Infinity && p.shares > 0);
    const totalUncappedShares = uncappedCommonParticipants.reduce((sum, p) => sum + p.shares, 0);
    const totalUncappedReceived = uncappedCommonParticipants.reduce((sum, p) => sum + p.received, 0);
    const impliedCommonPrice = totalUncappedShares > 0 ? totalUncappedReceived / totalUncappedShares : 0;

    participants.forEach((p) => {
      if (p.kind === 'holder') {
        commonPayout.set(p.id, p.received);
      } else {
        warrantGross.set(p.id, p.received);
      }
    });

    holders.forEach((h) => {
      if (!h.isPref) {
        mechanism.set(h.sh.id, 'Common Pro-Rata');
      } else if (convSet.has(h.sh.id)) {
        mechanism.set(h.sh.id, 'Converted to Common');
      } else if (h.cls.liquidationType === 'participating') {
        mechanism.set(
          h.sh.id,
          h.capLimit !== null ? 'Participating (Capped)' : 'Participating (Uncapped)'
        );
      } else {
        mechanism.set(h.sh.id, 'Liquidation Preference');
      }
    });

    return {
      prefPayout,
      commonPayout,
      warrantGross,
      warrantStrike,
      mechanism,
      impliedCommonPrice,
      totalStrikeProceeds,
      tierAllocations,
      residualToCommonPool: residualStart,
    };
  };

  let outcome = runPass(convertedSet, exercisedWarrantSet);
  for (let iter = 0; iter < 25; iter++) {
    let changed = false;

    if (includeWarrants) {
      for (const wp of snapshot.warrantPrograms) {
        if (wp.totalWarrants <= 0) continue;
        const currentlyIn = exercisedWarrantSet.has(wp.id);
        const testPrice = outcome.impliedCommonPrice;
        if (!currentlyIn && testPrice > wp.strikePrice + 0.001) {
          exercisedWarrantSet.add(wp.id);
          changed = true;
        } else if (currentlyIn && testPrice < wp.strikePrice - 0.001) {
          exercisedWarrantSet.delete(wp.id);
          changed = true;
        }
      }
    }

    for (const h of holders) {
      if (!h.isPref) continue;
      if (h.cls.liquidationType === 'participating' && h.capLimit === null) continue;

      const isConverted = convertedSet.has(h.sh.id);
      const currentPayout =
        (outcome.prefPayout.get(h.sh.id) ?? 0) + (outcome.commonPayout.get(h.sh.id) ?? 0);

      const altSet = new Set(convertedSet);
      if (isConverted) altSet.delete(h.sh.id);
      else altSet.add(h.sh.id);

      const altOutcome = runPass(altSet, exercisedWarrantSet);
      const altPayout =
        (altOutcome.prefPayout.get(h.sh.id) ?? 0) + (altOutcome.commonPayout.get(h.sh.id) ?? 0);

      if (altPayout > currentPayout + 1) {
        if (isConverted) convertedSet.delete(h.sh.id);
        else convertedSet.add(h.sh.id);
        changed = true;
        break;
      }
    }

    outcome = runPass(convertedSet, exercisedWarrantSet);
    if (!changed) break;
  }

  const payoutRows: WaterfallPayoutRow[] = [];
  const categoryTotals = { Founders: 0, Angels: 0, VC: 0, ESOP: 0 };

  holders.forEach((h) => {
    const gross = (outcome.prefPayout.get(h.sh.id) ?? 0) + (outcome.commonPayout.get(h.sh.id) ?? 0);
    const sharePct = safeExit > 0 ? (gross / safeExit) * 100 : 0;
    payoutRows.push({
      id: h.sh.id,
      name: h.sh.name,
      category: h.sh.category,
      shareClassName: h.cls.name,
      shares: h.sh.shares,
      investedCapital: h.sh.investedAmount,
      grossPayout: gross,
      strikeCost: 0,
      netPayout: gross,
      shareOfProceedsPct: sharePct,
      moic: formatMOIC(gross, h.sh.investedAmount),
      mechanism: outcome.mechanism.get(h.sh.id) ?? 'Common Pro-Rata',
    });

    if (h.sh.category === 'Founder') categoryTotals.Founders += gross;
    else if (h.sh.category === 'Angel') categoryTotals.Angels += gross;
    else if (h.sh.category === 'VC') categoryTotals.VC += gross;
    else categoryTotals.ESOP += gross;
  });

  let exercisedWarrantCount = 0;
  snapshot.warrantPrograms.forEach((wp) => {
    const isExercised = includeWarrants && exercisedWarrantSet.has(wp.id);
    const gross = isExercised ? outcome.warrantGross.get(wp.id) ?? 0 : 0;
    const strike = isExercised ? outcome.warrantStrike.get(wp.id) ?? 0 : 0;
    const net = Math.max(0, gross - strike);
    if (isExercised) exercisedWarrantCount += wp.totalWarrants;

    payoutRows.push({
      id: wp.id,
      name: wp.name,
      category: 'ESOP',
      shareClassName: `Warrants @ ${formatPriceSEK(wp.strikePrice)}`,
      shares: wp.totalWarrants,
      investedCapital: strike,
      grossPayout: gross,
      strikeCost: strike,
      netPayout: net,
      shareOfProceedsPct: safeExit > 0 ? (net / safeExit) * 100 : 0,
      moic: strike > 0 ? formatMOIC(gross, strike) : '0.0x',
      mechanism: isExercised ? 'Warrants Exercised (ITM)' : 'Warrants Out-of-the-Money',
    });
    categoryTotals.ESOP += net;
  });

  const trace: WaterfallTraceStep[] = [];
  let stepNo = 1;

  trace.push({
    stepNumber: stepNo++,
    titleEN: 'Distributable Exit Pool Formation',
    titleSV: 'Faststallande av utdelningsbar exit-likvid',
    detailEN:
      outcome.totalStrikeProceeds > 0
        ? `Equity exit value of ${formatSEK(safeExit)} plus ${formatSEK(outcome.totalStrikeProceeds)} in strike cash from ${formatInt(exercisedWarrantCount)} in-the-money warrants creates a ${formatSEK(safeExit + outcome.totalStrikeProceeds)} gross pool.`
        : `Equity exit value of ${formatSEK(safeExit)} with no warrant strike proceeds added (${includeWarrants ? 'all warrant pools out-of-the-money' : 'warrant exercise toggled off'}).`,
    detailSV:
      outcome.totalStrikeProceeds > 0
        ? `Exit-vardering om ${formatSEK(safeExit)} plus ${formatSEK(outcome.totalStrikeProceeds)} i losenlikvid fran ${formatInt(exercisedWarrantCount)} in-the-money-optioner ger en bruttopool pa ${formatSEK(safeExit + outcome.totalStrikeProceeds)}.`
        : `Exit-vardering om ${formatSEK(safeExit)} utan tillkommande losenlikvid (${includeWarrants ? 'inga optioner ar in-the-money' : 'optionslosen ar avstangd'}).`,
    allocatedAmount: safeExit + outcome.totalStrikeProceeds,
    remainingPool: safeExit + outcome.totalStrikeProceeds,
  });

  if (outcome.tierAllocations.length > 0) {
    outcome.tierAllocations.forEach((tier) => {
      trace.push({
        stepNumber: stepNo++,
        titleEN: `Liquidation Preference — Tier ${tier.rank} (${tier.names.join(', ')})`,
        titleSV: `Likvidationspreferens — Niva ${tier.rank} (${tier.names.join(', ')})`,
        detailEN:
          tier.paid >= tier.claim - 1
            ? `Preference claim of ${formatSEK(tier.claim)} paid in full to holders electing liquidation preference.`
            : `Insufficient proceeds for full ${formatSEK(tier.claim)} preference; ${formatSEK(tier.paid)} distributed pro rata within this tier.`,
        detailSV:
          tier.paid >= tier.claim - 1
            ? `Preferenskrav om ${formatSEK(tier.claim)} utbetalas fullt ut till preferensagare som ej konverterar.`
            : `Likviden racker ej for fullt krav (${formatSEK(tier.claim)}); ${formatSEK(tier.paid)} fordelas pro rata inom nivan.`,
        allocatedAmount: tier.paid,
        remainingPool: tier.remaining,
      });
    });
  } else {
    trace.push({
      stepNumber: stepNo++,
      titleEN: 'Preferred Conversion / Common Parity',
      titleSV: 'Preferenskonvertering / Stamaktieparitet',
      detailEN:
        convertedSet.size > 0
          ? `All ${convertedSet.size} preference position(s) converted rationally into Common shares because as-converted pro-rata proceeds exceeded their liquidation preference.`
          : 'No liquidation preference tranches active at this valuation; proceeds flow directly to Common shareholders pro rata.',
      detailSV:
        convertedSet.size > 0
          ? `Samtliga ${convertedSet.size} preferenspositioner konverterade rationellt till stamaktier da stamaktieandelen overstiger likvidationspreferensen.`
          : 'Inga aktiva likvidationspreferenser vid denna vardering; hela likviden fordelas pro rata till stamaktieagare.',
      allocatedAmount: 0,
      remainingPool: safeExit + outcome.totalStrikeProceeds,
    });
  }

  trace.push({
    stepNumber: stepNo++,
    titleEN: 'Residual Distribution to Common & Converted Equity',
    titleSV: 'Aterstaende likvid till stamaktier & konverterade aktier',
    detailEN: `Remaining ${formatSEK(outcome.residualToCommonPool)} distributed pro rata at an implied common price of ${formatPriceSEK(outcome.impliedCommonPrice)} per share (warrants net of strike price).`,
    detailSV: `Aterstaende ${formatSEK(outcome.residualToCommonPool)} fordelas pro rata till ett implicerat aktiepris om ${formatPriceSEK(outcome.impliedCommonPrice)} per aktie (optioner netto efter losenpris).`,
    allocatedAmount: outcome.residualToCommonPool,
    remainingPool: 0,
  });

  return {
    exitValuation: safeExit,
    warrantStrikeProceeds: outcome.totalStrikeProceeds,
    totalDistributablePool: safeExit + outcome.totalStrikeProceeds,
    impliedCommonSharePrice: outcome.impliedCommonPrice,
    exercisedWarrantCount,
    payoutRows,
    categoryTotals,
    trace,
  };
}

export function generateWaterfallCurve(
  snapshot: CapTableSnapshot,
  includeWarrants: boolean,
  maxValuation = 300_000_000
): WaterfallCurvePoint[] {
  const steps = 30;
  const points: WaterfallCurvePoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const val = Math.round((maxValuation / steps) * i);
    const res = calculateExitWaterfall(snapshot, val, includeWarrants);
    points.push({
      exitValMSEK: Number((val / 1_000_000).toFixed(1)),
      exitValSEK: val,
      Founders: Number((res.categoryTotals.Founders / 1_000_000).toFixed(2)),
      Angels: Number((res.categoryTotals.Angels / 1_000_000).toFixed(2)),
      VC: Number((res.categoryTotals.VC / 1_000_000).toFixed(2)),
      ESOP: Number((res.categoryTotals.ESOP / 1_000_000).toFixed(2)),
    });
  }
  return points;
}
