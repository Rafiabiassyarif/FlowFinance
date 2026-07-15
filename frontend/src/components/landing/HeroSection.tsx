import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function HeroSection() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  return (
    <section className="relative flex flex-col items-center text-center pt-32 pb-40 z-10">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/20 blur-[150px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-surface-dark/80 border border-white/10 text-sm font-medium text-slate-300 mb-10 backdrop-blur-xl shadow-2xl hover:border-brand-500/30 transition-colors cursor-pointer group"
      >
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
        </span>
        <span className="text-white font-semibold">Monevra 2.0</span> {t('hero.live').replace('Monevra 2.0', '')}
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        className="font-display text-5xl md:text-7xl lg:text-[6.5rem] font-extrabold tracking-tight leading-[1.05] mb-8 max-w-5xl text-white"
      >
        {t('hero.title1')}<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-accent-400 to-brand-300 animate-gradient-x">
          {t('hero.title2')}
        </span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        className="text-xl md:text-2xl text-slate-400 max-w-3xl mb-12 leading-relaxed font-light"
      >
        {t('hero.subtitle')}
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto"
      >
        <Link 
          to={user ? "/dashboard" : "/login"}
          className="relative group overflow-hidden rounded-2xl p-[1px] hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-shadow duration-300"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-brand-400 to-accent-600 rounded-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
          <div className="relative px-8 py-4 bg-bg-dark rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 group-hover:bg-opacity-0 group-hover:text-white">
             <span className="font-semibold text-lg">{user ? t('hero.ctaOpen') : t('hero.ctaStart')}</span>
             <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <a 
          href="#features"
          className="px-8 py-4 rounded-2xl bg-surface-dark border border-white/10 hover:border-white/20 text-white font-semibold transition-all backdrop-blur-md flex items-center justify-center gap-3 hover:-translate-y-1 shadow-xl hover:shadow-2xl hover:bg-white/5"
        >
          <Play className="w-5 h-5 fill-current" />
          {t('hero.demo')}
        </a>
      </motion.div>

      {/* Floating UI Presentation - Non-Web, Abstract Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="mt-32 w-full max-w-5xl relative perspective-1000 hidden md:block h-[500px]"
      >
         <div className="absolute inset-0 bg-gradient-to-b from-brand-500/20 to-transparent blur-3xl -z-10 rounded-full" />
         
         {/* Center Large Card: Total Balance & Graph */}
         <motion.div 
           animate={{ y: [-15, 15, -15], rotateX: [5, -5, 5], rotateY: [-5, 5, -5] }}
           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
           className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] rounded-[2.5rem] border border-white/10 bg-surface-dark/60 backdrop-blur-3xl overflow-hidden shadow-[0_0_80px_rgba(59,130,246,0.3)] ring-1 ring-white/10 z-20 p-8"
         >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10 flex justify-between items-start mb-8">
               <div>
                 <div className="text-slate-400 font-medium mb-2">{t('heroCards.totalWealth')}</div>
                 <div className="text-5xl font-display font-bold text-white tracking-tight">Rp 245.5M</div>
               </div>
               <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center border border-brand-500/30 text-brand-400 text-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                 💎
               </div>
            </div>
            
            <div className="relative z-10 h-40 w-full mt-4">
              {/* SVG Sparkline */}
              <svg className="absolute bottom-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="heroSparkline" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(96, 165, 250, 0.6)" />
                    <stop offset="100%" stopColor="rgba(96, 165, 250, 0)" />
                  </linearGradient>
                  <filter id="heroGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <path d="M0,100 L0,50 Q20,30 40,60 T80,20 T100,40 L100,100 Z" fill="url(#heroSparkline)" />
                <path d="M0,50 Q20,30 40,60 T80,20 T100,40" fill="none" stroke="#60a5fa" strokeWidth="3" filter="url(#heroGlow)" />
                <circle cx="100" cy="40" r="4" fill="#fff" filter="url(#heroGlow)" />
                <circle cx="100" cy="40" r="2" fill="#60a5fa" />
              </svg>
            </div>
         </motion.div>

         {/* Floating Card 1: Virtual Card */}
         <motion.div 
           animate={{ y: [0, -20, 0], rotateZ: [-5, -2, -5] }}
           transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
           className="absolute left-[5%] top-[10%] w-72 rounded-3xl border border-white/20 bg-gradient-to-br from-cyan-500/40 to-brand-600/40 backdrop-blur-xl shadow-2xl p-6 z-10 overflow-hidden group"
         >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
            <div className="flex justify-between items-center mb-10 relative z-10">
               <span className="font-display font-bold text-white text-lg tracking-widest">{t('heroCards.virtualCard')}</span>
               <svg className="w-8 h-8" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="12" fill="white" fillOpacity="0.5"/>
                  <circle cx="24" cy="12" r="12" fill="white" fillOpacity="0.5"/>
               </svg>
            </div>
            <div className="font-mono text-white/80 tracking-[0.2em] mb-4 relative z-10">**** **** **** 4281</div>
            <div className="flex justify-between text-white/60 text-xs font-medium relative z-10 uppercase tracking-wider">
               <span>John Doe</span>
               <span>12/28</span>
            </div>
         </motion.div>

         {/* Floating Card 2: Recent Transaction */}
         <motion.div 
           animate={{ y: [0, 25, 0], rotateZ: [3, 6, 3] }}
           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
           className="absolute right-[2%] bottom-[15%] w-80 rounded-3xl border border-white/10 bg-surface-dark/80 backdrop-blur-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] p-6 z-30"
         >
           <div className="text-sm font-semibold text-white mb-5 flex items-center justify-between">
              {t('heroCards.recentTransaction')}
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           </div>
           
           <div className="space-y-4">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-surface-dark flex items-center justify-center border border-white/5 shadow-inner">
                 <span className="text-xl">☕</span>
               </div>
               <div>
                 <div className="font-medium text-slate-200 text-sm">Starbucks</div>
                 <div className="text-xs text-slate-500">{t('heroCards.today')}, 14:45</div>
               </div>
               <div className="ml-auto font-bold text-white">-Rp 55.000</div>
             </div>
             
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center border border-brand-500/20 shadow-inner">
                 <span className="text-xl text-brand-400">💸</span>
               </div>
               <div>
                 <div className="font-medium text-slate-200 text-sm">{t('heroCards.incomingTransfer')}</div>
                 <div className="text-xs text-slate-500">{t('heroCards.yesterday')}, 09:00</div>
               </div>
               <div className="ml-auto font-bold text-green-400">+Rp 2.5M</div>
             </div>
           </div>
         </motion.div>

         {/* Floating Card 3: AI Insights */}
         <motion.div 
           animate={{ y: [-15, 10, -15], x: [-10, 10, -10] }}
           transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
           className="absolute left-[5%] bottom-[5%] w-64 rounded-3xl border border-accent-500/30 bg-surface-dark/90 backdrop-blur-xl shadow-[0_20px_40px_rgba(139,92,246,0.3)] p-5 z-20"
         >
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center shrink-0 border border-accent-500/30 shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                 <span className="text-accent-400 font-bold text-lg">✨</span>
               </div>
               <div>
                  <h4 className="text-white font-semibold text-sm mb-1">{t('heroCards.smartInsight')}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{t('heroCards.insightDesc')}</p>
               </div>
            </div>
         </motion.div>

      </motion.div>
    </section>
  );
}
