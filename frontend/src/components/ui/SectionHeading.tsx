/**
 * SectionHeading — consistent section header with eyebrow badge, title,
 * and subtitle. Includes a small decorative gradient line.
 */
import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}: SectionHeadingProps) {
  const isCenter = align === 'center';
  return (
    <div
      className={`${isCenter ? 'text-center max-w-3xl mx-auto' : 'text-left max-w-3xl'} mb-12 ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-sm mb-4 ${isCenter ? 'mx-auto' : ''}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
        <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-indigo-600">
          {eyebrow}
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl sm:text-4xl lg:text-5xl font-sans font-extrabold tracking-tight text-slate-900 leading-[1.1]"
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm sm:text-base text-slate-600 font-sans leading-relaxed mt-4"
        >
          {subtitle}
        </motion.p>
      )}

      {/* Decorative gradient line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={`h-px w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mt-6 ${isCenter ? 'mx-auto' : ''}`}
      />
    </div>
  );
}
