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
  const isSV = state.language === 'SV';
  const [name, setName] = useState('TO 2026/2030 Key Personnel');
  const [recipientCategory, setRecipientCategory] = useState<WarrantRecipient>('Employees');
  const [totalWarrants, setTotalWarrants] = useState('50000');
  const [strikePrice, setStrikePrice] = useState('35');
  const [targetShareClassId, setTargetShareClassId] = useState(
    state.shareClasses[1]?.id ?? state.shareClasses[0]?.id ?? ''
  );

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? (isSV ? 'TO 2026/2030 Nyckelpersoner' : 'TO 2026/2030 Key Personnel'));
      setRecipientCategory(initial?.recipientCategory ?? 'Employees');
      setTotalWarrants(String(initial?.totalWarrants ?? 50000));
      setStrikePrice(String(initial?.strikePrice ?? 35));
      setTargetShareClassId(
        initial?.targetShareClassId ?? state.shareClasses[1]?.id ?? state.shareClasses[0]?.id ?? ''
      );
    }
  }, [open, initial, state.shareClasses, isSV]);

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
      title={initial ? (isSV ? 'Redigera optionsprogram' : 'Edit Warrant Program') : (isSV ? 'Lägg till teckningsoptioner (ESOP)' : 'Add Warrant Program (ESOP)')}
      subtitle={isSV ? 'Personaloptions- & teckningsoptionsprogram (14 kap. ABL).' : 'Employee stock option & warrant program (Ch. 14 Companies Act).'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#15233E] mb-1">
            {isSV ? 'Programmets namn' : 'Program Name'} *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isSV ? 't.ex. TO 2026/2030 Nyckelpersoner' : 'e.g. TO 2026/2030 Key Personnel'}
            className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">
              {isSV ? 'Mottagargrupp' : 'Recipient Group'}
            </label>
            <select
              value={recipientCategory}
              onChange={(e) => setRecipientCategory(e.target.value as WarrantRecipient)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
            >
              <option value="Employees">{isSV ? 'Anställda (Employees)' : 'Employees'}</option>
              <option value="Board">{isSV ? 'Styrelse (Board)' : 'Board'}</option>
              <option value="Key Advisors">{isSV ? 'Nyckelrådgivare (Advisors)' : 'Key Advisors'}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">
              {isSV ? 'Målaktieklass' : 'Target Share Class'}
            </label>
            <select
              value={targetShareClassId}
              onChange={(e) => setTargetShareClassId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
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
            <label className="block text-xs font-medium text-[#15233E] mb-1">
              {isSV ? 'Antal teckningsoptioner' : 'Number of Warrants'} *
            </label>
            <input
              type="number"
              min={0}
              required
              value={totalWarrants}
              onChange={(e) => setTotalWarrants(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">
              {isSV ? 'Teckningskurs / Lösenpris (SEK)' : 'Strike Price (SEK)'} *
            </label>
            <input
              type="number"
              step="0.01"
              min={0}
              required
              value={strikePrice}
              onChange={(e) => setStrikePrice(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
            />
          </div>
        </div>
        <div className="pt-4 flex justify-end gap-2 border-t border-[#E5E0D5]">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-[#5A6475] hover:text-[#15233E] cursor-pointer">
            {isSV ? 'Avbryt' : 'Cancel'}
          </button>
          <button type="submit" className="px-4 py-2 text-xs font-medium bg-[#15233E] text-[#FCFBF9] hover:bg-[#1E3156] rounded-md shadow-xs cursor-pointer">
            {initial ? (isSV ? 'Uppdatera program' : 'Update Pool') : (isSV ? 'Skapa optionsprogram' : 'Create Pool')}
          </button>
        </div>
      </form>
    </SlideOverDrawer>
  );
}
