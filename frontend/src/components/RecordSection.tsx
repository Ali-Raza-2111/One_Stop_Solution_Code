import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { Users, ClipboardList, Globe2, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { useAnimatedNumber } from './admin/useAnimatedNumber';
import CircularProgressRing from './ui/CircularProgressRing';
import SectionHeading from './ui/SectionHeading';

interface RecordSectionProps {
  initialClients?: number;
  initialOrders?: number;
  initialCountries?: number;
}

interface StatCardProps {
  icon: ComponentType<{ className?: string }>;
  target: number;
  max: number;
  label: string;
  sub: string;
  suffix?: string;
  displayValue: string;
  ringColor: string;
}

function StatCard({
  icon: Icon,
  target,
  max,
  label,
  sub,
  suffix = '+',
  displayValue,
  ringColor,
}: StatCardProps) {
  // Ring value = fraction of max
  const ringValue = max > 0 ? Math.min(1, target / max) : 0;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="glass-card p-4 sm:p-6 text-center hover:border-indigo-500/40 transition-all duration-500 hover:shadow-xl flex flex-col items-center justify-between glow-hover"
    >
      <div className="relative">
        <CircularProgressRing
          value={ringValue}
          size={108}
          strokeWidth={5}
          color={ringColor}
        >
          <div className="flex flex-col items-center justify-center">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-white/60 rounded-xl flex items-center justify-center text-indigo-600 mb-1 shadow-sm">
              <Icon className="w-4 h-4" />
            </div>
          </div>
        </CircularProgressRing>
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl lg:text-4xl font-sans font-extrabold text-slate-900 leading-none tracking-tight">
          <span className="gradient-text">{displayValue}</span>
          <span className="text-slate-900">{suffix}</span>
        </div>
        <h3 className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 leading-none mt-2">
          {label}
        </h3>
        <p className="hidden sm:block text-[10px] text-slate-500 font-sans mt-1.5 leading-snug">
          {sub}
        </p>
      </div>
    </motion.div>
  );
}

export default function RecordSection({
  initialClients = 140,
  initialOrders = 380,
  initialCountries = 18,
}: RecordSectionProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Use AnimatedNumber hook for smooth tween (same as admin AnalyticsTab)
  const clientsDisplay = useAnimatedNumber(hasAnimated ? initialClients : 0, 1600);
  const ordersDisplay = useAnimatedNumber(hasAnimated ? initialOrders : 0, 1800);
  const countriesDisplay = useAnimatedNumber(
    hasAnimated ? initialCountries : 0,
    1400,
  );

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasAnimated]);

  const fmt = (n: number) => Math.round(n).toLocaleString();

  return (
    <motion.section
      ref={sectionRef}
      id="records"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="py-24 bg-transparent border-b border-white/20 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <SectionHeading
          eyebrow="Our Proven Record"
          title={
            <>
              Reliable Remote Performance{' '}
              <span className="gradient-text">Scales</span>
            </>
          }
          subtitle="We hold ourselves to transparent, meticulous standards. Over years of focused practice, we have supported international startups, founders, and private clinics with clean operations."
        />

        {/* Counter Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <StatCard
            icon={Users}
            target={initialClients}
            max={200}
            label="Clients"
            sub="Active long-term service relationships"
            displayValue={fmt(clientsDisplay)}
            ringColor="url(#ringGradient)"
          />
          <StatCard
            icon={ClipboardList}
            target={initialOrders}
            max={500}
            label="Contracts"
            sub="Individual assignments closed"
            displayValue={fmt(ordersDisplay)}
            ringColor="url(#ringGradient)"
          />
          <StatCard
            icon={Globe2}
            target={initialCountries}
            max={30}
            label="Countries"
            sub="Serving US, UK, Australia, Europe & UAE"
            displayValue={fmt(countriesDisplay)}
            ringColor="url(#ringGradient)"
          />
          <StatCard
            icon={Award}
            target={100}
            max={100}
            label="Success"
            sub="Maintained across major platforms"
            suffix="%"
            displayValue={fmt(clientsDisplay === 0 ? 0 : 100)}
            ringColor="url(#ringGradient)"
          />
        </div>
      </div>
    </motion.section>
  );
}
