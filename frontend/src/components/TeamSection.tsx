import { TEAM } from '../data/mockData';
import { Award, ShieldCheck, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export default function TeamSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section id="team" className="py-24 bg-transparent border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest mb-2">Our Remote Team</p>
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-slate-900 mb-4">
            Certified Financial & Document Specialists
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed font-sans">
            Our team comprises highly structured, meticulous bookkeeping, auditing, and document architects dedicated to supporting your remote operations with pristine precision.
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
          {TEAM.map((member) => (
            <motion.div
              key={member.id}
              id={`team-card-${member.id}`}
              variants={cardVariants}
              whileHover={{ y: -3 }}
              className="glass-card p-6 hover:shadow-lg transition-all duration-500 flex flex-col justify-between group"
            >
              <div>
                {/* Image container with online dot */}
                <div className="relative w-28 h-28 mx-auto mb-6">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-200/80 shadow-md bg-white">
                    <img
                      src={member.pictureUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Emerald online dot */}
                  <span className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-md animate-pulse" title="Active Online" />
                </div>

                {/* Info details */}
                <div className="text-center mb-6">
                  <h3 className="font-sans font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors duration-500">
                    {member.name}
                  </h3>
                  <p className="text-xs text-indigo-600 font-bold font-sans mt-1">
                    {member.title}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1.5 uppercase tracking-widest">
                    Experience: {member.experience}
                  </p>
                </div>

                {/* Achievements List */}
                <div id="achievements" className="border-t border-white/40 pt-5">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-550 mb-3 flex items-center justify-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Verified Credentials</span>
                  </h4>
                  <div className="flex flex-col space-y-2">
                    {member.certifications.map((cert, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2.5 bg-white/45 px-3 py-2 rounded-xl border border-white/45 shadow-sm backdrop-blur-md"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[10.5px] font-semibold font-sans text-slate-700 leading-tight">
                          {cert}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-6 border-t border-white/40 mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    const target = document.getElementById('contact');
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer duration-300"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Consult with {member.name.split(' ')[0]}</span>
                </button>
              </div>

            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
