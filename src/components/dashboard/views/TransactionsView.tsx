import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useFinance } from '../../../context/FinanceContext';
import { Plus, Search, Filter, Pencil, Trash, ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp, ShoppingCart } from 'lucide-react';
import TransactionModal from '../TransactionModal';
import { Transaction } from '../../../types';
import { formatCurrency } from '../../../lib/format';

const STATUS_LABELS: Record<string, string> = {
  Completed: 'Selesai',
  Pending: 'Tertunda',
  Failed: 'Gagal',
};

export default function TransactionsView() {
  const { transactions, deleteTransaction, profile } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const openModal = (tx?: Transaction) => {
    setTxToEdit(tx || null);
    setIsModalOpen(true);
  };

  const filteredTransactions = transactions.filter(t => {
    const q = search.toLowerCase();
    const matchesSearch = t.title.toLowerCase().includes(q) || 
                          t.category.toLowerCase().includes(q) ||
                          t.wallet.toLowerCase().includes(q);
    const matchesType = filterType === 'All' || 
                        (filterType === 'Income' && t.type === 'income') ||
                        (filterType === 'Expense' && t.type === 'expense');
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const currency = profile.currency || 'IDR';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto pb-12 flex flex-col gap-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-200 tracking-tight mb-1">Daftar Transaksi</h2>
          <p className="text-slate-400 text-sm">Kelola semua riwayat pemasukan dan pengeluaran Anda.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="btn-premium shadow-lg shadow-brand-500/20"
        >
          <Plus size={16} /> Transaksi Baru
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-[2rem] p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors pointer-events-none" />
          <div className="p-3.5 rounded-2xl bg-green-500/10 text-green-400 shadow-inner shadow-green-500/20 relative z-10">
            <ArrowUpCircle size={24} />
          </div>
          <div className="relative z-10">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Total Pemasukan</div>
            <div className="text-2xl font-display font-bold text-green-400 tracking-tight">{formatCurrency(totalIncome, currency)}</div>
          </div>
        </div>
        <div className="glass-card rounded-[2rem] p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors pointer-events-none" />
          <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-400 shadow-inner shadow-red-500/20 relative z-10">
            <ArrowDownCircle size={24} />
          </div>
          <div className="relative z-10">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Total Pengeluaran</div>
            <div className="text-2xl font-display font-bold text-red-400 tracking-tight">{formatCurrency(totalExpense, currency)}</div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] p-6 sm:p-8 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 relative z-10">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-hover:text-brand-400 transition-colors" />
            <input 
              type="text"
              placeholder="Cari transaksi, kategori, atau dompet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-hover border border-border-dark rounded-2xl pl-12 pr-4 py-3.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all hover:border-slate-300/30 shadow-inner"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3.5 rounded-2xl border border-border-dark bg-surface-hover text-sm font-semibold text-slate-300 hover:border-slate-300/30 hover:bg-surface-hover transition-all focus:outline-none shadow-sm cursor-pointer"
              >
                <option value="All">Semua Tipe</option>
                <option value="Income">Pemasukan</option>
                <option value="Expense">Pengeluaran</option>
              </select>
              <Filter size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3.5 rounded-2xl border border-border-dark bg-surface-hover text-sm font-semibold text-slate-300 hover:border-slate-300/30 hover:bg-surface-hover transition-all focus:outline-none shadow-sm cursor-pointer"
              >
                <option value="All">Semua Status</option>
                <option value="Completed">Selesai</option>
                <option value="Pending">Tertunda</option>
                <option value="Failed">Gagal</option>
              </select>
              <Filter size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-dark">
              <tr className="text-slate-400 border-b border-border-dark text-xs uppercase tracking-wider">
                <th className="py-4 px-5 font-semibold rounded-tl-2xl">Transaksi</th>
                <th className="py-4 px-5 font-semibold text-right">Jumlah</th>
                <th className="py-4 px-5 font-semibold hidden md:table-cell">Tanggal</th>
                <th className="py-4 px-5 font-semibold hidden lg:table-cell">Dompet</th>
                <th className="py-4 px-5 font-semibold hidden sm:table-cell">Status</th>
                <th className="py-4 px-5 text-right rounded-tr-2xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-hover transition-colors group">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-surface-dark border border-border-dark flex items-center justify-center group-hover:border-brand-500/30 group-hover:bg-brand-500/10 transition-colors shrink-0 shadow-lg shadow-black/20">
                        <span className="text-xl">
                          {tx.type === 'income' ? <TrendingUp size={24} className="text-green-400" /> : <ShoppingCart size={24} className="text-slate-400" />}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-200 truncate max-w-[200px] text-base">{tx.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate bg-surface-hover inline-block px-2 py-0.5 rounded-md">{tx.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className={`text-base font-bold ${tx.type === 'income' ? 'text-green-400' : 'text-slate-200'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), currency)}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-400 text-sm hidden md:table-cell font-medium">{tx.date}</td>
                  <td className="py-4 px-5 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <Wallet size={14} className="text-slate-500" />
                      <span className="text-slate-300 font-medium">{tx.wallet}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                      tx.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      tx.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {STATUS_LABELS[tx.status] || tx.status}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openModal(tx)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-surface-hover transition-colors border border-transparent hover:border-border-dark"
                        title="Edit transaksi"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Hapus transaksi ini?')) deleteTransaction(tx.id);
                        }}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
                        title="Hapus transaksi"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500 gap-4">
                      <div className="w-20 h-20 bg-surface-dark rounded-full flex items-center justify-center border border-border-dark shadow-2xl">
                        <Search className="w-10 h-10 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-300 text-base mb-1">Tidak Ada Transaksi</p>
                        <p className="text-sm">
                          {transactions.length === 0 
                            ? 'Belum ada transaksi. Tekan "Transaksi Baru" untuk memulai.'
                            : 'Tidak ada transaksi yang cocok dengan filter pencarian Anda.'
                          }
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length > 0 && (
          <div className="mt-6 pt-5 border-t border-border-dark flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Total Menampilkan</span>
            <span className="bg-surface-hover px-3 py-1.5 rounded-lg text-slate-300">{filteredTransactions.length} dari {transactions.length}</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && <TransactionModal onClose={() => { setIsModalOpen(false); setTxToEdit(null); }} txToEdit={txToEdit} />}
      </AnimatePresence>
    </motion.div>
  );
}
