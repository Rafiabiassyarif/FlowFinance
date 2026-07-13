import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  CheckCircle2, AlertTriangle, User, Globe, Camera, 
  Shield, Bell, Smartphone, Trash2, Key, Monitor, Lock, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiRequest } from '../../../lib/api';

export default function SettingsView() {
  const { profile: contextProfile, updateProfile } = useFinance();
  const { logout, user } = useAuth();
  const { t, setLanguage } = useLanguage();
  
  const [profile, setProfile] = useState(contextProfile);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'danger'>('profile');

  // Password State
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfile(contextProfile);
  }, [contextProfile]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveProfile = async () => {
    if (!profile.name || !profile.email) {
      showToast('error', 'Nama dan email tidak boleh kosong.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(profile);
      showToast('success', 'Profil berhasil diperbarui!');
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('error', 'Ukuran gambar maksimal 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        // Update local state directly so it previews instantly, save later when clicking 'Simpan'
        setProfile({ ...profile, avatar: reader.result as string });
        showToast('success', 'Foto berhasil dipilih (Klik Simpan untuk menerapkan)');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.old) {
      showToast('error', 'Masukkan sandi lama Anda');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      showToast('error', 'Konfirmasi kata sandi baru tidak cocok');
      return;
    }
    if (passwords.new.length < 6) {
      showToast('error', 'Sandi baru minimal 6 karakter');
      return;
    }
    
    setPasswordSaving(true);
    try {
      await apiRequest(`/users/${user?.uid}/password`, {
        method: 'PUT',
        body: JSON.stringify({ oldPassword: passwords.old, newPassword: passwords.new })
      });
      showToast('success', 'Kata sandi berhasil diubah!');
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mengubah kata sandi');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('APAKAH ANDA YAKIN? Tindakan ini akan menghapus semua data Anda secara permanen dan tidak dapat dipulihkan.')) {
      const password = window.prompt('Masukkan kata sandi Anda untuk mengonfirmasi penghapusan akun:');
      if (!password) {
        showToast('error', 'Penghapusan akun dibatalkan.');
        return;
      }
      try {
        await apiRequest(`/users/${user?.uid}`, { 
          method: 'DELETE',
          body: JSON.stringify({ password })
        });
        logout();
      } catch (e: any) {
        showToast('error', e.message || 'Gagal menghapus akun.');
      }
    }
  };

  const defaultAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.name}&backgroundColor=transparent`;

  const tabs = [
    { id: 'profile', icon: User, label: t('settings.tabs.profile') },
    { id: 'security', icon: Shield, label: t('settings.tabs.security') },
    { id: 'preferences', icon: Globe, label: t('settings.tabs.preferences') },
    { id: 'danger', icon: Trash2, label: t('settings.tabs.danger'), danger: true },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12 text-slate-200">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium border ${
              toast.type === 'success' 
                ? 'bg-green-500/10 border-green-500/30 text-green-400 backdrop-blur-md' 
                : 'bg-red-500/10 border-red-500/30 text-red-400 backdrop-blur-md'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-slate-200">{t('settings.title')}</h2>
        <p className="text-slate-400 text-sm mt-1">Kelola informasi pribadi, keamanan akun, dan preferensi aplikasi Anda.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <div className="glass-card rounded-[2rem] p-4 sticky top-24 flex flex-col gap-2 border border-border-dark shadow-xl shadow-black/5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    isActive 
                      ? tab.danger 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 border border-brand-400/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover border border-transparent'
                  }`}
                >
                  <Icon size={18} className={isActive ? (tab.danger ? 'text-red-400' : 'text-white') : 'text-slate-500'} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            
            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-[2rem] p-8 border border-border-dark shadow-xl shadow-black/5">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-8">
                    <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                      <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <img 
                        src={profile.avatar || defaultAvatar}
                        alt="Avatar"
                        className="w-32 h-32 rounded-[2rem] bg-surface-dark border border-border-dark relative z-10 shadow-xl object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-[2rem] z-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white mb-1" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Ubah Foto</span>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        accept="image/png, image/jpeg, image/webp" 
                        className="hidden" 
                      />
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-display font-bold text-2xl text-slate-200 mb-1">{profile.name || 'Pengguna'}</h3>
                      <p className="text-slate-400 text-sm mb-4">{profile.email}</p>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider">
                          {user?.role === 'admin' ? '👑 Administrator' : '🚀 Anggota Aktif'}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-hover border border-border-dark text-slate-400 text-xs font-bold uppercase tracking-wider">
                          Bergabung 2026
                        </span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-border-dark mb-8" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{t('settings.fullName')}</label>
                      <input 
                        type="text" 
                        value={profile.name}
                        onChange={e => setProfile({...profile, name: e.target.value})}
                        className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{t('settings.email')}</label>
                      <input 
                        type="email" 
                        value={profile.email}
                        onChange={e => setProfile({...profile, email: e.target.value})}
                        className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50 transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{t('settings.labels.phone')}</label>
                      <input 
                        type="tel" 
                        value={profile.phone || ''}
                        onChange={e => setProfile({...profile, phone: e.target.value})}
                        placeholder="+62 812-XXXX-XXXX"
                        className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSaveProfile} disabled={saving} className="btn-premium shadow-lg shadow-brand-500/20 disabled:opacity-50">
                      {saving ? t('settings.saving') : t('settings.save')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Password Change */}
                <div className="glass-card rounded-[2rem] p-8 border border-border-dark shadow-xl shadow-black/5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-surface-hover border border-border-dark text-slate-300">
                      <Key size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-200">{t('settings.sections.passwords')}</h3>
                      <p className="text-xs text-slate-400 mt-1">Pastikan kata sandi Anda kuat dan tidak digunakan di tempat lain.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{t('settings.labels.oldPass')}</label>
                      <input 
                        type="password" value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})}
                        autoComplete="new-password"
                        className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{t('settings.labels.newPass')}</label>
                      <input 
                        type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})}
                        autoComplete="new-password"
                        className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{t('settings.labels.confirmPass')}</label>
                      <input 
                        type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                        autoComplete="new-password"
                        className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50 transition-all"
                      />
                    </div>
                    <button onClick={handlePasswordChange} disabled={passwordSaving} className="mt-4 px-6 py-2.5 bg-surface-hover hover:bg-slate-700/50 border border-border-dark rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 text-slate-200">
                      {passwordSaving ? t('settings.saving') : t('settings.labels.updatePass')}
                    </button>
                  </div>
                </div>

                {/* 2FA */}
                <div className="glass-card rounded-[2rem] p-8 border border-border-dark shadow-xl shadow-black/5 flex flex-col sm:flex-row gap-6 justify-between items-center">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                      <Lock size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-200">{t('settings.sections.twoFactor')}</h3>
                      <p className="text-sm text-slate-400 mt-1 max-w-md">Amankan akun Anda dengan mewajibkan kode token khusus setiap kali Anda masuk dari perangkat baru.</p>
                    </div>
                  </div>
                  <Toggle 
                    label="" 
                    checked={profile.twoFactorEnabled || false} 
                    onChange={async (c) => {
                      setProfile({...profile, twoFactorEnabled: c});
                      await updateProfile({...profile, twoFactorEnabled: c});
                      showToast('success', `2FA berhasil di${c ? 'aktifkan' : 'nonaktifkan'}`);
                    }} 
                  />
                </div>

                {/* Sessions */}
                <div className="glass-card rounded-[2rem] p-8 border border-border-dark shadow-xl shadow-black/5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-surface-hover border border-border-dark text-slate-300">
                      <Monitor size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-200">{t('settings.sections.sessions')}</h3>
                      <p className="text-xs text-slate-400 mt-1">Perangkat yang saat ini login ke akun Anda.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-surface-dark border border-border-dark">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                        <Smartphone size={18} className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">Windows PC - Chrome (Sesi Saat Ini)</p>
                        <p className="text-xs text-slate-500 mt-0.5">Jakarta, ID • IP: 114.122.x.x</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold tracking-wider uppercase border border-green-500/20">
                      Aktif
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: PREFERENCES */}
            {activeTab === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-[2rem] p-8 border border-border-dark shadow-xl shadow-black/5">
                  <h3 className="font-semibold text-lg text-slate-200 mb-6">{t('settings.sections.regional')}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{t('settings.language')}</label>
                      <select 
                        value={profile.language || 'id'}
                        onChange={e => setProfile({...profile, language: e.target.value})}
                        className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50 transition-all shadow-inner appearance-none cursor-pointer"
                      >
                        <option value="id">🇮🇩 Bahasa Indonesia</option>
                        <option value="en">🇬🇧 English (US)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{t('settings.currency')}</label>
                      <select 
                        value={profile.currency}
                        onChange={e => setProfile({...profile, currency: e.target.value})}
                        className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50 transition-all shadow-inner appearance-none cursor-pointer"
                      >
                        <option value="IDR">IDR (Rp) - Rupiah Indonesia</option>
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-border-dark flex justify-end">
                    <button onClick={handleSaveProfile} disabled={saving} className="btn-premium disabled:opacity-50">
                      {saving ? t('settings.saving') : t('settings.save')}
                    </button>
                  </div>
                </div>

                <div className="glass-card rounded-[2rem] p-8 border border-border-dark shadow-xl shadow-black/5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <Bell size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-200">{t('settings.sections.notifications')}</h3>
                      <p className="text-xs text-slate-400 mt-1">Pilih notifikasi apa saja yang ingin Anda terima.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 max-w-xl">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-dark border border-border-dark">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">Notifikasi Email</p>
                        <p className="text-xs text-slate-500 mt-1">Terima email peringatan sistem dan keamanan penting.</p>
                      </div>
                      <Toggle 
                        label="" 
                        checked={profile.notifEmail ?? true} 
                        onChange={async (c) => {
                          setProfile({...profile, notifEmail: c});
                          await updateProfile({...profile, notifEmail: c});
                          showToast('success', 'Preferensi notifikasi disimpan');
                        }} 
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-dark border border-border-dark">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">Notifikasi Push Transaksi</p>
                        <p className="text-xs text-slate-500 mt-1">Peringatan real-time saat transaksi atau anggaran baru.</p>
                      </div>
                      <Toggle 
                        label="" 
                        checked={profile.notifPush ?? false} 
                        onChange={async (c) => {
                          setProfile({...profile, notifPush: c});
                          await updateProfile({...profile, notifPush: c});
                          showToast('success', 'Preferensi notifikasi disimpan');
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: DANGER */}
            {activeTab === 'danger' && (
              <motion.div
                key="danger"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="border border-red-500/20 bg-red-500/5 rounded-[2rem] p-8 relative overflow-hidden shadow-2xl shadow-red-900/10">
                  <div className="absolute -top-10 -right-10 p-8 opacity-5 text-red-500 pointer-events-none transform rotate-12">
                    <AlertTriangle size={150} />
                  </div>
                  
                  <div className="relative z-10 max-w-2xl">
                    <h3 className="font-bold text-xl text-red-400 mb-3">Zona Berbahaya</h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-6">
                      Menghapus akun akan mengakibatkan hilangnya <span className="font-bold text-white">secara permanen</span> seluruh data transaksi, riwayat dompet, target keuangan, dan preferensi profil Anda. Data yang telah dihapus tidak dapat dipulihkan oleh administrator sekalipun.
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <button onClick={handleDeleteAccount} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-500/20 flex items-center gap-2">
                        <Trash2 size={18} /> Hapus Akun Secara Permanen
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card rounded-[2rem] p-8 border border-border-dark flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-200">Keluar dari Perangkat</h3>
                    <p className="text-sm text-slate-400 mt-1">Hentikan sesi Anda saat ini untuk mengamankan akun.</p>
                  </div>
                  <button onClick={logout} className="px-6 py-3 bg-surface-dark hover:bg-surface-hover border border-border-dark text-slate-300 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                    <LogOut size={18} /> Keluar Aplikasi
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      {label && <span className="text-xs font-medium text-slate-300 group-hover:text-slate-200 transition-colors mr-4">{label}</span>}
      <div className="relative shrink-0" onClick={() => onChange(!checked)}>
        <div className={`block w-10 h-6 rounded-full transition-colors duration-300 shadow-inner ${checked ? 'bg-brand-500' : 'bg-surface-dark border border-border-dark'}`}></div>
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
      </div>
    </label>
  );
}
