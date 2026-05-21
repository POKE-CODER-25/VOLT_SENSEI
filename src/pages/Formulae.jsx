import { motion, AnimatePresence } from "framer-motion";
import { Atom, Calculator, Cpu, Sparkles, BookOpen, Search, Filter, ChevronRight, Loader2, Info, Zap } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import PageHeader from "../components/common/PageHeader";
import { askVoltSensei } from "../services/groq";

const PHYSICS_FORMULAE = [
  {
    id: "p1",
    name: "Newton's Second Law",
    formula: "F = ma",
    variables: "F: Force (N), m: Mass (kg), a: Acceleration (m/s²)",
    explanation: "The force acting on an object is equal to the mass of that object times its acceleration.",
    usage: "Used in Mechanics to calculate motion and forces.",
    relevance: "Fundamental for almost all JEE Mechanics problems."
  },
  {
    id: "p2",
    name: "Coulomb's Law",
    formula: "F = k(q₁q₂/r²)",
    variables: "F: Force (N), k: Coulomb's constant, q: Charges (C), r: Distance (m)",
    explanation: "Calculates the electrostatic force of attraction or repulsion between two point charges.",
    usage: "Electrostatics, point charge interactions.",
    relevance: "High weightage in JEE Electrostatics section."
  },
  {
    id: "p3",
    name: "Ohm's Law",
    formula: "V = IR",
    variables: "V: Voltage (V), I: Current (A), R: Resistance (Ω)",
    explanation: "The current through a conductor between two points is directly proportional to the voltage across the two points.",
    usage: "Circuit analysis, DC circuits.",
    relevance: "Base of Current Electricity topics in JEE."
  },
  {
    id: "p4",
    name: "Kinetic Energy",
    formula: "K = ½mv²",
    variables: "K: Kinetic Energy (J), m: Mass (kg), v: Velocity (m/s)",
    explanation: "Energy possessed by an object due to its motion.",
    usage: "Work-Energy theorem, collisions.",
    relevance: "Essential for Work, Power & Energy unit."
  },
  {
    id: "p5",
    name: "De Broglie Wavelength",
    formula: "λ = h/p",
    variables: "λ: Wavelength, h: Planck's constant, p: Momentum",
    explanation: "Relates the wave-like properties of matter to its momentum.",
    usage: "Modern Physics, Dual nature of matter.",
    relevance: "Critical for JEE Modern Physics questions."
  },
  {
    id: "p6",
    name: "Einstein's Mass-Energy",
    formula: "E = mc²",
    variables: "E: Energy, m: Mass, c: Speed of light",
    explanation: "States that mass and energy are interchangeable.",
    usage: "Nuclear physics, binding energy.",
    relevance: "Conceptual base for Nuclear Physics."
  },
  {
    id: "p7",
    name: "Universal Gravitation",
    formula: "F = G(m₁m₂/r²)",
    variables: "F: Gravitational Force, G: Gravitational Constant, m: Masses, r: Distance",
    explanation: "Attractive force between any two objects with mass.",
    usage: "Planetary motion, satellite mechanics.",
    relevance: "Key formula for Gravitation chapter."
  },
  {
    id: "p8",
    name: "Bernoulli's Equation",
    formula: "P + ½ρv² + ρgh = constant",
    variables: "P: Pressure, ρ: Density, v: Velocity, g: gravity, h: height",
    explanation: "Conservation of energy principle for flowing fluids.",
    usage: "Fluid dynamics, lift in wings, venturi meter.",
    relevance: "Vital for JEE Fluid Mechanics."
  },
  {
    id: "p9",
    name: "Centripetal Force",
    formula: "F = mv²/r",
    variables: "F: Force, m: Mass, v: Velocity, r: Radius",
    explanation: "Force required to keep an object moving in a curved path.",
    usage: "Circular motion, banking of roads.",
    relevance: "Frequent in Circular Motion and Rotational Dynamics."
  },
  {
    id: "p10",
    name: "Lens Maker's Formula",
    formula: "1/f = (μ-1)(1/R₁ - 1/R₂)",
    variables: "f: Focal length, μ: Refractive index, R: Radii of curvature",
    explanation: "Relates focal length of a lens to its physical properties.",
    usage: "Ray optics, lens design.",
    relevance: "Core formula for Optics in JEE Advanced."
  },
  {
    id: "p11",
    name: "Lorentz Force",
    formula: "F = q(E + v × B)",
    variables: "F: Force, q: Charge, E: Electric Field, v: Velocity, B: Magnetic Field",
    explanation: "Total force on a point charge due to electric and magnetic fields.",
    usage: "Electromagnetism, particle accelerators.",
    relevance: "Used in Magnetic Effects of Current."
  },
  {
    id: "p12",
    name: "Capacitance",
    formula: "C = Q/V",
    variables: "C: Capacitance, Q: Charge, V: Potential difference",
    explanation: "Ratio of the change in electric charge of a system to the corresponding change in its electric potential.",
    usage: "Capacitors, energy storage.",
    relevance: "High weightage in JEE Main & Advanced."
  }
];

