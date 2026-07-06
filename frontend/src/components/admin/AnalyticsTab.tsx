import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Globe2,
  BarChart3,
  Star,
  Award,
  Plus,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Users,
  ClipboardList,
  Activity,
  Crown,
  Sparkles,
  Zap,
  LayoutGrid,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Activity as ActivityIcon,
  Mail,
  MessageSquare,
  Layers,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';
import { Service, Rating } from '../../types';
import { useAnimatedNumber, useAnimatedNumberFormatted } from './useAnimatedNumber';

/* ------------------------------------------------------------------ */
/* Types & shared helpers                                             */
/* ------------------------------------------------------------------ */

interface CountryVisit {
  name: string;
  code: string;
  visits: number;
}

interface ConversionStats {
  email: number;
  whatsapp: number;
  alternative: number;
}

interface StarsHistogram {
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

interface AnalyticsTabProps {
  stats: { clients: number; orders: number; countries: number };
  onUpdateStats: (s: { clients: number; orders: number; countries: number }) => void;
  services: Service[];
  ratings: Rating[];
}

/* Country flag emoji map */
const FLAG_MAP: { [key: string]: string } = {
  'united states': '🇺🇸',
  us: '🇺🇸',
  'united kingdom': '🇬🇧',
  uk: '🇬🇧',
  canada: '🇨🇦',
  ca: '🇨🇦',
  pakistan: '🇵🇰',
  pk: '🇵🇰',
  germany: '🇩🇪',
  de: '🇩🇪',
  australia: '🇦🇺',
  au: '🇦🇺',
  'united arab emirates': '🇦🇪',
  uae: '🇦🇪',
  dubai: '🇦🇪',
  'saudi arabia': '🇸🇦',
  sa: '🇸🇦',
  france: '🇫🇷',
  fr: '🇫🇷',
  india: '🇮🇳',
  in: '🇮🇳',
};

const getFlag = (name: string): string => FLAG_MAP[name.trim().toLowerCase()] || '🌐';

const COLORS = {
  email: '#3B82F6',
  whatsapp: '#22C55E',
  alternative: '#94A3B8',
};

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(15, 23, 42, 0.96)',
  border: '1px solid rgba(99, 102, 241, 0.35)',
  borderRadius: '14px',
  fontSize: '12px',
  color: '#fff',
  padding: '10px 14px',
  boxShadow: '0 12px 40px -10px rgba(99, 102, 241, 0.55), 0 0 0 1px rgba(255,255,255,0.04) inset',
  backdropFilter: 'blur(12px)',
};
const TOOLTIP_ITEM_STYLE = { color: '#fff' };
const TOOLTIP_LABEL_STYLE = { color: '#A5B4FC', fontWeight: 700, marginBottom: '4px' };

/* Truncate long service names for compact axes/legends.
   "Bookkeeping & Accounting" -> "Bookkeeping & Acct." (17 chars) */
const truncateName = (name: string, maxLen = 17): string => {
  if (!name) return '';
  if (name.length <= maxLen) return name;
  // Try to break on a space for nicer truncation
  const truncated = name.slice(0, maxLen - 1).trimEnd();
  return `${truncated}…`;
};

/* Color palette reused across service charts */
const SVC_COLOR_PALETTE = ['#F59E0B', '#6366F1', '#06B6D4', '#22C55E', '#EC4899', '#14B8A6'];
const svcColorAt = (i: number) => SVC_COLOR_PALETTE[i % SVC_COLOR_PALETTE.length];

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

/* ------------------------------------------------------------------ */
/* Chart Type Switcher                                               */
/* ------------------------------------------------------------------ */
type ChartTypeSwitcherProps<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; icon: typeof BarChart3 }[];
};

