import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, Wallet, Budget, Goal } from '../types';
import { useAuth } from './AuthContext';
import { apiRequest } from '../lib/api';

export interface Profile {
  name: string;
  email: string;
  currency: string;
  language?: string;
  phone?: string;
  avatar?: string | null;
  twoFactorEnabled?: boolean;
}

interface FinancePayload {
  profile: Profile;
  transactions: Transaction[];
  wallets: Wallet[];
  budgets: Budget[];
  goals: Goal[];
}

interface FinanceContextType {
  transactions: Transaction[];
  wallets: Wallet[];
  budgets: Budget[];
  goals: Goal[];
  profile: Profile;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addWallet: (wallet: Omit<Wallet, 'id' | 'balance'> & { initialBalance: number }) => Promise<void>;
  updateWallet: (id: string, wallet: Partial<Omit<Wallet, 'id'>>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, budget: Omit<Budget, 'id'>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, goal: Omit<Goal, 'id'>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
  getTotalBalance: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpense: () => number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profile, setProfile] = useState<Profile>({ name: '', email: '', currency: 'IDR', language: 'id', phone: '', avatar: null, twoFactorEnabled: false });

  const resetState = () => {
    setTransactions([]);
    setWallets([]);
    setBudgets([]);
    setGoals([]);
    setProfile({ name: '', email: '', currency: 'IDR', language: 'id', phone: '', avatar: null, twoFactorEnabled: false });
  };

  const loadFinance = async () => {
    if (!user) {
      resetState();
      return;
    }
    const data = await apiRequest<FinancePayload>(`/users/${user.uid}/finance`);
    setProfile(data.profile);
    setTransactions(data.transactions || []);
    setWallets(data.wallets || []);
    setBudgets(data.budgets || []);
    setGoals(data.goals || []);
  };

  useEffect(() => {
    loadFinance().catch(console.error);
  }, [user?.uid]);

  const updateWalletLocal = async (id: string, updatedWallet: Partial<Omit<Wallet, 'id'>>) => {
    if (!user) return;
    await apiRequest(`/users/${user.uid}/wallets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedWallet),
    });
  };

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    if (!user) return;
    await apiRequest(`/users/${user.uid}/transactions`, {
      method: 'POST',
      body: JSON.stringify(tx),
    });

    const walletToUpdate = wallets.find(w => w.name === tx.wallet);
    if (walletToUpdate) {
      const delta = tx.type === 'income' ? tx.amount : -Math.abs(tx.amount);
      await updateWalletLocal(walletToUpdate.id, { balance: walletToUpdate.balance + delta });
    }
    await loadFinance();
  };

  const updateTransaction = async (id: string, updatedTx: Omit<Transaction, 'id'>) => {
    if (!user) return;
    const oldTx = transactions.find(t => t.id === id);

    await apiRequest(`/users/${user.uid}/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedTx),
    });

    if (oldTx) {
      const oldWallet = wallets.find(w => w.name === oldTx.wallet);
      const newWallet = wallets.find(w => w.name === updatedTx.wallet);

      if (oldWallet && newWallet && oldWallet.id === newWallet.id) {
        const oldDelta = oldTx.type === 'income' ? oldTx.amount : -Math.abs(oldTx.amount);
        const newDelta = updatedTx.type === 'income' ? updatedTx.amount : -Math.abs(updatedTx.amount);
        await updateWalletLocal(oldWallet.id, { balance: oldWallet.balance - oldDelta + newDelta });
      } else {
        if (oldWallet) {
          const oldDelta = oldTx.type === 'income' ? oldTx.amount : -Math.abs(oldTx.amount);
          await updateWalletLocal(oldWallet.id, { balance: oldWallet.balance - oldDelta });
        }
        if (newWallet) {
          const newDelta = updatedTx.type === 'income' ? updatedTx.amount : -Math.abs(updatedTx.amount);
          await updateWalletLocal(newWallet.id, { balance: newWallet.balance + newDelta });
        }
      }
    }
    await loadFinance();
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    const txToDelete = transactions.find(t => t.id === id);
    await apiRequest(`/users/${user.uid}/transactions/${id}`, { method: 'DELETE' });

    if (txToDelete) {
      const walletToUpdate = wallets.find(w => w.name === txToDelete.wallet);
      if (walletToUpdate) {
        const delta = txToDelete.type === 'income' ? txToDelete.amount : -Math.abs(txToDelete.amount);
        await updateWalletLocal(walletToUpdate.id, { balance: walletToUpdate.balance - delta });
      }
    }
    await loadFinance();
  };

  const addWallet = async (wallet: Omit<Wallet, 'id' | 'balance'> & { initialBalance: number }) => {
    if (!user) return;
    await apiRequest(`/users/${user.uid}/wallets`, {
      method: 'POST',
      body: JSON.stringify(wallet),
    });
    await loadFinance();
  };

  const updateWallet = async (id: string, updatedWallet: Partial<Omit<Wallet, 'id'>>) => {
    await updateWalletLocal(id, updatedWallet);
    await loadFinance();
  };

  const deleteWallet = async (id: string) => {
    if (!user) return;
    await apiRequest(`/users/${user.uid}/wallets/${id}`, { method: 'DELETE' });
    await loadFinance();
  };

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    if (!user) return;
    await apiRequest(`/users/${user.uid}/budgets`, {
      method: 'POST',
      body: JSON.stringify(budget),
    });
    await loadFinance();
  };

  const updateBudget = async (id: string, updatedBudget: Omit<Budget, 'id'>) => {
    if (!user) return;
    await apiRequest(`/users/${user.uid}/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedBudget),
    });
    await loadFinance();
  };

  const deleteBudget = async (id: string) => {
    if (!user) return;
    await apiRequest(`/users/${user.uid}/budgets/${id}`, { method: 'DELETE' });
    await loadFinance();
  };

  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    if (!user) return;
    await apiRequest(`/users/${user.uid}/goals`, {
      method: 'POST',
      body: JSON.stringify(goal),
    });
    await loadFinance();
  };

  const updateGoal = async (id: string, updatedGoal: Omit<Goal, 'id'>) => {
    if (!user) return;
    await apiRequest(`/users/${user.uid}/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedGoal),
    });
    await loadFinance();
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    await apiRequest(`/users/${user.uid}/goals/${id}`, { method: 'DELETE' });
    await loadFinance();
  };

  const updateProfile = async (newProfile: Profile) => {
    if (!user) return;
    await apiRequest(`/users/${user.uid}/profile`, {
      method: 'PUT',
      body: JSON.stringify(newProfile),
    });
    setProfile(newProfile);
  };

  const getTotalBalance = () => wallets.reduce((acc, w) => acc + w.balance, 0);

  const getMonthlyIncome = () => {
    const now = new Date();
    return transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'income' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const getMonthlyExpense = () => {
    const now = new Date();
    return transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  };

  return (
    <FinanceContext.Provider value={{
      transactions, wallets, budgets, goals, profile,
      addTransaction, updateTransaction, deleteTransaction,
      addWallet, updateWallet, deleteWallet,
      addBudget, updateBudget, deleteBudget,
      addGoal, updateGoal, deleteGoal,
      updateProfile,
      getTotalBalance, getMonthlyIncome, getMonthlyExpense,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
