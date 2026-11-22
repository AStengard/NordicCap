// ============================================================================
// DOMAIN TYPES (SWEDISH AKTIEBOLAG / ABL DATA MODEL & VC ENGINES)
// ============================================================================

export type Language = 'EN' | 'SV';
export type WorkspaceTab = 'starter' | 'setup' | 'cap_table' | 'round_sim' | 'waterfall' | 'abl_legal';

export type StakeholderCategory = 'Founder' | 'Angel' | 'VC' | 'ESOP';
export type WarrantRecipient = 'Employees' | 'Board' | 'Key Advisors';

export type LiquidationPrefType = 'non_participating' | 'participating';
export type LiquidationSeniority = 'senior' | 'pari_passu';
export type AntiDilutionType = 'none' | 'broad_based_wa' | 'full_ratchet';
export type PoolShuffleTiming = 'pre_money' | 'post_money';

export interface ShareClass {
  id: string;
  name: string;
  code: string;
  isPreferred: boolean;
  votesPerShare: number;
  issuePrice: number;
  liquidationMultiple: number;
  liquidationType: LiquidationPrefType;
  participationCap: number | null;
  seniority: LiquidationSeniority;
  seniorityRank: number;
  antiDilution: AntiDilutionType;
}

export interface Shareholder {
  id: string;
  name: string;
  category: StakeholderCategory;
  shareClassId: string;
  shares: number;
  investedAmount: number;
}

export interface ConvertibleNote {
  id: string;
  holderName: string;
  category: StakeholderCategory;
  principal: number;
  interestRate: number;
  accrualMonths: number;
  valuationCap: number;
  discountRate: number;
  status: 'active' | 'converted';
  convertedShares?: number;
  convertedRoundName?: string;
}

export interface WarrantProgram {
  id: string;
  name: string;
  recipientCategory: WarrantRecipient;
  totalWarrants: number;
  strikePrice: number;
  targetShareClassId: string;
}

export interface CompanyProfile {
  name: string;
  orgNumber: string;
  shareCapital: number;
  postMoneyValuation: number;
  scenarioLabel: string;
}

export interface AppliedRoundRecord {
  id: string;
  roundName: string;
  shareClassName: string;
  investorName: string;
  investmentAmount: number;
  preMoneyValuation: number;
  postMoneyValuation: number;
  sharePrice: number;
  newSharesIssued: number;
  appliedAt: string;
}

export interface CapTableSnapshot {
  company: CompanyProfile;
  shareClasses: ShareClass[];
  shareholders: Shareholder[];
  convertibleNotes: ConvertibleNote[];
  warrantPrograms: WarrantProgram[];
  appliedRounds: AppliedRoundRecord[];
}

export interface CapTableState extends CapTableSnapshot {
  language: Language;
  activeTab: WorkspaceTab;
  history: CapTableSnapshot[];
}

export interface RoundSimInputs {
  roundName: string;
  newShareClassName: string;
  investorName: string;
  preMoneyValuation: number;
  investmentAmount: number;
  votesPerShare: number;
  enableOptionPoolTopUp: boolean;
  targetPoolPct: number;
  poolTiming: PoolShuffleTiming;
  autoConvertNotes: boolean;
  liquidationMultiple: number;
  liquidationType: LiquidationPrefType;
  participationCap: number | null;
  seniority: LiquidationSeniority;
  antiDilution: AntiDilutionType;
}

export interface ConvertedNoteResult {
  note: ConvertibleNote;
  accruedInterest: number;
  totalConversionAmount: number;
  discountPrice: number;
  capPrice: number | null;
  effectivePrice: number;
  mechanism: 'cap' | 'discount';
  sharesIssued: number;
}

