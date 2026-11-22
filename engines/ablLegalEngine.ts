import {
  ABLRuleResult,
  BolagsverketDoc,
  CapTableState,
  GeneratedClause,
  ShareClass,
} from '../types';
import { formatInt, formatPriceSEK, formatSEK } from '../utils/formatters';

export function evaluateABLCompliance(
  state: CapTableState,
  metrics: {
    votingRatio: number;
    ablVotingCompliant: boolean;
    ablCapitalCompliant: boolean;
    quotaValue: number;
  }
): ABLRuleResult[] {
  const rules: ABLRuleResult[] = [];

  // 1. Leo-lagen (16 kap. ABL) — 9/10 Qualified Majority
  const leoWarrants = state.warrantPrograms.filter(
    (w) => w.totalWarrants > 0 && (w.recipientCategory === 'Employees' || w.recipientCategory === 'Board')
  );
  if (leoWarrants.length > 0) {
    const totalLeo = leoWarrants.reduce((sum, w) => sum + w.totalWarrants, 0);
    rules.push({
      id: 'abl_leo_lagen',
      statute: '16 kap. 2 & 8 §§ ABL (Leo-lagen)',
      severity: 'critical',
      majorityRequired: '9/10 (90%) Votes & Shares',
      titleEN: 'Leo-lagen Qualified Majority Alert (ESOP / Board Warrants)',
      titleSV: 'Leo-lagen — Skarpt majoritetskrav (Personal- / Styrelseoptioner)',
      explanationEN: `Detected ${leoWarrants.length} warrant program(s) (${formatInt(totalLeo)} warrants) directed to Employees or Board members. Under Chapter 16 ABL, resolutions issuing warrants or directed shares to insiders require at least 9/10 (90%) of both votes cast and shares represented at the General Meeting.`,
      explanationSV: `Identifierade ${leoWarrants.length} teckningsoptionsprogram (${formatInt(totalLeo)} optioner) riktade till anstallda eller styrelse. Enligt 16 kap. ABL (Leo-lagen) kraver beslutet minst 9/10 (90%) av bade avgivna roster och vid stamman foretradda aktier.`,
    });
  } else {
    rules.push({
      id: 'abl_leo_lagen',
      statute: '16 kap. ABL (Leo-lagen)',
      severity: 'pass',
      majorityRequired: 'N/A',
      titleEN: 'Leo-lagen (16 kap. ABL) — No Insider Warrants Active',
      titleSV: 'Leo-lagen (16 kap. ABL) — Inga riktade personaloptioner',
      explanationEN: 'No employee or board warrant pools detected. Standard majority rules apply.',
      explanationSV: 'Inga personal- eller styrelseoptioner registrerade. Ordinarie majoritetsregler galler.',
    });
  }

  // 2. Directed Share Issue (13 kap. 2 § ABL) — 2/3 Majority
  const hasDirectedRound = state.appliedRounds.length > 0 || state.shareClasses.some((c) => c.isPreferred);
  rules.push({
    id: 'abl_directed_issue',
    statute: '13 kap. 2 § ABL',
    severity: hasDirectedRound ? 'warning' : 'pass',
    majorityRequired: '2/3 (66.7%) Votes & Shares',
    titleEN: 'Directed Share Issue (Riktad nyemission)',
    titleSV: 'Riktad nyemission — Avvikelse fran foretradesratt',
    explanationEN: hasDirectedRound
      ? 'Deviating from existing shareholders’ statutory pre-emption rights (foretradesratt) to issue VC preference shares or convertible notes requires a 2/3 qualified majority of both votes cast and shares represented at the General Meeting.'
      : 'No directed financing round applied yet. Any future VC round deviating from pro-rata pre-emption rights triggers the 2/3 majority rule.',
    explanationSV: hasDirectedRound
      ? 'Avvikelse fran aktieagarnas lagstadgade foretradesratt vid nyemission eller konvertibelutgivning kraver 2/3 majoritet av sa val avgivna roster som foretradda aktier.'
      : 'Ingen riktad runda verkstalld an. Kommande VC-runda med avvikelse fran foretradesratten utloser krav pa 2/3 majoritet.',
  });

  // 3. Articles of Association Amendment (7 kap. 42-43 §§ ABL)
  const hasPrefClass = state.shareClasses.some((c) => c.isPreferred);
  rules.push({
    id: 'abl_articles',
    statute: '7 kap. 42–45 §§ ABL',
    severity: hasPrefClass ? 'warning' : 'pass',
    majorityRequired: '2/3 (or 9/10 if altering class rights)',
    titleEN: 'Articles of Association Amendment (Bolagsordningsandring)',
    titleSV: 'Andring av bolagsordning (Aktieslag & Aktiekapitalgranser)',
    explanationEN: `Introduction of new share classes (${state.shareClasses.map((c) => c.name).join(', ')}) or expanding share capital limits (must respect 1:4 min/max ratio under 3 kap. 1 § ABL) requires amending the Bolagsordning by 2/3 majority (higher under 7 kap. 43–45 §§ if impairing existing class rights).`,
    explanationSV: `Inforande av nya aktieslag (${state.shareClasses.map((c) => c.name).join(', ')}) eller andrade aktiekapitalgranser (max 1:4-spann enligt 3 kap. 1 § ABL) kraver bolagsordningsandring med 2/3 majoritet (eller skarpt krav enligt 7 kap. 43–45 §§ vid inskrankning av aktieslagsratt).`,
  });

  // 4. Voting Ratio Discrepancy (4 kap. 5 § ABL)
  rules.push({
    id: 'abl_voting_ratio',
    statute: '4 kap. 5 § ABL',
    severity: metrics.ablVotingCompliant ? 'pass' : 'critical',
    majorityRequired: 'Statutory Ceiling 10:1',
    titleEN: 'Voting Power Discrepancy Limit (Rostvardesskillnad)',
    titleSV: 'Begransning av rostvardesskillnad (Max 10:1)',
    explanationEN: metrics.ablVotingCompliant
      ? `Compliant: Current maximum voting ratio across share classes is ${metrics.votingRatio.toFixed(1)}:1, within the strict Swedish statutory ceiling of 10:1.`
      : `Statutory Breach: Voting ratio is ${metrics.votingRatio.toFixed(1)}:1, exceeding the maximum 10:1 ratio permitted under 4 kap. 5 § ABL. Bolagsverket will refuse registration.`,
    explanationSV: metrics.ablVotingCompliant
      ? `Uppfylld: Maximal rostvardesskillnad ar ${metrics.votingRatio.toFixed(1)}:1, inom lagens tak pa 10:1.`
      : `Lagbrott: Rostvardesskillnaden ar ${metrics.votingRatio.toFixed(1)}:1 vilket overstiger taket 10:1 enligt 4 kap. 5 § ABL. Bolagsverket vagar registrering.`,
  });

  // 5. Minimum Share Capital (1 kap. 5 § ABL)
  rules.push({
    id: 'abl_min_capital',
    statute: '1 kap. 5 § ABL',
    severity: metrics.ablCapitalCompliant ? 'pass' : 'critical',
    majorityRequired: '>= 25 000 SEK',
    titleEN: 'Minimum Private AB Share Capital (Aktiekapital)',
    titleSV: 'Minsta aktiekapital i privat aktiebolag',
    explanationEN: metrics.ablCapitalCompliant
      ? `Compliant: Registered share capital is ${formatSEK(state.company.shareCapital)} (Quota value ${metrics.quotaValue.toFixed(4)} SEK/share), exceeding the 25 000 SEK private AB minimum.`
      : `Statutory Breach: Share capital of ${formatSEK(state.company.shareCapital)} is below the 25 000 SEK minimum for a Swedish private AB.`,
    explanationSV: metrics.ablCapitalCompliant
      ? `Uppfylld: Registrerat aktiekapital ar ${formatSEK(state.company.shareCapital)} (kvotvarde ${metrics.quotaValue.toFixed(4)} SEK/aktie), over minimikravet 25 000 SEK.`
      : `Lagbrott: Aktiekapitalet (${formatSEK(state.company.shareCapital)}) understiger minimikravet 25 000 SEK for privat aktiebolag.`,
  });

  return rules;
}

