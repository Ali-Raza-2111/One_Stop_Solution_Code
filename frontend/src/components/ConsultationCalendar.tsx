import { useState, useEffect, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse, addDays, isBefore, startOfToday } from 'date-fns';
import { Clock, Calendar, Globe, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

import 'react-day-picker/dist/style.css';

interface ConsultationCalendarProps {
  /** Visitor's IANA timezone, e.g. "America/New_York" */
  visitorTimeZone: string;
  /** Called whenever the visitor changes their selection. */
  onChange: (isoString: string) => void;
  /** Pre-selected ISO string (optional). */
  value?: string;
}

/**
 * Professional consultation calendar widget.
 *
 * Combines:
 *   - react-day-picker for picking a future date
 *   - Pre-defined time slots (09:00 AM – 06:00 PM, 15-min increments)
 *   - Dual timezone preview (visitor's local + PKT / Asia/Karachi)
 *
 * The PKT time is computed live from the visitor's local selection so the
 * business owner in Pakistan knows exactly when the meeting will happen.
 */
export default function ConsultationCalendar({
  visitorTimeZone,
  onChange,
  value,
}: ConsultationCalendarProps) {
  const today = startOfToday();
  const maxDate = addDays(today, 60); // allow bookings up to 60 days ahead

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string>(''); // "14:30"

  // Hydrate from `value` if provided
  useEffect(() => {
    if (!value) {
      setSelectedDate(undefined);
      setSelectedSlot('');
      return;
    }
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      setSelectedDate(d);
      setSelectedSlot(format(d, 'HH:mm'));
    }
  }, [value]);

  // Pre-defined 15-minute slots from 9 AM to 6 PM
  const timeSlots = useMemo(() => {
    const slots: { value: string; label: string }[] = [];
    for (let h = 9; h < 18; h++) {
      for (const m of [0, 15, 30, 45]) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        slots.push({
          value: `${hh}:${mm}`,
          label: format(parse(`${hh}:${mm}`, 'HH:mm', new Date()), 'h:mm a'),
        });
      }
    }
    return slots;
  }, []);

  // Whenever date or slot changes, propagate ISO string up
  useEffect(() => {
    if (!selectedDate || !selectedSlot) {
      return;
    }
    const [hh, mm] = selectedSlot.split(':').map(Number);
    const combined = new Date(selectedDate);
    combined.setHours(hh, mm, 0, 0);
    onChange(combined.toISOString());
  }, [selectedDate, selectedSlot, onChange]);

  // Compute PKT equivalent (visitor's local selection → Asia/Karachi)
  const pktLabel = useMemo(() => {
    if (!selectedDate || !selectedSlot) return '';
    try {
      const [hh, mm] = selectedSlot.split(':').map(Number);
      const combined = new Date(selectedDate);
      combined.setHours(hh, mm, 0, 0);
      const pktTime = combined.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Karachi',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const pktDate = combined.toLocaleDateString('en-US', {
        timeZone: 'Asia/Karachi',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      return `${pktDate} · ${pktTime}`;
    } catch {
      return '';
    }
  }, [selectedDate, selectedSlot]);

  // Compute visitor's local formatted label
  const localLabel = useMemo(() => {
    if (!selectedDate || !selectedSlot) return '';
    try {
      const [hh, mm] = selectedSlot.split(':').map(Number);
      const combined = new Date(selectedDate);
      combined.setHours(hh, mm, 0, 0);
      return format(combined, 'EEE, MMM d · h:mm a');
    } catch {
      return '';
    }
  }, [selectedDate, selectedSlot]);

  // Custom-styled day picker modifiers
  // Note: react-day-picker v10 expects Matcher[] or Matcher
  const disabledDays: any[] = [
    { before: today },
    { daysOfWeek: [0] }, // disable Sundays (or adjust per business policy)
  ];

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 p-4 space-y-4 shadow-sm">
      {/* Header row */}
      <div className="flex items-center justify-between pb-3 border-b border-white/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div>
            <span className="block text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-widest leading-none">
              Pick Date & Time Slot
            </span>
            <span className="block text-[9px] text-slate-500 font-mono mt-0.5">
              Free 15-minute consultation · Sundays closed
            </span>
          </div>
        </div>
        <span className="text-[9px] font-mono font-bold text-slate-500 bg-white/50 px-2 py-1 rounded-md border border-white/40">
          {visitorTimeZone.split('/').pop()?.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* === Calendar === */}
        <div className="bg-white/60 rounded-xl border border-white/50 p-3">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={disabledDays}
            startMonth={today}
            endMonth={maxDate}
            numberOfMonths={1}
            classNames={{
              root: 'rdp-root',
              months: 'rdp-months',
              month: 'rdp-month',
              month_caption: 'rdp-caption',
              caption_label: 'rdp-caption-label',
              nav: 'rdp-nav',
              button_previous: 'rdp-nav-button rdp-nav-button-prev',
              button_next: 'rdp-nav-button rdp-nav-button-next',
              chevron: 'rdp-chevron',
              month_grid: 'rdp-table',
              weekdays: 'rdp-head-row',
              weekday: 'rdp-head-cell',
              weeks: 'rdp-weeks',
              week: 'rdp-row',
              day: 'rdp-cell',
              day_button: 'rdp-day',
              selected: 'rdp-day-selected',
              today: 'rdp-day-today',
              disabled: 'rdp-day-disabled',
              outside: 'rdp-day-outside',
              hidden: 'rdp-day-hidden',
              footer: 'rdp-footer',
            } as any}
            components={{
              Chevron: () => null,
            }}
          />
        </div>

        {/* === Time slot picker === */}
        <div className="bg-white/60 rounded-xl border border-white/50 p-3 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-widest">
              Available Slots
            </span>
            {selectedDate ? (
              <span className="text-[10px] font-mono font-bold text-slate-700">
                {format(selectedDate, 'EEE, MMM d')}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-400">
                ← Pick a date first
              </span>
            )}
          </div>

          {selectedDate ? (
            <div className="grid grid-cols-3 gap-1.5 overflow-y-auto max-h-[260px] pr-1 scrollbar-hide">
              {timeSlots.map((slot) => {
                const isSelected = selectedSlot === slot.value;
                return (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => setSelectedSlot(slot.value)}
                    className={`py-2 px-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-white/70 text-slate-600 border-white/40 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50'
                    }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <Calendar className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-[11px] text-slate-500 font-sans">
                Select a date to see available time slots
              </p>
            </div>
          )}
        </div>
      </div>

      {/* === Dual timezone summary === */}
      {localLabel && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/40"
        >
          {/* Visitor's local time */}
          <div className="flex items-start gap-2 p-3 bg-white/50 rounded-xl border border-white/40">
            <Globe className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Your Local Time
              </span>
              <span className="block text-[11px] font-mono font-bold text-slate-800 mt-0.5">
                {localLabel}
              </span>
              <span className="block text-[9px] text-slate-500 font-mono mt-0.5 truncate">
                {visitorTimeZone}
              </span>
            </div>
          </div>

          {/* PKT time */}
          <div className="flex items-start gap-2 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <Clock className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-[9px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
                Pakistan Time (PKT)
              </span>
              <span className="block text-[11px] font-mono font-bold text-emerald-800 mt-0.5">
                {pktLabel}
              </span>
              <span className="block text-[9px] text-emerald-600 font-mono mt-0.5">
                Asia/Karachi
              </span>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
          </div>
        </motion.div>
      )}

      {!localLabel && (
        <div className="text-center pt-3 border-t border-white/40">
          <p className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
            <ChevronRight className="w-3 h-3" />
            <span>Select a date and time slot to see dual timezone preview</span>
          </p>
        </div>
      )}
    </div>
  );
}
