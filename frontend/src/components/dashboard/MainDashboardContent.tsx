import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, TrendingDown, Wallet, Target,
  Plus, Trash, Sparkles, AlertCircle, Lightbulb, CheckCircle2,
  Send, Download, CreditCard, MoreHorizontal, ShoppingCart, Pencil
} from 'lucide-react';
import { 
  AreaChart, Area, PieChart as RePieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { INCOME_VS_EXPENSE_DATA, CATEGORY_DATA } from '../../data';
import { useFinance } from '../../context/FinanceContext';
import TransactionModal from './TransactionModal';
import { formatCurrency } from '../../lib/format';
import { Transaction } from '../../types';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];

export default function MainDashboardContent({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const { transactions, wallets, budgets, goals, getTotalBalance, getMonthlyIncome, getMonthlyExpense, profile, deleteTransaction } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);

  const openModal = (tx?: Transaction) => {
    setTxToEdit(tx || null);
    setIsModalOpen(true);
  };

  // Group transactions by category for PieChart
  const getCategoryData = () => {
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const reduced = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Math.abs(curr.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(reduced)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // top 5
  };

  const chartCategoryData = getCategoryData();

  // Map last 6 months
  const getIncomeExpenseData = () => {
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleString('id-ID', { month: 'short' });
      
      const monthTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear();
      });

      const income = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const expense = monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Math.abs(t.amount), 0);

      data.push({ name: monthStr, income, expense });
    }
    return data;
  };

  const chartIncomeExpenseData = getIncomeExpenseData();
  const totalBalance = getTotalBalance();
  const monthlyIncome = getMonthlyIncome();
  const monthlyExpense = getMonthlyExpense();
  const currency = profile.currency || 'IDR';

  // Smart Insights AI
  const generateInsights = () => {
    const insights: { type: 'warning' | 'success' | 'info', message: string, icon: any }[] = [];
    
    // 1. Budget warnings
    budgets.forEach(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category && new Date(t.date).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      if (spent >= budget.limit * 0.9 && spent < budget.limit) {
        insights.push({ type: 'warning', icon: AlertCircle, message: `Pengeluaran ${budget.category} mencapai ${(spent/budget.limit*100).toFixed(0)}% dari batas bulan ini.` });
      } else if (spent >= budget.limit) {
        insights.push({ type: 'warning', icon: AlertCircle, message: `Pengeluaran ${budget.category} telah melebihi batas anggaran!` });
      }
    });

    // 2. Savings Goals progress
    const closeGoals = goals.filter(g => (g.currentAmount / g.targetAmount) >= 0.8 && g.currentAmount < g.targetAmount);
    closeGoals.forEach(g => {
      insights.push({ type: 'success', icon: CheckCircle2, message: `Sedikit lagi! Target "${g.name}" hampir tercapai (${((g.currentAmount/g.targetAmount)*100).toFixed(0)}%).` });
    });

    // 3. Deficit / Surplus Detection
    if (monthlyExpense > monthlyIncome && monthlyIncome > 0) {
      insights.push({ type: 'warning', icon: AlertCircle, message: `Awas! Pengeluaran Anda (Defisit ${formatCurrency(monthlyExpense - monthlyIncome, currency)}) melebihi pemasukan bulan ini.` });
    } else if (monthlyExpense > 0 && monthlyIncome === 0) {
      insights.push({ type: 'warning', icon: AlertCircle, message: `Anda memiliki pengeluaran bulan ini, namun belum ada pemasukan yang tercatat.` });
    } else if (monthlyIncome > monthlyExpense * 2 && monthlyExpense > 0) {
      insights.push({ type: 'success', icon: TrendingUp, message: `Bagus sekali! Pemasukan Anda jauh lebih besar dari pengeluaran bulan ini.` });
    }

    // 4. Month over Month (MoM) spending
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthExp = transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === lastMonth.getMonth())
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    if (lastMonthExp > 0) {
      if (monthlyExpense > lastMonthExp * 1.2) {
        insights.push({ type: 'warning', icon: TrendingUp, message: `Pengeluaran bulan ini naik signifikan dibanding bulan lalu. Waktunya mengerem pengeluaran!` });
      } else if (monthlyExpense < lastMonthExp * 0.8) {
        insights.push({ type: 'success', icon: TrendingDown, message: `Luar biasa! Pengeluaran bulan ini jauh lebih hemat dibanding bulan lalu.` });
      }
    } else if (lastMonthExp === 0 && monthlyExpense > 0) {
      insights.push({ type: 'info', icon: Lightbulb, message: `Ini adalah bulan pertama Anda mencatat pengeluaran. Tetap pantau arus kas Anda ya!` });
    }

    if (insights.length === 0) {
      insights.push({ type: 'info', icon: Lightbulb, message: 'Keuangan Anda terpantau stabil bulan ini. Terus pertahankan kebiasaan baik ini!' });
    }

    // Prioritize warnings, then successes, then info
    insights.sort((a, b) => {
      const order = { warning: 1, success: 2, info: 3 };
      return order[a.type] - order[b.type];
    });

    return insights;
  };
  
  const insights = generateInsights();



  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-8 max-w-7xl mx-auto pb-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-1 text-slate-200">
            Selamat datang kembali, {profile.name ? profile.name.split(' ')[0] : 'Pengguna'}.
          </h1>
          <p className="text-slate-400 text-sm">Berikut adalah ringkasan keuangan Anda untuk bulan ini.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-xl bg-surface-dark border border-border-dark text-sm font-medium hover:bg-surface-hover transition-colors text-slate-300 shadow-sm shadow-black/50">
            {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
          </button>
          <button 
            onClick={() => openModal()}
            className="btn-premium shadow-lg shadow-brand-500/20"
          >
            <Plus size={16} /> Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Saldo" 
          val={formatCurrency(totalBalance, currency)} 
          trend="Semua dompet" 
          isNeutral 
          icon={Wallet} 
          color="brand" 
        />
        <StatCard 
          title="Pemasukan Bulan Ini" 
          val={formatCurrency(monthlyIncome, currency)} 
          trend={monthlyIncome > 0 ? 'Bulan ini' : 'Belum ada'} 
          isUp 
          isNeutral={monthlyIncome === 0}
          icon={TrendingUp} 
          color="green" 
        />
        <StatCard 
          title="Pengeluaran Bulan Ini" 
          val={formatCurrency(monthlyExpense, currency)} 
          trend={monthlyExpense > 0 ? 'Bulan ini' : 'Belum ada'} 
          isUp={false}
          isNeutral={monthlyExpense === 0}
          icon={TrendingDown} 
          color="red" 
        />
        <StatCard 
          title="Saldo Bersih Bulan Ini" 
          val={formatCurrency(monthlyIncome - monthlyExpense, currency)} 
          trend={monthlyIncome - monthlyExpense >= 0 ? 'Surplus' : 'Defisit'} 
          isUp={monthlyIncome - monthlyExpense >= 0}
          isNeutral={monthlyIncome === 0 && monthlyExpense === 0}
          icon={Target} 
          color="accent" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">


          {/* Charts Area */}
          <div className="glass-card rounded-3xl p-6 h-[320px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-brand-500/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-semibold text-lg text-slate-200">Arus Kas Analytics</h3>
              <span className="text-xs text-slate-500 bg-surface-hover px-3 py-1 rounded-full">6 Bulan Terakhir</span>
            </div>
            <div className="flex-1 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartIncomeExpenseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#ffffff50" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => {
                    if (val >= 1000000) return `${(val/1000000).toFixed(0)}M`;
                    if (val >= 1000) return `${(val/1000).toFixed(0)}K`;
                    return `${val}`;
                  }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }} 
                    formatter={(val: number) => [formatCurrency(val, currency), '']}
                  />
                  <Area type="monotone" dataKey="income" name="Pemasukan" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Smart Insights Panel */}
          <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group border border-brand-500/30 bg-gradient-to-br from-surface-dark/60 to-brand-900/20 shadow-xl shadow-brand-900/10">
            <div className="absolute -top-10 -right-10 p-8 opacity-20 text-brand-500 pointer-events-none transform rotate-12 transition-transform group-hover:rotate-45 duration-700">
              <Sparkles size={120} />
            </div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 rounded-2xl bg-brand-500/20 text-brand-400 shrink-0 shadow-inner shadow-brand-500/5">
                <Sparkles size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-cyan-400 mb-3">AI Insights</h3>
                <div className="space-y-3">
                  {insights.slice(0, 3).map((insight, i) => {
                    const IconComponent = insight.icon;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className={`flex items-start gap-3 p-3 rounded-xl bg-surface-hover border border-border-dark text-sm ${
                        insight.type === 'warning' ? 'text-amber-400' :
                        insight.type === 'success' ? 'text-green-400' : 'text-slate-300'
                      }`}>
                        <IconComponent size={18} className="shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{insight.message}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Categories Chart */}
          <div className="glass-card rounded-3xl p-6 flex flex-col flex-1 relative overflow-hidden">
            <h3 className="font-semibold text-lg mb-2 text-slate-200">Distribusi Kategori</h3>
            {chartCategoryData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                Belum ada data pengeluaran
              </div>
            ) : (
              <>
                <div className="flex-1 relative flex items-center justify-center min-h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={chartCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={6}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={8}
                      >
                        {chartCategoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                        formatter={(val: number) => [formatCurrency(val, currency), '']}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mb-1">Total</span>
                     <span className="text-base font-bold text-slate-200 bg-surface-dark/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                       {formatCurrency(monthlyExpense, currency).replace(/[^0-9.,KMB]/g, '').slice(0, 8)}
                     </span>
                  </div>
                </div>
                <div className="mt-4 space-y-2 overflow-y-auto scrollbar-hide max-h-[120px] pr-2">
                  {chartCategoryData.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0 shadow-sm shadow-black/50" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-slate-300 truncate max-w-[100px] font-medium">{cat.name}</span>
                      </div>
                      <span className="font-bold text-slate-200 shrink-0">{formatCurrency(cat.value, currency)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table Row */}
      <div className="glass-card rounded-3xl p-6 mt-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 relative z-10">
          <h3 className="font-semibold text-lg text-slate-200">Transaksi Terbaru</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab && setActiveTab('transactions')}
              className="px-5 py-2.5 rounded-xl bg-surface-hover hover:bg-surface-hover text-sm font-medium text-slate-200 transition-all border border-border-dark hover:border-slate-300/30 shadow-sm"
            >
              Lihat Semua
            </button>
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-slate-400 border-b border-border-dark text-xs uppercase tracking-wider bg-surface-dark">
                <th className="py-4 px-5 font-medium rounded-tl-xl">Transaksi</th>
                <th className="py-4 px-5 font-medium">Jumlah</th>
                <th className="py-4 px-5 font-medium hidden md:table-cell">Tanggal</th>
                <th className="py-4 px-5 font-medium hidden sm:table-cell">Dompet</th>
                <th className="py-4 px-5 font-medium hidden sm:table-cell">Status</th>
                <th className="py-4 px-5 rounded-tr-xl"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-hover transition-colors group">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-surface-dark border border-border-dark flex items-center justify-center group-hover:border-brand-500/30 group-hover:bg-brand-500/10 transition-colors shrink-0 shadow-lg shadow-black/20">
                        <span className="text-xl">
                          {tx.type === 'income' ? <TrendingUp size={24} className="text-green-400" /> : <ShoppingCart size={24} className="text-slate-400" />}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-200 truncate max-w-[180px] text-base">{tx.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate bg-surface-hover inline-block px-2 py-0.5 rounded-md">{tx.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`text-base font-bold ${tx.type === 'income' ? 'text-green-400' : 'text-slate-200'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), currency)}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-400 hidden md:table-cell font-medium">{tx.date}</td>
                  <td className="py-4 px-5 hidden sm:table-cell">
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
                      {tx.status === 'Completed' ? 'Selesai' : tx.status === 'Pending' ? 'Tertunda' : 'Gagal'}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openModal(tx)} 
                        className="text-slate-500 hover:text-white transition-colors p-2 rounded-xl hover:bg-surface-hover hidden sm:block"
                        title="Edit transaksi"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Hapus transaksi ini?')) deleteTransaction(tx.id);
                        }} 
                        className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-red-500/10"
                        title="Hapus transaksi"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-4 bg-surface-dark rounded-b-xl border-t border-border-dark">
              <div className="w-20 h-20 bg-surface-dark rounded-full flex items-center justify-center border border-border-dark shadow-2xl">
                <Wallet className="w-10 h-10 text-slate-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-300 mb-1">Belum Ada Transaksi</p>
                <p className="text-sm">Catat pengeluaran pertama Anda sekarang!</p>
              </div>
              <button 
                onClick={() => openModal()}
                className="btn-premium mt-2"
              >
                <Plus size={16} /> Tambah Transaksi
              </button>
            </div>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {isModalOpen && <TransactionModal onClose={() => { setIsModalOpen(false); setTxToEdit(null); }} txToEdit={txToEdit} />}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ title, val, trend, isUp, isNeutral, icon: Icon, color }: any) {
  const colorMap: any = {
    brand: 'text-brand-400 bg-brand-400/10 border-brand-500/20 shadow-brand-500/5',
    green: 'text-green-400 bg-green-400/10 border-green-500/20 shadow-green-500/5',
    red: 'text-red-400 bg-red-400/10 border-red-500/20 shadow-red-500/5',
    accent: 'text-accent-400 bg-accent-400/10 border-accent-500/20 shadow-accent-500/5',
  };

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      className={`glass-card rounded-3xl p-6 relative overflow-hidden group border ${colorMap[color].split(' ')[2]} shadow-lg ${colorMap[color].split(' ')[3]}`}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-surface-hover rounded-full blur-xl group-hover:bg-surface-hover transition-colors pointer-events-none" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${colorMap[color].split(' ').slice(0,2).join(' ')}`}>
            <Icon size={20} />
          </div>
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        </div>
      </div>
      
      <div className="text-2xl lg:text-3xl font-display font-bold text-slate-200 mb-3 tracking-tight truncate relative z-10">{val}</div>
      
      <div className="flex flex-wrap items-center gap-2 text-xs relative z-10">
        <span className={`font-bold inline-flex items-center px-2 py-1 rounded-lg ${
          isNeutral ? 'bg-slate-500/10 text-slate-400' : isUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {!isNeutral && (isUp ? <TrendingUp size={14} className="mr-1.5"/> : <TrendingDown size={14} className="mr-1.5"/>)}
          {trend}
        </span>
      </div>
    </motion.div>
  );
}