const MATHS_FORMULAE = [
  {
    id: "m1",
    name: "Quadratic Formula",
    formula: "x = [-b ± √(b² - 4ac)] / 2a",
    variables: "a, b, c: Coefficients of ax² + bx + c = 0",
    explanation: "Provides the roots of a quadratic equation. The discriminant (D = b² - 4ac) determines the nature of roots.",
    usage: "Finding zeros of functions, solving parabolic equations.",
    relevance: "Fundamental for Algebra and Coordinate Geometry in JEE.",
    graph: "Corresponds to the x-intercepts of the parabola y = ax² + bx + c."
  },
  {
    id: "m2",
    name: "Euler's Identity",
    formula: "e^(iπ) + 1 = 0",
    variables: "e: Base of natural log, i: Imaginary unit, π: Pi",
    explanation: "Connects five fundamental mathematical constants in a single equation.",
    usage: "Complex numbers, rotation in the complex plane.",
    relevance: "Key for Complex Numbers and De Moivre's Theorem.",
    graph: "Represents a rotation of 180° on the unit circle in the Argand plane."
  },
  {
    id: "m3",
    name: "Derivative of sin(x)",
    formula: "d/dx [sin(x)] = cos(x)",
    variables: "x: Angle in radians",
    explanation: "The rate of change of the sine function at any point is the value of the cosine function.",
    usage: "Calculus, finding slopes of trigonometric curves.",
    relevance: "Essential for JEE Differentiation and Integration chapters.",
    graph: "The slope of sin(x) at any point equals the y-value of cos(x) at that same point."
  },
  {
    id: "m4",
    name: "Pythagorean Identity",
    formula: "sin²θ + cos²θ = 1",
    variables: "θ: Angle",
    explanation: "The most fundamental identity in trigonometry, derived from the unit circle.",
    usage: "Simplifying trig expressions, solving triangles.",
    relevance: "Must-know for Trigonometry and Calculus.",
    graph: "Defines the locus of a unit circle x² + y² = 1 where x=cosθ, y=sinθ."
  },
  {
    id: "m5",
    name: "General Term of AP",
    formula: "aₙ = a + (n-1)d",
    variables: "a: First term, n: Term number, d: Common difference",
    explanation: "Calculates the value of any term in an Arithmetic Progression.",
    usage: "Sequences and Series analysis.",
    relevance: "Core of JEE Algebra section.",
    graph: "Points (n, aₙ) lie on a straight line with slope 'd'."
  },
  {
    id: "m6",
    name: "Distance Formula",
    formula: "d = √[(x₂-x₁)² + (y₂-y₁)²]",
    variables: "x, y: Coordinates of two points",
    explanation: "Calculates the straight-line distance between two points in a 2D plane.",
    usage: "Coordinate geometry, finding lengths of segments.",
    relevance: "Used in almost every Coordinate Geometry problem.",
    graph: "The length of the hypotenuse of a right-angled triangle formed by the points."
  },
  {
    id: "m7",
    name: "Product Rule",
    formula: "(uv)' = u'v + uv'",
    variables: "u, v: Differentiable functions of x",
    explanation: "Rule for differentiating the product of two functions.",
    usage: "Differential calculus.",
    relevance: "Basic building block for JEE Advanced Calculus.",
    graph: "Used to find slopes of curves defined by function products."
  },
  {
    id: "m8",
    name: "Equation of a Circle",
    formula: "(x-h)² + (y-k)² = r²",
    variables: "(h,k): Center, r: Radius",
    explanation: "Standard form equation for a circle in the Cartesian plane.",
    usage: "Conic sections, geometry.",
    relevance: "High weightage in JEE Main/Advanced coordinate geometry.",
    graph: "The set of all points at distance 'r' from the fixed point (h,k)."
  },
  {
    id: "m9",
    name: "Bayes' Theorem",
    formula: "P(A|B) = [P(B|A)P(A)] / P(B)",
    variables: "P(A|B): Conditional probability",
    explanation: "Relates the conditional and marginal probabilities of random events.",
    usage: "Probability and Statistics.",
    relevance: "Critical for high-level JEE Probability questions.",
    graph: "Often visualized using Tree Diagrams or Venn Diagrams."
  },
  {
    id: "m10",
    name: "Integration of 1/x",
    formula: "∫ (1/x) dx = ln|x| + C",
    variables: "ln: Natural logarithm, C: Integration constant",
    explanation: "The integral of the reciprocal function results in a logarithmic function.",
    usage: "Integral calculus, area under hyperbola.",
    relevance: "Standard integral used across JEE Maths.",
    graph: "The area under the curve y=1/x from 1 to 'a' equals ln(a)."
  }
];

