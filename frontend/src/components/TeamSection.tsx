import { motion } from 'motion/react';
import { Mail, Shield, Award, CheckCircle } from 'lucide-react';
import { TeamMember } from '../types';

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "member-1",
    name: "Sophia Martinez, CPA",
    role: "Lead Certified Accountant & QBO Pro",
    bio: "Ex-KPMG consultant specializing in comprehensive GAAP auditing, forensic accounting, and complex catch-up bookkeeping reconstruction.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    specialties: ["QuickBooks Pro", "Forensic Auditing", "Back-Tax Prep"],
    isOnline: true,
    email: "accounting@onestop.com"
  },
  {
    id: "member-2",
    name: "Marcus Sterling",
    role: "Director of MS Office & Spreadsheet Automation",
    bio: "VBA Architect who has automated cash flow models and corporate dashboards for over 80 small businesses, saving hundreds of operational hours.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    specialties: ["VBA Macros", "Financial Projection Models", "Office Automation"],
    isOnline: true,
    email: "automation@onestop.com"
  },
  {
    id: "member-3",
    name: "Victoria Thorne",
    role: "Senior Risk Auditor & Administrative Lead",
    bio: "Certified internal control specialist managing security-vetted virtual support structures, operational audits, and corporate NDAs.",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    specialties: ["Internal Auditing", "Risk Assessment", "Corporate Administration"],
    isOnline: true,
    email: "audit@onestop.com"
  }
];

interface TeamSectionProps {
  teamList?: TeamMember[];
}

export default function TeamSection({ teamList = INITIAL_TEAM_MEMBERS }: TeamSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const membersToRender = teamList;


  return (
    <section id="team" className="py-24 bg-transparent border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest mb-2">Expert Personnel</p>
          <h2 className="text-3xl font-sans font-extrabold tracking-tight text-slate-900 mb-4">
            Meet Our Certified Remote Specialists
          </h2>
          <p className="text-sm text-slate-500 font-sans">
            Our vetted accountants, systems architects, and executive partners operate on double-timezone schedules to offer overnight support and absolute confidentiality.
          </p>
        </div>

        {/* Team Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {membersToRender.map((member) => (
            <motion.div
              key={member.id}
              id={`team-card-${member.id}`}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="glass-card p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-500 relative overflow-hidden"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between mb-5">
                  <div className="relative">
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-white/60 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Corner Active Lights indicator */}
                    {member.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-xs" title="Available Remote">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-white/50 text-[10px] font-bold font-mono text-slate-500 uppercase rounded-lg border border-white/50 shadow-xs">
                    <Shield className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Vetted</span>
                  </div>
                </div>

                {/* Info block */}
                <h3 className="font-sans font-bold text-lg text-slate-800 leading-tight">
                  {member.name}
                </h3>
                <p className="text-xs font-mono font-bold text-indigo-600 mt-1">
                  {member.role}
                </p>
                
                <p className="text-xs text-slate-500 leading-relaxed font-sans mt-3.5">
                  {member.bio}
                </p>
              </div>

              {/* Specialties & CTA */}
              <div className="mt-6 pt-4 border-t border-white/45">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {member.specialties.map((spec, index) => (
                    <span 
                      key={index} 
                      className="text-[9px] font-bold font-mono uppercase bg-indigo-50/70 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100 shadow-xs"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>NDA Active</span>
                  </span>

                  <a 
                    href={`mailto:${member.email}`}
                    className="p-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl border border-indigo-100 hover:border-indigo-600 transition-all duration-300 flex items-center justify-center shadow-xs cursor-pointer"
                    title={`Contact ${member.name}`}
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Audit Disclaimer */}
        <div className="mt-12 text-center p-5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/40 max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            <Award className="w-4.5 h-4.5 text-indigo-600" />
            <span>Guaranteed Service Level Agreement</span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 leading-normal font-sans mt-1.5">
            Every file, sheet, and account remains encrypted. Zero permanent offshore server caching.
          </p>
        </div>

      </div>
    </section>
  );
}
