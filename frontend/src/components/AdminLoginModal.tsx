import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, User, X, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both administrative credentials.');
      return;
    }

    setIsSubmitting(true);

    // Credential verification (demo credentials for preview)
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';

    // Simulate small verification delay
    setTimeout(() => {
      if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        setIsSubmitting(false);
        onLoginSuccess();
        setUsername('');
        setPassword('');
        onClose();
        // Clear the #admin hash so refresh doesn't re-trigger the modal
        if (window.location.hash.toLowerCase() === '#admin') {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } else {
        setIsSubmitting(false);
        setError('Invalid credentials. Try admin / admin123');
      }
    }, 700);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="admin-login-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Ambient Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-lg"
          />

          {/* Premium Glassmorphic Login Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(99,102,241,0.25)] z-10 overflow-hidden"
          >
            {/* Elegant close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Radiant Cyber Ambient Glow Meshes */}
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/20 blur-[50px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-500/20 blur-[50px] pointer-events-none" />

            {/* Header / Brand Mark */}
            <div className="relative text-center mb-8">
              <div className="relative inline-flex mb-4">
                {/* Glowing ring */}
                <span className="absolute inset-0 rounded-2xl bg-indigo-500/30 blur-md animate-pulse" />
                <div className="relative p-3.5 bg-gradient-to-b from-indigo-500 to-indigo-600 border border-indigo-400/30 text-white rounded-2xl shadow-xl">
                  <Shield className="w-5 h-5 text-indigo-100" />
                </div>
              </div>
              <h3 className="text-xl font-sans font-black text-white tracking-tight">
                Secure Terminal Login
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-1.5 max-w-xs mx-auto">
                Authorize administrator session to view backend metrics & manage content catalogs.
              </p>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4 relative">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs font-sans flex items-center gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 pl-1">
                  Admin ID / Username
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter your admin ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950/65 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs font-sans text-white focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/35 transition-all placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 pl-1">
                  Secret Access Key
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/65 border border-white/10 rounded-2xl pl-10 pr-11 py-3 text-xs font-sans text-white focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/35 transition-all placeholder-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 text-slate-500 hover:text-slate-300 rounded transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Authorize Session CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full py-3 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 disabled:opacity-75 text-white font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-indigo-500/10 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4.5 h-4.5 rounded-full border-2 border-white border-t-transparent animate-spin inline-block mr-1.5" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Authorize Session</span>
                  </>
                )}
              </button>
            </form>

            {/* Security Badge notice */}
            <div className="mt-8 pt-4.5 border-t border-white/5 flex items-center justify-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute" />
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1.5">
                AES-256 SESSION ENCRYPTION ACTIVE
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

