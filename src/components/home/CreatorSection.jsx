import { motion } from "framer-motion";
import { Mail, GraduationCap, Globe, Share2, Code2 } from "lucide-react";

function CreatorSection() {
  const socialLinks = [
    { icon: Globe, label: "GitHub", href: "#github" },
    { icon: Share2, label: "LinkedIn", href: "#linkedin" },
    { icon: Mail, label: "Email", href: "#email" },
  ];

  return (
    <section className="relative mx-auto max-w-7xl px-4 md:px-8 py-24 border-t border-white/5">
      <div className="relative overflow-hidden rounded-[3rem] bg-white/[0.01] border border-white/5 p-8 md:p-16 backdrop-blur-3xl">
        {/* Decorative Glows */}
        <div className="absolute -top-24 -left-24 h-64 w-64 bg-electric/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Creator Info */}
          <div className="text-center md:text-left space-y-6">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.03] px-3 py-1 border border-white/5"
              >
                <Code2 size={12} className="text-electric/60" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Project Architect</span>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-bold text-slate-400"
              >
                Prepared by <span className="text-white">R. Pruthvi Adithya Raj</span>
              </motion.h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-4 bg-white/[0.02] px-6 py-3 rounded-2xl border border-white/5"
            >
              <div className="h-8 w-8 rounded-lg bg-electric/10 flex items-center justify-center">
                <GraduationCap size={16} className="text-electric/60" />
              </div>
              <div className="text-left">
                <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest mb-0.5">Academic Affiliation</p>
                <p className="text-xs font-bold text-slate-400">GPREC Kurnool</p>
              </div>
            </motion.div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center md:items-end gap-6">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Digital Presence</p>
             <div className="flex gap-4">
               {socialLinks.map((link, i) => (
                 <motion.a
                   key={link.label}
                   href={link.href}
                   target="_blank"
                   rel="noopener noreferrer"
                   initial={{ opacity: 0, scale: 0.8 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   whileHover={{ scale: 1.1, y: -5 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.2 + i * 0.1 }}
                   className="h-12 w-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all shadow-xl"
                 >
                   <link.icon size={20} />
                 </motion.a>
               ))}
             </div>
             <p className="text-[9px] font-black uppercase tracking-widest text-slate-700">© 2026 Volt Sensei</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CreatorSection;
