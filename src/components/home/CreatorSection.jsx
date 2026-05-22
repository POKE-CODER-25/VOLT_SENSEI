import { motion } from "framer-motion";
import { Mail, GraduationCap, Globe, Share2, ExternalLink, User } from "lucide-react";

function CreatorSection() {
  const socialLinks = [
    { 
      icon: Globe, 
      label: "GitHub", 
     href: "https://github.com/POKE-CODER-25", 
      username: "Source Code",
      color: "hover:text-white",
      bg: "hover:bg-white/10"
    },
    { 
      icon: Share2, 
      label: "LinkedIn", 
     href: "https://www.linkedin.com/in/pruthvi-raj-411992303", 
      username: "Professional Network",
      color: "hover:text-blue-400",
      bg: "hover:bg-blue-500/10"
    },
    { 
      icon: Mail, 
      label: "Email", 
      href: "mailto:luffytaroatp@gmail.com", 
      username: "Academic Inquiry",
      color: "hover:text-emerald-400",
      bg: "hover:bg-emerald-500/10"
    },
  ];

  return (
    <section className="relative mx-auto max-w-7xl px-4 md:px-8 py-32 border-t border-white/5">
      <div className="mb-16 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter"
        >
          Behind <span className="text-electric">Volt Sensei</span>
        </motion.h2>
        <div className="mt-4 h-1 w-20 bg-electric/30 mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Connection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          {socialLinks.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ x: 10 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group flex items-center gap-6 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl transition-all duration-500 ${link.bg}`}
            >
              <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform duration-500">
                <link.icon size={24} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{link.label}</p>
                <p className={`text-sm font-bold text-slate-300 transition-colors ${link.color}`}>{link.username}</p>
              </div>
              <ExternalLink size={16} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.a>
          ))}
        </div>

        {/* Right Side: Identity Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 p-10 md:p-14 flex flex-col justify-center backdrop-blur-3xl shadow-2xl"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 h-64 w-64 bg-electric/5 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 h-40 w-40 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-[2rem] bg-slate-900 border border-white/10 flex items-center justify-center shadow-inner">
                <User size={32} className="text-slate-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-electric">The Creator</span>
                <h3 className="text-3xl font-black text-white mt-1">R. Pruthvi</h3>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <GraduationCap size={20} className="text-slate-500 mt-1" />
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Institution</p>
                  <p className="text-sm font-bold text-slate-300">GPREC, Kurnool</p>
                </div>
              </div>

              <div className="flex items-center justify-between px-2">
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">© 2026</span>
                   <span className="text-[11px] font-black text-white uppercase tracking-tighter">Volt Sensei Project</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Stable</span>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default CreatorSection;
