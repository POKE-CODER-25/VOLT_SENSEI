import { motion } from "framer-motion";
import { Mail, GraduationCap, Code2, User, Globe, Share2, ExternalLink } from "lucide-react";

function CreatorSection() {
  const socialLinks = [
    { icon: Globe, label: "GitHub", href: "#" },
    { icon: Share2, label: "LinkedIn", href: "#" },
    { icon: Mail, label: "Email", href: "#" },
  ];

  return (
    <section className="relative mx-auto max-w-7xl px-4 md:px-8 py-24 border-t border-white/5">
      <div className="relative overflow-hidden rounded-[3rem] bg-white/[0.02] border border-white/10 p-8 md:p-16 backdrop-blur-3xl">
        {/* Decorative Glows */}
        <div className="absolute -top-24 -left-24 h-64 w-64 bg-electric/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Creator Info */}
          <div className="text-center md:text-left space-y-8">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/10 mb-4"
              >
                <Code2 size={14} className="text-electric" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Architect</span>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-black text-white"
              >
                Prepared by <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-purple-400">R. Pruthvi Adithya Raj</span>
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5"
              >
                <div className="h-10 w-10 rounded-xl bg-electric/10 flex items-center justify-center">
                  <GraduationCap size={20} className="text-electric" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">College</p>
                  <p className="text-sm font-bold text-white">GPREC</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5"
              >
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <User size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Branch</p>
                  <p className="text-sm font-bold text-white">3rd Year CSD</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center md:items-end gap-6">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Connect with Me</p>
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
                   transition={{ delay: 0.3 + i * 0.1 }}
                   className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all shadow-2xl"
                 >
                   <link.icon size={24} />
                 </motion.a>
               ))}
             </div>
             <p className="text-[10px] font-medium text-slate-600 italic">© 2026 Volt Sensei · All Rights Reserved</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CreatorSection;
