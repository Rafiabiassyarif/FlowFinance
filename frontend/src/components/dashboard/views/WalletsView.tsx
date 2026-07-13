import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../../../context/FinanceContext';
import { Wallet as WalletIcon, Plus, CreditCard, Building2, Smartphone, Pencil, Trash, X, Globe } from 'lucide-react';
import { Wallet } from '../../../types';
import { formatCurrency } from '../../../lib/format';

import { convertToBase, convertFromBase } from '../../../lib/exchangeRates';

export default function WalletsView() {
  const { wallets, deleteWallet, getTotalBalance, profile } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [walletToEdit, setWalletToEdit] = useState<Wallet | null>(null);

  const openModal = (wallet?: Wallet) => {
    setWalletToEdit(wallet || null);
    setIsModalOpen(true);
  };

  const currency = profile.currency || 'IDR';
  const totalBalance = getTotalBalance();

  return (
    <div className="max-w-7xl mx-auto pb-12 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-200">Dompet & Akun</h2>
          <p className="text-slate-400 text-sm">Kelola akun bank tertaut, kartu, dan uang elektronik Anda.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="btn-premium"
        >
          <Plus size={16} /> Tambah Dompet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Balance Summary Card */}
        <div className="glass-card rounded-[2rem] p-6 bg-gradient-to-br from-brand-900/40 to-surface-dark border-brand-500/20">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
              <WalletIcon size={20} />
            </div>
            <span className="font-medium text-slate-300">Kekayaan Bersih</span>
          </div>
          <div className="text-4xl font-display font-bold text-white tracking-tight mb-2">
            {formatCurrency(totalBalance, currency)}
          </div>
          <p className="text-sm text-slate-400">
            Total saldo di {wallets.length} dompet
          </p>
          {wallets.length === 0 && (
            <button 
              onClick={() => openModal()}
              className="mt-4 text-xs text-brand-400 hover:text-brand-300 underline"
            >
              + Tambah dompet pertama
            </button>
          )}
        </div>

        {wallets.map(wallet => (
          <WalletCard 
            key={wallet.id} 
            wallet={wallet} 
            onEdit={() => openModal(wallet)} 
            onDelete={() => {
              if (window.confirm(`Hapus dompet "${wallet.name}"? Transaksi terkait tidak akan ikut terhapus.`)) {
                deleteWallet(wallet.id);
              }
            }} 
            currency={currency} 
          />
        ))}
      </div>

      {wallets.length === 0 && (
        <div className="glass-card rounded-[2rem] p-8 text-center flex flex-col items-center gap-3 text-slate-500">
          <WalletIcon className="w-10 h-10 text-slate-600" />
          <p className="text-sm">Belum ada dompet. Mulai dengan menambahkan rekening bank, e-wallet, atau kartu kredit.</p>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && <AddWalletModal onClose={() => setIsModalOpen(false)} walletToEdit={walletToEdit} />}
      </AnimatePresence>
    </div>
  );
}

const WalletCard: React.FC<{ wallet: Wallet; onEdit: () => void; onDelete: () => void, currency: string }> = ({ wallet, onEdit, onDelete, currency }) => {
  const getIcon = () => {
    switch (wallet.type) {
      case 'Bank': return <Building2 size={24} className="text-blue-400" />;
      case 'Crypto': return <Smartphone size={24} className="text-accent-400" />;
      case 'eWallet': return <Globe size={24} className="text-cyan-400" />;
      default: return <CreditCard size={24} className="text-slate-400" />;
    }
  };

  const typeLabel: Record<string, string> = {
    Bank: 'Rekening Bank',
    Crypto: 'Kripto',
    eWallet: 'Dompet Digital',
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="glass-card rounded-[2rem] p-6 relative group"
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-surface-dark border border-border-dark flex items-center justify-center mb-2">
            {getIcon()}
          </div>
          <span className="text-xs text-slate-500">{typeLabel[wallet.type] || wallet.type}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={onEdit}
            className="p-2 text-slate-500 hover:text-brand-400 transition-colors rounded-lg hover:bg-brand-500/10"
            title="Ubah dompet"
          >
            <Pencil size={15} />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
            title="Hapus dompet"
          >
            <Trash size={15} />
          </button>
        </div>
      </div>

      <div className="space-y-1 mb-6">
        <h3 className="text-lg font-medium text-slate-200">{wallet.name}</h3>
        {wallet.accountNumber && (
          <p className="text-sm text-slate-500 font-mono tracking-wider">{wallet.accountNumber}</p>
        )}
      </div>

      <div className={`text-2xl font-display font-bold ${wallet.balance < 0 ? 'text-red-400' : 'text-slate-200'}`}>
        {formatCurrency(wallet.balance, currency)}
      </div>
      {wallet.balance < 0 && <p className="text-xs text-red-400 mt-1">Saldo negatif</p>}
    </motion.div>
  );
};

function AddWalletModal({ onClose, walletToEdit }: { onClose: () => void, walletToEdit?: Wallet | null }) {
  const { addWallet, updateWallet, profile } = useFinance();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const initialBalanceStr = walletToEdit?.balance 
    ? convertFromBase(walletToEdit.balance, profile.currency).toString()
    : '0';

  const [formData, setFormData] = useState({
    name: walletToEdit?.name || '',
    initialBalance: initialBalanceStr,
    type: walletToEdit?.type || 'Bank' as Wallet['type'],
    accountNumber: walletToEdit?.accountNumber || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name) { setError('Nama dompet wajib diisi.'); return; }
    
    const balanceInBase = convertToBase(parseFloat(formData.initialBalance || '0'), profile.currency);
    setSaving(true);
    try {
      if (walletToEdit) {
        await updateWallet(walletToEdit.id, {
          name: formData.name,
          type: formData.type,
          accountNumber: formData.accountNumber || undefined,
          balance: parseFloat(formData.initialBalance) || 0,
        });
      } else {
        await addWallet({
          name: formData.name,
          type: formData.type,
          initialBalance: parseFloat(formData.initialBalance) || 0,
          accountNumber: formData.accountNumber || undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan dompet.');
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
          <h2 className="text-xl font-display font-bold text-slate-200">{walletToEdit ? 'Ubah Dompet' : 'Tambah Dompet'}</h2>
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
            <label className="block text-xs font-medium text-slate-400 mb-1">Nama Dompet</label>
            <input
              type="text"
              required
              className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500/50 transition-colors"
              placeholder="mis. BCA Tabungan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Tipe Dompet</label>
            <select
              className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500/50 transition-colors"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Wallet['type'] })}
            >
              <option value="Bank">🏦 Rekening Bank</option>
              <option value="eWallet">📱 Dompet Digital (GoPay, OVO, dll)</option>
              <option value="Crypto">🔐 Dompet Kripto</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">{walletToEdit ? 'Saldo Saat Ini' : 'Saldo Awal'}</label>
            <input
              type="number"
              step="0.01"
              className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500/50 transition-colors"
              placeholder="0"
              value={formData.initialBalance}
              onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nomor Akun / ID (opsional)</label>
            <input
              type="text"
              className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500/50 transition-colors"
              placeholder="mis. 0812xxxx, **** 4421, atau email"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-premium w-full text-white -500/20 disabled:opacity-60"
          >
            {saving ? 'Menyimpan...' : walletToEdit ? 'Simpan Perubahan' : 'Tambah Dompet'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
