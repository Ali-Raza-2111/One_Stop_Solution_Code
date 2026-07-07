/**
 * Reveal — wraps children and fades + slides them into view when they
 * intersect the viewport. Mirrors motion/react's whileInView API but
 * provides a friendlier default + stagger support via delay prop.
 */
import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface RevealProps {
  children: ReactNode;
  delay?: number; // seconds
  y?: number; // px offset
  className?: string;
  once?: boolean;
}

export default function Reveal({
  children,
  delay = 0,
  y = 24,
  className = '',
  once = true,
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
