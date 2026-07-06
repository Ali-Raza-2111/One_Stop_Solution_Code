import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Star, 
  Calculator, 
  FileSpreadsheet, 
  FileText, 
  Award, 
  Crown, 
  Activity 
} from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onExplore: () => void;
  onBook: () => void;
}

const TRUST_LOGOS = [
  { name: 'QuickBooks Online', icon: Calculator, color: 'text-emerald-600 bg-emerald-500/5 border-emerald-500/10' },
  { name: 'Microsoft Excel', icon: FileSpreadsheet, color: 'text-green-600 bg-green-500/5 border-green-500/10' },
  { name: 'Microsoft Word', icon: FileText, color: 'text-blue-600 bg-blue-500/5 border-blue-500/10' },
  { name: 'Upwork Top Rated', icon: Crown, color: 'text-indigo-600 bg-indigo-500/5 border-indigo-500/10' },
  { name: 'Fiverr Pro Verified', icon: Award, color: 'text-purple-600 bg-purple-500/5 border-purple-500/10' },
  { name: 'SEC Auditing Standard', icon: ShieldCheck, color: 'text-slate-700 bg-slate-500/5 border-slate-500/10' },
];

export default function Hero({ onExplore, onBook }: HeroProps) {
  const highlights = [
    'QuickBooks Online ProAdvisors',
    'MOS Certified Excel Experts',
    'Certified Internal Auditors (CIA)',
    'Confidential NDAs & Secure Storage'
  ];

  const listContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  const listItem = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section id="hero" className="relative pt-32 pb-16 overflow-hidden bg-transparent">
      {/* Soft background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(203,213,225,0.3)_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-50/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Copy Bento Box - Frosted Glass Panel */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 glass-panel p-8 sm:p-12 rounded-3xl flex flex-col justify-between space-y-10"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Certified Remote Specialists</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Scale your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 block sm:inline">
                  operations
                </span>{' '}
                with quiet precision.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 font-sans leading-relaxed max-w-xl">
                Streamline bookkeeping, automate complex spreadsheets, and secure financial workflows with an expert remote crew dedicated to meticulous craft.
              </p>

              {/* Highlights checklists - structured like neat transparent badges */}
              <motion.div 
                variants={listContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4"
              >
                {highlights.map((text, idx) => (
                  <motion.div 
                    key={idx} 
                    variants={listItem}
                    whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
                    className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl border border-white/40 bg-white/40 hover:bg-white/60 text-slate-800 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600" />
                    <span className="text-xs font-semibold font-sans tracking-tight">{text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Buttons & Footer Row */}
            <div className="space-y-8 pt-8 border-t border-white/40">
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={onExplore}
                  className="px-7 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-600/10 transition-all flex items-center justify-center space-x-2 cursor-pointer duration-300"
                >
                  <span>Explore Catalog & Portfolio</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={onBook}
                  className="px-7 py-4 bg-white/50 hover:bg-white/70 text-slate-800 border border-white/50 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer duration-300 backdrop-blur-md shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Book Free Consultation</span>
                </motion.button>
              </div>

              {/* Trust/Rating Strip right under CTAs */}
              <div className="flex flex-col sm:flex-row sm:items-center p-4 bg-white/40 border border-white/50 rounded-2xl gap-4 backdrop-blur-md shadow-sm">
                <div className="flex items-center space-x-1.5 shrink-0">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-800 font-sans">4.9 / 5.0</span>
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 font-sans leading-normal">
                  Trusted by 140+ international clients on <span className="text-indigo-600 font-bold">Upwork Top Rated</span> & <span className="text-purple-600 font-bold">Fiverr Pro Verified</span> networks.
                </div>
              </div>
            </div>
          </motion.div>

          {/* Graphical/Illustrative Hero Panel Bento Box - Frosted Translucent Task simulation */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="hidden lg:flex lg:col-span-5 glass-panel text-slate-800 p-8 rounded-3xl flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-6 relative z-10 w-full">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/45">
                <div className="flex items-center space-x-2">
                  <Activity className="w-3.5 h-3.5 text-indigo-600 animate-pulse shrink-0" />
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500">Operational Harmony</span>
                </div>
                <span className="text-[9px] font-mono bg-indigo-50/70 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded font-bold">Verified Remote</span>
              </div>

              {/* Task list simulation - Elegant Glass Card style */}
              <div className="space-y-4 text-xs font-sans">
                <motion.div 
                  whileHover={{ scale: 1.015 }}
                  className="p-4 bg-white/45 rounded-2xl border border-white/50 hover:bg-white/65 transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-indigo-600 tracking-widest uppercase">TASK RECONCILED</span>
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-600"></span>
                    </span>
                  </div>
                  <p className="font-sans font-bold text-[13px] text-slate-800 mt-1">3-Year Financial Backlog Cleanup</p>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 font-mono">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded font-bold">99.8% Accuracy</span>
                      <span>•</span>
                      <span>QBO Certified</span>
                    </div>
                  </div>
                  {/* Sliding loading indicator */}
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-3">
                    <motion.div 
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                      className="w-full h-full bg-gradient-to-r from-transparent via-indigo-600 to-transparent"
                    />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.015 }}
                  className="p-4 bg-white/45 rounded-2xl border border-white/50 hover:bg-white/65 transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-emerald-600 tracking-widest uppercase">AUTOMATION ACTIVE</span>
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
                    </span>
                  </div>
                  <p className="font-sans font-bold text-[13px] text-slate-800 mt-1">VBA Inventory Automation System</p>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 font-mono">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded font-bold">Macros Online</span>
                      <span>•</span>
                      <span>MOS Excel Expert</span>
                    </div>
                  </div>
                  {/* Sliding loading indicator */}
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-3">
                    <motion.div 
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
                      className="w-full h-full bg-gradient-to-r from-transparent via-emerald-600 to-transparent"
                    />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.015 }}
                  className="p-4 bg-white/45 rounded-2xl border border-white/50 hover:bg-white/65 transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-indigo-500 tracking-widest uppercase">AUDIT VERIFIED</span>
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                    </span>
                  </div>
                  <p className="font-sans font-bold text-[13px] text-slate-800 mt-1">Compliance Audit Assessment</p>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 font-mono">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded font-bold">CIA Compliant</span>
                      <span>•</span>
                      <span>Audit Ready</span>
                    </div>
                  </div>
                  {/* Sliding loading indicator */}
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-3">
                    <motion.div 
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 3.2, ease: "linear" }}
                      className="w-full h-full bg-gradient-to-r from-transparent via-purple-600 to-transparent"
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Verified Trust Badge footer */}
            <div className="mt-8 pt-4 border-t border-white/45 flex items-center justify-center space-x-2 text-[10px] font-mono font-bold text-slate-500 relative z-10">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Confidential Client NDA Guarantee</span>
            </div>
          </motion.div>

        </div>

        {/* === Trust metrics bar — inspired by bookkeeper360 / lessaccounting === */}
        {/* A clean stats strip right under the hero, showing key conversion metrics */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/30 backdrop-blur-md rounded-2xl border border-white/40 overflow-hidden shadow-sm"
        >
          {[
            { value: '140+', label: 'Active Clients', sub: 'Across 18 countries' },
            { value: '380+', label: 'Projects Delivered', sub: 'On-time, 100%' },
            { value: '4.9★', label: 'Average Rating', sub: 'From 154 reviews' },
            { value: '15min', label: 'Response Time', sub: 'During business hours' },
          ].map((m, i) => (
            <div
              key={i}
              className="bg-white/45 backdrop-blur-md p-5 sm:p-6 text-center hover:bg-white/60 transition-colors duration-300"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight leading-none">
                {m.value}
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-indigo-600 font-sans uppercase tracking-wider mt-2">
                {m.label}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 font-mono mt-1 leading-tight">
                {m.sub}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Continuous Horizontally Scrolling Logo Marquee Strip */}
        <div className="mt-20 pt-10 border-t border-white/40 overflow-hidden relative">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-indigo-600 block mb-2">
              ECOSYSTEMS & MARKETPLACE CHANNELS
            </span>
            <p className="text-[11px] text-slate-500 font-sans font-semibold">
              Corporate configurations and secure escrow contracts handled via global leading platforms.
            </p>
          </div>

          <div className="w-full overflow-hidden relative mt-4">
            {/* Overlay gradients to fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50/50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50/50 to-transparent z-10 pointer-events-none" />

            <div className="flex w-max animate-marquee-right">
              {/* First half of items */}
              <div className="flex items-center gap-6 px-3 shrink-0">
                {TRUST_LOGOS.map((logo, idx) => (
                  <div 
                    key={`logo-1-${idx}`} 
                    className="flex items-center space-x-2.5 px-4 py-3 bg-white/45 border border-white/50 rounded-2xl shadow-sm hover:border-indigo-500/50 transition-all hover:-translate-y-0.5 shrink-0 duration-300 backdrop-blur-md"
                  >
                    <div className={`p-1.5 rounded-lg border ${logo.color}`}>
                      <logo.icon className="w-4 h-4 shrink-0" />
                    </div>
                    <span className="font-sans font-bold text-xs text-slate-800 tracking-tight">{logo.name}</span>
                  </div>
                ))}
              </div>
              {/* Second half for seamless loop */}
              <div className="flex items-center gap-6 px-3 shrink-0">
                {TRUST_LOGOS.map((logo, idx) => (
                  <div 
                    key={`logo-2-${idx}`} 
                    className="flex items-center space-x-2.5 px-4 py-3 bg-white/45 border border-white/50 rounded-2xl shadow-sm hover:border-indigo-500/50 transition-all hover:-translate-y-0.5 shrink-0 duration-300 backdrop-blur-md"
                  >
                    <div className={`p-1.5 rounded-lg border ${logo.color}`}>
                      <logo.icon className="w-4 h-4 shrink-0" />
                    </div>
                    <span className="font-sans font-bold text-xs text-slate-800 tracking-tight">{logo.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