export function generateBolagsverketChecklist(state: CapTableState): BolagsverketDoc[] {
  const hasNotes = state.convertibleNotes.length > 0;
  const hasWarrants = state.warrantPrograms.length > 0;
  return [
    {
      id: 'doc_stammoprotokoll',
      required: true,
      statute: '7 kap. 48 § & 13 kap. ABL',
      titleEN: 'General Meeting Minutes (Stammoprotokoll)',
      titleSV: 'Bolagsstammoprotokoll (med rostlangd)',
      noteEN: 'Signed minutes with voting list (rostlangd) evidencing 2/3 or 9/10 qualified majority.',
      noteSV: 'Justerat protokoll med rostlangd som styrker 2/3- eller 9/10-majoritet.',
    },
    {
      id: 'doc_bolagsordning',
      required: true,
      statute: '3 kap. 1 § & 7 kap. 42 § ABL',
      titleEN: 'Updated Articles of Association (Bolagsordning)',
      titleSV: 'Uppdaterad bolagsordning',
      noteEN: 'Reflects new share classes, preference clauses, and updated share capital / share count intervals.',
      noteSV: 'Innehaller nya aktieslag, preferensbestammelser samt justerade aktiekapital- och aktiegranser.',
    },
    {
      id: 'doc_redogorelse',
      required: true,
      statute: '13 kap. 6 § ABL',
      titleEN: 'Board Report on Significant Events (Styrelsens redogorelse)',
      titleSV: 'Styrelsens redogorelse for vasentliga handelser',
      noteEN: 'Required if the issue resolution is passed outside the Annual General Meeting (EGM).',
      noteSV: 'Kravs vid extra bolagsstamma nar arsstamma inte hallits i anslutning till beslutet.',
    },
    {
      id: 'doc_teckningslista',
      required: true,
      statute: '13 kap. 13 § ABL',
      titleEN: 'Subscription List (Teckningslista)',
      titleSV: 'Teckningslista',
      noteEN: 'Executed subscription list confirming allotment of new shares, warrants, or converted K-lan.',
      noteSV: 'Undertecknad teckningslista som bekr\u00E4ftar teckning och tilldelning av aktier/optioner.',
    },
    {
      id: 'doc_revisor',
      required: hasNotes,
      statute: '13 kap. 8 § & 15 kap. ABL',
      titleEN: 'Auditor Statement (Revisorsyttrande)',
      titleSV: 'Revisorsyttrande (Kvittning / Apport / 13 kap. 6 §)',
      noteEN: hasNotes
        ? 'Required for set-off issue (kvittningsemission) when converting K-lan principal & accrued interest.'
        : 'Conditional: required if payment is made via set-off (kvittning) or contribution in kind (apport).',
      noteSV: hasNotes
        ? 'Kravs for kvittningsemission vid konvertering av konvertibellan (K-lan) och upplupen ranta.'
        : 'Villkorat: kravs vid kvittningsemission eller apportegendom.',
    },
    {
      id: 'doc_bankintyg',
      required: true,
      statute: '13 kap. 28 § & 5 kap. 1 § ABL',
      titleEN: 'Bank Payment Certificate & Updated Aktiebok',
      titleSV: 'Bankintyg & Uppdaterad aktiebok',
      noteEN: `Bank certificate confirming paid-in cash + updated share register${hasWarrants ? ' and warrant register' : ''}.`,
      noteSV: `Bankintyg over inbetald emissionslikvid samt uppdaterad aktiebok${hasWarrants ? ' och optionsbok' : ''}.`,
    },
  ];
}