const CHEMISTRY_FORMULAE = [
  {
    id: "c1",
    name: "Ideal Gas Equation",
    formula: "PV = nRT",
    variables: "P: Pressure, V: Volume, n: Moles, R: Gas Constant, T: Temperature",
    explanation: "Describes the behavior of a hypothetical ideal gas under varying conditions.",
    usage: "Gaseous state, thermodynamics.",
    relevance: "High weightage in Physical Chemistry for JEE Main."
  },
  {
    id: "c2",
    name: "Gibbs Free Energy",
    formula: "ΔG = ΔH - TΔS",
    variables: "ΔG: Gibbs Energy, ΔH: Enthalpy change, T: Temp (K), ΔS: Entropy change",
    explanation: "Determines the spontaneity of a chemical reaction at constant pressure and temperature.",
    usage: "Chemical thermodynamics, equilibrium.",
    relevance: "Crucial for predicting reaction direction in JEE Advanced."
  },
  {
    id: "c3",
    name: "Nernst Equation",
    formula: "E = E° - (RT/nF) ln Q",
    variables: "E: Cell potential, E°: Standard potential, Q: Reaction quotient",
    explanation: "Relates the reduction potential of an electrochemical cell to the standard electrode potential.",
    usage: "Electrochemistry, calculating cell EMF.",
    relevance: "Extremely important for high-scoring Electrochemistry problems."
  }
];