function ChartTypeSwitcher<T extends string>({ value, onChange, options }: ChartTypeSwitcherProps<T>) {
  return (
    <div className="inline-flex items-center gap-0.5 bg-slate-950/70 border border-white/10 rounded-xl p-1 backdrop-blur-md shadow-inner">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isActive
                ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
            title={opt.label}
          >
            <Icon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
            <span className="hidden md:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Counter card                                                       */
/* ------------------------------------------------------------------ */
type CounterCardProps = {
  item: {
    id: 'clients' | 'orders' | 'countries';
    label: string;
    value: number;
    color: string;
    icon: typeof Users;
  };
  index: number;
  stats: { clients: number; orders: number; countries: number };
  onUpdateStats: (s: { clients: number; orders: number; countries: number }) => void;
};

const CounterCard: React.FC<CounterCardProps> = ({
  item,
  index,
  stats,
  onUpdateStats,
}) => {
  const Icon = item.icon;
  const animValue = useAnimatedNumberFormatted(item.value, 0);
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl overflow-hidden group hover:border-white/20 transition-all"
    >
      <div
        className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${item.color} opacity-10 blur-3xl rounded-full group-hover:opacity-25 group-hover:scale-125 transition-all duration-700`}
      />
      <div className="flex items-center justify-between mb-3 relative">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Live
        </span>
      </div>
      <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider relative">{item.label}</p>
      <div className="flex items-baseline justify-between mt-3 relative">
        <span className="text-4xl font-black text-white font-mono tracking-tight">{animValue}+</span>
        <div className="flex space-x-1.5 bg-slate-950/80 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => onUpdateStats({ ...stats, [item.id]: Math.max(0, item.value - 1) })}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Decrement"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdateStats({ ...stats, [item.id]: item.value + 1 })}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Increment"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center space-x-2 relative">
        <span className="text-[10px] text-slate-500 font-mono">Manual:</span>
        <input
          type="number"
          value={item.value}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0;
            onUpdateStats({ ...stats, [item.id]: val });
          }}
          className="w-16 bg-slate-950/80 border border-white/10 rounded-lg py-1 px-2 text-[10px] font-mono text-indigo-300 focus:outline-none focus:border-indigo-500 text-center"
        />
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function AnalyticsTab({
  stats,
  onUpdateStats,
  services,
  ratings,
}: AnalyticsTabProps) {
  /* ---------------- Country-wise visitor tracking ---------------- */
  const [countrySearch, setCountrySearch] = useState('');
  const [countryList, setCountryList] = useState<CountryVisit[]>([
    { name: 'United States', code: 'US', visits: 450 },
    { name: 'United Kingdom', code: 'GB', visits: 280 },
    { name: 'Canada', code: 'CA', visits: 190 },
    { name: 'Pakistan', code: 'PK', visits: 150 },
    { name: 'Germany', code: 'DE', visits: 95 },
    { name: 'United Arab Emirates', code: 'AE', visits: 80 },
    { name: 'Australia', code: 'AU', visits: 72 },
  ]);
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryVisits, setNewCountryVisits] = useState('10');
  const [countryChartType, setCountryChartType] = useState<
    'horizontal' | 'vertical' | 'composed' | 'pie'
  >('horizontal');

  const totalVisits = useMemo(
    () => countryList.reduce((acc, c) => acc + c.visits, 0),
    [countryList],
  );

  const filteredCountries = useMemo(() => {
    return [...countryList]
      .filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
      .sort((a, b) => b.visits - a.visits);
  }, [countryList, countrySearch]);

  const countryChartData = useMemo(() => {
    return [...countryList]
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 8)
      .map((c) => ({ name: c.name, visits: c.visits, flag: getFlag(c.name) }));
  }, [countryList]);

  const handleAddCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryName.trim()) return;
    const countVal = parseInt(newCountryVisits) || 0;
    const existingIndex = countryList.findIndex(
      (c) => c.name.toLowerCase() === newCountryName.toLowerCase(),
    );
    if (existingIndex !== -1) {
      const copy = [...countryList];
      copy[existingIndex].visits += countVal;
      setCountryList(copy);
    } else {
      setCountryList([
        ...countryList,
        {
          name: newCountryName,
          code: newCountryName.slice(0, 2).toUpperCase(),
          visits: countVal,
        },
      ]);
    }
    setNewCountryName('');
    setNewCountryVisits('10');
  };

  /* -------------------- Conversion stats (pie) -------------------- */
  const [conversionStats, setConversionStats] = useState<ConversionStats>({
    email: 42,
    whatsapp: 38,
    alternative: 20,
  });
  const [contactChartType, setContactChartType] = useState<
    'donut' | 'bar' | 'radial' | 'line'
  >('donut');

  const pieData = useMemo(
    () => [
      { name: 'Email', value: conversionStats.email, color: COLORS.email },
      { name: 'WhatsApp', value: conversionStats.whatsapp, color: COLORS.whatsapp },
      { name: 'Other Platforms', value: conversionStats.alternative, color: COLORS.alternative },
    ],
    [conversionStats],
  );

  const totalContacts = useMemo(
    () => conversionStats.email + conversionStats.whatsapp + conversionStats.alternative,
    [conversionStats],
  );

  /* ----------------- Stars histogram (distribution) ---------------- */
  const [starsHistogram, setStarsHistogram] = useState<StarsHistogram>({
    fiveStar: 120,
    fourStar: 24,
    threeStar: 7,
    twoStar: 2,
    oneStar: 1,
  });
  const [ratingDistChartType, setRatingDistChartType] = useState<
    'gauge' | 'bar' | 'pie' | 'area'
  >('gauge');

  const totalStars =
    starsHistogram.fiveStar * 5 +
    starsHistogram.fourStar * 4 +
    starsHistogram.threeStar * 3 +
    starsHistogram.twoStar * 2 +
    starsHistogram.oneStar * 1;
  const totalReviewsCount =
    starsHistogram.fiveStar +
    starsHistogram.fourStar +
    starsHistogram.threeStar +
    starsHistogram.twoStar +
    starsHistogram.oneStar;
  const computedAverageScore =
    totalReviewsCount > 0 ? (totalStars / totalReviewsCount) : 0;

  const ratingDistributionData = useMemo(
    () => [
      { stars: '5 ★', count: starsHistogram.fiveStar, fill: '#F59E0B', glow: '#FCD34D' },
      { stars: '4 ★', count: starsHistogram.fourStar, fill: '#FBBF24', glow: '#FDE68A' },
      { stars: '3 ★', count: starsHistogram.threeStar, fill: '#FCD34D', glow: '#FEF3C7' },
      { stars: '2 ★', count: starsHistogram.twoStar, fill: '#FB923C', glow: '#FED7AA' },
      { stars: '1 ★', count: starsHistogram.oneStar, fill: '#F87171', glow: '#FECACA' },
    ],
    [starsHistogram],
  );

  /* --------------- Service-wise ratings bar chart --------------- */
  const serviceRatingsData = useMemo(() => {
    const approved = ratings.filter((r) => r.isApproved !== false);
    const grouped: { [key: string]: { sum: number; count: number } } = {};
    approved.forEach((r) => {
      const serviceName =
        services.find((s) => s.id === r.serviceId)?.name || 'General';
      if (!grouped[serviceName]) grouped[serviceName] = { sum: 0, count: 0 };
      grouped[serviceName].sum += r.ratingStars ?? 5;
      grouped[serviceName].count += 1;
    });
    return Object.entries(grouped)
      .map(([name, v]) => ({
        name,
        avg: v.count > 0 ? Number((v.sum / v.count).toFixed(2)) : 0,
        count: v.count,
        fill: '#6366F1',
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [ratings, services]);
  const [serviceChartType, setServiceChartType] = useState<
    'radial' | 'bar' | 'line' | 'composed'
  >('radial');

  /* -------------------- Core counters summary -------------------- */
  const counterCards = [
    { id: 'clients' as const, label: 'Satisfied Global Clients', value: stats.clients, color: 'from-indigo-500 to-indigo-600', icon: Users },
    { id: 'orders' as const, label: 'Completed Deliverables', value: stats.orders, color: 'from-sky-500 to-sky-600', icon: ClipboardList },
    { id: 'countries' as const, label: 'Nations Represented', value: stats.countries, color: 'from-emerald-500 to-emerald-600', icon: Globe2 },
  ];

  const animTotalVisits = useAnimatedNumberFormatted(totalVisits, 0);
  const animTotalContacts = useAnimatedNumberFormatted(totalContacts, 0);
  const animAverageScore = useAnimatedNumberFormatted(computedAverageScore, 2);
  const animTotalReviews = useAnimatedNumberFormatted(totalReviewsCount, 0);
  const averageScoreForGauge = useAnimatedNumber(computedAverageScore, 900);

  return (
    <div className="space-y-8">
      {/* ============== 1. Core Counters Summary ============== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {counterCards.map((item, i) => (
          <CounterCard
            key={`counter-${i}`}
            item={item}
            index={i}
            stats={stats}
            onUpdateStats={onUpdateStats}
          />
        ))}
      </div>

      {/* ============== 2. Country-wise Visitor Tracking ============== */}
      <motion.div
        custom={3}
        variants={cardVariants}
        initial="hidden"
        animate="show"
        className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
          <div>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-indigo-400" />
              Country-Wise Client Visitor Tracking
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Geographic distribution of website visitors — switch between 4 visualization styles.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ChartTypeSwitcher
              value={countryChartType}
              onChange={setCountryChartType}
              options={[
                { id: 'horizontal', label: 'H-Bar', icon: BarChart3 },
                { id: 'vertical', label: 'V-Bar', icon: TrendingUp },
                { id: 'composed', label: 'Composed', icon: LayoutGrid },
                { id: 'pie', label: 'Donut', icon: PieIcon },
              ]}
            />
            <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-md border border-indigo-500/10">
              Total: <span className="font-black text-white">{animTotalVisits}</span> visits
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Chart panel */}
          <div className="lg:col-span-3 bg-slate-950/40 border border-white/5 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                Top Countries by Visits
              </span>
              <span className="text-[9px] font-mono text-slate-600 uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Top 3 highlighted
              </span>
            </div>

            {/* HORIZONTAL BAR */}
            {countryChartType === 'horizontal' && (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={countryChartData} layout="vertical" margin={{ top: 5, right: 45, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barGradientV2" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.85} />
                      <stop offset="60%" stopColor="#3B82F6" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="barGradientGold" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.85} />
                      <stop offset="60%" stopColor="#FBBF24" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#FCD34D" stopOpacity={1} />
                    </linearGradient>
                    <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#E2E8F0', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} width={110} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} formatter={(v: number) => [`${v} visits`, 'Visitors']} />
                  <Bar dataKey="visits" radius={[0, 10, 10, 0]} maxBarSize={26} isAnimationActive animationDuration={900} shape={(props: any) => {
                    const { x, y, width, height, index, payload } = props;
                    const isTop3 = index < 3;
                    const fill = isTop3 ? 'url(#barGradientGold)' : 'url(#barGradientV2)';
                    return (
                      <g>
                        <rect x={x} y={y - 2} width={width} height={height + 4} rx={10} fill={fill} opacity={0.25} filter="url(#barGlow)" />
                        <rect x={x} y={y} width={width} height={height} rx={10} fill={fill} />
                        {isTop3 && width > 10 && (
                          <g transform={`translate(${x + width + 6}, ${y + height / 2 - 8})`}>
                            <circle r={9} fill="rgba(245, 158, 11, 0.2)" />
                            <foreignObject width={18} height={18} x={-9} y={-9}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18 }}>
                                <Crown className={index === 0 ? 'w-3.5 h-3.5 text-amber-300' : 'w-3 h-3 text-amber-500'} fill={index === 0 ? '#FCD34D' : 'none'} />
                              </div>
                            </foreignObject>
                          </g>
                        )}
                        <text x={x + width + (isTop3 ? 24 : 6)} y={y + height / 2} dy={4} fill={isTop3 ? '#FCD34D' : '#A5B4FC'} fontSize={11} fontWeight={700} fontFamily="JetBrains Mono, monospace">
                          {payload.visits}
                        </text>
                      </g>
                    );
                  }} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* VERTICAL BAR */}
            {countryChartType === 'vertical' && (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={countryChartData} margin={{ top: 30, right: 10, left: 0, bottom: 50 }}>
                  <defs>
                    <linearGradient id="vbarIndigo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity={1} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="vbarGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FCD34D" stopOpacity={1} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.6} />
                    </linearGradient>
                    <filter id="vbarGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#E2E8F0', fontSize: 9 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} angle={-25} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} formatter={(v: number) => [`${v} visits`, 'Visitors']} />
                  <Bar dataKey="visits" radius={[10, 10, 0, 0]} maxBarSize={48} isAnimationActive animationDuration={900} shape={(props: any) => {
                    const { x, y, width, height, index } = props;
                    const isTop3 = index < 3;
                    const fill = isTop3 ? 'url(#vbarGold)' : 'url(#vbarIndigo)';
                    return (
                      <g>
                        <rect x={x} y={y - 2} width={width} height={height + 4} rx={10} fill={fill} opacity={0.25} filter="url(#vbarGlow)" />
                        <rect x={x} y={y} width={width} height={height} rx={10} fill={fill} />
                      </g>
                    );
                  }}>
                    <LabelList dataKey="visits" position="top" fill="#A5B4FC" fontSize={10} fontWeight={700} fontFamily="JetBrains Mono, monospace" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* COMPOSED CHART — bars + line trend */}
            {countryChartType === 'composed' && (
              <ResponsiveContainer width="100%" height={340}>
                <ComposedChart data={countryChartData} margin={{ top: 30, right: 20, left: 0, bottom: 50 }}>
                  <defs>
                    <linearGradient id="compBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="compLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#FCD34D" />
                    </linearGradient>
                    <filter id="compGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#E2E8F0', fontSize: 9 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} angle={-25} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} formatter={(v: number) => [`${v} visits`, 'Visitors']} />
                  <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#94A3B8', paddingTop: 8 }} />
                  <Bar name="Visits" dataKey="visits" radius={[10, 10, 0, 0]} maxBarSize={48} fill="url(#compBarGrad)" isAnimationActive animationDuration={900} filter="url(#compGlow)" />
                  <Line name="Trend" type="monotone" dataKey="visits" stroke="url(#compLineGrad)" strokeWidth={3} dot={{ fill: '#FCD34D', r: 5, strokeWidth: 0 }} activeDot={{ r: 7, fill: '#fff', stroke: '#F59E0B', strokeWidth: 2 }} isAnimationActive animationDuration={1100} />
                </ComposedChart>
              </ResponsiveContainer>
            )}

            {/* DONUT PIE */}
            {countryChartType === 'pie' && (
              <div className="relative">
                <ResponsiveContainer width="100%" height={340}>
                  <PieChart>
                    <defs>
                      <filter id="countrySliceGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <Pie
                      data={countryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="visits"
                      isAnimationActive
                      animationDuration={900}
                      stroke="rgba(15, 23, 42, 0.9)"
                      strokeWidth={2}
                      filter="url(#countrySliceGlow)"
                    >
                      {countryChartData.map((_, idx) => (
                        <Cell key={`country-cell-${idx}`} fill={['#F59E0B', '#6366F1', '#06B6D4', '#22C55E', '#8B5CF6', '#EC4899', '#F472B6', '#3B82F6'][idx % 8]} />
                      ))}
                      <LabelList dataKey="name" position="outside" fill="#E2E8F0" fontSize={9} fontFamily="JetBrains Mono, monospace" formatter={(v: string) => (v || '').slice(0, 12)} />
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} formatter={(v: number) => [`${v} visits`, 'Visitors']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Total</div>
                  <div className="text-3xl font-black text-white font-mono leading-tight">{animTotalVisits}</div>
                  <div className="text-[9px] font-mono text-indigo-400 uppercase tracking-wider mt-0.5">Visits</div>
                </div>
              </div>
            )}
          </div>

          {/* Country list + add form */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="mb-3">
              <input type="text" placeholder="Search countries..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-sans text-white focus:outline-none focus:border-indigo-500/60 placeholder-slate-600 transition-colors" />
            </div>
            <div className="admin-scroll max-h-[260px] overflow-y-auto space-y-1.5 pr-1.5">
              {filteredCountries.map((country, idx) => {
                const realIdx = countryList.findIndex((c) => c.name === country.name);
                const pct = totalVisits > 0 ? (country.visits / totalVisits) * 100 : 0;
                const isTop = idx < 3;
                return (
                  <motion.div key={country.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04, duration: 0.3 }} className={`p-2.5 bg-slate-950/45 hover:bg-slate-950 border rounded-xl transition-all ${isTop ? 'border-amber-500/20' : 'border-white/5'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        {isTop && <Crown className={`w-3 h-3 ${idx === 0 ? 'text-amber-300' : 'text-amber-500'}`} fill={idx === 0 ? '#FCD34D' : 'none'} />}
                        <span className="text-base">{getFlag(country.name)}</span>
                        <span className="text-white font-sans font-bold text-xs">{country.name}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{country.code}</span>
                      </div>
                      <span className="text-indigo-400 font-bold text-xs font-mono">{country.visits}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-2 relative">
                      <div className={`h-full rounded-full transition-all duration-500 ${isTop ? 'bg-gradient-to-r from-amber-400 to-amber-300' : 'bg-gradient-to-r from-indigo-500 to-blue-500'}`} style={{ width: `${pct}%` }} />
                      {isTop && <div className="absolute top-0 h-1.5 bg-amber-400/40 blur-sm rounded-full" style={{ width: `${pct}%` }} />}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-500 font-mono">{pct.toFixed(1)}% share</span>
                      <div className="flex items-center space-x-1">
                        <button onClick={() => { const copy = [...countryList]; copy[realIdx].visits = Math.max(0, copy[realIdx].visits - 10); setCountryList(copy); }} className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors text-[9px] font-mono" title="-10 visits">-10</button>
                        <button onClick={() => { const copy = [...countryList]; copy[realIdx].visits += 10; setCountryList(copy); }} className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors text-[9px] font-mono" title="+10 visits">+10</button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <form onSubmit={handleAddCountry} className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input type="text" required placeholder="e.g. France" value={newCountryName} onChange={(e) => setNewCountryName(e.target.value)} className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-sans text-white focus:outline-none focus:border-indigo-500/60 placeholder-slate-600 transition-colors" />
              </div>
              <div className="flex space-x-1.5">
                <input type="number" required value={newCountryVisits} onChange={(e) => setNewCountryVisits(e.target.value)} className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-2 py-2 text-xs text-center font-mono text-indigo-400 focus:outline-none focus:border-indigo-500/60" />
                <button type="submit" className="px-3 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center shadow-lg shadow-indigo-500/20" title="Add country">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>

      {/* ============== 3. Contact Method ============== */}
      <motion.div
        custom={4}
        variants={cardVariants}
        initial="hidden"
        animate="show"
        className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
          <div>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Client Contact Method Distribution
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              How clients prefer to reach out — switch between 4 visualization styles.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ChartTypeSwitcher
              value={contactChartType}
              onChange={setContactChartType}
              options={[
                { id: 'donut', label: 'Donut', icon: PieIcon },
                { id: 'bar', label: 'Bars', icon: BarChart3 },
                { id: 'radial', label: 'Radial', icon: ActivityIcon },
                { id: 'line', label: 'Line', icon: LineIcon },
              ]}
            />
            <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-md border border-indigo-500/10">
              Total Contacts: <span className="font-black text-white">{animTotalContacts}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Switchable Chart */}
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/15 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

            {/* DONUT */}
            {contactChartType === 'donut' && (
              <div className="relative">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <defs>
                      <filter id="sliceGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={115}
                      paddingAngle={4}
                      dataKey="value"
                      isAnimationActive
                      animationDuration={900}
                      stroke="rgba(15, 23, 42, 0.8)"
                      strokeWidth={3}
                      filter="url(#sliceGlow)"
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} formatter={(v: number, name: string) => [`${v} leads`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Total</div>
                  <div className="text-4xl font-black text-white font-mono leading-tight">{animTotalContacts}</div>
                  <div className="text-[9px] font-mono text-indigo-400 uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> Leads
                  </div>
                </div>
              </div>
            )}

            {/* BAR */}
            {contactChartType === 'bar' && (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={pieData} margin={{ top: 30, right: 20, left: 0, bottom: 10 }}>
                  <defs>
                    {pieData.map((d, i) => (
                      <linearGradient key={i} id={`barGradContact${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={d.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={d.color} stopOpacity={0.4} />
                      </linearGradient>
                    ))}
                    <filter id="contactBarGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#E2E8F0', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} formatter={(v: number, name: string) => [`${v} leads`, name]} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={64} isAnimationActive animationDuration={900} shape={(props: any) => {
                    const { x, y, width, height, index } = props;
                    return (
                      <g>
                        <rect x={x} y={y - 2} width={width} height={height + 4} rx={10} fill={`url(#barGradContact${index})`} opacity={0.25} filter="url(#contactBarGlow)" />
                        <rect x={x} y={y} width={width} height={height} rx={10} fill={`url(#barGradContact${index})`} />
                      </g>
                    );
                  }}>
                    <LabelList dataKey="value" position="top" fill="#A5B4FC" fontSize={12} fontWeight={700} fontFamily="JetBrains Mono, monospace" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* RADIAL */}
            {contactChartType === 'radial' && (
              <ResponsiveContainer width="100%" height={320}>
                <RadialBarChart
                  innerRadius="25%"
                  outerRadius="100%"
                  data={pieData.map((p) => ({ ...p, fill: p.color }))}
                  startAngle={90}
                  endAngle={-270}
                >
                  <defs>
                    <filter id="contactRadialGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <PolarAngleAxis type="number" domain={[0, Math.max(...pieData.map((p) => p.value), 1)]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: 'rgba(255,255,255,0.04)' }} dataKey="value" cornerRadius={12} filter="url(#contactRadialGlow)" isAnimationActive animationDuration={1000} />
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#94A3B8', paddingLeft: 8 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} formatter={(v: number, name: string) => [`${v} leads`, name]} />
                </RadialBarChart>
              </ResponsiveContainer>
            )}

            {/* LINE CHART — replaced Treemap */}
            {contactChartType === 'line' && (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={pieData} margin={{ top: 30, right: 30, left: 0, bottom: 10 }}>
                  <defs>
                    {pieData.map((d, i) => (
                      <linearGradient key={i} id={`contactLineGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={d.color} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={d.color} stopOpacity={1} />
                      </linearGradient>
                    ))}
                    <filter id="contactLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#E2E8F0', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} cursor={{ stroke: 'rgba(99, 102, 241, 0.3)', strokeWidth: 1 }} formatter={(v: number, name: string) => [`${v} leads`, name]} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Leads"
                    stroke={pieData[0].color}
                    strokeWidth={3}
                    isAnimationActive
                    animationDuration={1000}
                    filter="url(#contactLineGlow)"
                    dot={(props: any) => {
                      const { cx, cy, payload, index } = props;
                      return (
                        <g key={`dot-${index}`}>
                          <circle cx={cx} cy={cy} r={8} fill={payload.color} fillOpacity={0.25} />
                          <circle cx={cx} cy={cy} r={5} fill={payload.color} stroke="#fff" strokeWidth={2} />
                          <text x={cx} y={cy - 14} fill="#fff" fontSize={11} fontWeight={700} fontFamily="JetBrains Mono, monospace" textAnchor="middle">
                            {payload.value}
                          </text>
                        </g>
                      );
                    }}
                    activeDot={{ r: 8, fill: '#fff', stroke: '#6366F1', strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Adjustable controls */}
          <div className="space-y-4">
            {[
              { key: 'email' as const, label: 'Email', desc: 'Direct email inquiries', icon: Mail, color: COLORS.email, bgClass: 'bg-blue-500', textClass: 'text-blue-400', glowClass: 'shadow-blue-500/40' },
              { key: 'whatsapp' as const, label: 'WhatsApp', desc: 'Business WhatsApp messages', icon: MessageSquare, color: COLORS.whatsapp, bgClass: 'bg-green-500', textClass: 'text-green-400', glowClass: 'shadow-green-500/40' },
              { key: 'alternative' as const, label: 'Other Platforms', desc: 'Fiverr, Upwork, LinkedIn', icon: Layers, color: COLORS.alternative, bgClass: 'bg-slate-400', textClass: 'text-slate-400', glowClass: 'shadow-slate-500/30' },
            ].map((item, i) => {
              const val = conversionStats[item.key];
              const pct = totalContacts > 0 ? (val / totalContacts) * 100 : 0;
              const Icon = item.icon;
              return (
                <motion.div key={item.key} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }} className="bg-slate-950/45 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${item.bgClass} shadow-md ${item.glowClass}`} />
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3 h-3 ${item.textClass}`} />
                        <div>
                          <span className="text-xs font-sans font-bold text-white block">{item.label}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{item.desc}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black font-mono ${item.textClass} block`}>{val}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{pct.toFixed(0)}% share</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="range" min="0" max="200" value={val} onChange={(e) => { const n = parseInt(e.target.value) || 0; setConversionStats((prev) => ({ ...prev, [item.key]: n })); }} className="w-full accent-indigo-500 cursor-ew-resize bg-slate-950 h-1 rounded" style={{ accentColor: item.color }} />
                    <input type="number" value={val} onChange={(e) => { const n = parseInt(e.target.value) || 0; setConversionStats((prev) => ({ ...prev, [item.key]: n })); }} className="w-12 bg-slate-950 border border-white/5 text-[10px] py-1 rounded text-center text-white font-mono" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-center gap-6 text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full shadow-md shadow-blue-500/40" style={{ background: COLORS.email }} /> Email (Blue)</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full shadow-md shadow-green-500/40" style={{ background: COLORS.whatsapp }} /> WhatsApp (Light Green)</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: COLORS.alternative }} /> Other Platforms (Grey)</span>
        </div>
      </motion.div>

      {/* ============== 4. Rating Distribution ============== */}
      <motion.div
        custom={5}
        variants={cardVariants}
        initial="hidden"
        animate="show"
        className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3 border-b border-white/5 pb-5">
          <div>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" fill="#F59E0B" />
              Rating Distribution & Overall Average
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Adjust the count for each star tier — switch between 4 visualization styles.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ChartTypeSwitcher
              value={ratingDistChartType}
              onChange={setRatingDistChartType}
              options={[
                { id: 'gauge', label: 'Gauge', icon: ActivityIcon },
                { id: 'bar', label: 'Bars', icon: BarChart3 },
                { id: 'pie', label: 'Donut', icon: PieIcon },
                { id: 'area', label: 'Area', icon: TrendingUp },
              ]}
            />
            <div className="text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold font-mono block">Avg</span>
              <span className="text-lg font-black text-amber-400 font-mono leading-none">{animAverageScore}/5</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Chart panel */}
          <div className="lg:col-span-3 bg-slate-950/40 border border-white/5 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="flex items-center justify-between mb-2 relative">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Distribution Visualization
              </span>
              <span className="text-[9px] font-mono text-amber-400/80 uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live
              </span>
            </div>

            {/* GAUGE */}
            {ratingDistChartType === 'gauge' && (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart
                    innerRadius="68%"
                    outerRadius="100%"
                    data={[{ name: 'avg', value: averageScoreForGauge, fill: 'url(#gaugeGradient)' }]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <defs>
                      <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FCD34D" />
                        <stop offset="50%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#D97706" />
                      </linearGradient>
                      <filter id="gaugeGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <PolarAngleAxis type="number" domain={[0, 5]} angleAxisId={0} tick={false} />
                    <RadialBar background={{ fill: 'rgba(255,255,255,0.04)' }} dataKey="value" cornerRadius={20} filter="url(#gaugeGlow)" isAnimationActive animationDuration={900} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none" style={{ marginTop: '-10px' }}>
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Avg Score</div>
                  <div className="text-5xl font-black text-amber-400 font-mono leading-tight drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">{animAverageScore}</div>
                  <div className="flex justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className={`w-3 h-3 ${i <= Math.round(computedAverageScore) ? 'text-amber-400 fill-current' : 'text-slate-700'}`} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* BAR */}
            {ratingDistChartType === 'bar' && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingDistributionData} margin={{ top: 30, right: 20, left: 0, bottom: 10 }}>
                  <defs>
                    {ratingDistributionData.map((d, i) => (
                      <linearGradient key={i} id={`ratingBarGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={d.glow} stopOpacity={1} />
                        <stop offset="100%" stopColor={d.fill} stopOpacity={0.5} />
                      </linearGradient>
                    ))}
                    <filter id="ratingBarGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="stars" tick={{ fill: '#E2E8F0', fontSize: 11, fontWeight: 700 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} cursor={{ fill: 'rgba(245, 158, 11, 0.08)' }} formatter={(v: number) => [`${v} reviews`, 'Count']} />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={56} isAnimationActive animationDuration={900} shape={(props: any) => {
                    const { x, y, width, height, index } = props;
                    return (
                      <g>
                        <rect x={x} y={y - 2} width={width} height={height + 4} rx={10} fill={`url(#ratingBarGrad${index})`} opacity={0.3} filter="url(#ratingBarGlow)" />
                        <rect x={x} y={y} width={width} height={height} rx={10} fill={`url(#ratingBarGrad${index})`} />
                      </g>
                    );
                  }}>
                    <LabelList dataKey="count" position="top" fill="#FCD34D" fontSize={11} fontWeight={700} fontFamily="JetBrains Mono, monospace" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* PIE / DONUT */}
            {ratingDistChartType === 'pie' && (
              <div className="relative">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <defs>
                      <filter id="ratingSliceGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <Pie
                      data={ratingDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={115}
                      paddingAngle={3}
                      dataKey="count"
                      isAnimationActive
                      animationDuration={900}
                      stroke="rgba(15, 23, 42, 0.9)"
                      strokeWidth={2}
                      filter="url(#ratingSliceGlow)"
                    >
                      {ratingDistributionData.map((entry, idx) => (
                        <Cell key={`rating-cell-${idx}`} fill={entry.fill} />
                      ))}
                      <LabelList dataKey="stars" position="outside" fill="#E2E8F0" fontSize={10} fontFamily="JetBrains Mono, monospace" />
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} formatter={(v: number, name: string) => [`${v} reviews`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Total</div>
                  <div className="text-3xl font-black text-amber-400 font-mono leading-tight">{animTotalReviews}</div>
                  <div className="text-[9px] font-mono text-amber-400/80 uppercase tracking-wider mt-0.5">Reviews</div>
                </div>
              </div>
            )}

            {/* AREA */}
            {ratingDistChartType === 'area' && (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={ratingDistributionData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="ratingAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FCD34D" stopOpacity={0.9} />
                      <stop offset="60%" stopColor="#F59E0B" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ratingLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F87171" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#FCD34D" />
                    </linearGradient>
                    <filter id="ratingAreaGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="stars" tick={{ fill: '#E2E8F0', fontSize: 11, fontWeight: 700 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} formatter={(v: number) => [`${v} reviews`, 'Count']} />
                  <Area type="monotone" dataKey="count" stroke="url(#ratingLineGrad)" strokeWidth={3} fill="url(#ratingAreaGrad)" isAnimationActive animationDuration={1000} filter="url(#ratingAreaGlow)" dot={{ fill: '#FCD34D', r: 5, strokeWidth: 0 }} activeDot={{ r: 7, fill: '#fff', stroke: '#F59E0B', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Editable controls */}
          <div className="lg:col-span-2 space-y-2">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-3 text-center">
                <div className="text-[9px] text-slate-500 uppercase font-bold font-mono">Weighted Avg</div>
                <div className="flex items-baseline gap-1 justify-center mt-1">
                  <span className="text-2xl font-black text-amber-400 font-mono leading-none">{animAverageScore}</span>
                  <span className="text-[10px] text-slate-500 font-mono">/ 5.0</span>
                </div>
                <div className="flex justify-center mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`w-3 h-3 ${i <= Math.round(computedAverageScore) ? 'text-amber-400 fill-current' : 'text-slate-700'}`} />
                  ))}
                </div>
              </div>
              <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 text-center">
                <div className="text-[9px] text-slate-500 uppercase font-bold font-mono">Total Reviews</div>
                <span className="text-2xl font-black text-white font-mono leading-none block mt-1">{animTotalReviews}</span>
                <span className="text-[9px] text-slate-500 font-mono">files</span>
              </div>
            </div>
            {[
              { key: 'fiveStar' as const, stars: 5, label: 'Excellent (5★)', color: 'bg-amber-400', glow: 'shadow-amber-400/40' },
              { key: 'fourStar' as const, stars: 4, label: 'Satisfactory (4★)', color: 'bg-amber-300', glow: 'shadow-amber-300/40' },
              { key: 'threeStar' as const, stars: 3, label: 'Average (3★)', color: 'bg-amber-200', glow: 'shadow-amber-200/40' },
              { key: 'twoStar' as const, stars: 2, label: 'Mediocre (2★)', color: 'bg-orange-400', glow: 'shadow-orange-400/40' },
              { key: 'oneStar' as const, stars: 1, label: 'Deficient (1★)', color: 'bg-rose-500', glow: 'shadow-rose-500/40' },
            ].map((tier, i) => {
              const value = starsHistogram[tier.key];
              const pct = totalReviewsCount > 0 ? (value / totalReviewsCount) * 100 : 0;
              return (
                <motion.div key={tier.key} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06, duration: 0.3 }} className="bg-slate-950/60 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-white/10 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-300 font-mono uppercase flex items-center gap-1.5">
                        {[...Array(tier.stars)].map((_, s) => (
                          <Star key={s} className="w-2.5 h-2.5 text-amber-400 fill-current" />
                        ))}
                        <span className="ml-1">{tier.label.split('(')[0].trim()}</span>
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">{pct.toFixed(0)}% share</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden relative">
                      <div className={`h-full ${tier.color} rounded-full shadow-md ${tier.glow} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button onClick={() => setStarsHistogram((prev) => ({ ...prev, [tier.key]: Math.max(0, value - 1) }))} className="p-1 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white rounded text-xs font-mono">−</button>
                    <input type="number" value={value} onChange={(e) => { const v = parseInt(e.target.value) || 0; setStarsHistogram((prev) => ({ ...prev, [tier.key]: v })); }} className="w-12 bg-slate-900 border border-white/10 rounded text-[10px] text-center font-mono py-1 text-white focus:outline-none" />
                    <button onClick={() => setStarsHistogram((prev) => ({ ...prev, [tier.key]: value + 1 }))} className="p-1 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white rounded text-xs font-mono">+</button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ============== 5. Service-Wise Ratings ============== */}
      <motion.div
        custom={6}
        variants={cardVariants}
        initial="hidden"
        animate="show"
        className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
          <div>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              Service-Wise Ratings Breakdown
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Average rating per service — switch between 4 visualization styles.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ChartTypeSwitcher
              value={serviceChartType}
              onChange={setServiceChartType}
              options={[
                { id: 'radial', label: 'Radial', icon: ActivityIcon },
                { id: 'bar', label: 'Bars', icon: BarChart3 },
                { id: 'line', label: 'Line', icon: LineIcon },
                { id: 'composed', label: 'Composed', icon: LayoutGrid },
              ]}
            />
            <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-md border border-indigo-500/10">
              {serviceRatingsData.length} services
            </span>
          </div>
        </div>

        {serviceRatingsData.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/30 border border-dashed border-white/10 rounded-2xl">
            <TrendingUp className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-mono">
              No approved ratings yet. Approve client reviews in the Reviews tab to see service-wise averages here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Chart panel */}
            <div className="lg:col-span-3 bg-slate-950/40 border border-white/5 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
              <div className="flex items-center justify-between mb-2 relative">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  Service Comparison
                </span>
                <span className="text-[9px] font-mono text-slate-600 uppercase">Scale: 0 — 5.0 ★</span>
              </div>

              {/* RADIAL — custom external legend so long service names wrap properly */}
              {serviceChartType === 'radial' && (
                <div className="flex flex-col gap-3">
                  <ResponsiveContainer width="100%" height={260}>
                    <RadialBarChart
                      innerRadius="22%"
                      outerRadius="100%"
                      data={serviceRatingsData.map((s, i) => ({
                        ...s,
                        fill: svcColorAt(i),
                      }))}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <defs>
                        <filter id="radialGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <PolarAngleAxis type="number" domain={[0, 5]} angleAxisId={0} tick={false} />
                      <RadialBar background={{ fill: 'rgba(255,255,255,0.04)' }} dataKey="avg" cornerRadius={8} filter="url(#radialGlow)" isAnimationActive animationDuration={1000} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} formatter={(v: number, _name: string, props: any) => [`${v} ★ (${props.payload.count} reviews)`, props.payload.name]} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  {/* Custom legend: full names wrap onto multiple lines, never truncate */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-2 pt-1">
                    {serviceRatingsData.map((s, i) => {
                      const fill = svcColorAt(i);
                      return (
                        <div key={`svc-radial-leg-${i}`} className="flex items-start gap-2 min-w-0">
                          <span
                            className="inline-block w-3 h-3 rounded-sm shrink-0 mt-0.5 ring-1 ring-white/20"
                            style={{ backgroundColor: fill }}
                          />
                          <div className="flex flex-col min-w-0 leading-tight">
                            <span className="text-[10px] font-mono text-slate-200 break-words">{s.name}</span>
                            <span className="text-[9px] font-mono text-slate-500">
                              {s.avg.toFixed(2)} ★ · {s.count} rev
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* HORIZONTAL BAR — wide YAxis so long service names fit fully */}
              {serviceChartType === 'bar' && (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={serviceRatingsData} layout="vertical" margin={{ top: 5, right: 50, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="svcBarTop" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.85} />
                        <stop offset="100%" stopColor="#FCD34D" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="svcBarRest" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity={0.85} />
                        <stop offset="100%" stopColor="#06B6D4" stopOpacity={1} />
                      </linearGradient>
                      <filter id="svcBarGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis type="number" domain={[0, 5]} tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#E2E8F0', fontSize: 10, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      width={170}
                      tickFormatter={(v: string) => truncateName(v, 22)}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} formatter={(v: number, _n: string, props: any) => [`${v} ★ (${props.payload.count} reviews)`, props.payload.name]} />
                    <Bar dataKey="avg" radius={[0, 10, 10, 0]} maxBarSize={28} isAnimationActive animationDuration={900} shape={(props: any) => {
                      const { x, y, width, height, index, payload } = props;
                      const isTop = index === 0;
                      const fill = isTop ? 'url(#svcBarTop)' : 'url(#svcBarRest)';
                      return (
                        <g>
                          <rect x={x} y={y - 2} width={width} height={height + 4} rx={10} fill={fill} opacity={0.25} filter="url(#svcBarGlow)" />
                          <rect x={x} y={y} width={width} height={height} rx={10} fill={fill} />
                          <text x={x + width + 6} y={y + height / 2} dy={4} fill={isTop ? '#FCD34D' : '#A5B4FC'} fontSize={11} fontWeight={700} fontFamily="JetBrains Mono, monospace">
                            {payload.avg.toFixed(2)} ★
                          </text>
                        </g>
                      );
                    }} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* LINE CHART — replaced Radar, ticks abbreviated to prevent overlap */}
              {serviceChartType === 'line' && (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={serviceRatingsData} margin={{ top: 30, right: 30, left: 0, bottom: 60 }}>
                    <defs>
                      <linearGradient id="svcLineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="50%" stopColor="#A5B4FC" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                      <linearGradient id="svcLineFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                      <filter id="svcLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#E2E8F0', fontSize: 9, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      angle={-30}
                      textAnchor="end"
                      height={70}
                      interval={0}
                      tickFormatter={(v: string) => truncateName(v, 14)}
                    />
                    <YAxis type="number" domain={[0, 5]} tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} cursor={{ stroke: 'rgba(99, 102, 241, 0.3)', strokeWidth: 1 }} formatter={(v: number, _n: string, props: any) => [`${v} ★ (${props.payload.count} reviews)`, props.payload.name]} />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      name="Avg Rating"
                      stroke="url(#svcLineGrad)"
                      strokeWidth={3}
                      isAnimationActive
                      animationDuration={1100}
                      filter="url(#svcLineGlow)"
                      dot={(props: any) => {
                        const { cx, cy, payload, index } = props;
                        const fill = svcColorAt(index);
                        return (
                          <g key={`svc-dot-${index}`}>
                            <circle cx={cx} cy={cy} r={10} fill={fill} fillOpacity={0.2} />
                            <circle cx={cx} cy={cy} r={6} fill={fill} stroke="#fff" strokeWidth={2} />
                            <text x={cx} y={cy - 16} fill={fill} fontSize={11} fontWeight={700} fontFamily="JetBrains Mono, monospace" textAnchor="middle">
                              {payload.avg.toFixed(2)} ★
                            </text>
                          </g>
                        );
                      }}
                      activeDot={{ r: 8, fill: '#fff', stroke: '#6366F1', strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {/* COMPOSED CHART — bars + line, wide YAxis for long service names */}
              {serviceChartType === 'composed' && (
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={serviceRatingsData} layout="vertical" margin={{ top: 5, right: 50, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="svcCompBar" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity={0.85} />
                        <stop offset="100%" stopColor="#06B6D4" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="svcCompLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#FCD34D" />
                      </linearGradient>
                      <filter id="svcCompGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis type="number" domain={[0, 5]} tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#E2E8F0', fontSize: 10, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      width={170}
                      tickFormatter={(v: string) => truncateName(v, 22)}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} formatter={(v: number, _n: string, props: any) => [`${v} ★ (${props.payload.count} reviews)`, props.payload.name]} />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#94A3B8', paddingTop: 8 }} />
                    <Bar name="Avg Rating" dataKey="avg" radius={[0, 10, 10, 0]} maxBarSize={24} fill="url(#svcCompBar)" isAnimationActive animationDuration={900} filter="url(#svcCompGlow)" />
                    <Line name="Trend" type="monotone" dataKey="avg" stroke="url(#svcCompLine)" strokeWidth={3} dot={{ fill: '#FCD34D', r: 4, strokeWidth: 0 }} isAnimationActive animationDuration={1100} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Service ranking cards */}
            <div className="lg:col-span-2 space-y-2">
              {serviceRatingsData.map((s, i) => {
                const rankColors = [
                  'border-amber-500/30 from-amber-500/10',
                  'border-slate-400/30 from-slate-400/10',
                  'border-orange-700/30 from-orange-700/10',
                  'border-indigo-500/20 from-indigo-500/5',
                ];
                const rankBadges = ['🥇', '🥈', '🥉', ''];
                return (
                  <motion.div key={s.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }} className={`bg-gradient-to-r ${rankColors[i] || rankColors[3]} to-transparent border rounded-xl p-3 flex items-center gap-3 hover:scale-[1.02] transition-transform`}>
                    <div className="text-xl w-7 text-center">
                      {rankBadges[i] || <span className="text-[10px] text-slate-500 font-mono">#{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-slate-300 font-mono uppercase font-bold truncate mb-0.5">{s.name}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-700" style={{ width: `${(s.avg / 5) * 100}%` }} />
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono shrink-0">{s.count} rev</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span className="text-lg font-black text-amber-400 font-mono">{s.avg.toFixed(2)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