export interface StakeholderDilutionRow {
  id: string;
  name: string;
  category: StakeholderCategory | 'ESOP Pool';
  shareClassLabel: string;
  sharesBefore: number;
  sharesAfter: number;
  capitalPctBefore: number;
  capitalPctAfter: number;
  capitalDeltaPct: number;
  capitalDeltaBps: number;
  votingPctBefore: number;
  votingPctAfter: number;
  votingDeltaPct: number;
  votingDeltaBps: number;
  isNew?: boolean;
}

export interface RoundSimulationResult {
  valid: boolean;
  errorMessage?: string;
  sharePrice: number;
  preMoneySharesBase: number;
  preMoneySharesEffective: number;
  newInvestorShares: number;
  optionPoolTopUpShares: number;
  totalConvertedNoteShares: number;
  totalNewIssuedShares: number;
  postMoneyIssuedShares: number;
  postMoneyFullyDilutedShares: number;
  postMoneyValuation: number;
  newInvestorOwnershipPct: number;
  postMoneyPoolPct: number;
  convertedNotes: ConvertedNoteResult[];
  stakeholderRows: StakeholderDilutionRow[];
  chartData: {
    stage: string;
    Founders: number;
    Angels: number;
    ExistingVC: number;
    ConvertedNotes: number;
    NewInvestor: number;
    ESOP: number;
  }[];
  shareCapitalIncrease: number;
  quotaValue: number;
}

export type WaterfallPayoutMechanism =
  | 'Liquidation Preference'
  | 'Converted to Common'
  | 'Participating (Capped)'
  | 'Participating (Uncapped)'
  | 'Common Pro-Rata'
  | 'Warrants Exercised (ITM)'
  | 'Warrants Out-of-the-Money';

export interface WaterfallPayoutRow {
  id: string;
  name: string;
  category: StakeholderCategory;
  shareClassName: string;
  shares: number;
  investedCapital: number;
  grossPayout: number;
  strikeCost: number;
  netPayout: number;
  shareOfProceedsPct: number;
  moic: string;
  mechanism: WaterfallPayoutMechanism;
}

export interface WaterfallTraceStep {
  stepNumber: number;
  titleEN: string;
  titleSV: string;
  detailEN: string;
  detailSV: string;
  allocatedAmount: number;
  remainingPool: number;
}

export interface ExitWaterfallResult {
  exitValuation: number;
  warrantStrikeProceeds: number;
  totalDistributablePool: number;
  impliedCommonSharePrice: number;
  exercisedWarrantCount: number;
  payoutRows: WaterfallPayoutRow[];
  categoryTotals: {
    Founders: number;
    Angels: number;
    VC: number;
    ESOP: number;
  };
  trace: WaterfallTraceStep[];
}

export interface WaterfallCurvePoint {
  exitValMSEK: number;
  exitValSEK: number;
  Founders: number;
  Angels: number;
  VC: number;
  ESOP: number;
}

export type ABLSeverity = 'critical' | 'warning' | 'pass';

export interface ABLRuleResult {
  id: string;
  statute: string;
  severity: ABLSeverity;
  majorityRequired: string;
  titleEN: string;
  titleSV: string;
  explanationEN: string;
  explanationSV: string;
}

export interface BolagsverketDoc {
  id: string;
  required: boolean;
  titleEN: string;
  titleSV: string;
  statute: string;
  noteEN: string;
  noteSV: string;
}

export interface GeneratedClause {
  id: string;
  category: 'SHA' | 'Bolagsordning';
  titleEN: string;
  titleSV: string;
  mathSummary: string;
  bodyEN: string;
  bodySV: string;
}

export interface DemoStepConfig {
  index: number;
  targetTab: WorkspaceTab;
  badgeEN: string;
  badgeSV: string;
  titleEN: string;
  titleSV: string;
  actionLabelEN: string;
  actionLabelSV: string;
  bulletsEN: { label: string; text: string }[];
  bulletsSV: { label: string; text: string }[];
}

export interface TooltipPayloadEntry {
  name?: string;
  value?: number;
  color?: string;
}
