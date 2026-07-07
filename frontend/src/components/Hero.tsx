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
  Activity,
  MousePointer2,
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useEffect, useRef } from 'react';
import MagneticButton from './ui/MagneticButton';

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
    'Confidential NDAs & Secure Storage',
  ];

  // Parallax — mouse motion shifts floating shapes & main panel
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const springX = useSpring(mvX, { stiffness: 80, damping: 18 });
  const springY = useSpring(mvY, { stiffness: 80, damping: 18 });

  const shape1X = useTransform(springX, [-1, 1], [-18, 18]);
  const shape1Y = useTransform(springY, [-1, 1], [-12, 12]);
  const shape2X = useTransform(springX, [-1, 1], [22, -22]);
  const shape2Y = useTransform(springY, [-1, 1], [14, -14]);
  const panelX = useTransform(springX, [-1, 1], [-6, 6]);
  const panelY = useTransform(springY, [-1, 1], [-4, 4]);

  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mvX.set(x * 2);
      mvY.set(y * 2);
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, [mvX, mvY]);

  const listContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const listItem = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative pt-32 pb-16 overflow-hidden bg-transparent"
    >
      {/* Floating decorative shapes — parallax-driven */}
      <motion.div
        style={{ x: shape1X, y: shape1Y }}
        className="absolute top-32 left-[8%] w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/30 to-purple-500/20 blur-[2px] animate-float-y pointer-events-none"
        aria-hidden
      />
      <motion.div
        style={{ x: shape2X, y: shape2Y }}
        className="absolute top-48 right-[12%] w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/30 to-amber-400/20 animate-float-y pointer-events-none"
        aria-hidden
        // Stagger the float animation
      />
      <div
        className="absolute bottom-32 left-[20%] w-12 h-12 rotate-12 bg-gradient-to-br from-emerald-400/30 to-sky-400/20 rounded-lg animate-float-y pointer-events-none"
        style={{ animationDelay: '-3s' }}
        aria-hidden
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* === Main Copy Panel === */}
          <motion.div
            style={{ x: panelX, y: panelY }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 glass-panel p-8 sm:p-12 rounded-3xl flex flex-col justify-between space-y-10 relative overflow-hidden shimmer-border"
          >
            {/* Subtle moving sheen overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-30 bg-gradient-to-br from-white/40 via-transparent to-transparent" />

            <div className="space-y-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Certified Remote Specialists</span>
                <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold text-slate-900 tracking-tight leading-[1.05]">
                Scale your{' '}
                <span className="gradient-text block sm:inline">operations</span>{' '}
                with quiet precision.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 font-sans leading-relaxed max-w-xl">
                Streamline bookkeeping, automate complex spreadsheets, and secure financial workflows with an expert remote crew dedicated to meticulous craft.
              </p>

              {/* Highlights checklists */}
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
                    className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl border border-white/40 bg-white/40 hover:bg-white/70 hover:border-indigo-300/40 text-slate-800 transition-colors shadow-sm glow-hover"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600" />
                    <span className="text-xs font-semibold font-sans tracking-tight">
                      {text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Buttons & Footer Row */}
            <div className="space-y-8 pt-8 border-t border-white/40 relative z-10">
              <div className="flex flex-col sm:flex-row gap-4">
                <MagneticButton
                  onClick={onExplore}
                  className="px-7 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer duration-300 animate-pulse-glow"
                  aria-label="Explore Catalog and Portfolio"
                >
                  <span>Explore Catalog &amp; Portfolio</span>
                  <ArrowRight className="w-4 h-4" />
                </MagneticButton>

                <MagneticButton
                  onClick={onBook}
                  className="px-7 py-4 bg-white/60 hover:bg-white/85 text-slate-800 border border-white/60 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer duration-300 backdrop-blur-md shadow-sm"
                  aria-label="Book Free Consultation"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Book Free Consultation</span>
                </MagneticButton>
              </div>

              {/* Trust/Rating strip */}
              <div className="flex flex-col sm:flex-row sm:items-center p-4 bg-white/40 border border-white/50 rounded-2xl gap-4 backdrop-blur-md shadow-sm">
                <div className="flex items-center space-x-1.5 shrink-0">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{
                          delay: 0.6 + i * 0.08,
                          duration: 0.4,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </motion.span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-800 font-sans">
                    4.9 / 5.0
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 font-sans leading-normal">
                  Trusted by 140+ international clients on{' '}
                  <span className="text-indigo-600 font-bold">Upwork Top Rated</span>{' '}
                  &amp;{' '}
                  <span className="text-purple-600 font-bold">
                    Fiverr Pro Verified
                  </span>{' '}
                  networks.
                </div>
              </div>
            </div>
          </motion.div>

          {/* === Right panel — live operational status === */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="hidden lg:flex lg:col-span-5 glass-panel text-slate-800 p-8 rounded-3xl flex-col justify-between relative overflow-hidden shimmer-border"
          >
            <div className="space-y-6 relative z-10 w-full">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/45">
                <div className="flex items-center space-x-2">
                  <Activity className="w-3.5 h-3.5 text-indigo-600 animate-pulse shrink-0" />
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500">
                    Operational Harmony
                  </span>
                </div>
                <span className="text-[9px] font-mono bg-indigo-50/70 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded font-bold">
                  Verified Remote
                </span>
              </div>

              {/* Animated task cards */}
              <div className="space-y-4 text-xs font-sans">
                {[
                  {
                    label: 'TASK RECONCILED',
                    labelColor: 'text-indigo-600',
                    pingColor: 'bg-indigo-500',
                    dotColor: 'bg-indigo-600',
                    title: '3-Year Financial Backlog Cleanup',
                    badge: '99.8% Accuracy',
                    badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    sub: 'QBO Certified',
                    barColor: 'via-indigo-600',
                    duration: 3,
                  },
                  {
                    label: 'AUTOMATION ACTIVE',
                    labelColor: 'text-emerald-600',
                    pingColor: 'bg-emerald-500',
                    dotColor: 'bg-emerald-600',
                    title: 'VBA Inventory Automation System',
                    badge: 'Macros Online',
                    badgeCls: 'bg-green-50 text-green-700 border-green-100',
                    sub: 'MOS Excel Expert',
                    barColor: 'via-emerald-600',
                    duration: 3.5,
                  },
                  {
                    label: 'AUDIT VERIFIED',
                    labelColor: 'text-indigo-500',
                    pingColor: 'bg-indigo-400',
                    dotColor: 'bg-indigo-500',
                    title: 'Compliance Audit Assessment',
                    badge: 'CIA Compliant',
                    badgeCls: 'bg-purple-50 text-purple-700 border-purple-100',
                    sub: 'Audit Ready',
                    barColor: 'via-purple-600',
                    duration: 3.2,
                  },
                ].map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.15, duration: 0.6 }}
                    whileHover={{ scale: 1.015 }}
                    className="p-4 bg-white/45 rounded-2xl border border-white/50 hover:bg-white/70 hover:border-indigo-200/40 transition-all duration-300 shadow-sm glow-hover"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-mono font-bold ${t.labelColor} tracking-widest uppercase`}
                      >
                        {t.label}
                      </span>
                      <span className="flex h-1.5 w-1.5 relative">
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${t.pingColor} opacity-75`}
                        />
                        <span
                          className={`relative inline-flex rounded-full h-1.5 w-1.5 ${t.dotColor}`}
                        />
                      </span>
                    </div>
                    <p className="font-sans font-bold text-[13px] text-slate-800 mt-1">
                      {t.title}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 font-mono">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-1.5 py-0.5 border rounded font-bold ${t.badgeCls}`}
                        >
                          {t.badge}
                        </span>
                        <span>•</span>
                        <span>{t.sub}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-3">
                      <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{
                          repeat: Infinity,
                          duration: t.duration,
                          ease: 'linear',
                        }}
                        className={`w-full h-full bg-gradient-to-r from-transparent ${t.barColor} to-transparent`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Verified trust badge footer */}
            <div className="mt-8 pt-4 border-t border-white/45 flex items-center justify-center space-x-2 text-[10px] font-mono font-bold text-slate-500 relative z-10">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Confidential Client NDA Guarantee</span>
            </div>
          </motion.div>
        </div>

        {/* === Trust metrics strip === */}
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
            <motion.div
              key={i}
              whileHover={{ y: -3 }}
              className="bg-white/45 backdrop-blur-md p-5 sm:p-6 text-center hover:bg-white/70 transition-colors duration-300 glow-hover"
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
            </motion.div>
          ))}
        </motion.div>

        {/* === Logo marquee === */}
        <div className="mt-20 pt-10 border-t border-white/40 overflow-hidden relative">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-indigo-600 block mb-2">
              ECOSYSTEMS &amp; MARKETPLACE CHANNELS
            </span>
            <p className="text-[11px] text-slate-500 font-sans font-semibold">
              Corporate configurations and secure escrow contracts handled via global leading platforms.
            </p>
          </div>

          <div className="w-full overflow-hidden relative mt-4">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-japandi-bg/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-japandi-bg/80 to-transparent z-10 pointer-events-none" />

            <div className="flex w-max animate-marquee-right">
              {[0, 1].map((half) => (
                <div key={half} className="flex items-center gap-6 px-3 shrink-0">
                  {TRUST_LOGOS.map((logo, idx) => (
                    <div
                      key={`${half}-${idx}`}
                      className="flex items-center space-x-2.5 px-4 py-3 bg-white/50 border border-white/60 rounded-2xl shadow-sm hover:border-indigo-500/50 transition-all hover:-translate-y-0.5 shrink-0 duration-300 backdrop-blur-md glow-hover"
                    >
                      <div className={`p-1.5 rounded-lg border ${logo.color}`}>
                        <logo.icon className="w-4 h-4 shrink-0" />
                      </div>
                      <span className="font-sans font-bold text-xs text-slate-800 tracking-tight">
                        {logo.name}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="flex flex-col items-center justify-center mt-16 gap-2 text-slate-400"
        >
          <MousePointer2 className="w-3.5 h-3.5 rotate-90" />
          <span className="text-[9px] font-mono uppercase tracking-widest">
            Scroll to explore
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="w-px h-8 bg-gradient-to-b from-slate-400 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
