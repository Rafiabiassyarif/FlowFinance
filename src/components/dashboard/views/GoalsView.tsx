import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../../../context/FinanceContext';
import { Target, Plus, Pencil, Trash, X, Trophy } from 'lucide-react';
import { Goal } from '../../../types';
import { formatCurrency } from '../../../lib/format';

import { convertToBase, convertFromBase } from '../../../lib/exchangeRates';

export default function GoalsView() {
  const { goals, deleteGoal, profile } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  const openModal = (goal?: Goal) => {
    setGoalToEdit(goal || null);
    setIsModalOpen(true);
  };

  const currency = profile.currency || 'IDR';

  return (
    <div className="max-w-7xl mx-auto pb-12 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-200">Target Tabungan</h2>
          <p className="text-slate-400 text-sm">Tetapkan impian Anda dan pantau perkembangannya.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="btn-premium"
        >
          <Plus size={16} /> Tambah Target
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map(goal => (
          <GoalCard 
            key={goal.id} 
            goal={goal} 
            onEdit={() => openModal(goal)} 
            onDelete={() => {
              if (window.confirm(`Hapus target "${goal.name}"?`)) {
                deleteGoal(goal.id);
              }
            }} 
            currency={currency} 
          />
        ))}
      </div>

      {goals.length === 0 && (
        <div className="glass-card rounded-[2rem] p-12 text-center flex flex-col items-center gap-3 text-slate-500 mt-4">
          <Trophy className="w-12 h-12 text-slate-600 mb-2" />
          <h3 className="text-lg font-medium text-slate-300">Belum Ada Target</h3>
          <p className="text-sm max-w-sm">Mulai wujudkan impian Anda dengan membuat target tabungan baru, seperti liburan, beli gadget, atau dana darurat.</p>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && <GoalModal onClose={() => setIsModalOpen(false)} goalToEdit={goalToEdit} />}
      </AnimatePresence>
    </div>
  );
}

function GoalCard({ goal, onEdit, onDelete, currency }: { goal: Goal; onEdit: () => void; onDelete: () => void, currency: string }) {
  const percentage = Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100));
  const isCompleted = percentage >= 100;
  
  // Calculate remaining days
  const today = new Date();
  const deadline = new Date(goal.deadline);
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="glass-card rounded-[2rem] p-6 relative group overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl border flex items-center justify-center ${isCompleted ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-brand-500/20 text-brand-400 border-brand-500/30'}`}>
            {isCompleted ? <Trophy size={20} /> : <Target size={20} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-200">{goal.name}</h3>
            <p className="text-xs text-slate-500">
              Tenggat: <span className="text-slate-400">{new Date(goal.deadline).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span> 
              {diffDays > 0 && !isCompleted ? ` (${diffDays} hari lagi)` : diffDays < 0 && !isCompleted ? ' (Terlewat)' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={onEdit} className="p-2 text-slate-500 hover:text-brand-400 transition-colors rounded-lg hover:bg-brand-500/10">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
            <Trash size={15} />
          </button>
        </div>
      </div>

      <div className="mb-2 flex justify-between items-end">
        <div>
          <p className="text-xs text-slate-500 mb-1">Terkumpul</p>
          <p className={`text-xl font-display font-bold ${isCompleted ? 'text-green-400' : 'text-slate-200'}`}>
            {formatCurrency(goal.currentAmount, currency)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Target</p>
          <p className="text-sm font-medium text-slate-400">{formatCurrency(goal.targetAmount, currency)}</p>
        </div>
      </div>

      <div className="w-full bg-surface-dark h-3 rounded-full overflow-hidden border border-border-dark relative">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full rounded-full ${isCompleted ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-brand-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]'}`}
        />
      </div>
      <div className="mt-2 text-right text-xs font-bold text-slate-400">{percentage.toFixed(1)}%</div>
    </motion.div>
  );
}

function GoalModal({ onClose, goalToEdit }: { onClose: () => void, goalToEdit?: Goal | null }) {
  const { addGoal, updateGoal, profile } = useFinance();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: goalToEdit?.name || '',
    targetAmount: goalToEdit?.targetAmount ? convertFromBase(goalToEdit.targetAmount, profile.currency).toString() : '',
    currentAmount: goalToEdit?.currentAmount ? convertFromBase(goalToEdit.currentAmount, profile.currency).toString() : '0',
    deadline: goalToEdit?.deadline || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.targetAmount || !formData.deadline) {
      setError('Harap lengkapi semua data wajib.');
      return;
    }
    setSaving(true);
    try {
      if (goalToEdit) {
        await updateGoal(goalToEdit.id, {
          name: formData.name,
          targetAmount: parseFloat(formData.targetAmount) || 0,
          currentAmount: parseFloat(formData.currentAmount) || 0,
          deadline: formData.deadline,
        });
      } else {
        await addGoal({
          name: formData.name,
          targetAmount: parseFloat(formData.targetAmount) || 0,
          currentAmount: parseFloat(formData.currentAmount) || 0,
          deadline: formData.deadline,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan target.');
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
          <h2 className="text-xl font-display font-bold text-slate-200">{goalToEdit ? 'Ubah Target' : 'Buat Target Baru'}</h2>
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
            <label className="block text-xs font-medium text-slate-400 mb-1">Nama / Tujuan Tabungan</label>
            <input
              type="text"
              required
              className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500/50"
              placeholder="mis. Liburan ke Jepang"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Target Nominal</label>
            <input
              type="number"
              required
              step="0.01"
              className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500/50"
              placeholder="0"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
            />
          </div>
          
          {goalToEdit && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Terkumpul Saat Ini</label>
              <input
                type="number"
                step="0.01"
                className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500/50"
                placeholder="0"
                value={formData.currentAmount}
                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Tenggat Waktu (Deadline)</label>
            <input
              type="date"
              required
              className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500/50"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-premium w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Menyimpan...' : goalToEdit ? 'Simpan Perubahan' : 'Buat Target'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
