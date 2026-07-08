import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../../../context/FinanceContext';
import { Target, Plus, Pencil, Trash, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Budget } from '../../../types';
import { formatCurrency } from '../../../lib/format';

import { convertToBase, convertFromBase } from '../../../lib/exchangeRates';

const CATEGORIES = [
  { value: 'Food', label: 'Makanan & Minuman' },
  { value: 'Transport', label: 'Transportasi' },
  { value: 'Housing', label: 'Tempat Tinggal' },
  { value: 'Entertainment', label: 'Hiburan' },
  { value: 'Health', label: 'Kesehatan' },
  { value: 'Shopping', label: 'Belanja' },
  { value: 'Education', label: 'Pendidikan' },
  { value: 'Utilities', label: 'Tagihan' },
  { value: 'Other', label: 'Lainnya' },
];

export default function BudgetsView() {
  const { transactions, budgets, deleteBudget, profile } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  const now = new Date();
  const currency = profile.currency || 'IDR';

  // Get spending for THIS MONTH only by category
  const getMonthlySpent = (category: string) => {
    return transactions
      .filter(t => {
        if (t.type !== 'expense' || t.category !== category) return false;
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const openModal = (budget?: Budget) => {
    setBudgetToEdit(budget || null);
    setIsModalOpen(true);
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + getMonthlySpent(b.category), 0);
  const budgetsOver = budgets.filter(b => getMonthlySpent(b.category) > b.limit).length;

  return (
    <div className="max-w-7xl mx-auto pb-12 flex flex-col gap-6 text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-200">Anggaran</h2>
          <p className="text-slate-400 text-sm">Lacak batas pengeluaran Anda per kategori bulan ini.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="btn-premium"
        >
          <Plus size={16} /> Anggaran Baru
        </button>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-slate-200">{budgets.length}</div>
            <div className="text-xs text-slate-500 mt-1">Total Anggaran</div>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <div className="text-lg font-bold text-slate-200 truncate">{formatCurrency(totalSpent, currency)}</div>
            <div className="text-xs text-slate-500 mt-1">Terpakai Bulan Ini</div>
          </div>
          <div className={`glass-card rounded-2xl p-4 text-center ${budgetsOver > 0 ? 'border-red-500/30' : ''}`}>
            <div className={`text-2xl font-bold ${budgetsOver > 0 ? 'text-red-400' : 'text-green-400'}`}>{budgetsOver}</div>
            <div className="text-xs text-slate-500 mt-1">Melebihi Batas</div>
          </div>
        </div>
      )}

      {budgets.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-12 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center">
            <Target className="w-8 h-8 text-brand-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-1">Belum Ada Anggaran</h3>
            <p className="text-slate-400 text-sm">Buat anggaran untuk melacak pengeluaran Anda per kategori.</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="btn-premium"
          >
            <Plus size={16} /> Buat Anggaran Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const spent = getMonthlySpent(b.category);
            const percent = Math.min((spent / b.limit) * 100, 100);
            const isOver = spent > b.limit;
            const catLabel = CATEGORIES.find(c => c.value === b.category)?.label || b.category;

            return (
              <div key={b.id} className={`glass-card rounded-[2rem] p-6 relative group ${isOver ? 'border-red-500/20' : ''}`}>
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => openModal(b)}
                    className="p-2 text-slate-500 hover:text-brand-400 transition-colors rounded-full hover:bg-brand-500/10"
                    title="Ubah anggaran"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Hapus anggaran ini?')) deleteBudget(b.id);
                    }}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-full hover:bg-red-500/10"
                    title="Hapus anggaran"
                  >
                    <Trash size={14} />
                  </button>
                </div>

                <div className="flex justify-between items-center mb-4 pr-16">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${isOver ? 'bg-red-500/20 text-red-400' : 'bg-brand-500/20 text-brand-400'}`}>
                      {isOver ? <AlertTriangle size={18} /> : <Target size={18} />}
                    </div>
                    <h3 className="font-medium text-slate-200 truncate">{catLabel}</h3>
                  </div>
                </div>

                <div className="flex justify-between text-sm mb-2">
                  <span className={`font-bold ${isOver ? 'text-red-400' : 'text-slate-200'}`}>{formatCurrency(spent, currency)}</span>
                  <span className="text-slate-400">dari {formatCurrency(b.limit, currency)}</span>
                </div>
                <div className="h-2.5 w-full bg-surface-dark rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-red-500' : percent > 75 ? 'bg-amber-500' : 'bg-brand-500'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${isOver ? 'text-red-400' : 'text-slate-400'}`}>
                    {isOver 
                      ? `⚠️ Lebih ${formatCurrency(spent - b.limit, currency)}` 
                      : `Tersisa ${formatCurrency(b.limit - spent, currency)}`
                    }
                  </p>
                  <span className="text-xs font-semibold text-slate-400">{percent.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Overall Budget Bar */}
      {budgets.length > 0 && (
        <div className="glass-card rounded-[2rem] p-6">
          <h3 className="font-semibold text-slate-200 mb-4">Ringkasan Total Anggaran Bulan Ini</h3>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Total terpakai</span>
            <span className="text-slate-200 font-semibold">
              {formatCurrency(totalSpent, currency)} / {formatCurrency(totalBudget, currency)}
            </span>
          </div>
          <div className="h-3 bg-surface-dark rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${totalSpent > totalBudget ? 'bg-red-500' : totalSpent / totalBudget > 0.75 ? 'bg-amber-500' : 'bg-brand-500'}`}
              style={{ width: `${Math.min((totalSpent / (totalBudget || 1)) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% dari total anggaran terpakai` : ''}
          </p>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && <BudgetModal onClose={() => setIsModalOpen(false)} budgetToEdit={budgetToEdit} />}
      </AnimatePresence>
    </div>
  );
}

function BudgetModal({ onClose, budgetToEdit }: { onClose: () => void, budgetToEdit?: Budget | null }) {
  const { addBudget, updateBudget, profile } = useFinance();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    category: budgetToEdit?.category || '',
    limit: budgetToEdit?.limit ? convertFromBase(budgetToEdit.limit, profile.currency).toString() : ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.category) { setError('Pilih kategori.'); return; }
    if (!formData.limit || parseFloat(formData.limit) <= 0) { setError('Batas harus lebih dari 0.'); return; }
    setSaving(true);
    try {
      if (budgetToEdit) {
        await updateBudget(budgetToEdit.id, { category: formData.category, limit: convertToBase(parseFloat(formData.limit), profile.currency) });
      } else {
        await addBudget({ category: formData.category, limit: parseFloat(formData.limit) });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan anggaran.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md glass-card rounded-[2rem] p-6 relative z-10 border border-border-dark"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-slate-200">{budgetToEdit ? 'Ubah Anggaran' : 'Anggaran Baru'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-hover text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Kategori</label>
            <select
              className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500/50 transition-colors"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Pilih kategori</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Batas Bulanan</label>
            <input
              type="number"
              step="1"
              min="1"
              required
              className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500/50 transition-colors"
              placeholder="mis. 500000"
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-premium w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Menyimpan...' : budgetToEdit ? 'Simpan Perubahan' : 'Buat Anggaran'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
