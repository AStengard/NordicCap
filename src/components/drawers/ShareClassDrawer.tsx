import React, { useEffect, useState } from 'react';
import {
  AntiDilutionType,
  LiquidationPrefType,
  LiquidationSeniority,
  ShareClass,
} from '../../types';
import { useCapTable } from '../../context/CapTableContext';
import { generateId } from '../../utils/formatters';
import { SlideOverDrawer } from '../ui/SlideOverDrawer';

export function ShareClassDrawer({
  open,
  initial,
  onClose,
}: {
  open: boolean;
  initial?: ShareClass;
  onClose: () => void;
}) {
  const { dispatch } = useCapTable();
  const [name, setName] = useState('Seed Pref');
  const [code, setCode] = useState('SP');
  const [isPreferred, setIsPreferred] = useState(true);
  const [votesPerShare, setVotesPerShare] = useState('1');
  const [issuePrice, setIssuePrice] = useState('35');
  const [liquidationMultiple, setLiquidationMultiple] = useState('1');
  const [liquidationType, setLiquidationType] = useState<LiquidationPrefType>('non_participating');
  const [participationCap, setParticipationCap] = useState('');
  const [seniority, setSeniority] = useState<LiquidationSeniority>('senior');
  const [antiDilution, setAntiDilution] = useState<AntiDilutionType>('broad_based_wa');

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? 'Seed Pref');
      setCode(initial?.code ?? 'SP');
      setIsPreferred(initial?.isPreferred ?? true);
      setVotesPerShare(String(initial?.votesPerShare ?? 1));
      setIssuePrice(String(initial?.issuePrice ?? 35));
      setLiquidationMultiple(String(initial?.liquidationMultiple ?? 1));
      setLiquidationType(initial?.liquidationType ?? 'non_participating');
      setParticipationCap(initial?.participationCap != null ? String(initial.participationCap) : '');
      setSeniority(initial?.seniority ?? 'senior');
      setAntiDilution(initial?.antiDilution ?? 'broad_based_wa');
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({
      type: 'UPSERT_SHARE_CLASS',
      payload: {
        id: initial?.id ?? generateId('cls'),
        name: name.trim(),
        code: code.trim().toUpperCase() || 'X',
        isPreferred,
        votesPerShare: Math.max(1, Number(votesPerShare) || 1),
        issuePrice: Math.max(0, Number(issuePrice) || 0),
        liquidationMultiple: isPreferred ? Math.max(0, Number(liquidationMultiple) || 1) : 0,
        liquidationType,
        participationCap: isPreferred && liquidationType === 'participating' && participationCap.trim() ? Number(participationCap) : null,
        seniority,
        seniorityRank: initial?.seniorityRank ?? (isPreferred ? 1 : 0),
        antiDilution: isPreferred ? antiDilution : 'none',
      },
    });
    onClose();
  };

  return (
    <SlideOverDrawer
      open={open}
      title={initial ? 'Edit Share Class' : 'Add Share Class'}
      subtitle="Define voting power (Ch. 4 § 5 Companies Act) and preference rights."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#15233E] mb-1">Class Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C3] rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">Code</label>
            <input
              type="text"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono uppercase bg-white border border-[#D8D1C3] rounded-md"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">Votes per Share (1–10)</label>
            <input
              type="number"
              min={1}
              max={15}
              value={votesPerShare}
              onChange={(e) => setVotesPerShare(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D8D1C3] rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">Issue Price (SEK)</label>
            <input
              type="number"
              step="0.01"
              min={0}
              value={issuePrice}
              onChange={(e) => setIssuePrice(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D8D1C3] rounded-md"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-[#15233E]">
          <input
            type="checkbox"
            checked={isPreferred}
            onChange={(e) => setIsPreferred(e.target.checked)}
          />
          Preference Share Class (Preferensaktier)
        </label>
        {isPreferred && (
          <div className="p-3.5 bg-[#F6F4EF] border border-[#E5E0D5] rounded-md space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#15233E] mb-1">Liq. Preference (x)</label>
                <input
                  type="number"
                  step="0.5"
                  min={0.5}
                  value={liquidationMultiple}
                  onChange={(e) => setLiquidationMultiple(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm font-mono bg-white border border-[#D8D1C3] rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#15233E] mb-1">Type</label>
                <select
                  value={liquidationType}
                  onChange={(e) => setLiquidationType(e.target.value as LiquidationPrefType)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D8D1C3] rounded"
                >
                  <option value="non_participating">Non-Participating</option>
                  <option value="participating">Participating</option>
                </select>
              </div>
            </div>
            {liquidationType === 'participating' && (
              <div>
                <label className="block text-xs font-medium text-[#15233E] mb-1">Participation Cap (x, blank = uncapped)</label>
                <input
                  type="number"
                  step="0.5"
                  min={1}
                  value={participationCap}
                  onChange={(e) => setParticipationCap(e.target.value)}
                  placeholder="e.g., 3"
                  className="w-full px-2.5 py-1.5 text-sm font-mono bg-white border border-[#D8D1C3] rounded"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#15233E] mb-1">Seniority</label>
                <select
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value as LiquidationSeniority)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D8D1C3] rounded"
                >
                  <option value="senior">Senior</option>
                  <option value="pari_passu">Pari Passu</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#15233E] mb-1">Anti-Dilution</label>
                <select
                  value={antiDilution}
                  onChange={(e) => setAntiDilution(e.target.value as AntiDilutionType)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D8D1C3] rounded"
                >
                  <option value="none">None</option>
                  <option value="broad_based_wa">Broad-Based WA</option>
                  <option value="full_ratchet">Full Ratchet</option>
                </select>
              </div>
            </div>
          </div>
        )}
        <div className="pt-4 flex justify-end gap-2 border-t border-[#E5E0D5]">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-[#5A6475]">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-xs font-medium bg-[#15233E] text-[#FCFBF9] rounded-md">
            {initial ? 'Update Class' : 'Create Share Class'}
          </button>
        </div>
      </form>
    </SlideOverDrawer>
  );
}
