import React, { useEffect, useState } from 'react';
import { ConvertibleNote, StakeholderCategory } from '../../types';
import { useCapTable } from '../../context/CapTableContext';
import { generateId } from '../../utils/formatters';
import { SlideOverDrawer } from '../ui/SlideOverDrawer';

export function NoteDrawer({
  open,
  initial,
  onClose,
}: {
  open: boolean;
  initial?: ConvertibleNote;
  onClose: () => void;
}) {
  const { state, dispatch } = useCapTable();
  const isSV = state.language === 'SV';
  const [holderName, setHolderName] = useState('');
  const [category, setCategory] = useState<StakeholderCategory>('Angel');
  const [principal, setPrincipal] = useState('2000000');
  const [interestRate, setInterestRate] = useState('6');
  const [accrualMonths, setAccrualMonths] = useState('12');
  const [valuationCap, setValuationCap] = useState('40000000');
  const [discountRate, setDiscountRate] = useState('20');

  useEffect(() => {
    if (open) {
      setHolderName(initial?.holderName ?? '');
      setCategory(initial?.category ?? 'Angel');
      setPrincipal(String(initial?.principal ?? 2_000_000));
      setInterestRate(String(initial?.interestRate ?? 6));
      setAccrualMonths(String(initial?.accrualMonths ?? 12));
      setValuationCap(String(initial?.valuationCap ?? 40_000_000));
      setDiscountRate(String(initial?.discountRate ?? 20));
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holderName.trim()) return;
    dispatch({
      type: 'UPSERT_NOTE',
      payload: {
        id: initial?.id ?? generateId('note'),
        holderName: holderName.trim(),
        category,
        principal: Math.max(0, Number(principal) || 0),
        interestRate: Math.max(0, Number(interestRate) || 0),
        accrualMonths: Math.max(0, Number(accrualMonths) || 0),
        valuationCap: Math.max(0, Number(valuationCap) || 0),
        discountRate: Math.min(80, Math.max(0, Number(discountRate) || 0)),
        status: initial?.status ?? 'active',
      },
    });
    onClose();
  };

  return (
    <SlideOverDrawer
      open={open}
      title={initial ? (isSV ? 'Redigera konvertibellån' : 'Edit Convertible Note') : (isSV ? 'Lägg till konvertibellån' : 'Add Convertible Note')}
      subtitle={isSV ? 'Konvertibelt skuldebrev (15 kap. ABL) med tak- och rabattmekanik.' : 'Convertible debt (Ch. 15 Companies Act) with cap and discount conversion mechanics.'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#15233E] mb-1">
            {isSV ? 'Långivarens namn / Bolag' : 'Noteholder Name'} *
          </label>
          <input
            type="text"
            required
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            placeholder={isSV ? 't.ex. Almi Invest AB (Konvertibel)' : 'e.g., Almi Invest AB (Convertible)'}
            className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">
              {isSV ? 'Lånebelopp (SEK)' : 'Principal (SEK)'} *
            </label>
            <input
              type="number"
              min={0}
              required
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">
              {isSV ? 'Kategori' : 'Category'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as StakeholderCategory)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
            >
              <option value="Angel">Angel</option>
              <option value="VC">VC</option>
              <option value="Founder">{isSV ? 'Grundare' : 'Founder'}</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">
              {isSV ? 'Årlig ränta (%)' : 'Annual Interest (%)'}
            </label>
            <input
              type="number"
              step="0.5"
              min={0}
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">
              {isSV ? 'Upplupna månader' : 'Accrual Months'}
            </label>
            <input
              type="number"
              min={0}
              value={accrualMonths}
              onChange={(e) => setAccrualMonths(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">
              {isSV ? 'Värderingstak / Cap (SEK)' : 'Valuation Cap (SEK)'}
            </label>
            <input
              type="number"
              min={0}
              value={valuationCap}
              onChange={(e) => setValuationCap(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#15233E] mb-1">
              {isSV ? 'Rabatt / Discount (%)' : 'Discount Rate (%)'}
            </label>
            <input
              type="number"
              min={0}
              max={80}
              value={discountRate}
              onChange={(e) => setDiscountRate(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D8D1C3] rounded-md focus:ring-2 focus:ring-[#8C6D46] focus:outline-none"
            />
          </div>
        </div>
        <div className="pt-4 flex justify-end gap-2 border-t border-[#E5E0D5]">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-[#5A6475] hover:text-[#15233E] cursor-pointer">
            {isSV ? 'Avbryt' : 'Cancel'}
          </button>
          <button type="submit" className="px-4 py-2 text-xs font-medium bg-[#15233E] text-[#FCFBF9] hover:bg-[#1E3156] rounded-md shadow-xs cursor-pointer">
            {initial ? (isSV ? 'Uppdatera lån' : 'Update Note') : (isSV ? 'Lägg till lån' : 'Add Note')}
          </button>
        </div>
      </form>
    </SlideOverDrawer>
  );
}
