import { Transaction, Wallet } from './types';

export const RECENT_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    title: 'Apple Music Subscription',
    category: 'Entertainment',
    amount: -10.99,
    wallet: 'Main Bank',
    date: '2026-05-24',
    status: 'Completed',
    type: 'expense'
  },
  {
    id: '2',
    title: 'Freelance Design Work',
    category: 'Income',
    amount: 1250.00,
    wallet: 'PayPal',
    date: '2026-05-22',
    status: 'Completed',
    type: 'income'
  },
  {
    id: '3',
    title: 'Grocery Store',
    category: 'Food',
    amount: -124.50,
    wallet: 'Main Bank',
    date: '2026-05-21',
    status: 'Completed',
    type: 'expense'
  },
  {
    id: '4',
    title: 'AWS Server Hosting',
    category: 'Infrastructure',
    amount: -45.00,
    wallet: 'Credit Card',
    date: '2026-05-20',
    status: 'Pending',
    type: 'expense'
  },
  {
    id: '5',
    title: 'Coffee Beans',
    category: 'Food',
    amount: -18.99,
    wallet: 'Main Bank',
    date: '2026-05-19',
    status: 'Completed',
    type: 'expense'
  }
];

export const WALLETS: Wallet[] = [
  { id: '1', name: 'Main Bank', balance: 8450.20, type: 'Bank', accountNumber: '**** 4421' },
  { id: '2', name: 'Credit Card', balance: -450.00, type: 'Bank', accountNumber: '**** 8899' },
  { id: '3', name: 'PayPal', balance: 1250.00, type: 'eWallet', accountNumber: 'alex@example.com' },
  { id: '4', name: 'Revolut', balance: 150.00, type: 'eWallet', accountNumber: '+1 415-555-0198' },
];

export const EXPENSE_DATA = [
  { name: 'Jan', value: 2400 },
  { name: 'Feb', value: 1398 },
  { name: 'Mar', value: 3800 },
  { name: 'Apr', value: 3908 },
  { name: 'May', value: 4800 },
  { name: 'Jun', value: 3800 },
  { name: 'Jul', value: 4300 },
];

export const CATEGORY_DATA = [
  { name: 'Housing', value: 1200 },
  { name: 'Food', value: 600 },
  { name: 'Transport', value: 300 },
  { name: 'Entertainment', value: 200 },
];

export const INCOME_VS_EXPENSE_DATA = [
  { name: 'Week 1', income: 4000, expense: 2400 },
  { name: 'Week 2', income: 3000, expense: 1398 },
  { name: 'Week 3', income: 2000, expense: 3800 },
  { name: 'Week 4', income: 2780, expense: 3908 },
];
