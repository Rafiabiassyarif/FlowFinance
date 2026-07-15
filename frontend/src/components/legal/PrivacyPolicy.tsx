import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-bg-dark text-slate-200 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/register" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 transition-colors mb-8">
          <ArrowLeft size={16} />
          <span>Kembali ke Pendaftaran</span>
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-dark/50 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm"
        >
          <h1 className="text-3xl font-bold text-white mb-6">Kebijakan Privasi</h1>
          <p className="text-slate-400 mb-8">Terakhir diperbarui: 8 Juli 2026</p>
          
          <div className="space-y-6 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Informasi yang Kami Kumpulkan</h2>
              <p>Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami, seperti saat Anda membuat akun, memperbarui profil, atau memasukkan data transaksi. Ini termasuk nama, alamat email, mata uang pilihan, dan catatan keuangan yang Anda simpan di dalam aplikasi kami.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Bagaimana Kami Menggunakan Informasi Anda</h2>
              <p>Kami menggunakan informasi yang kami kumpulkan untuk mengoperasikan, memelihara, dan meningkatkan aplikasi Monevra. Data transaksi Anda diproses secara eksklusif untuk menampilkan analitik, anggaran, dan metrik keuangan di dasbor Anda sendiri. Kami juga menggunakan email Anda untuk mengirim kode OTP dan pemberitahuan keamanan akun.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Perlindungan Data</h2>
              <p>Kami menerapkan tindakan keamanan yang dirancang untuk melindungi informasi pribadi Anda. Kata sandi Anda di-hash dengan kuat menggunakan standar industri terkini, dan komunikasi data antara peramban Anda dan peladen kami dienkripsi menggunakan protokol aman (SSL/TLS).</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Berbagi Informasi</h2>
              <p>Monevra TIDAK PERNAH menjual, menyewakan, atau menukar data pribadi dan finansial Anda kepada pihak ketiga mana pun. Informasi hanya akan dibagikan jika diwajibkan secara hukum atau dengan persetujuan eksplisit Anda.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Hak Anda (Penghapusan Akun)</h2>
              <p>Anda memiliki kendali penuh atas data Anda. Melalui pengaturan akun, Anda berhak menghapus akun Anda beserta seluruh data transaksinya secara permanen dari basis data kami kapan saja.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