const PERIODIC_TABLE_DATA = [
  { n: 1, s: "H", name: "Hydrogen", v: "1", info: "Most abundant element in the universe. Key in fuels and acid-base chemistry." },
  { n: 2, s: "He", name: "Helium", v: "0", info: "Inert noble gas. Lowest boiling point of any element." },
  { n: 3, s: "Li", name: "Lithium", v: "1", info: "Lightest metal. Essential for modern battery technology." },
  { n: 4, s: "Be", name: "Beryllium", v: "2", info: "Amphoteric oxide. Diagonal relationship with Aluminum." },
  { n: 5, s: "B", name: "Boron", v: "3", info: "Metalloid. Used in heat-resistant borosilicate glass." },
  { n: 6, s: "C", name: "Carbon", v: "4", info: "Basis of organic chemistry. Forms versatile covalent bonds." },
  { n: 7, s: "N", name: "Nitrogen", v: "3, 5", info: "78% of Earth's atmosphere. Crucial for biological molecules." },
  { n: 8, s: "O", name: "Oxygen", v: "2", info: "Highly reactive non-metal. Essential for combustion and life." },
  { n: 9, s: "F", name: "Fluorine", v: "1", info: "Most electronegative element. Extremely reactive oxidizer." },
  { n: 10, s: "Ne", name: "Neon", v: "0", info: "Noble gas with distinct reddish-orange glow in discharge tubes." },
  { n: 11, s: "Na", name: "Sodium", v: "1", info: "Soft, highly reactive alkali metal. Forms ionic salt (NaCl)." },
  { n: 12, s: "Mg", name: "Magnesium", v: "2", info: "Alkaline earth metal. Essential for photosynthesis (Chlorophyll)." },
  { n: 13, s: "Al", name: "Aluminum", v: "3", info: "Passivates in air. Most abundant metal in Earth's crust." },
  { n: 14, s: "Si", name: "Silicon", v: "4", info: "Semiconductor. Basis of the electronics industry." },
  { n: 15, s: "P", name: "Phosphorus", v: "3, 5", info: "Exists in allotropes (White, Red, Black). Found in DNA/ATP." },
  { n: 16, s: "S", name: "Sulfur", v: "2, 4, 6", info: "Forms S8 rings. Crucial for vulcanized rubber and acids." },
  { n: 17, s: "Cl", name: "Chlorine", v: "1", info: "Strong disinfectant. Key component of hydrochloric acid." },
  { n: 18, s: "Ar", name: "Argon", v: "0", info: "Third most abundant atmospheric gas. Used in welding shields." },
  { n: 19, s: "K", name: "Potassium", v: "1", info: "Highly reactive metal. Key for cellular nerve function." },
  { n: 20, s: "Ca", name: "Calcium", v: "2", info: "Main component of bones and limestone (CaCO3)." },
];