export function generateLegalClauses(
  state: CapTableState,
  prefClass: ShareClass | null,
  dragThreshold: number
): GeneratedClause[] {
  const companyName = state.company.name;
  const clsName = prefClass?.name ?? 'Preference Shares (Series A)';
  const mult = prefClass ? prefClass.liquidationMultiple.toFixed(1) : '1.0';
  const isPart = prefClass?.liquidationType === 'participating';
  const capStr = prefClass?.participationCap ? `${prefClass.participationCap.toFixed(1)}x` : 'uncapped';
  const senStr = prefClass?.seniority === 'senior' ? 'senior to all junior classes' : 'pari passu with existing preferred classes';
  const adLabel =
    prefClass?.antiDilution === 'full_ratchet'
      ? 'Full Ratchet'
      : prefClass?.antiDilution === 'broad_based_wa'
        ? 'Broad-Based Weighted Average'
        : 'None';
  const minCap = Math.max(25_000, Math.floor((state.company.shareCapital * 0.8) / 1000) * 1000);
  const maxCap = minCap * 4;
  const totalIssued = state.shareholders.reduce((sum, s) => sum + s.shares, 0);
  const minShares = Math.max(100_000, Math.floor((totalIssued * 0.8) / 10_000) * 10_000);
  const maxShares = minShares * 4;

  return [
    {
      id: 'clause_liq_pref',
      category: 'SHA',
      titleEN: 'Liquidation Preference (Exit Proceeds Waterfall)',
      titleSV: 'Likvidationspreferens (Exit-vattenfall)',
      mathSummary: `${clsName} | ${mult}x | ${isPart ? `Participating (${capStr})` : 'Non-Participating'} | ${prefClass?.seniority === 'senior' ? 'Senior' : 'Pari Passu'}`,
      bodyEN: `In the event of any Exit, Deemed Liquidation Event, or winding-up of ${companyName}, the net distributable proceeds shall be applied ${senStr} as follows: First, holders of ${clsName} shall be entitled to receive an amount per share equal to ${mult}x the Original Issue Price (${formatPriceSEK(prefClass?.issuePrice ?? 45.25)}). ${
        isPart
          ? `Thereafter, holders of ${clsName} shall participate pro rata with holders of Common Shares in the distribution of remaining proceeds on an as-converted basis${
              prefClass?.participationCap
                ? `, provided that aggregate proceeds paid to ${clsName} shall not exceed ${capStr} the Original Issue Price unless such holders elect to convert to Common Shares`
                : ' without cap'
            }.`
          : `In lieu of receiving such preference, any holder of ${clsName} shall automatically receive the greater of (i) the ${mult}x Liquidation Preference or (ii) the pro-rata amount payable had all ${clsName} been converted into Common Shares immediately prior to the Exit.`
      }`,
      bodySV: `Vid en Exit, likvidation eller upplosning av ${companyName} ska nettolikviden fordelas med prioritetsordning (${prefClass?.seniority === 'senior' ? 'senior fore efterstallda aktieslag' : 'pari passu med ovriga preferensaktier'}) enligt foljande: I forsta hand ska innehavare av ${clsName} erhalla ett belopp per aktie motsvarande ${mult}x teckningskursen (${formatPriceSEK(prefClass?.issuePrice ?? 45.25)}). ${
        isPart
          ? `Darefter ska innehavare av ${clsName} delta pro rata tillsammans med stamaktieagare i fordelningen av aterstaende likvid${
              prefClass?.participationCap
                ? `, dock hogst upp till ett sammanlagt deltagandetak om ${capStr} teckningskursen saframt ej konvertering till stamaktier ger hogre utfall`
                : ' utan ovre tak'
            }.`
          : `Om en pro rata-fordelning som om ${clsName} konverterats till stamaktier ger ett hogre belopp an ${mult}x likvidationspreferensen, ska innehavaren automatiskt erhalla det hogre stamaktiebeloppet.`
      }`,
    },
    {
      id: 'clause_anti_dilution',
      category: 'SHA',
      titleEN: 'Anti-Dilution Protection (Down-Round Adjustment)',
      titleSV: 'Utspadningsskydd (Down-Round-justering)',
      mathSummary: `${clsName} | Mechanism: ${adLabel}`,
      bodyEN:
        prefClass?.antiDilution === 'none'
          ? `The ${clsName} carry no price-based anti-dilution adjustment in the event of a subsequent financing round priced below the Original Issue Price. Shareholders rely solely on statutory pre-emption rights (foretradesratt) under Chapter 13 ABL.`
          : prefClass?.antiDilution === 'full_ratchet'
            ? `If ${companyName} issues Additional Shares at a price per share below the ${clsName} Issue Price (${formatPriceSEK(prefClass?.issuePrice ?? 45.25)}), the effective conversion price of ${clsName} shall be reduced on a Full Ratchet basis to equal the lowest price per share of the dilutive issuance via a compensatory bonus or par-value issue.`
            : `If ${companyName} completes a Dilutive Issuance below ${formatPriceSEK(prefClass?.issuePrice ?? 45.25)} per share, holders of ${clsName} shall be compensated on a Broad-Based Weighted Average basis: CP2 = CP1 * (A + B) / (A + C), where A equals total fully diluted shares immediately prior to the round (including unexercised ESOP warrants), B equals shares purchasable at CP1, and C equals new shares actually issued.`,
      bodySV:
        prefClass?.antiDilution === 'none'
          ? `${clsName} medfor inget prisbaserat utspadningsskydd vid en framtida nyemission till lagre teckningskurs (down-round). Aktieagarna forlitar sig pa lagstadgad foretradesratt enligt 13 kap. ABL.`
          : prefClass?.antiDilution === 'full_ratchet'
            ? `Om ${companyName} genomfor en nyemission till en kurs understigande teckningskursen for ${clsName} (${formatPriceSEK(prefClass?.issuePrice ?? 45.25)}), ska kompensationsaktier emitteras till kvotvarde enligt Full Ratchet-principen sa att den genomsnittliga anskaffningskursen justeras ned till den nya lagre kursen.`
            : `Vid en nedvarderingsemission under ${formatPriceSEK(prefClass?.issuePrice ?? 45.25)} per aktie kompenseras innehavare av ${clsName} genom Broad-Based Weighted Average-justering: CP2 = CP1 * (A + B) / (A + C), dar A utgor totalt antal fullt utspadda aktier inkl. utestande teckningsoptioner.`,
    },
    {
      id: 'clause_bolagsordning',
      category: 'Bolagsordning',
      titleEN: 'Articles of Association (§ 4 Share Capital & § 5 Share Classes)',
      titleSV: 'Bolagsordning (§ 4 Aktiekapital & § 5 Aktieslag)',
      mathSummary: `Capital: ${formatSEK(minCap)} – ${formatSEK(maxCap)} | Classes: ${state.shareClasses.map((c) => `${c.name} (${c.votesPerShare}v)`).join(', ')}`,
      bodyEN: `§ 4 Share Capital: The share capital of ${companyName} shall be not less than ${formatSEK(minCap)} and not more than ${formatSEK(maxCap)} (1:4 statutory ratio per 3 kap. 1 § ABL).\n§ 5 Number of Shares & Classes: The number of shares shall be not less than ${formatInt(minShares)} and not more than ${formatInt(maxShares)}. Shares may be issued in the following classes: ${state.shareClasses.map((c) => `${c.name} (${c.votesPerShare} vote${c.votesPerShare > 1 ? 's' : ''}/share)`).join('; ')}. All share classes conform to the 10:1 maximum voting ratio under 4 kap. 5 § ABL.`,
      bodySV: `§ 4 Aktiekapital: Aktiekapitalet i ${companyName} ska utgora lagst ${formatSEK(minCap)} och hogst ${formatSEK(maxCap)} (inom 1:4-gransen enligt 3 kap. 1 § ABL).\n§ 5 Antal aktier och aktieslag: Antalet aktier ska vara lagst ${formatInt(minShares)} och hogst ${formatInt(maxShares)}. Aktier far ges ut i foljande aktieslag: ${state.shareClasses.map((c) => `${c.name} (${c.votesPerShare} rost${c.votesPerShare > 1 ? 'er' : ''}/aktie)`).join('; ')}. Rostvardesskillnaden uppfyller 4 kap. 5 § ABL (max 10:1).`,
    },
    {
      id: 'clause_drag_tag',
      category: 'SHA',
      titleEN: 'Drag-Along & Tag-Along Rights (Medfoljningsratt / Skyldighet)',
      titleSV: 'Drag-Along & Tag-Along (Medfoljningsskyldighet & -ratt)',
      mathSummary: `Drag Trigger: >= ${dragThreshold.toFixed(1)}% Votes/Shares + Majority of Preferred`,
      bodyEN: `Drag-Along: If shareholders holding at least ${dragThreshold.toFixed(1)}% of the Shares (including a majority of ${clsName}) accept a bona fide third-party offer to acquire 100% of ${companyName}, all remaining Shareholders shall be obligated to transfer their Shares on identical commercial terms, subject strictly to the Liquidation Preference Waterfall.\nTag-Along: If any Founder proposes to transfer Shares exceeding 5% of their holdings to a third party, Investors shall have a pro-rata Tag-Along right to co-sell on equivalent terms.`,
      bodySV: `Drag-Along (Medfoljningsskyldighet): Om aktieagare som representerar minst ${dragThreshold.toFixed(1)}% av aktierna (inklusive majoriteten av ${clsName}) accepterar ett seriost bud pa 100% av aktierna i ${companyName}, ar ovriga aktieagare skyldiga att overlatna sina aktier pa samma kommersiella villkor med beaktande av likvidationspreferensen.\nTag-Along (Medfoljningsratt): Om en grundare avser overlatna mer an 5% av sitt innehav till tredje man har investerarna ratt att pro rata salja motsvarande andel pa lika villkor.`,
    },
  ];
}
