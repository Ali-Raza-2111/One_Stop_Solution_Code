import { useState } from 'react';
import { SERVICES, RATINGS } from '../data/mockData';
import { Star, MapPin, Tag, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Rating } from '../types';
import SectionHeading from './ui/SectionHeading';
import Reveal from './ui/Reveal';

interface RatingsSectionProps {
  ratingsList?: Rating[];
}

export default function RatingsSection({ ratingsList }: RatingsSectionProps) {
  const [filterServiceId, setFilterServiceId] = useState<string>('all');
  const [showAllRatings, setShowAllRatings] = useState(false);

  const baseRatings = (ratingsList || RATINGS) as Rating[];
  const approvedRatings = baseRatings.filter((r) => r.isApproved !== false);

  const filteredRatings =
    filterServiceId === 'all'
      ? approvedRatings
      : approvedRatings.filter((r) => r.serviceId === filterServiceId);

  const displayedRatings = showAllRatings
    ? filteredRatings
    : filteredRatings.slice(0, 3);

  const filterOptions = [
    { id: 'all', name: 'Show All Services' },
    ...SERVICES.map((s) => ({ id: s.id, name: s.name })),
  ];

  const getServiceName = (serviceId: string) => {
    return SERVICES.find((s) => s.id === serviceId)?.name || 'General';
  };

  return (
    <section
      id="ratings"
      className="py-24 bg-transparent overflow-hidden border-b border-white/20 relative"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* === Header === */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <SectionHeading
            eyebrow="Client Reviews"
            align="left"
            title={
              <>
                Feedback From Our{' '}
                <span className="gradient-text">Active Global Partners</span>
              </>
            }
            subtitle="See how our remote financial auditing, custom bookkeeping, and executive virtual operations are helping global small businesses."
          />

          {/* Filter */}
          <Reveal delay={0.1} className="flex items-center space-x-3 shrink-0">
            <label
              htmlFor="service-filter"
              className="text-xs font-mono font-bold text-slate-500 uppercase"
            >
              Filter by service:
            </label>
            <div className="relative">
              <select
                id="service-filter"
                value={filterServiceId}
                onChange={(e) => setFilterServiceId(e.target.value)}
                className="appearance-none bg-white/60 backdrop-blur-md border border-white/60 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/35 shadow-sm cursor-pointer"
              >
                {filterOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                <span className="text-[10px]">▼</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* === Avatar marquee strip === */}
        {approvedRatings.length > 0 && (
          <Reveal delay={0.15} className="mb-12 overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-japandi-bg/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-japandi-bg/80 to-transparent z-10 pointer-events-none" />
            <div className="flex w-max animate-marquee-left gap-3">
              {[...approvedRatings, ...approvedRatings, ...approvedRatings].map(
                (r, idx) => (
                  <div
                    key={`avatar-${idx}`}
                    className="flex items-center gap-2 px-3 py-2 bg-white/50 border border-white/60 rounded-full backdrop-blur-md shadow-sm shrink-0"
                    title={`${r.name} — ${r.company}`}
                  >
                    {r.avatarUrl ? (
                      <img
                        src={r.avatarUrl}
                        alt={r.name}
                        className="w-7 h-7 rounded-full object-cover border border-white/60"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-sans font-bold text-xs">
                        {r.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-[10px] font-mono font-bold text-slate-700 pr-1">
                      {r.name.split(' ')[0]}
                    </span>
                  </div>
                ),
              )}
            </div>
          </Reveal>
        )}

        {/* === Ratings grid === */}
        <div className="min-h-[300px] relative">
          <AnimatePresence mode="popLayout">
            {displayedRatings.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {displayedRatings.map((item, idx) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95, y: 18 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 18 }}
                    transition={{
                      duration: 0.5,
                      delay: idx * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ y: -4 }}
                    className="glass-card p-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-500 relative overflow-hidden glow-hover shimmer-border"
                  >
                    {/* Quote decoration */}
                    <Quote className="absolute top-4 right-4 w-10 h-10 text-indigo-500/10 rotate-180" />

                    <div className="relative z-10">
                      {/* Animated stars */}
                      <div className="flex items-center space-x-0.5 mb-4 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
                            whileInView={{
                              opacity: 1,
                              scale: 1,
                              rotate: 0,
                            }}
                            viewport={{ once: true }}
                            transition={{
                              delay: 0.2 + i * 0.08,
                              duration: 0.4,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </motion.span>
                        ))}
                      </div>

                      <p className="text-xs text-slate-705 leading-relaxed font-sans italic mb-6">
                        &ldquo;{item.comment}&rdquo;
                      </p>
                    </div>

                    {/* Profile meta */}
                    <div className="pt-4 border-t border-white/45 mt-4 flex items-center space-x-3 relative z-10">
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/60"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-sans font-bold text-sm">
                          {item.name.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="font-sans font-bold text-sm text-slate-800 truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-sans truncate leading-none mt-1">
                          {item.designation},{' '}
                          <span className="font-bold text-slate-500">
                            {item.company}
                          </span>
                        </p>

                        <div className="flex items-center space-x-2 mt-2">
                          <span className="flex items-center space-x-1 text-[10px] font-mono text-slate-500">
                            <MapPin className="w-3 h-3 text-indigo-600" />
                            <span>{item.country}</span>
                          </span>

                          <span className="flex items-center space-x-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono uppercase tracking-tight border border-indigo-100 shadow-sm">
                            <Tag className="w-2.5 h-2.5" />
                            <span className="max-w-[100px] truncate">
                              {getServiceName(item.serviceId)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 bg-white/20 rounded-2xl border border-dashed border-white/45"
              >
                <p className="text-sm text-slate-500">
                  No client ratings available for this specific service filter.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View all button */}
        {filteredRatings.length > 3 && (
          <div className="flex justify-center mt-12">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAllRatings(!showAllRatings)}
              className="px-6 py-3 bg-white/70 hover:bg-indigo-50 border border-slate-200 text-indigo-600 font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer hover:border-indigo-500/30 flex items-center gap-2"
            >
              <span>
                {showAllRatings ? 'Show Fewer Reviews' : 'View All Reviews'}
              </span>
              <span className="text-[10px]">{showAllRatings ? '▲' : '▼'}</span>
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
}
