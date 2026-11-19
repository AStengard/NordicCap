import {
  CapTableState,
  ConvertedNoteResult,
  RoundSimInputs,
  RoundSimulationResult,
  ShareClass,
  StakeholderCategory,
  StakeholderDilutionRow,
} from '../types';

export function simulateFinancingRound(
  state: CapTableState,
  inputs: RoundSimInputs
): RoundSimulationResult {
  const classMap = new Map<string, ShareClass>();
  state.shareClasses.forEach((c) => classMap.set(c.id, c));

  const issuedBefore = state.shareholders.reduce((sum, s) => sum + s.shares, 0);
  const warrantsBefore = state.warrantPrograms.reduce((sum, w) => sum + w.totalWarrants, 0);
  const preMoneySharesBase = issuedBefore + warrantsBefore;
  const activeNotes = inputs.autoConvertNotes
    ? state.convertibleNotes.filter((n) => n.status === 'active')
    : [];

  if (issuedBefore <= 0 || inputs.preMoneyValuation <= 0 || inputs.investmentAmount < 0) {
    return {
      valid: false,
      errorMessage: 'Pre-money valuation and existing share count must be greater than zero.',
      sharePrice: 0,
      preMoneySharesBase,
      preMoneySharesEffective: preMoneySharesBase,
      newInvestorShares: 0,
      optionPoolTopUpShares: 0,
      totalConvertedNoteShares: 0,
      totalNewIssuedShares: 0,
      postMoneyIssuedShares: issuedBefore,
      postMoneyFullyDilutedShares: preMoneySharesBase,
      postMoneyValuation: inputs.preMoneyValuation,
      newInvestorOwnershipPct: 0,
      postMoneyPoolPct: 0,
      convertedNotes: [],
      stakeholderRows: [],
      chartData: [],
      shareCapitalIncrease: 0,
      quotaValue: 0,
    };
  }

  const targetPoolFraction = inputs.enableOptionPoolTopUp
    ? Math.min(Math.max(inputs.targetPoolPct, 0), 45) / 100
    : 0;

  let optionPoolTopUpShares = 0;
  let sharePrice = inputs.preMoneyValuation / preMoneySharesBase;
  let newInvestorShares = 0;
  let convertedNotes: ConvertedNoteResult[] = [];
  let totalConvertedNoteShares = 0;
  let preMoneySharesEffective = preMoneySharesBase;

  const computeNotes = (roundPrice: number, preSharesForCap: number): ConvertedNoteResult[] =>
    activeNotes.map((note) => {
      const accruedInterest = note.principal * (note.interestRate / 100) * (note.accrualMonths / 12);
      const totalConversionAmount = note.principal + accruedInterest;
      const discountPrice = roundPrice * Math.max(0.05, 1 - note.discountRate / 100);
      const capPrice =
        note.valuationCap > 0 && preSharesForCap > 0 ? note.valuationCap / preSharesForCap : null;
      let effectivePrice = discountPrice;
      let mechanism: 'cap' | 'discount' = 'discount';
      if (capPrice !== null && capPrice < discountPrice) {
        effectivePrice = capPrice;
        mechanism = 'cap';
      }
      const sharesIssued = effectivePrice > 0 ? Math.round(totalConversionAmount / effectivePrice) : 0;
      return {
        note,
        accruedInterest,
        totalConversionAmount,
        discountPrice,
        capPrice,
        effectivePrice,
        mechanism,
        sharesIssued,
      };
    });

  if (inputs.poolTiming === 'pre_money') {
    for (let iter = 0; iter < 40; iter++) {
      preMoneySharesEffective = preMoneySharesBase + optionPoolTopUpShares;
      sharePrice = inputs.preMoneyValuation / preMoneySharesEffective;
      newInvestorShares = sharePrice > 0 ? Math.round(inputs.investmentAmount / sharePrice) : 0;
      convertedNotes = computeNotes(sharePrice, preMoneySharesEffective);
      totalConvertedNoteShares = convertedNotes.reduce((sum, cn) => sum + cn.sharesIssued, 0);
      const postFd = preMoneySharesEffective + newInvestorShares + totalConvertedNoteShares;
      if (!inputs.enableOptionPoolTopUp) {
        optionPoolTopUpShares = 0;
        break;
      }
      const desiredTotalWarrants = targetPoolFraction * postFd;
      const nextTopUp = Math.max(0, Math.round(desiredTotalWarrants - warrantsBefore));
      if (Math.abs(nextTopUp - optionPoolTopUpShares) <= 1) {
        optionPoolTopUpShares = nextTopUp;
        break;
      }
      optionPoolTopUpShares = nextTopUp;
    }
    preMoneySharesEffective = preMoneySharesBase + optionPoolTopUpShares;
    sharePrice = inputs.preMoneyValuation / preMoneySharesEffective;
    newInvestorShares = sharePrice > 0 ? Math.round(inputs.investmentAmount / sharePrice) : 0;
    convertedNotes = computeNotes(sharePrice, preMoneySharesEffective);
    totalConvertedNoteShares = convertedNotes.reduce((sum, cn) => sum + cn.sharesIssued, 0);
  } else {
    preMoneySharesEffective = preMoneySharesBase;
    sharePrice = inputs.preMoneyValuation / preMoneySharesBase;
    newInvestorShares = sharePrice > 0 ? Math.round(inputs.investmentAmount / sharePrice) : 0;
    convertedNotes = computeNotes(sharePrice, preMoneySharesBase);
    totalConvertedNoteShares = convertedNotes.reduce((sum, cn) => sum + cn.sharesIssued, 0);
    const basePostShares = preMoneySharesBase + newInvestorShares + totalConvertedNoteShares;
    if (inputs.enableOptionPoolTopUp && targetPoolFraction > 0 && targetPoolFraction < 0.9) {
      const needed = (targetPoolFraction * basePostShares - warrantsBefore) / (1 - targetPoolFraction);
      optionPoolTopUpShares = Math.max(0, Math.round(needed));
    }
  }

  const totalNewIssuedShares = newInvestorShares + totalConvertedNoteShares;
  const postMoneyIssuedShares = issuedBefore + totalNewIssuedShares;
  const postMoneyWarrants = warrantsBefore + optionPoolTopUpShares;
  const postMoneyFullyDilutedShares = postMoneyIssuedShares + postMoneyWarrants;
  const postMoneyValuation = postMoneyFullyDilutedShares * sharePrice;
  const newInvestorOwnershipPct =
    postMoneyFullyDilutedShares > 0 ? (newInvestorShares / postMoneyFullyDilutedShares) * 100 : 0;
  const postMoneyPoolPct =
    postMoneyFullyDilutedShares > 0 ? (postMoneyWarrants / postMoneyFullyDilutedShares) * 100 : 0;

  const totalVotesBefore = state.shareholders.reduce((sum, s) => {
    const cls = classMap.get(s.shareClassId);
    return sum + s.shares * (cls?.votesPerShare ?? 1);
  }, 0);
  const totalVotesAfter = totalVotesBefore + totalNewIssuedShares * inputs.votesPerShare;

  const stakeholderRows: StakeholderDilutionRow[] = state.shareholders.map((sh) => {
    const cls = classMap.get(sh.shareClassId);
    const votes = sh.shares * (cls?.votesPerShare ?? 1);
    const capBefore = preMoneySharesBase > 0 ? (sh.shares / preMoneySharesBase) * 100 : 0;
    const capAfter =
      postMoneyFullyDilutedShares > 0 ? (sh.shares / postMoneyFullyDilutedShares) * 100 : 0;
    const voteBefore = totalVotesBefore > 0 ? (votes / totalVotesBefore) * 100 : 0;
    const voteAfter = totalVotesAfter > 0 ? (votes / totalVotesAfter) * 100 : 0;
    return {
      id: sh.id,
      name: sh.name,
      category: sh.category,
      shareClassLabel: cls?.name ?? 'Common',
      sharesBefore: sh.shares,
      sharesAfter: sh.shares,
      capitalPctBefore: capBefore,
      capitalPctAfter: capAfter,
      capitalDeltaPct: capAfter - capBefore,
      capitalDeltaBps: (capAfter - capBefore) * 100,
      votingPctBefore: voteBefore,
      votingPctAfter: voteAfter,
      votingDeltaPct: voteAfter - voteBefore,
      votingDeltaBps: (voteAfter - voteBefore) * 100,
    };
  });

  convertedNotes.forEach((cn) => {
    const capAfter =
      postMoneyFullyDilutedShares > 0 ? (cn.sharesIssued / postMoneyFullyDilutedShares) * 100 : 0;
    const voteAfter =
      totalVotesAfter > 0 ? ((cn.sharesIssued * inputs.votesPerShare) / totalVotesAfter) * 100 : 0;
    stakeholderRows.push({
      id: `sim_conv_${cn.note.id}`,
      name: `${cn.note.holderName} (Conv.)`,
      category: cn.note.category,
      shareClassLabel: `${inputs.newShareClassName} (Conv.)`,
      sharesBefore: 0,
      sharesAfter: cn.sharesIssued,
      capitalPctBefore: 0,
      capitalPctAfter: capAfter,
      capitalDeltaPct: capAfter,
      capitalDeltaBps: capAfter * 100,
      votingPctBefore: 0,
      votingPctAfter: voteAfter,
      votingDeltaPct: voteAfter,
      votingDeltaBps: voteAfter * 100,
      isNew: true,
    });
  });

  if (newInvestorShares > 0) {
    const capAfter =
      postMoneyFullyDilutedShares > 0 ? (newInvestorShares / postMoneyFullyDilutedShares) * 100 : 0;
    const voteAfter =
      totalVotesAfter > 0 ? ((newInvestorShares * inputs.votesPerShare) / totalVotesAfter) * 100 : 0;
    stakeholderRows.push({
      id: 'sim_new_investor',
      name: inputs.investorName.trim() || `${inputs.roundName} Lead Investor`,
      category: 'VC',
      shareClassLabel: inputs.newShareClassName || `${inputs.roundName} Pref`,
      sharesBefore: 0,
      sharesAfter: newInvestorShares,
      capitalPctBefore: 0,
      capitalPctAfter: capAfter,
      capitalDeltaPct: capAfter,
      capitalDeltaBps: capAfter * 100,
      votingPctBefore: 0,
      votingPctAfter: voteAfter,
      votingDeltaPct: voteAfter,
      votingDeltaBps: voteAfter * 100,
      isNew: true,
    });
  }

  if (warrantsBefore > 0 || optionPoolTopUpShares > 0) {
    const capBefore = preMoneySharesBase > 0 ? (warrantsBefore / preMoneySharesBase) * 100 : 0;
    const capAfter =
      postMoneyFullyDilutedShares > 0 ? (postMoneyWarrants / postMoneyFullyDilutedShares) * 100 : 0;
    stakeholderRows.push({
      id: 'sim_esop_pool',
      name: 'Warrant Pool (Teckningsoptioner)',
      category: 'ESOP Pool',
      shareClassLabel: optionPoolTopUpShares > 0 ? 'ESOP + Top-Up' : 'ESOP',
      sharesBefore: warrantsBefore,
      sharesAfter: postMoneyWarrants,
      capitalPctBefore: capBefore,
      capitalPctAfter: capAfter,
      capitalDeltaPct: capAfter - capBefore,
      capitalDeltaBps: (capAfter - capBefore) * 100,
      votingPctBefore: 0,
      votingPctAfter: 0,
      votingDeltaPct: 0,
      votingDeltaBps: 0,
    });
  }

  const sumCat = (cat: StakeholderCategory, denom: number): number => {
    const total = state.shareholders
      .filter((s) => s.category === cat)
      .reduce((acc, s) => acc + s.shares, 0);
    return denom > 0 ? Number(((total / denom) * 100).toFixed(2)) : 0;
  };
  const esopExistingShares = state.shareholders
    .filter((s) => s.category === 'ESOP')
    .reduce((acc, s) => acc + s.shares, 0);

  const chartData = [
    {
      stage: 'Before Round',
      Founders: sumCat('Founder', preMoneySharesBase),
      Angels: sumCat('Angel', preMoneySharesBase),
      ExistingVC: sumCat('VC', preMoneySharesBase),
      ConvertedNotes: 0,
      NewInvestor: 0,
      ESOP:
        preMoneySharesBase > 0
          ? Number((((warrantsBefore + esopExistingShares) / preMoneySharesBase) * 100).toFixed(2))
          : 0,
    },
    {
      stage: `After ${inputs.roundName || 'Round'}`,
      Founders: sumCat('Founder', postMoneyFullyDilutedShares),
      Angels: sumCat('Angel', postMoneyFullyDilutedShares),
      ExistingVC: sumCat('VC', postMoneyFullyDilutedShares),
      ConvertedNotes:
        postMoneyFullyDilutedShares > 0
          ? Number(((totalConvertedNoteShares / postMoneyFullyDilutedShares) * 100).toFixed(2))
          : 0,
      NewInvestor:
        postMoneyFullyDilutedShares > 0
          ? Number(((newInvestorShares / postMoneyFullyDilutedShares) * 100).toFixed(2))
          : 0,
      ESOP:
        postMoneyFullyDilutedShares > 0
          ? Number((((postMoneyWarrants + esopExistingShares) / postMoneyFullyDilutedShares) * 100).toFixed(2))
          : 0,
    },
  ];

  const quotaValue = issuedBefore > 0 ? state.company.shareCapital / issuedBefore : 0.05;
  return {
    valid: true,
    sharePrice,
    preMoneySharesBase,
    preMoneySharesEffective,
    newInvestorShares,
    optionPoolTopUpShares,
    totalConvertedNoteShares,
    totalNewIssuedShares,
    postMoneyIssuedShares,
    postMoneyFullyDilutedShares,
    postMoneyValuation,
    newInvestorOwnershipPct,
    postMoneyPoolPct,
    convertedNotes,
    stakeholderRows,
    chartData,
    shareCapitalIncrease: totalNewIssuedShares * quotaValue,
    quotaValue,
  };
}
