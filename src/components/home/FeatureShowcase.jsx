import { motion } from "framer-motion";
import { Zap, Brain, Rocket, Users, Target, ShieldCheck } from "lucide-react";

const stats = [
  { label: "Questions Solved", value: "1.2M+", icon: Target, color: "text-electric" },
  { label: "Concepts Mastered", value: "50K+", icon: Brain, color: "text-purple-400" },
  { label: "Active Students", value: "100K+", icon: Users, color: "text-emerald-400" },
  { label: "Success Rate", value: "99.2%", icon: ShieldCheck, color: "text-amber-400" },
];

function FeatureShowcase() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 md:px-8 py-24">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-96 bg-electric/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Motivational Copy */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-electric/10 px-4 py-2 border border-electric/20 mb-6"
          >
            <Zap size={16} className="text-electric" />
            <span className="text-[10px] font-black uppercase tracking-widest text-electric">The Future of JEE Prep</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight mb-8"
          >
            Beyond <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-purple-500">Traditional</span> Learning
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 font-medium mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0"
          >
            Volt Sensei isn't just a platform; it's an AI-powered neural network for your brain. We transform complex theories into visual intuition, making the impossible, achievable.
          </motion.p>

          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto lg:mx-0">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 backdrop-blur-sm"
              >
                <stat.icon size={20} className={`${stat.color} mb-2`} />
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side: Futuristic Visuals */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10 aspect-square w-full max-w-lg mx-auto"
          >
            {/* Main Visual Core */}
            <div className="absolute inset-0 rounded-full border border-electric/20 animate-spin-slow" />
            <div className="absolute inset-4 rounded-full border border-purple-500/20 animate-reverse-spin-slow" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="bg-gradient-to-br from-electric to-purple-600 p-8 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,245,255,0.3)]"
                >
                  <Brain size={64} className="text-white" />
                </motion.div>
                
                {/* Floating Elements */}
                <FloatingIcon Icon={Zap} color="text-electric" delay={0} pos="top-[-20%] left-[-10%]" />
                <FloatingIcon Icon={Rocket} color="text-purple-400" delay={1} pos="bottom-[-10%] right-[-5%]" />
                <FloatingIcon Icon={Target} color="text-emerald-400" delay={2} pos="top-[10%] right-[-15%]" />
              </div>
            </div>
          </motion.div>
          
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-electric/20 blur-[100px] rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}

function FloatingIcon({ Icon, color, delay, pos }) {
  return (
    <motion.div
      animate={{ 
        y: [0, -20, 0],
        rotate: [0, 10, -10, 0]
      }}
      transition={{ duration: 3, delay, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute ${pos} bg-slate-900/80 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-md`}
    >
      <Icon size={24} className={color} />
    </motion.div>
  );
}

export default FeatureShowcase;
