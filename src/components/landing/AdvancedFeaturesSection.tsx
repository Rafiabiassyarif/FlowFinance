import React from 'react';
import { motion } from 'motion/react';
import { Tag, SplitSquareHorizontal, History, Target, Users, ShieldAlert } from 'lucide-react';

export default function AdvancedFeaturesSection() {
  const features = [
    {
      icon: SplitSquareHorizontal,
      title: 'Split Transactions',
      desc: 'Divide single receipts across multiple categories perfectly.'
    },
    {
      icon: Tag,
      title: 'Custom Tags',
      desc: 'Create personalized tagging systems for your specific needs.'
    },
    {
      icon: History,
      title: 'Unlimited History',
      desc: 'Never lose a transaction. Search through years of data instantly.'
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      desc: 'Set savings goals and watch your progress update automatically.'
    },
    {
      icon: Users,
      title: 'Shared Wallets',
      desc: 'Collaborate with your partner or roommates on shared expenses.'
    },
    {
      icon: ShieldAlert,
      title: 'Smart Alerts',
      desc: 'Get notified of unusual spending patterns or upcoming bills.'
    }
  ];

  return (
    <section className="py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="mb-16 md:flex justify-between items-end gap-10">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white"
            >
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-brand-400">power users.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-xl"
            >
              Simple on the surface, incredibly deep underneath.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:block"
          >
            <div className="w-24 h-24 rounded-full bg-brand-500/10 blur-xl absolute -mt-12 -ml-12 pointer-events-none"></div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="p-8 rounded-3xl bg-surface-dark border border-white/5 hover:border-brand-500/30 hover:bg-surface-dark/80 transition-all duration-300 group hover:-translate-y-1 shadow-lg"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 text-slate-300 flex items-center justify-center mb-6 group-hover:bg-brand-500/20 group-hover:text-brand-400 transition-colors">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-3 group-hover:text-brand-300 transition-colors">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
