import { motion, AnimatePresence } from 'motion/react';
import {
  ExternalLink,
  Star,
  Eye,
  PlayCircle,
  FileText,
  Image as ImageIcon,
  Clock,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { PortfolioItem } from '../types';

interface PortfolioGridProps {
  items: PortfolioItem[];
  onViewDetail: (item: PortfolioItem) => void;
  onOrderNow: (item: PortfolioItem) => void;
}

/**
 * Upwork-inspired portfolio card grid.
 *
 * Design language (matches Upwork's "Catalog" / "Project Catalog" cards):
 *  - Clean white card with subtle shadow + border
 *  - Wide 16:9 thumbnail with media type badge overlay
 *  - Hover overlay with "View Project" CTA
 *  - Skills as small pill tags
 *  - "Order Now" primary button + "View" ghost button at the bottom
 *
 * The grid is responsive: 1 col mobile, 2 cols tablet, 3 cols desktop.
 */
export default function PortfolioGrid({
  items,
  onViewDetail,
  onOrderNow,
}: PortfolioGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16 bg-white/40 rounded-2xl border border-dashed border-white/50 backdrop-blur-md">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
          <Eye className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-sans text-slate-500">
          No portfolio cases uploaded for this section yet.
        </p>
        <p className="text-[11px] text-slate-400 mt-1 font-mono">
          Check back soon — new case studies are added regularly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {items.map((item, idx) => {
        // Resolve the right thumbnail
        const thumb = item.thumbnailUrl || item.mediaUrl;
        const mediaIcon =
          item.mediaType === 'video'
            ? PlayCircle
            : item.mediaType === 'pdf'
              ? FileText
              : ImageIcon;
        const MediaIcon = mediaIcon;

        return (
          <motion.article
            key={item.id || `pf-${idx}`}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.5,
              delay: idx * 0.06,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            whileHover={{ y: -4 }}
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col"
          >
            {/* === Thumbnail (Upwork-style 16:9) === */}
            <div
              onClick={() => onViewDetail(item)}
              className="relative aspect-[16/10] bg-slate-100 overflow-hidden cursor-pointer"
            >
              <img
                src={thumb}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Top-left media type badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wide shadow-sm">
                <MediaIcon className="w-3 h-3 text-indigo-600" />
                <span>{item.mediaType || 'image'}</span>
              </div>

              {/* Top-right "Verified" star */}
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-50/95 backdrop-blur-md text-amber-700 px-2 py-1 rounded-lg text-[9px] font-bold font-mono uppercase shadow-sm border border-amber-200/50">
                <Star className="w-3 h-3 fill-current text-amber-500" />
                <span>Verified</span>
              </div>

              {/* Hover overlay with "View Project" */}
              <div className="absolute inset-0 bg-slate-900/55 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <div className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-xl shadow-md font-bold text-xs font-sans transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>View Project</span>
                </div>
              </div>
            </div>

            {/* === Card body === */}
            <div className="p-5 flex-1 flex flex-col">
              {/* Title */}
              <h5
                onClick={() => onViewDetail(item)}
                className="font-sans font-bold text-[15px] text-slate-800 mb-1.5 cursor-pointer group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2"
              >
                {item.title}
              </h5>

              {/* Meta line — duration + tag */}
              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mb-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>2-5 days delivery</span>
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>From $99</span>
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed font-sans mb-4 line-clamp-2">
                {item.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.skills.slice(0, 4).map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[9px] font-bold font-mono uppercase rounded-md border border-indigo-100"
                  >
                    {skill}
                  </span>
                ))}
                {item.skills.length > 4 && (
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[9px] font-bold font-mono uppercase rounded-md">
                    +{item.skills.length - 4}
                  </span>
                )}
              </div>

              {/* === Action row (Upwork-style) === */}
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onViewDetail(item)}
                  className="flex-1 py-2.5 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onOrderNow(item)}
                  className="flex-[1.4] py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-md shadow-indigo-600/15 flex items-center justify-center gap-1.5"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
