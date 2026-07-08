const fs = require('fs');
let c = fs.readFileSync('src/i18n/locales.ts', 'utf8');

const enFeat = `
  features: {
    tag: 'Core Features',
    title1: 'Everything you need.',
    title2: "nothing you don't.",
    subtitle: 'A meticulously crafted suite of tools designed to give you absolute clarity and control over your financial footprint.',
    card1Title: 'Global Expense Tracking',
    card1Desc: 'Monitor every cent you spend in real-time across the globe. Seamlessly track multiple revenue streams securely and clearly.',
    card2Title: 'Multi-Currency Wallets',
    card2Desc: 'Manage balances in USD, EUR, GBP, IDR, SGD, and more. Group your assets the way you actually use them.',
    card3Title: 'Category Breakdown',
    card3Desc: 'Visualize your spending behavior with beautiful, interactive charts.',
    card4Title: 'Export Globally',
    card4Desc: 'Generate professional PDF & CSV reports for your personal records.',
    card5Title: 'Lightning Fast Search',
    card5Desc: 'Instantly find specific transactions from years ago. Filter by amount, date, category, or custom tags with zero lag.'
  },`;

const idFeat = `
  features: {
    tag: 'Fitur Utama',
    title1: 'Semua yang Anda butuhkan.',
    title2: 'tanpa yang tidak perlu.',
    subtitle: 'Kumpulan alat yang dibuat dengan cermat, dirancang untuk memberi Anda kejelasan mutlak dan kendali atas rekam jejak keuangan Anda.',
    card1Title: 'Pelacakan Pengeluaran Global',
    card1Desc: 'Pantau setiap sen yang Anda belanjakan secara real-time di seluruh dunia. Lacak beberapa aliran pendapatan dengan aman dan jelas.',
    card2Title: 'Dompet Multi-Mata Uang',
    card2Desc: 'Kelola saldo dalam USD, EUR, GBP, IDR, SGD, dan banyak lagi. Kelompokkan aset Anda sesuai dengan cara Anda menggunakannya.',
    card3Title: 'Rincian Kategori',
    card3Desc: 'Visualisasikan perilaku pengeluaran Anda dengan bagan yang indah dan interaktif.',
    card4Title: 'Ekspor Global',
    card4Desc: 'Hasilkan laporan PDF & CSV profesional untuk catatan pribadi Anda.',
    card5Title: 'Pencarian Cepat Kilat',
    card5Desc: 'Temukan transaksi tertentu dari bertahun-tahun lalu secara instan. Filter berdasarkan jumlah, tanggal, atau tag tanpa lag.'
  },`;

c = c.replace(/hero: \{/, enFeat + '\n  hero: {');
c = c.replace(/hero: \{\n    live: "FlowFinance 2\.0 kini/, idFeat + '\n  hero: {\n    live: "FlowFinance 2.0 kini');

fs.writeFileSync('src/i18n/locales.ts', c);

// Now process FeaturesSection.tsx
let f = fs.readFileSync('src/components/landing/FeaturesSection.tsx', 'utf8');
if (!f.includes('useLanguage')) {
  f = f.replace(/import \{ motion \} from 'motion\/react';/, "import { motion } from 'motion/react';\nimport { useLanguage } from '../../context/LanguageContext';");
  f = f.replace(/export default function FeaturesSection\(\) \{/, "export default function FeaturesSection() {\n  const { t } = useLanguage();");
}
f = f.replace(/>Core Features</, ">{t('features.tag')}<");
f = f.replace(/>Everything you need\.</, ">{t('features.title1')}<");
f = f.replace(/>nothing you don't\.</, ">{t('features.title2')}<");
f = f.replace(/>\s*A meticulously crafted suite of tools designed to give you absolute clarity and control over your financial footprint\.\s*</, ">{t('features.subtitle')}<");
f = f.replace(/>Global Expense Tracking</, ">{t('features.card1Title')}<");
f = f.replace(/>\s*Monitor every cent you spend in real-time across the globe\. Seamlessly track multiple revenue streams securely and clearly\.\s*</, ">{t('features.card1Desc')}<");
f = f.replace(/>Multi-Currency Wallets</, ">{t('features.card2Title')}<");
f = f.replace(/>\s*Manage balances in USD, EUR, GBP, IDR, SGD, and more\. Group your assets the way you actually use them\.\s*</, ">{t('features.card2Desc')}<");
f = f.replace(/>Category Breakdown</, ">{t('features.card3Title')}<");
f = f.replace(/>Visualize your spending behavior with beautiful, interactive charts\.</, ">{t('features.card3Desc')}<");
f = f.replace(/>Export Globally</, ">{t('features.card4Title')}<");
f = f.replace(/>Generate professional PDF & CSV reports for your personal records\.</, ">{t('features.card4Desc')}<");
f = f.replace(/>Lightning Fast Search</, ">{t('features.card5Title')}<");
f = f.replace(/>\s*Instantly find specific transactions from years ago\. Filter by amount, date, category, or custom tags with zero lag\.\s*</, ">{t('features.card5Desc')}<");

fs.writeFileSync('src/components/landing/FeaturesSection.tsx', f);
console.log("Done");
