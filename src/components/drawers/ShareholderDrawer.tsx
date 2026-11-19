import React, { useEffect, useState } from 'react';
import { Shareholder, StakeholderCategory } from '../../types';
import { useCapTable } from '../../context/CapTableContext';
import { generateId } from '../../utils/formatters';
import { SlideOverDrawer } from '../ui/SlideOverDrawer';

export function ShareholderDrawer({
  open,
  initial,
  onClose,
}: {
  open: boolean;
  initial?: Shareholder;
  onClose: () => void;
}) {
  const { state, dispatch } = useCapTable();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<StakeholderCategory>('Angel');
  const [shareClassId, setShareClassId] = useState(state.shareClasses[0]?.id ?? '');
  const [shares, setShares] = useState('50000');
  const [investedAmount, setInvestedAmount] = useState('1000000');

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setCategory(initial?.category ?? 'Angel');
      setShareClassId(initial?.shareClassId ?? state.shareClasses[0]?.id ?? '');
      setShares(String(initial?.shares ?? 50000));
      setInvestedAmount(String(initial?.investedAmount ?? 1_000_000));
    }
  }, [open, initial, state.shareClasses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({
      type: 'UPSERT_SHAREHOLDER',
      payload: {
        id: initial?.id ?? generateId('sh'),
        name: name.trim(),
        category,
        shareClassId,
        shares: Math.max(0, Math.round(Number(shares) || 0)),
        investedAmount: Math.max(0, Math.round(Number(investedAmount) || 0)),
      },
    });
    onClose();
  };

  return (
    <SlideOverDrawer
      open={open}
      title={initial ? 'Edit Shareholder' : 'Add Shareholder'}
      subtitle="Register an equity holder in the Swedish Aktiebok."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#15233E] mb-1">Shareholder / Entity Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Nordstjernan Ventures AB"
            className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C3] rounded-md"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as StakeholderCategory)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C3] rounded-md"
            >
              <option value="Founder">Founder</option>
              <option value="Angel">Angel</option>
              <option value="VC">VC</option>
              <option value="ESOP">ESOP</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">Share Class</label>
            <select
              value={shareClassId}
              onChange={(e) => setShareClassId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C3] rounded-md"
            >
              {state.shareClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.votesPerShare}x vote)
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#15233E] mb-1">Number of Shares</label>
          <input
            type="number"
            min={0}
            required
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D8D1C3] rounded-md"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#15233E] mb-1">Total Capital Invested (SEK)</label>
          <input
            type="number"
            min={0}
            required
            value={investedAmount}
            onChange={(e) => setInvestedAmount(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D8D1C3] rounded-md"
          />
        </div>
        <div className="pt-4 flex justify-end gap-2 border-t border-[#E5E0D5]">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-[#5A6475]">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-xs font-medium bg-[#15233E] text-[#FCFBF9] rounded-md">
            {initial ? 'Update Shareholder' : 'Add Shareholder'}
          </button>
        </div>
      </form>
    </SlideOverDrawer>
  );
}
