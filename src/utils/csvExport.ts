import { CapTableState } from '../types';
import { useCapTableMetrics } from '../context/CapTableContext';

export function exportCapTableToCSV(
  state: CapTableState,
  metrics: ReturnType<typeof useCapTableMetrics>
): void {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const rows: string[][] = [
    ['NordicCap Cap Table Export', state.company.name, `Org.nr ${state.company.orgNumber}`, state.company.scenarioLabel],
    ['Aktiekapital (SEK)', String(state.company.shareCapital), 'Post-Money Valuation (SEK)', String(state.company.postMoneyValuation)],
    [],
    ['Stakeholder', 'Category', 'Instrument / Share Class', 'Shares / Warrants', 'Votes per Share', 'Invested Capital (SEK)', 'Capital % (Issued)', 'Voting % (Issued)', 'Fully Diluted %'],
  ];

  state.shareholders.forEach((sh) => {
    const cls = metrics.classMap.get(sh.shareClassId);
    const votes = sh.shares * (cls?.votesPerShare ?? 1);
    rows.push([
      sh.name,
      sh.category,
      cls?.name ?? 'Common',
      String(sh.shares),
      String(cls?.votesPerShare ?? 1),
      String(sh.investedAmount),
      metrics.totalIssuedShares > 0 ? ((sh.shares / metrics.totalIssuedShares) * 100).toFixed(2) : '0.00',
      metrics.totalVotes > 0 ? ((votes / metrics.totalVotes) * 100).toFixed(2) : '0.00',
      metrics.fullyDilutedShares > 0 ? ((sh.shares / metrics.fullyDilutedShares) * 100).toFixed(2) : '0.00',
    ]);
  });

  state.warrantPrograms.forEach((wp) => {
    rows.push([
      wp.name,
      `ESOP (${wp.recipientCategory})`,
      `Warrants @ ${wp.strikePrice} SEK`,
      String(wp.totalWarrants),
      '0',
      '0',
      '0.00',
      '0.00',
      metrics.fullyDilutedShares > 0 ? ((wp.totalWarrants / metrics.fullyDilutedShares) * 100).toFixed(2) : '0.00',
    ]);
  });

  const csvContent = '\uFEFF' + rows.map((r) => r.map(esc).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const suffix = state.language === 'SV' ? 'Aktiebok' : 'Cap_Table';
  link.setAttribute('download', `${state.company.name.replace(/\s+/g, '_')}_${suffix}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
