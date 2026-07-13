export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  wallet: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  type: 'income' | 'expense';
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  type: 'Bank' | 'Crypto' | 'eWallet';
  accountNumber?: string;
}

export interface ChartData {
  name: string;
  value: number;
  uv?: number;
  pv?: number;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}
