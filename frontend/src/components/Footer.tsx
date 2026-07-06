import { Shield, Mail, Phone, MapPin, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const quickLinks = [
    { id: 'services', label: 'Services Catalog' },
    { id: 'portfolio', label: 'Portfolio Showcases' },
    { id: 'team', label: 'Our Specialists' },
    { id: 'resources', label: 'Resource Download Hub' },
    { id: 'faqs', label: 'General FAQs' },
    { id: 'contact', label: 'Book Briefing Slot' }
  ];

  return (
    <footer className="bg-white/40 backdrop-blur-md text-slate-600 py-20 border-t border-slate-200/50 font-sans relative z-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-slate-200/50">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-2 text-slate-800">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-600/15">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-sans font-extrabold text-lg tracking-tight block leading-none">
                  OneStop
                </span>
                <span className="text-[10px] font-mono text-indigo-600 tracking-widest font-bold uppercase block mt-1 leading-none">
                  Online Services
                </span>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Certified freelance-style virtual assistance, tax preparation readiness, trial ledger cleanups, custom Excel spreadsheets, SOX compliance internal audits, and electronic PDF creations.
            </p>

            <div className="space-y-2 text-xs pt-2">
              <div className="flex items-center space-x-2 text-slate-700">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-mono text-xs">{`support@onestoponlineservices.com`}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-mono text-xs">+92 300 1234567</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs">Punjab, Pakistan (PKT Timezone)</span>
              </div>
            </div>
          </div>

          {/* Quick Nav Col */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs">
              {quickLinks.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer text-left block duration-300 font-medium"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Platforms Col */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider">
              Verified Marketplace Profiles
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We operate secure escrow contracts on major international freelancing networks. Hire our specialists with 100% platform guarantees.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href="https://www.upwork.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white/60 border border-slate-200/80 hover:border-indigo-500/40 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl font-bold text-[10px] uppercase font-mono tracking-wider transition-all duration-300 shadow-sm"
              >
                Upwork Top Rated
              </a>
              <a
                href="https://www.fiverr.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white/60 border border-slate-200/80 hover:border-indigo-500/40 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl font-bold text-[10px] uppercase font-mono tracking-wider transition-all duration-300 shadow-sm"
              >
                Fiverr Pro Verified
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white/60 border border-slate-200/80 hover:border-indigo-500/40 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl font-bold text-[10px] uppercase font-mono tracking-wider transition-all duration-300 shadow-sm"
              >
                LinkedIn Network
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Panel */}
        <div className="pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} OneStopOnlineServices. All rights reserved. Visitor Preview Edition.</p>
          <div className="flex items-center space-x-4">
            <span>Security rules audited</span>
            <span>•</span>
            <span>Non-Disclosure Agreements (NDA) guaranteed</span>
            <span>•</span>
            <a
              href="#admin"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors font-mono uppercase tracking-wider"
              title="Administrator login"
            >
              <Lock className="w-3 h-3" />
              Admin
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
