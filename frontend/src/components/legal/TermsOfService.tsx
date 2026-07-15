import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold text-white mb-6">Syarat & Ketentuan Layanan</h1>
          <p className="text-slate-400 mb-8">Terakhir diperbarui: 8 Juli 2026</p>
          
          <div className="space-y-6 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Penerimaan Syarat</h2>
              <p>Dengan mengakses dan menggunakan Monevra, Anda menyetujui untuk terikat oleh Syarat & Ketentuan Layanan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda tidak diperkenankan menggunakan layanan kami.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Akun Pengguna</h2>
              <p>Untuk menggunakan fitur tertentu dari layanan kami, Anda harus mendaftar akun. Anda bertanggung jawab untuk menjaga kerahasiaan informasi akun dan kata sandi Anda. Anda menyetujui untuk menerima tanggung jawab atas semua aktivitas yang terjadi di bawah akun Anda.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Penggunaan Layanan</h2>
              <p>Anda setuju untuk tidak menyalahgunakan layanan Monevra. Anda dilarang menggunakan platform ini untuk tujuan ilegal, pencucian uang, penipuan, atau tindakan yang melanggar hukum dan peraturan yang berlaku di wilayah yurisdiksi Anda.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Keamanan Data Finansial</h2>
              <p>Monevra menyediakan alat pencatatan dan pengelolaan keuangan. Walaupun kami menggunakan enkripsi standar industri, kami tidak bertanggung jawab atas kerugian finansial yang diakibatkan oleh kelalaian Anda dalam menjaga keamanan perangkat atau membagikan akses Anda kepada pihak ketiga.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Perubahan Layanan</h2>
              <p>Kami berhak untuk mengubah, menangguhkan, atau menghentikan layanan (atau bagian mana pun darinya) kapan saja dengan atau tanpa pemberitahuan sebelumnya. Kami tidak bertanggung jawab kepada Anda atau pihak ketiga atas modifikasi apa pun.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Batasan Tanggung Jawab</h2>
              <p>Monevra tidak memberikan jaminan keuangan atau nasihat investasi. Semua keputusan keuangan yang Anda buat dengan menggunakan perangkat lunak kami adalah risiko Anda sendiri.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
