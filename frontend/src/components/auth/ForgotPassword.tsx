import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Mail, ArrowRight, Loader2, CheckCircle2, Lock, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword, verifyResetCode, confirmPasswordReset } = useAuth();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      if (step === 'email') {
        const response = await resetPassword(email);
        setMessage(response.message || 'Kode OTP telah dikirim ke email Anda.');
        setStep('code');
      } else if (step === 'code') {
        await verifyResetCode(email, code);
        setMessage('Kode valid. Silakan masukkan password baru Anda.');
        setStep('password');
      } else {
        await confirmPasswordReset(email, newPassword, code);
        setMessage('Password berhasil direset! Mengalihkan ke halaman login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } as any }
  };

  return (
    <AuthLayout title={t('auth.resetTitle')} subtitle={t('auth.resetSubtitle')}>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        <form className="space-y-6" onSubmit={handleReset}>
          {error && (
            <motion.div variants={itemVariants} className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3">
              <div className="mt-0.5">⚠️</div>
              <div>{error}</div>
            </motion.div>
          )}
          {message && (
            <motion.div variants={itemVariants} className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>{message}</div>
            </motion.div>
          )}
          
          <div className="space-y-5">
            {step === 'email' && (
              <motion.div variants={itemVariants} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer block w-full appearance-none rounded-xl border border-white/10 bg-surface-dark/40 pl-11 px-4 pt-5 pb-2 text-white shadow-inner focus:border-brand-400 focus:bg-surface-dark/80 focus:outline-none focus:ring-4 focus:ring-brand-500/20 transition-all duration-300 hover:border-white/20 sm:text-sm placeholder-transparent"
                  placeholder={t('auth.emailPlaceholder')}
                />
                <label htmlFor="email" className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-11 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-brand-400 cursor-text">
                  {t('auth.emailLabel')}
                </label>
              </motion.div>
            )}
          
                    {step === 'code' && (
              <motion.div variants={itemVariants} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <KeyRound className="h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input
                  type="text"
                  id="code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="peer block w-full appearance-none rounded-xl border border-white/10 bg-surface-dark/40 pl-11 px-4 pt-5 pb-2 text-white shadow-inner focus:border-brand-400 focus:bg-surface-dark/80 focus:outline-none focus:ring-4 focus:ring-brand-500/20 transition-all duration-300 hover:border-white/20 sm:text-lg tracking-widest font-mono placeholder-transparent"
                  placeholder="000000"
                  maxLength={6}
                />
                <label htmlFor="code" className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-11 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-brand-400 cursor-text">
                  Kode Verifikasi (6 Angka)
                </label>
              </motion.div>
            )}

            {step === 'password' && (
              <motion.div variants={itemVariants} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input
                  type="password"
                  id="newPassword"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="peer block w-full appearance-none rounded-xl border border-white/10 bg-surface-dark/40 pl-11 px-4 pt-5 pb-2 text-white shadow-inner focus:border-brand-400 focus:bg-surface-dark/80 focus:outline-none focus:ring-4 focus:ring-brand-500/20 transition-all duration-300 hover:border-white/20 sm:text-sm placeholder-transparent"
                  placeholder="••••••••"
                  minLength={6}
                />
                <label htmlFor="newPassword" className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-11 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-brand-400 cursor-text">
                  {t('auth.passwordLabel')} Baru
                </label>
              </motion.div>
            )}

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              className="w-full relative group rounded-xl p-[1px] transition-all duration-500 disabled:opacity-70 mt-6 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-brand-500 via-accent-500 to-brand-500 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] group-hover:bg-[position:100%_0]"></span>
              <div className="relative flex items-center justify-center gap-2 px-4 py-3.5 bg-surface-dark/80 backdrop-blur-md rounded-xl transition-all duration-300 group-hover:bg-transparent">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                    <span className="font-semibold text-white">{t('auth.processing')}</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-white text-base">
                      {step === 'email' ? t('auth.resetPassword') : (step === 'code' ? 'Verifikasi Kode' : 'Ubah Kata Sandi')}
                    </span>
                    <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </motion.button>
          </div>
        </form>

        <motion.div variants={itemVariants} className="mt-8 text-center text-sm text-slate-400">
          {t('auth.rememberPassword')}{' '}
          <Link to="/login" className="font-semibold text-white hover:text-brand-400 transition-colors">
            {t('auth.signInBack')}
          </Link>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}