function PeriodicTable({ onSelect }) {
  return (
    <div className="mb-12 overflow-x-auto pb-4">
      <div className="flex gap-2 min-w-max">
        {PERIODIC_TABLE_DATA.map((el) => (
          <button
            key={el.n}
            onClick={() => onSelect(el)}
            className="w-14 h-16 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col items-center justify-center transition-all hover:bg-white/10 hover:border-teal-500/50 hover:scale-105 active:scale-95"
          >
            <span className="text-[8px] font-bold text-slate-500">{el.n}</span>
            <span className="text-xl font-black text-white">{el.s}</span>
            <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">{el.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const SUBJECT_CONFIG = {
  physics: {
    id: "physics",
    title: "Physics Formulae",
    icon: Cpu,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    gradient: "from-cyan-500/20 to-blue-500/20",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.15)]",
    description: "Laws of motion, electromagnetism, and quantum mechanics.",
    data: PHYSICS_FORMULAE
  },
  maths: {
    id: "maths",
    title: "Maths Formulae",
    icon: Calculator,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    gradient: "from-pink-500/20 to-rose-500/20",
    glow: "shadow-[0_0_30px_rgba(236,72,153,0.15)]",
    description: "Calculus, algebra, geometry, and trigonometry.",
    data: MATHS_FORMULAE
  },
  chemistry: {
    id: "chemistry",
    title: "Chemistry Formulae",
    icon: Atom,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    gradient: "from-teal-500/20 to-emerald-500/20",
    glow: "shadow-[0_0_30px_rgba(20,184,166,0.15)]",
    description: "Stoichiometry, organic reactions, and thermodynamics.",
    data: CHEMISTRY_FORMULAE
  },
};

function Formulae() {
  const [activeSubject, setActiveSubject] = useState("physics");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiGeneratedFormula, setAiGeneratedFormula] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const config = SUBJECT_CONFIG[activeSubject];

  const filteredFormulae = useMemo(() => {
    if (!searchQuery.trim()) return config.data;
    return config.data.filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.formula.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [config.data, searchQuery]);

  const handleAiSearch = async () => {
    if (!searchQuery.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setAiGeneratedFormula(null);

    try {
      let subjectPrompt = "";
      if (activeSubject === "physics") {
        subjectPrompt = "Focus on the physical law, formula, and a clear breakdown of variables/units.";
      } else if (activeSubject === "maths") {
        subjectPrompt = "Focus on the equation and its geometric/graphical significance (e.g., what the slope or area represents).";
      } else if (activeSubject === "chemistry") {
        subjectPrompt = "Focus on the molecular formula or chemical reaction equation. Explain the structure or stoichiometry.";
      }

      const prompt = `You are an elite JEE mentor. Generate a detailed educational JSON for the ${activeSubject} query: "${searchQuery}". 
      ${subjectPrompt}
      Response format:
      {
        "name": "Full Name",
        "formula": "The main formula/equation/reaction",
        "detailTitle": "${activeSubject === 'physics' ? 'Variables' : activeSubject === 'maths' ? 'Graph Meaning' : 'Molecular Structure'}",
        "detailContent": "Detailed breakdown related to the title",
        "explanation": "Simple 1-2 sentence core concept",
        "usage": "Where it is applied in JEE",
        "relevance": "JEE exam importance and tips"
      }
      ONLY return JSON.`;

      const response = await askVoltSensei(prompt);
      const cleanJson = response.replace(/```json|```/g, "").trim();
      const data = JSON.parse(cleanJson);
      
      setAiGeneratedFormula({ ...data, id: `ai-${Date.now()}`, isAi: true });
    } catch (err) {
      console.error("AI Generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20 overflow-x-hidden">
      <PageHeader
        title="Formulae with Fun"
        subtitle="Master JEE equations through interactive visualization and logical breakdowns."
        icon={<Sparkles size={24} className="text-electric" />}
      />

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Subject Switcher */}
        <div className="mb-12 flex flex-wrap gap-4 justify-center">
          {Object.values(SUBJECT_CONFIG).map((sub) => {
            const Icon = sub.icon;
            const isActive = activeSubject === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  setActiveSubject(sub.id);
                  setAiGeneratedFormula(null);
                  setSearchQuery("");
                  setSelectedElement(null);
                }}
                className={`relative group flex items-center gap-3 px-8 py-4 rounded-2xl border transition-all duration-300 ${
                  isActive 
                    ? `${sub.border} ${sub.bg} ${sub.glow} border-white/20` 
                    : "border-white/5 bg-white/[0.02] hover:bg-white/5"
                }`}
              >
                <Icon size={20} className={isActive ? sub.color : "text-slate-500"} />
                <span className={`text-sm font-black uppercase tracking-widest ${isActive ? "text-white" : "text-slate-400"}`}>
                  {sub.id}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeSubject"
                    className={`absolute -bottom-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Periodic Table Area */}
        {activeSubject === "chemistry" && (
          <div className="mb-12">
            <div className="px-2 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Interactive Elements (1-20)</div>
            <PeriodicTable onSelect={setSelectedElement} />
            <AnimatePresence>
               {selectedElement && (
                 <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-[2rem] border border-teal-500/20 bg-teal-500/5 p-8 mb-12 relative overflow-hidden"
                 >
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <span className="text-[120px] font-black">{selectedElement.s}</span>
                   </div>
                   <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/10">
                        <span className="text-[10px] font-black uppercase text-slate-500 mb-2">Symbol</span>
                        <span className="text-4xl font-black text-white">{selectedElement.s}</span>
                        <span className="text-xs font-bold text-teal-400 mt-2">{selectedElement.name}</span>
                      </div>
                      <div className="md:col-span-3 space-y-6">
                        <div className="flex flex-wrap gap-4">
                           <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                              <span className="text-[8px] font-black text-slate-500 uppercase mr-2">Atomic Number:</span>
                              <span className="text-sm font-black text-white">{selectedElement.n}</span>
                           </div>
                           <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                              <span className="text-[8px] font-black text-slate-500 uppercase mr-2">Valency:</span>
                              <span className="text-sm font-black text-white">{selectedElement.v}</span>
                           </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 flex items-center gap-2">
                            <Info size={12} /> Important JEE Info
                          </h4>
                          <p className="text-sm font-medium text-slate-300 leading-relaxed max-w-2xl">{selectedElement.info}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedElement(null)}
                          className="text-[10px] font-black uppercase text-slate-600 hover:text-white transition-colors"
                        >
                          Close Details
                        </button>
                      </div>
                   </div>
                 </motion.div>
               )}
            </AnimatePresence>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
            <input
              type="text"
              placeholder={`Search ${config.title}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && filteredFormulae.length === 0 && handleAiSearch()}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-white/20 transition-all"
            />
          </div>
          {filteredFormulae.length === 0 && searchQuery && (
             <button 
              onClick={handleAiSearch}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-electric/10 border border-electric/30 text-electric text-sm font-black hover:bg-electric/20 transition-all disabled:opacity-50"
             >
               {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
               <span>AI Generate</span>
             </button>
          )}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 gap-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSubject}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Subject Hero Card */}
              <div className={`relative overflow-hidden rounded-[2.5rem] border ${config.border} bg-slate-900/40 p-8 md:p-12 backdrop-blur-3xl`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-20`} />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 ${config.glow}`}>
                    <config.icon size={40} className={config.color} />
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{config.title}</h2>
                    <p className="text-slate-400 font-medium max-w-xl">{config.description}</p>
                  </div>
                  <div className="flex-1" />
                  <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Total</p>
                      <p className="text-xl font-black text-white">{config.data.length}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Status</p>
                      <p className="text-xl font-black text-white">Live</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Result */}
              {aiGeneratedFormula && (
                <div className="mb-12">
                   <div className="flex items-center gap-2 mb-4 px-2">
                     <Sparkles size={16} className="text-electric" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Generated Result</span>
                   </div>
                   <FormulaCard formula={aiGeneratedFormula} theme={config.color} border={config.border} subject={activeSubject} />
                </div>
              )}

              {/* Formula Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFormulae.map((f) => (
                  <FormulaCard key={f.id} formula={f} theme={config.color} border={config.border} subject={activeSubject} />
                ))}
              </div>

              {filteredFormulae.length === 0 && !aiGeneratedFormula && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-6 rounded-full bg-white/5 p-8">
                    <BookOpen size={48} className="text-slate-700" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">No Formulae Found</h3>
                  <p className="text-slate-500 max-w-sm">
                    We couldn't find that in our database. Try the AI Generate button!
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function FormulaCard({ formula, theme, border, subject }) {
  const isAi = formula.isAi;
  
  // Logic for detail title and content
  let detailTitle = "Variables";
  let detailContent = formula.variables;

  if (isAi && formula.detailTitle) {
    detailTitle = formula.detailTitle;
    detailContent = formula.detailContent;
  } else {
    // Default fallback for subject-specific local data
    if (subject === "maths" || formula.graph) {
      detailTitle = "Graph Meaning";
      detailContent = formula.graph || formula.variables;
    } else if (subject === "chemistry") {
      detailTitle = "Molecular Structure";
      detailContent = formula.variables;
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04] hover:border-white/20 h-full flex flex-col`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-white group-hover:text-electric transition-colors line-clamp-1">{formula.name}</h3>
        {isAi && <div className="rounded-full bg-electric/20 px-2 py-0.5 text-[8px] font-black text-electric ring-1 ring-electric/30">AI</div>}
      </div>

      <div className="mb-6 rounded-2xl bg-black/40 p-5 text-center border border-white/5 shadow-inner min-h-[100px] flex items-center justify-center">
        <p className={`text-xl md:text-2xl font-black tracking-wider ${theme} break-words line-clamp-2`}>{formula.formula}</p>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1 flex items-center gap-1.5">
            <Info size={10} /> {detailTitle}
          </p>
          <p className="text-xs font-medium text-slate-300 leading-relaxed line-clamp-3">{detailContent}</p>
        </div>

        <div>
          <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Explanation</p>
          <p className="text-xs font-medium text-slate-400 leading-relaxed line-clamp-3">{formula.explanation}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 mt-6 space-y-3">
        <div className="flex items-start gap-3">
           <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-700 shrink-0" />
           <p className="text-[11px] font-bold text-slate-400 leading-tight">
             <span className="text-white">Usage:</span> {formula.usage}
           </p>
        </div>
        <div className="flex items-start gap-3">
           <div className={`mt-1.5 h-1.5 w-1.5 rounded-full bg-current ${theme} shrink-0`} />
           <p className="text-[11px] font-bold text-slate-400 leading-tight">
             <span className="text-white uppercase text-[9px] tracking-widest">JEE Relevance:</span> {formula.relevance}
           </p>
        </div>
      </div>
    </motion.div>
  );
}

export default Formulae;
