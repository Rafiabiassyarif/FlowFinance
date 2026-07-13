import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Receipt, Wallet, Calendar, Tag, ChevronDown, Save, ShoppingCart, TrendingUp } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types';
import { convertToBase, convertFromBase } from '../../lib/exchangeRates';

export default function TransactionModal({ onClose, txToEdit }: { onClose: () => void, txToEdit?: Transaction | null }) {
  const { addTransaction, updateTransaction, wallets, profile } = useFinance();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const initialAmount = txToEdit?.amount 
    ? convertFromBase(Math.abs(txToEdit.amount), profile.currency).toString() 
    : '';

  const [formData, setFormData] = useState({
    title: txToEdit?.title || '',
    amount: initialAmount,
    category: txToEdit?.category || '',
    type: txToEdit?.type || 'expense' as 'expense' | 'income',
    wallet: txToEdit?.wallet || (wallets[0]?.name || ''),
    date: txToEdit?.date || new Date().toISOString().split('T')[0],
    status: txToEdit?.status || 'Completed' as 'Completed' | 'Pending' | 'Failed',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title) { setError('Judul wajib diisi.'); return; }
    if (!formData.amount || parseFloat(formData.amount) <= 0) { setError('Jumlah harus lebih dari 0.'); return; }
    if (!formData.wallet) { setError('Pilih dompet terlebih dahulu.'); return; }
    if (!formData.date) { setError('Tanggal wajib diisi.'); return; }

    const amountInBase = convertToBase(parseFloat(formData.amount), profile.currency);

    const txPayload = {
      title: formData.title,
      amount: amountInBase,
      category: formData.category || 'Other',
      type: formData.type as 'income' | 'expense',
      wallet: formData.wallet,
      date: formData.date,
      status: formData.status as 'Completed' | 'Pending' | 'Failed',
    };

    setSaving(true);
    try {
      if (txToEdit) {
        await updateTransaction(txToEdit.id, txPayload);
      } else {
        await addTransaction(txPayload);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan transaksi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        className="w-full max-w-md bg-gradient-to-br from-surface-dark to-bg-dark rounded-[2rem] p-1 relative z-10 shadow-2xl shadow-brand-500/10 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-500/20 blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2 rounded-full" />
        
        <div className="bg-surface-dark/90 backdrop-blur-xl rounded-[1.9rem] p-6 relative border border-border-dark max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl text-white shadow-lg ${formData.type === 'expense' ? 'bg-gradient-to-br from-red-400 to-rose-600 shadow-red-500/30' : 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-green-500/30'}`}>
                <Receipt size={22} />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white tracking-tight">{txToEdit ? 'Ubah Transaksi' : 'Transaksi Baru'}</h2>
                <p className="text-xs text-slate-400">Catat arus kas Anda.</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center hover:bg-border-dark text-slate-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Toggle */}
            <div className="flex p-1.5 bg-surface-hover rounded-2xl border border-border-dark relative">
              <div 
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl transition-all duration-300 shadow-sm ${formData.type === 'expense' ? 'left-1.5' : 'left-[calc(50%+4.5px)]'}`} 
              />
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors relative z-10 flex items-center justify-center gap-2 ${formData.type === 'expense' ? 'text-bg-dark' : 'text-slate-400 hover:text-slate-300'}`}
                onClick={() => setFormData({ ...formData, type: 'expense' })}
              >
                <span className={formData.type === 'expense' ? 'text-red-400' : ''}><ShoppingCart size={16} /></span> Pengeluaran
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors relative z-10 flex items-center justify-center gap-2 ${formData.type === 'income' ? 'text-bg-dark' : 'text-slate-400 hover:text-slate-300'}`}
                onClick={() => setFormData({ ...formData, type: 'income' })}
              >
                <span className={formData.type === 'income' ? 'text-green-400' : ''}><TrendingUp size={16} /></span> Pemasukan
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Jumlah</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{profile.currency || 'IDR'}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full bg-surface-hover border border-border-dark rounded-2xl pl-14 pr-4 py-3.5 text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 text-xl font-bold transition-all placeholder:text-slate-400 group-hover:border-slate-300/30"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Judul / Keterangan</label>
              <input
                type="text"
                required
                className="w-full bg-surface-hover border border-border-dark rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-brand-500/50 transition-all hover:border-slate-300/30 placeholder:text-slate-400 font-medium"
                placeholder="mis. Belanja Bulanan"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><Calendar size={12}/> Tanggal</label>
                <input
                  type="date"
                  required
                  className="w-full bg-surface-hover border border-border-dark rounded-2xl px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500/50 transition-all hover:border-slate-300/30 font-medium"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              {/* Wallet */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><Wallet size={12}/> Dompet</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-surface-hover border border-border-dark rounded-2xl pl-4 pr-10 py-3 text-slate-200 focus:outline-none focus:border-brand-500/50 transition-all hover:border-slate-300/30 font-medium"
                    value={formData.wallet}
                    onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
                    required
                  >
                    {wallets.length === 0 && <option value="">Buat dompet dulu</option>}
                    {wallets.map(w => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><Tag size={12}/> Kategori</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-surface-hover border border-border-dark rounded-2xl pl-4 pr-10 py-3 text-slate-200 focus:outline-none focus:border-brand-500/50 transition-all hover:border-slate-300/30 font-medium"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Pilih Kategori</option>
                    {formData.type === 'income' ? (
                      <>
                        <option value="Salary">Gaji</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Investment">Investasi</option>
                        <option value="Gift">Hadiah</option>
                        <option value="Other">Lainnya</option>
                      </>
                    ) : (
                      <>
                        <option value="Food">Makanan & Minuman</option>
                        <option value="Transport">Transportasi</option>
                        <option value="Housing">Tempat Tinggal</option>
                        <option value="Entertainment">Hiburan</option>
                        <option value="Health">Kesehatan</option>
                        <option value="Shopping">Belanja</option>
                        <option value="Education">Pendidikan</option>
                        <option value="Utilities">Tagihan</option>
                        <option value="Other">Lainnya</option>
                      </>
                    )}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              {/* Status */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">Status</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-surface-hover border border-border-dark rounded-2xl pl-4 pr-10 py-3 text-slate-200 focus:outline-none focus:border-brand-500/50 transition-all hover:border-slate-300/30 font-medium"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="Completed">Selesai</option>
                    <option value="Pending">Tertunda</option>
                    <option value="Failed">Gagal</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || wallets.length === 0}
              className={`w-full mt-6 py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed
                ${formData.type === 'expense' ? 'bg-white text-bg-dark hover:bg-slate-200' : 'bg-brand-500 text-white hover:bg-brand-400 shadow-brand-500/20'}`}
            >
              <Save size={18} />
              {saving ? 'Menyimpan...' : txToEdit ? 'Simpan Perubahan' : 'Tambah Transaksi'}
            </button>

            {wallets.length === 0 && (
              <p className="text-center text-xs text-amber-400 mt-2 font-medium bg-amber-500/10 py-2 rounded-lg">Harap buat dompet terlebih dahulu sebelum menambah transaksi.</p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
