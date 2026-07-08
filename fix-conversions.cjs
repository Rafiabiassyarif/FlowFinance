const fs = require('fs');

// 1. Fix WalletsView.tsx
let f = 'src/components/dashboard/views/WalletsView.tsx';
let c = fs.readFileSync(f, 'utf8');
if (!c.includes("import { convertToBase, convertFromBase }")) {
  c = c.replace(/import { formatCurrency } [^\n]+\n/, "$&\nimport { convertToBase, convertFromBase } from '../../../lib/exchangeRates';\n");
}
c = c.replace(/balance: parseFloat\(formData.initialBalance \|\| '0'\)/g, "initialBalance: balanceInBase");
c = c.replace(/if \(walletToEdit\) \{\s+await updateWallet\(walletToEdit.id, \{\s+name: formData.name,\s+type: formData.type,\s+accountNumber: formData.accountNumber\s+\}\);/, `if (walletToEdit) {
        await updateWallet(walletToEdit.id, {
          name: formData.name,
          type: formData.type,
          accountNumber: formData.accountNumber,
          balance: balanceInBase
        });`);
fs.writeFileSync(f, c);

// 2. BudgetsView.tsx
f = 'src/components/dashboard/views/BudgetsView.tsx';
c = fs.readFileSync(f, 'utf8');
if (!c.includes("import { convertToBase, convertFromBase }")) {
  c = c.replace(/import { formatCurrency } [^\n]+\n/, "$&\nimport { convertToBase, convertFromBase } from '../../../lib/exchangeRates';\n");
}
c = c.replace(/const { addBudget, updateBudget } = useFinance\(\);/, "const { addBudget, updateBudget, profile } = useFinance();");
c = c.replace(/limit: budgetToEdit\?.limit\?.toString\(\) \|\| ''/, "limit: budgetToEdit?.limit ? convertFromBase(budgetToEdit.limit, profile.currency).toString() : ''");
c = c.replace(/limit: parseFloat\(formData.limit\)/, "limit: convertToBase(parseFloat(formData.limit), profile.currency)");
fs.writeFileSync(f, c);

// 3. GoalsView.tsx
f = 'src/components/dashboard/views/GoalsView.tsx';
c = fs.readFileSync(f, 'utf8');
if (!c.includes("import { convertToBase, convertFromBase }")) {
  c = c.replace(/import { formatCurrency } [^\n]+\n/, "$&\nimport { convertToBase, convertFromBase } from '../../../lib/exchangeRates';\n");
}
c = c.replace(/const { addGoal, updateGoal } = useFinance\(\);/, "const { addGoal, updateGoal, profile } = useFinance();");
c = c.replace(/targetAmount: goalToEdit\?.targetAmount\?.toString\(\) \|\| ''/, "targetAmount: goalToEdit?.targetAmount ? convertFromBase(goalToEdit.targetAmount, profile.currency).toString() : ''");
c = c.replace(/currentAmount: goalToEdit\?.currentAmount\?.toString\(\) \|\| '0'/, "currentAmount: goalToEdit?.currentAmount ? convertFromBase(goalToEdit.currentAmount, profile.currency).toString() : '0'");
c = c.replace(/targetAmount: parseFloat\(formData.targetAmount\),/g, "targetAmount: convertToBase(parseFloat(formData.targetAmount), profile.currency),");
c = c.replace(/currentAmount: parseFloat\(formData.currentAmount \|\| '0'\)/g, "currentAmount: convertToBase(parseFloat(formData.currentAmount || '0'), profile.currency)");
fs.writeFileSync(f, c);

console.log("Done");
