import React, { useEffect, useState } from 'react';
import { WarrantProgram, WarrantRecipient } from '../../types';
import { useCapTable } from '../../context/CapTableContext';
import { generateId } from '../../utils/formatters';
import { SlideOverDrawer } from '../ui/SlideOverDrawer';

export function WarrantDrawer({
  open,
  initial,
  onClose,
}: {
  open: boolean;
  initial?: WarrantProgram;
  onClose: () => void;
}) {
  const { state, dispatch } = useCapTable();
  const [name, setName] = useState('TO 2026/2030 Key Personnel');
  const [recipientCategory, setRecipientCategory] = useState<WarrantRecipient>('Employees');
  const [totalWarrants, setTotalWarrants] = useState('50000');
  const [strikePrice, setStrikePrice] = useState('35');
  const [targetShareClassId, setTargetShareClassId] = useState(
    state.shareClasses[1]?.id ?? state.shareClasses[0]?.id ?? ''
  );

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? 'TO 2026/2030 Key Personnel');
      setRecipientCategory(initial?.recipientCategory ?? 'Employees');
      setTotalWarrants(String(initial?.totalWarrants ?? 50000));
      setStrikePrice(String(initial?.strikePrice ?? 35));
      setTargetShareClassId(
        initial?.targetShareClassId ?? state.shareClasses[1]?.id ?? state.shareClasses[0]?.id ?? ''
      );
    }
  }, [open, initial, state.shareClasses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({
      type: 'UPSERT_WARRANT',
      payload: {
        id: initial?.id ?? generateId('wp'),
        name: name.trim(),
        recipientCategory,
        totalWarrants: Math.max(0, Math.round(Number(totalWarrants) || 0)),
        strikePrice: Math.max(0, Number(strikePrice) || 0),
        targetShareClassId,
      },
    });
    onClose();
  };

  return (
    <SlideOverDrawer
      open={open}
      title={initial ? 'Edit Warrant Program' : 'Add Warrant Program (Teckningsoptioner)'}
      subtitle="Swedish Teckningsoptioner (ABL 14 kap.) or KPO."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#15233E] mb-1">Program Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C3] rounded-md"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">Recipient Group</label>
            <select
              value={recipientCategory}
              onChange={(e) => setRecipientCategory(e.target.value as WarrantRecipient)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C3] rounded-md"
            >
              <option value="Employees">Employees</option>
              <option value="Board">Board</option>
              <option value="Key Advisors">Key Advisors</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">Target Share Class</label>
            <select
              value={targetShareClassId}
              onChange={(e) => setTargetShareClassId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C3] rounded-md"
            >
              {state.shareClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">Number of Warrants</label>
            <input
              type="number"
              min={0}
              required
              value={totalWarrants}
              onChange={(e) => setTotalWarrants(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D8D1C3] rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">Strike Price (SEK)</label>
            <input
              type="number"
              step="0.01"
              min={0}
              required
              value={strikePrice}
              onChange={(e) => setStrikePrice(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D8D1C3] rounded-md"
            />
          </div>
        </div>
        <div className="pt-4 flex justify-end gap-2 border-t border-[#E5E0D5]">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-[#5A6475]">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-xs font-medium bg-[#15233E] text-[#FCFBF9] rounded-md">
            {initial ? 'Update Pool' : 'Create Pool'}
          </button>
        </div>
      </form>
    </SlideOverDrawer>
  );
}
