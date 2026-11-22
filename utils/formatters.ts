// ============================================================================
// FINANCIAL & NUMERICAL FORMATTERS (SWEDISH / INTERNATIONAL NOTATION)
// ============================================================================

const NBSP = '\u00A0';

export function formatInt(value: number): string {
  const rounded = Math.round(value);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

export function formatSEK(value: number, compact = false): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (compact) {
    if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(2)} BSEK`;
    if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)} MSEK`;
    if (abs >= 100_000) return `${sign}${(abs / 1_000).toFixed(0)} kSEK`;
  }
  return `${sign}${formatInt(abs)} SEK`;
}

export function formatPriceSEK(value: number): string {
  if (!Number.isFinite(value)) return '0.00 SEK';
  return `${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)} SEK`;
}

export function formatPct(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '0.00%';
  return `${value.toFixed(decimals)}%`;
}

export function formatDeltaPct(delta: number): string {
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(2)}%`;
}

export function formatBps(bps: number): string {
  const rounded = Math.round(bps);
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${formatInt(rounded)} bps`;
}

export function formatMOIC(payout: number, invested: number): string {
  if (invested <= 0) return payout > 0 ? 'N/A' : '0.0x';
  const multiple = payout / invested;
  if (!Number.isFinite(multiple)) return 'N/A';
  if (multiple >= 100) return `${multiple.toFixed(0)}x`;
  return `${multiple.toFixed(2)}x`;
}

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
