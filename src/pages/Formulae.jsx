import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Atom, Calculator, Cpu, Sparkles, BookOpen, Search, Loader2, Info, Zap, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import PageHeader from "../components/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import { saveCustomFormula, getCustomFormulae } from "../services/firestore";
import { askVoltSensei } from "../services/groq";
import { intelligentSearch } from "../services/search";

const PHYSICS_FORMULAE = [
  { id: "p1", name: "Newton's Second Law", formula: "F = ma", variables: "F: Force (N), m: Mass (kg), a: Acceleration (m/s²)", explanation: "The force acting on an object is equal to the mass of that object times its acceleration.", derivation: "Derived from the rate of change of momentum: F = dp/dt.", usage: "Used in Mechanics to calculate motion and forces.", relevance: "Fundamental for almost all JEE Mechanics problems.", trick: "Always draw a Free Body Diagram (FBD) before applying F=ma." },
  { id: "p2", name: "Coulomb's Law", formula: "F = k(q₁q₂/r²)", variables: "F: Force (N), k: Coulomb's constant, q: Charges (C), r: Distance (m)", explanation: "Calculates the electrostatic force of attraction or repulsion between two point charges.", derivation: "Empirical law based on experimental observations by Charles-Augustin de Coulomb.", usage: "Electrostatics, point charge interactions.", relevance: "High weightage in JEE Electrostatics section.", trick: "Remember the inverse square law; doubling distance reduces force by 4x." },
  { id: "p3", name: "Ohm's Law", formula: "V = IR", variables: "V: Voltage (V), I: Current (A), R: Resistance (Ω)", explanation: "The current through a conductor between two points is directly proportional to the voltage across the two points.", derivation: "Derived from the drift velocity of electrons in a conductor.", usage: "Circuit analysis, DC circuits.", relevance: "Base of Current Electricity topics in JEE.", trick: "V-I graph for ohmic conductors is a straight line passing through origin." },
  { id: "p4", name: "Kinetic Energy", formula: "K = ½mv²", variables: "K: Kinetic Energy (J), m: Mass (kg), v: Velocity (m/s)", explanation: "Energy possessed by an object due to its motion.", derivation: "Derived from work-energy theorem: W = ∫ F dx.", usage: "Work-Energy theorem, collisions.", relevance: "Essential for Work, Power & Energy unit.", trick: "KE is always positive regardless of the direction of velocity." },
  { id: "p5", name: "De Broglie Wavelength", formula: "λ = h/p", variables: "λ: Wavelength, h: Planck's constant, p: Momentum", explanation: "Relates the wave-like properties of matter to its momentum.", derivation: "Hypothesized by extending Einstein's relation E=pc to matter waves.", usage: "Modern Physics, Dual nature of matter.", relevance: "Critical for JEE Modern Physics questions.", trick: "For electrons, λ ≈ √(150/V) Å where V is the accelerating potential." },
  { id: "p6", name: "Einstein's Mass-Energy", formula: "E = mc²", variables: "E: Energy, m: Mass, c: Speed of light", explanation: "States that mass and energy are interchangeable.", derivation: "Derived from the principles of Special Relativity.", usage: "Nuclear physics, binding energy.", relevance: "Conceptual base for Nuclear Physics.", trick: "1 amu of mass equals 931.5 MeV of energy." },
  { id: "p7", name: "Universal Gravitation", formula: "F = G(m₁m₂/r²)", variables: "F: Gravitational Force, G: Gravitational Constant, m: Masses, r: Distance", explanation: "Attractive force between any two objects with mass.", derivation: "Newton's law based on Kepler's third law of planetary motion.", usage: "Planetary motion, satellite mechanics.", relevance: "Key formula for Gravitation chapter.", trick: "Gravitational force is independent of the medium between the masses." },
  { id: "p8", name: "Bernoulli's Equation", formula: "P + ½ρv² + ρgh = constant", variables: "P: Pressure, ρ: Density, v: Velocity, g: gravity, h: height", explanation: "Conservation of energy principle for flowing fluids.", derivation: "Derived from work-energy theorem for ideal fluid flow.", usage: "Fluid dynamics, lift in wings, venturi meter.", relevance: "Vital for JEE Fluid Mechanics.", trick: "Valid only for incompressible, non-viscous, irrotational, steady flow." },
  { id: "p9", name: "Centripetal Force", formula: "F = mv²/r", variables: "F: Force, m: Mass, v: Velocity, r: Radius", explanation: "Force required to keep an object moving in a curved path.", derivation: "Derived from centripetal acceleration a = v²/r.", usage: "Circular motion, banking of roads.", relevance: "Frequent in Circular Motion and Rotational Dynamics.", trick: "Centripetal force is not a 'new' force; it's provided by tension, friction, etc." },
  { id: "p10", name: "Lens Maker's Formula", formula: "1/f = (μ-1)(1/R₁ - 1/R₂)", variables: "f: Focal length, μ: Refractive index, R: Radii of curvature", explanation: "Relates focal length of a lens to its physical properties.", derivation: "Derived using the refraction formula for two spherical surfaces.", usage: "Ray optics, lens design.", relevance: "Core formula for Optics in JEE Advanced.", trick: "Follow the Cartesian sign convention strictly for R₁ and R₂." },
  { id: "p11", name: "Lorentz Force", formula: "F = q(E + v × B)", variables: "F: Force, q: Charge, E: Electric Field, v: Velocity, B: Magnetic Field", explanation: "Total force on a point charge due to electric and magnetic fields.", derivation: "Combined effect of electric (qE) and magnetic (qvB sinθ) forces.", usage: "Electromagnetism, particle accelerators.", relevance: "Used in Magnetic Effects of Current.", trick: "The magnetic part of the force does zero work as it's always perpendicular to velocity." },
  { id: "p12", name: "Capacitance", formula: "C = Q/V", variables: "C: Capacitance, Q: Charge, V: Potential difference", explanation: "Ratio of the change in electric charge of a system to the corresponding change in its electric potential.", derivation: "Derived from the geometry of conductors and Gauss's Law.", usage: "Capacitors, energy storage.", relevance: "High weightage in JEE Main & Advanced.", trick: "Capacitance depends only on the geometry and the medium, not on Q or V." }
];

const MATHS_FORMULAE = [
  { id: "m1", name: "Quadratic Formula", formula: "x = [-b ± √(b² - 4ac)] / 2a", variables: "a, b, c: Coefficients of ax² + bx + c = 0", explanation: "Provides the roots of a quadratic equation. The discriminant (D = b² - 4ac) determines the nature of roots.", derivation: "Derived by completing the square on the general quadratic equation ax² + bx + c = 0.", usage: "Finding zeros of functions, solving parabolic equations.", relevance: "Fundamental for Algebra and Coordinate Geometry in JEE.", trick: "If a+b+c=0, the roots are always 1 and c/a.", graph: "Corresponds to the x-intercepts of the parabola y = ax² + bx + c." },
  { id: "m2", name: "Euler's Identity", formula: "e^(iπ) + 1 = 0", variables: "e: Base of natural log, i: Imaginary unit, π: Pi", explanation: "Connects five fundamental mathematical constants in a single equation.", derivation: "A special case of Euler's formula e^(ix) = cos(x) + i sin(x) where x = π.", usage: "Complex numbers, rotation in the complex plane.", relevance: "Key for Complex Numbers and De Moivre's Theorem.", trick: "Use it to simplify expressions involving complex powers of 'e'.", graph: "Represents a rotation of 180° on the unit circle in the Argand plane." },
  { id: "m3", name: "Derivative of sin(x)", formula: "d/dx [sin(x)] = cos(x)", variables: "x: Angle in radians", explanation: "The rate of change of the sine function at any point is the value of the cosine function.", derivation: "Derived using the first principle of derivatives: lim(h→0) [sin(x+h) - sin(x)] / h.", usage: "Calculus, finding slopes of trigonometric curves.", relevance: "Essential for JEE Differentiation and Integration chapters.", trick: "Derivative of 'co-' functions (cos, cot, cosec) always starts with a minus sign.", graph: "The slope of sin(x) at any point equals the y-value of cos(x) at that same point." },
  { id: "m4", name: "Pythagorean Identity", formula: "sin²θ + cos²θ = 1", variables: "θ: Angle", explanation: "The most fundamental identity in trigonometry, derived from the unit circle.", derivation: "Derived from the Pythagorean theorem a² + b² = c² applied to a unit circle.", usage: "Simplifying trig expressions, solving triangles.", relevance: "Must-know for Trigonometry and Calculus.", trick: "Divide by cos²θ to get 1 + tan²θ = sec²θ.", graph: "Defines the locus of a unit circle x² + y² = 1 where x=cosθ, y=sinθ." },
  { id: "m5", name: "General Term of AP", formula: "aₙ = a + (n-1)d", variables: "a: First term, n: Term number, d: Common difference", explanation: "Calculates the value of any term in an Arithmetic Progression.", derivation: "Derived by observing the pattern: a₁=a, a₂=a+d, a₃=a+2d...", usage: "Sequences and Series analysis.", relevance: "Core of JEE Algebra section.", trick: "If three terms are in AP, take them as (a-d), a, (a+d) to simplify calculations.", graph: "Points (n, aₙ) lie on a straight line with slope 'd'." },
  { id: "m6", name: "Distance Formula", formula: "d = √[(x₂-x₁)² + (y₂-y₁)²]", variables: "x, y: Coordinates of two points", explanation: "Calculates the straight-line distance between two points in a 2D plane.", derivation: "A direct application of the Pythagorean theorem in the Cartesian plane.", usage: "Coordinate geometry, finding lengths of segments.", relevance: "Used in almost every Coordinate Geometry problem.", trick: "Always check if the distance is along an axis to avoid lengthy calculations.", graph: "The length of the hypotenuse of a right-angled triangle formed by the points." },
  { id: "m7", name: "Product Rule", formula: "(uv)' = u'v + uv'", variables: "u, v: Differentiable functions of x", explanation: "Rule for differentiating the product of two functions.", derivation: "Derived from the limit definition of the derivative for the product f(x)g(x).", usage: "Differential calculus.", relevance: "Basic building block for JEE Advanced Calculus.", trick: "Think of it as: (1st derivative × 2nd) + (1st × 2nd derivative).", graph: "Used to find slopes of curves defined by function products." },
  { id: "m8", name: "Equation of a Circle", formula: "(x-h)² + (y-k)² = r²", variables: "(h,k): Center, r: Radius", explanation: "Standard form equation for a circle in the Cartesian plane.", derivation: "Derived using the distance formula from the center (h,k) to any point (x,y) on the circle.", usage: "Conic sections, geometry.", relevance: "High weightage in JEE Main/Advanced coordinate geometry.", trick: "General form x² + y² + 2gx + 2fy + c = 0 has center (-g, -f) and radius √(g²+f²-c).", graph: "The set of all points at distance 'r' from the fixed point (h,k)." },
  { id: "m9", name: "Bayes' Theorem", formula: "P(A|B) = [P(B|A)P(A)] / P(B)", variables: "P(A|B): Conditional probability", explanation: "Relates the conditional and marginal probabilities of random events.", derivation: "Derived from the definition of conditional probability: P(A∩B) = P(A|B)P(B) = P(B|A)P(A).", usage: "Probability and Statistics.", relevance: "Critical for high-level JEE Probability questions.", trick: "P(B) in the denominator is often calculated using the Theorem of Total Probability.", graph: "Often visualized using Tree Diagrams or Venn Diagrams." },
  { id: "m10", name: "Integration of 1/x", formula: "∫ (1/x) dx = ln|x| + C", variables: "ln: Natural logarithm, C: Integration constant", explanation: "The integral of the reciprocal function results in a logarithmic function.", derivation: "Fundamental result that cannot be derived via the power rule x^n (since n=-1).", usage: "Integral calculus, area under hyperbola.", relevance: "Standard integral used across JEE Maths.", trick: "Don't forget the modulus sign |x| since log is only defined for positive values.", graph: "The area under the curve y=1/x from 1 to 'a' equals ln(a)." }
];

const CHEMISTRY_FORMULAE = [
  { id: "c1", name: "Ideal Gas Equation", formula: "PV = nRT", variables: "P: Pressure, V: Volume, n: Moles, R: Gas Constant, T: Temperature", explanation: "Describes the behavior of a hypothetical ideal gas under varying conditions.", derivation: "Combination of Boyle's, Charles's, and Avogadro's laws.", usage: "Gaseous state, thermodynamics.", relevance: "High weightage in Physical Chemistry for JEE Main.", trick: "Use R = 0.0821 L·atm/(mol·K) for volume in liters and pressure in atm." },
  { id: "c2", name: "Gibbs Free Energy", formula: "ΔG = ΔH - TΔS", variables: "ΔG: Gibbs Energy, ΔH: Enthalpy change, T: Temp (K), ΔS: Entropy change", explanation: "Determines the spontaneity of a chemical reaction at constant pressure and temperature.", derivation: "Derived from the second law of thermodynamics (ΔS_total = ΔS_sys + ΔS_surr).", usage: "Chemical thermodynamics, equilibrium.", relevance: "Crucial for predicting reaction direction in JEE Advanced.", trick: "ΔG < 0 means spontaneous; ΔG > 0 means non-spontaneous." },
  { id: "c3", name: "Nernst Equation", formula: "E = E° - (RT/nF) ln Q", variables: "E: Cell potential, E°: Standard potential, Q: Reaction quotient", explanation: "Relates the reduction potential of an electrochemical cell to the standard electrode potential.", derivation: "Derived from ΔG = ΔG° + RT ln Q and ΔG = -nFE.", usage: "Electrochemistry, calculating cell EMF.", relevance: "Extremely important for high-scoring Electrochemistry problems.", trick: "At 298K, E = E° - (0.0591/n) log Q is the most common form used in JEE." },
  { id: "c4", name: "Sodium Chloride", formula: "NaCl", variables: "Na⁺: Sodium ion, Cl⁻: Chloride ion", explanation: "An ionic compound forming a face-centered cubic lattice. Commonly known as table salt.", derivation: "Formation via ionic bonding between Sodium (metal) and Chlorine (non-metal).", usage: "Solid state chemistry, electrochemistry.", relevance: "Classic example of ionic bonding and crystal lattices.", trick: "Coordination number is 6:6; each Na⁺ is surrounded by 6 Cl⁻." },
  { id: "c5", name: "Glucose", formula: "C₆H₁₂O₆", variables: "C: Carbon, H: Hydrogen, O: Oxygen", explanation: "A simple sugar that is an important energy source in living organisms.", derivation: "Produced in plants via photosynthesis using solar energy.", usage: "Biochemistry, respiration.", relevance: "Fundamental biomolecule in JEE Organic Chemistry.", trick: "Exists as an equilibrium mixture of open-chain and cyclic (pyranose) forms." },
  { id: "c6", name: "Photosynthesis", formula: "6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂", variables: "CO₂: Carbon dioxide, H₂O: Water, C₆H₁₂O₆: Glucose, O₂: Oxygen", explanation: "The process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water.", derivation: "A complex multi-stage redox reaction occurring in chloroplasts.", usage: "Biochemistry, redox reactions.", relevance: "Important application of redox and biological chemistry.", trick: "Water is oxidized to Oxygen; CO₂ is reduced to Glucose." },
  { id: "c7", name: "Haber Process", formula: "N₂ + 3H₂ ⇌ 2NH₃", variables: "N₂: Nitrogen, H₂: Hydrogen, NH₃: Ammonia", explanation: "Industrial production of ammonia using iron catalyst. High pressure and moderate temperature favor the yield.", derivation: "Based on Le Chatelier's Principle for exothermic gas-phase reactions.", usage: "Inorganic chemistry, chemical equilibrium.", relevance: "A classic example of Le Chatelier's principle in JEE.", trick: "High pressure (~200 atm) shifts the equilibrium to the side with fewer gas moles (Ammonia)." },
  { id: "c8", name: "Acetic Acid", formula: "CH₃COOH", variables: "C: Carbon, H: Hydrogen, O: Oxygen", explanation: "A weak organic acid that gives vinegar its sour taste and pungent smell.", derivation: "Derived from oxidation of ethanol or methanol carbonylation.", usage: "Organic synthesis, weak acids.", relevance: "Common weak acid used in ionic equilibrium problems.", trick: "Glacial acetic acid is anhydrous; it forms ice-like crystals at 16.6°C." },
  { id: "c9", name: "Benzene", formula: "C₆H₆", variables: "C: Carbon, H: Hydrogen", explanation: "An aromatic hydrocarbon consisting of a ring of six carbon atoms with alternating double bonds.", derivation: "Derived from coal tar or petroleum reforming; follows Kekulé structure.", usage: "Organic chemistry, aromaticity.", relevance: "Core molecule in JEE Organic Chemistry.", trick: "Hückel's Rule (4n+2 π electrons) explains its exceptional stability." },
  { id: "c10", name: "Sulfuric Acid", formula: "H₂SO₄", variables: "H: Hydrogen, S: Sulfur, O: Oxygen", explanation: "A strong mineral acid with highly corrosive properties, known as the 'king of chemicals'.", derivation: "Produced industrially via the Contact Process (oxidation of SO₂ to SO₃).", usage: "Contact process, dehydrating agent.", relevance: "Crucial reagent in organic and inorganic reactions.", trick: "It is a powerful dehydrating agent; it can char sugar by removing water." },
  { id: "c11", name: "Methane", formula: "CH₄", variables: "C: Carbon, H: Hydrogen", explanation: "The simplest alkane and the main component of natural gas.", derivation: "Formed by anaerobic decomposition of organic matter.", usage: "Fuel, organic synthesis.", relevance: "Basic building block in Organic Chemistry.", trick: "Has a tetrahedral geometry with bond angle of 109.5°." },
  { id: "c12", name: "Ammonia", formula: "NH₃", variables: "N: Nitrogen, H: Hydrogen", explanation: "A colorless gas with a characteristic pungent smell, widely used in fertilizers.", derivation: "Formed via the Haber Process; has a trigonal pyramidal shape.", usage: "Fertilizers, cleaning agents.", relevance: "Key molecule in p-block elements study.", trick: "Acting as a Lewis base due to the lone pair on Nitrogen." },
  { id: "c13", name: "Hydrochloric Acid", formula: "HCl", variables: "H: Hydrogen, Cl: Chlorine", explanation: "A strong, highly corrosive acid used in laboratories and industry.", derivation: "Prepared by dissolving hydrogen chloride gas in water.", usage: "Acid-base titrations, pickling of steel.", relevance: "Primary strong acid for pH calculations.", trick: "Azeotropic mixture with water at 20.2% concentration." },
  { id: "c14", name: "Sodium Hydroxide", formula: "NaOH", variables: "Na: Sodium, O: Oxygen, H: Hydrogen", explanation: "A strong base also known as lye or caustic soda.", derivation: "Produced via the Castner-Kellner or Nelson cell electrolysis of brine.", usage: "Soap making, paper industry.", relevance: "Primary strong base for JEE Ionic Equilibrium.", trick: "Deliquescent solid; it absorbs moisture and CO₂ from the air." },
  { id: "c15", name: "Water", formula: "H₂O", variables: "H: Hydrogen, O: Oxygen", explanation: "The universal solvent, essential for all known forms of life.", derivation: "Formed by combustion of hydrogen or neutralization reactions.", usage: "Solvent, coolant.", relevance: "Hydrogen bonding and anomalous properties are JEE favorites.", trick: "Maximum density occurs at 4°C due to hydrogen bonding." },
  { id: "c16", name: "Rusting of Iron", formula: "4Fe + 3O₂ + 6H₂O → 4Fe(OH)₃", variables: "Fe: Iron, O₂: Oxygen, H₂O: Water", explanation: "The slow oxidation of iron in the presence of air and moisture.", derivation: "An electrochemical process involving anodic and cathodic sites on the metal surface.", usage: "Corrosion studies.", relevance: "Important redox process in Electrochemistry.", trick: "Presence of electrolytes (like NaCl) accelerates the rusting process." },
  { id: "c17", name: "Neutralization", formula: "H⁺ + OH⁻ → H₂O", variables: "H⁺: Hydrogen ion, OH⁻: Hydroxide ion", explanation: "The reaction between an acid and a base to produce water and a salt.", derivation: "Based on the Arrhenius or Brønsted-Lowry acid-base theory.", usage: "Titrations.", relevance: "Foundation of Acid-Base chemistry.", trick: "Enthalpy of neutralization for strong acid-strong base is always -57.3 kJ/mol." },
  { id: "c18", name: "Ethanol", formula: "C₂H₅OH", variables: "C: Carbon, H: Hydrogen, O: Oxygen", explanation: "A clear, colorless liquid and the principle alcohol in alcoholic beverages.", derivation: "Produced by fermentation of sugars or hydration of ethene.", usage: "Solvent, fuel.", relevance: "Important functional group in Organic Chemistry.", trick: "Forms hydrogen bonds, leading to a higher boiling point than isomeric dimethyl ether." }
];

const ELEMENT_CATEGORIES = {
  "alkali": { name: "Alkali Metals", color: "bg-red-500", text: "text-red-400", border: "border-red-500/30", block: "s" },
  "alkaline": { name: "Alkaline Earth", color: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/30", block: "s" },
  "transition": { name: "Transition Metals", color: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/30", block: "d" },
  "post-transition": { name: "Post-transition", color: "bg-indigo-500", text: "text-indigo-400", border: "border-indigo-500/30", block: "p" },
  "metalloid": { name: "Metalloids", color: "bg-cyan-500", text: "text-cyan-400", border: "border-cyan-500/30", block: "p" },
  "nonmetal": { name: "Nonmetals", color: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/30", block: "p" },
  "halogen": { name: "Halogens", color: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/30", block: "p" },
  "noble": { name: "Noble Gases", color: "bg-pink-500", text: "text-pink-400", border: "border-pink-500/30", block: "p" },
  "lanthanide": { name: "Lanthanides", color: "bg-violet-400", text: "text-violet-300", border: "border-violet-400/30", block: "f" },
  "actinide": { name: "Actinides", color: "bg-purple-400", text: "text-purple-300", border: "border-purple-400/30", block: "f" }
};

const ALL_ELEMENTS = [
  { n: 1, s: "H", name: "Hydrogen", cat: "nonmetal", b: "s", r: 1, c: 1, v: "1", m: "1.008", conf: "1s¹", info: "Most abundant element; key in fuels and acid-base chemistry." },
  { n: 2, s: "He", name: "Helium", cat: "noble", b: "s", r: 1, c: 18, v: "0", m: "4.0026", conf: "1s²", info: "Inert gas used in cryogenics and balloons." },
  { n: 3, s: "Li", name: "Lithium", cat: "alkali", b: "s", r: 2, c: 1, v: "1", m: "6.94", conf: "[He] 2s¹", info: "Lightest metal; essential for rechargeable batteries." },
  { n: 4, s: "Be", name: "Beryllium", cat: "alkaline", b: "s", r: 2, c: 2, v: "2", m: "9.0122", conf: "[He] 2s²", info: "Used in aerospace and X-ray windows." },
  { n: 5, s: "B", name: "Boron", cat: "metalloid", b: "p", r: 2, c: 13, v: "3", m: "10.81", conf: "[He] 2s² 2p¹", info: "Key in borosilicate glass and nuclear reactors." },
  { n: 6, s: "C", name: "Carbon", cat: "nonmetal", b: "p", r: 2, c: 14, v: "4", m: "12.011", conf: "[He] 2s² 2p²", info: "Basis of organic chemistry and all known life." },
  { n: 7, s: "N", name: "Nitrogen", cat: "nonmetal", b: "p", r: 2, c: 15, v: "3, 5", m: "14.007", conf: "[He] 2s² 2p³", info: "Vital for fertilizers, explosives, and DNA." },
  { n: 8, s: "O", name: "Oxygen", cat: "nonmetal", b: "p", r: 2, c: 16, v: "2", m: "15.999", conf: "[He] 2s² 2p⁴", info: "Essential for respiration and combustion reactions." },
  { n: 9, s: "F", name: "Fluorine", cat: "halogen", b: "p", r: 2, c: 17, v: "1", m: "18.998", conf: "[He] 2s² 2p⁵", info: "Most electronegative element; highly reactive." },
  { n: 10, s: "Ne", name: "Neon", cat: "noble", b: "p", r: 2, c: 18, v: "0", m: "20.180", conf: "[He] 2s² 2p⁶", info: "Used in advertising signs and high-voltage indicators." },
  { n: 11, s: "Na", name: "Sodium", cat: "alkali", b: "s", r: 3, c: 1, v: "1", m: "22.990", conf: "[Ne] 3s¹", info: "Highly reactive metal; important in table salt (NaCl)." },
  { n: 12, s: "Mg", name: "Magnesium", cat: "alkaline", b: "s", r: 3, c: 2, v: "2", m: "24.305", conf: "[Ne] 3s²", info: "Key component of chlorophyll and lightweight alloys." },
  { n: 13, s: "Al", name: "Aluminum", cat: "post-transition", b: "p", r: 3, c: 13, v: "3", m: "26.982", conf: "[Ne] 3s² 3p¹", info: "Common metal known for its low density and corrosion resistance." },
  { n: 14, s: "Si", name: "Silicon", cat: "metalloid", b: "p", r: 3, c: 14, v: "4", m: "28.085", conf: "[Ne] 3s² 3p²", info: "Semiconductor used in electronics and glass making." },
  { n: 15, s: "P", name: "Phosphorus", cat: "nonmetal", b: "p", r: 3, c: 15, v: "3, 5", m: "30.974", conf: "[Ne] 3s² 3p³", info: "Crucial for life (DNA/ATP); several allotropes." },
  { n: 16, s: "S", name: "Sulfur", cat: "nonmetal", b: "p", r: 3, c: 16, v: "2, 4, 6", m: "32.06", conf: "[Ne] 3s² 3p⁴", info: "Used in matches, and sulfuric acid production." },
  { n: 17, s: "Cl", name: "Chlorine", cat: "halogen", b: "p", r: 3, c: 17, v: "1", m: "35.45", conf: "[Ne] 3s² 3p⁵", info: "Common disinfectant; water purification." },
  { n: 18, s: "Ar", name: "Argon", cat: "noble", b: "p", r: 3, c: 18, v: "0", m: "39.948", conf: "[Ne] 3s² 3p⁶", info: "Used in welding and incandescent light bulbs." },
  { n: 19, s: "K", name: "Potassium", cat: "alkali", b: "s", r: 4, c: 1, v: "1", m: "39.098", conf: "[Ar] 4s¹", info: "Essential mineral for nerve and muscle function." },
  { n: 20, s: "Ca", name: "Calcium", cat: "alkaline", b: "s", r: 4, c: 2, v: "2", m: "40.078", conf: "[Ar] 4s²", info: "Crucial for bones and structural materials." },
  { n: 21, s: "Sc", name: "Scandium", cat: "transition", b: "d", r: 4, c: 3, v: "3", m: "44.956", conf: "[Ar] 3d¹ 4s²", info: "Used in high-strength aluminum alloys." },
  { n: 22, s: "Ti", name: "Titanium", cat: "transition", b: "d", r: 4, c: 4, v: "4", m: "47.867", conf: "[Ar] 3d² 4s²", info: "Strong, lightweight metal used in aerospace." },
  { n: 23, s: "V", name: "Vanadium", cat: "transition", b: "d", r: 4, c: 5, v: "2-5", m: "50.942", conf: "[Ar] 3d³ 4s²", info: "Used in strong, shock-resistant steel alloys." },
  { n: 24, s: "Cr", name: "Chromium", cat: "transition", b: "d", r: 4, c: 6, v: "2, 3, 6", m: "51.996", conf: "[Ar] 3d⁵ 4s¹", info: "Provides corrosion resistance in stainless steel." },
  { n: 25, s: "Mn", name: "Manganese", cat: "transition", b: "d", r: 4, c: 7, v: "2-7", m: "54.938", conf: "[Ar] 3d⁵ 4s²", info: "Important in steel production and biological enzymes." },
  { n: 26, s: "Fe", name: "Iron", cat: "transition", b: "d", r: 4, c: 8, v: "2, 3", m: "55.845", conf: "[Ar] 3d⁶ 4s²", info: "Foundation of infrastructure; core of hemoglobin." },
  { n: 27, s: "Co", name: "Cobalt", cat: "transition", b: "d", r: 4, c: 9, v: "2, 3", m: "58.933", conf: "[Ar] 3d⁷ 4s²", info: "Used in rechargeable batteries and magnets." },
  { n: 28, s: "Ni", name: "Nickel", cat: "transition", b: "d", r: 4, c: 10, v: "2, 3", m: "58.693", conf: "[Ar] 3d⁸ 4s²", info: "Key metal for plating and stainless steel." },
  { n: 29, s: "Cu", name: "Copper", cat: "transition", b: "d", r: 4, c: 11, v: "1, 2", m: "63.546", conf: "[Ar] 3d¹⁰ 4s¹", info: "Excellent electrical conductor used in wiring." },
  { n: 30, s: "Zn", name: "Zinc", cat: "transition", b: "d", r: 4, c: 12, v: "2", m: "65.38", conf: "[Ar] 3d¹⁰ 4s²", info: "Used for galvanizing steel and in brass." },
  { n: 31, s: "Ga", name: "Gallium", cat: "post-transition", b: "p", r: 4, c: 13, v: "3", m: "69.723", conf: "[Ar] 3d¹⁰ 4s² 4p¹", info: "Low melting point; used in semiconductors." },
  { n: 32, s: "Ge", name: "Germanium", cat: "metalloid", b: "p", r: 4, c: 14, v: "4", m: "72.63", conf: "[Ar] 3d¹⁰ 4s² 4p²", info: "Important semiconductor material for early transistors." },
  { n: 33, s: "As", name: "Arsenic", cat: "metalloid", b: "p", r: 4, c: 15, v: "3, 5", m: "74.922", conf: "[Ar] 3d¹⁰ 4s² 4p³", info: "Used in pesticides and semiconductors." },
  { n: 34, s: "Se", name: "Selenium", cat: "nonmetal", b: "p", r: 4, c: 16, v: "2, 4, 6", m: "78.971", conf: "[Ar] 3d¹⁰ 4s² 4p⁴", info: "Used in photocopiers and solar cells." },
  { n: 35, s: "Br", name: "Bromine", cat: "halogen", b: "p", r: 4, c: 17, v: "1", m: "79.904", conf: "[Ar] 3d¹⁰ 4s² 4p⁵", info: "Only non-metallic element liquid at room temp." },
  { n: 36, s: "Kr", name: "Krypton", cat: "noble", b: "p", r: 4, c: 18, v: "0", m: "83.798", conf: "[Ar] 3d¹⁰ 4s² 4p⁶", info: "Used in energy-efficient windows." },
  { n: 37, s: "Rb", name: "Rubidium", cat: "alkali", b: "s", r: 5, c: 1, v: "1", m: "85.468", conf: "[Kr] 5s¹", info: "Used in atomic clocks." },
  { n: 38, s: "Sr", name: "Strontium", cat: "alkaline", b: "s", r: 5, c: 2, v: "2", m: "87.62", conf: "[Kr] 5s²", info: "Used in fireworks for red colors." },
  { n: 39, s: "Y", name: "Yttrium", cat: "transition", b: "d", r: 5, c: 3, v: "3", m: "88.906", conf: "[Kr] 4d¹ 5s²", info: "Used in superconductors." },
  { n: 40, s: "Zr", name: "Zirconium", cat: "transition", b: "d", r: 5, c: 4, v: "4", m: "91.224", conf: "[Kr] 4d² 5s²", info: "Corrosion resistant; nuclear reactors." },
  { n: 41, s: "Nb", name: "Niobium", cat: "transition", b: "d", r: 5, c: 5, v: "3, 5", m: "92.906", conf: "[Kr] 4d⁴ 5s¹", info: "Superconducting magnets." },
  { n: 42, s: "Mo", name: "Molybdenum", cat: "transition", b: "d", r: 5, c: 6, v: "2-6", m: "95.95", conf: "[Kr] 4d⁵ 5s¹", info: "Catalyst and steel alloys." },
  { n: 43, s: "Tc", name: "Technetium", cat: "transition", b: "d", r: 5, c: 7, v: "4, 7", m: "98", conf: "[Kr] 4d⁵ 5s²", info: "First synthetic element." },
  { n: 44, s: "Ru", name: "Ruthenium", cat: "transition", b: "d", r: 5, c: 8, v: "3, 4", m: "101.07", conf: "[Kr] 4d⁷ 5s¹", info: "Catalysis and electronics." },
  { n: 45, s: "Rh", name: "Rhodium", cat: "transition", b: "d", r: 5, c: 9, v: "3", m: "102.91", conf: "[Kr] 4d⁸ 5s¹", info: "Catalytic converters." },
  { n: 46, s: "Pd", name: "Palladium", cat: "transition", b: "d", r: 5, c: 10, v: "2, 4", m: "106.42", conf: "[Kr] 4d¹⁰", info: "Absorbs hydrogen gas." },
  { n: 47, s: "Ag", name: "Silver", cat: "transition", b: "d", r: 5, c: 11, v: "1", m: "107.87", conf: "[Kr] 4d¹⁰ 5s¹", info: "Highest electrical conductivity." },
  { n: 48, s: "Cd", name: "Cadmium", cat: "transition", b: "d", r: 5, c: 12, v: "2", m: "112.41", conf: "[Kr] 4d¹⁰ 5s²", info: "Rechargeable batteries." },
  { n: 49, s: "In", name: "Indium", cat: "post-transition", b: "p", r: 5, c: 13, v: "3", m: "114.82", conf: "[Kr] 4d¹⁰ 5s² 5p¹", info: "LCD screens." },
  { n: 50, s: "Sn", name: "Tin", cat: "post-transition", b: "p", r: 5, c: 14, v: "2, 4", m: "118.71", conf: "[Kr] 4d¹⁰ 5s² 5p²", info: "Bronze and solder." },
  { n: 51, s: "Sb", name: "Antimony", cat: "metalloid", b: "p", r: 5, c: 15, v: "3, 5", m: "121.76", conf: "[Kr] 4d¹⁰ 5s² 5p³", info: "Fire retardants." },
  { n: 52, s: "Te", name: "Tellurium", cat: "metalloid", b: "p", r: 5, c: 16, v: "2, 4, 6", m: "127.60", conf: "[Kr] 4d¹⁰ 5s² 5p⁴", info: "Solar panels." },
  { n: 53, s: "I", name: "Iodine", cat: "halogen", b: "p", r: 5, c: 17, v: "1", m: "126.90", conf: "[Kr] 4d¹⁰ 5s² 5p⁵", info: "Thyroid function." },
  { n: 54, s: "Xe", name: "Xenon", cat: "noble", b: "p", r: 5, c: 18, v: "0", m: "131.29", conf: "[Kr] 4d¹⁰ 5s² 5p⁶", info: "High-intensity flash lamps." },
  { n: 55, s: "Cs", name: "Cesium", cat: "alkali", b: "s", r: 6, c: 1, v: "1", m: "132.91", conf: "[Xe] 6s¹", info: "Atomic clocks." },
  { n: 56, s: "Ba", name: "Barium", cat: "alkaline", b: "s", r: 6, c: 2, v: "2", m: "137.33", conf: "[Xe] 6s²", info: "X-ray imaging." },
  { n: 57, s: "La", name: "Lanthanum", cat: "lanthanide", b: "f", r: 8, c: 3, v: "3", m: "138.91", conf: "[Xe] 5d¹ 6s²", info: "Rare earth metal." },
  { n: 58, s: "Ce", name: "Cerium", cat: "lanthanide", b: "f", r: 8, c: 4, v: "3, 4", m: "140.12", conf: "[Xe] 4f¹ 5d¹ 6s²", info: "Abundant rare earth." },
  { n: 59, s: "Pr", name: "Praseodymium", cat: "lanthanide", b: "f", r: 8, c: 5, v: "3, 4", m: "140.91", conf: "[Xe] 4f³ 6s²", info: "High-power magnets." },
  { n: 60, s: "Nd", name: "Neodymium", cat: "lanthanide", b: "f", r: 8, c: 6, v: "3", m: "144.24", conf: "[Xe] 4f⁴ 6s²", info: "Strong permanent magnets." },
  { n: 61, s: "Pm", name: "Promethium", cat: "lanthanide", b: "f", r: 8, c: 7, v: "3", m: "145", conf: "[Xe] 4f⁵ 6s²", info: "Radioactive rare earth." },
  { n: 62, s: "Sm", name: "Samarium", cat: "lanthanide", b: "f", r: 8, c: 8, v: "2, 3", m: "150.36", conf: "[Xe] 4f⁶ 6s²", info: "Magnets." },
  { n: 63, s: "Eu", name: "Europium", cat: "lanthanide", b: "f", r: 8, c: 9, v: "2, 3", m: "151.96", conf: "[Xe] 4f⁷ 6s²", info: "Reactive rare earth." },
  { n: 64, s: "Gd", name: "Gadolinium", cat: "lanthanide", b: "f", r: 8, c: 10, v: "3", m: "157.25", conf: "[Xe] 4f⁷ 5d¹ 6s²", info: "MRI contrast." },
  { n: 65, s: "Tb", name: "Terbium", cat: "lanthanide", b: "f", r: 8, c: 11, v: "3, 4", m: "158.93", conf: "[Xe] 4f⁹ 6s²", info: "Lighting." },
  { n: 66, s: "Dy", name: "Dysprosium", cat: "lanthanide", b: "f", r: 8, c: 12, v: "3", m: "162.50", conf: "[Xe] 4f¹⁰ 6s²", info: "Data storage." },
  { n: 67, s: "Ho", name: "Holmium", cat: "lanthanide", b: "f", r: 8, c: 13, v: "3", m: "164.93", conf: "[Xe] 4f¹¹ 6s²", info: "High magnetic strength." },
  { n: 68, s: "Er", name: "Erbium", cat: "lanthanide", b: "f", r: 8, c: 14, v: "3", m: "167.26", conf: "[Xe] 4f¹² 6s²", info: "Fiber optics." },
  { n: 69, s: "Tm", name: "Thulium", cat: "lanthanide", b: "f", r: 8, c: 15, v: "3", m: "168.93", conf: "[Xe] 4f¹³ 6s²", info: "Portable X-rays." },
  { n: 70, s: "Yb", name: "Ytterbium", cat: "lanthanide", b: "f", r: 8, c: 16, v: "2, 3", m: "173.05", conf: "[Xe] 4f¹⁴ 6s²", info: "Atomic clocks." },
  { n: 71, s: "Lu", name: "Lutetium", cat: "lanthanide", b: "f", r: 8, c: 17, v: "3", m: "174.97", conf: "[Xe] 4f¹⁴ 5d¹ 6s²", info: "Dense lanthanide." },
  { n: 72, s: "Hf", name: "Hafnium", cat: "transition", b: "d", r: 6, c: 4, v: "4", m: "178.49", conf: "[Xe] 4f¹⁴ 5d² 6s²", info: "Control rods." },
  { n: 73, s: "Ta", name: "Tantalum", cat: "transition", b: "d", r: 6, c: 5, v: "5", m: "180.95", conf: "[Xe] 4f¹⁴ 5d³ 6s²", info: "Corrosion resistant." },
  { n: 74, s: "W", name: "Tungsten", cat: "transition", b: "d", r: 6, c: 6, v: "6", m: "183.84", conf: "[Xe] 4f¹⁴ 5d⁴ 6s²", info: "Highest melting point." },
  { n: 75, s: "Re", name: "Rhenium", cat: "transition", b: "d", r: 6, c: 7, v: "4, 6, 7", m: "186.21", conf: "[Xe] 4f¹⁴ 5d⁵ 6s²", info: "Superalloys." },
  { n: 76, s: "Os", name: "Osmium", cat: "transition", b: "d", r: 6, c: 8, v: "4, 8", m: "190.23", conf: "[Xe] 4f¹⁴ 5d⁶ 6s²", info: "Densest element." },
  { n: 77, s: "Ir", name: "Iridium", cat: "transition", b: "d", r: 6, c: 9, v: "3, 4", m: "192.22", conf: "[Xe] 4f¹⁴ 5d⁷ 6s²", info: "Corrosion resistant." },
  { n: 78, s: "Pt", name: "Platinum", cat: "transition", b: "d", r: 6, c: 10, v: "2, 4", m: "195.08", conf: "[Xe] 4f¹⁴ 5d⁹ 6s¹", info: "Precious catalyst." },
  { n: 79, s: "Au", name: "Gold", cat: "transition", b: "d", r: 6, c: 11, v: "1, 3", m: "196.97", conf: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹", info: "Malleable metal." },
  { n: 80, s: "Hg", name: "Mercury", cat: "transition", b: "d", r: 6, c: 12, v: "1, 2", m: "200.59", conf: "[Xe] 4f¹⁴ 5d¹⁰ 6s²", info: "Liquid metal." },
  { n: 81, s: "Tl", name: "Thallium", cat: "post-transition", b: "p", r: 6, c: 13, v: "1, 3", m: "204.38", conf: "[Xe] 6p¹", info: "Toxic metal." },
  { n: 82, s: "Pb", name: "Lead", cat: "post-transition", b: "p", r: 6, c: 14, v: "2, 4", m: "207.2", conf: "[Xe] 6p²", info: "Batteries." },
  { n: 83, s: "Bi", name: "Bismuth", cat: "post-transition", b: "p", r: 6, c: 15, v: "3, 5", m: "208.98", conf: "[Xe] 6p³", info: "Stable mass metal." },
  { n: 84, s: "Po", name: "Polonium", cat: "metalloid", b: "p", r: 6, c: 16, v: "2, 4", m: "209", conf: "[Xe] 6p⁴", info: "Radioactive." },
  { n: 85, s: "At", name: "Astatine", cat: "halogen", b: "p", r: 6, c: 17, v: "1, 3, 5", m: "210", conf: "[Xe] 6p⁵", info: "Rare element." },
  { n: 86, s: "Rn", name: "Radon", cat: "noble", b: "p", r: 6, c: 18, v: "0", m: "222", conf: "[Xe] 6p⁶", info: "Radioactive gas." },
  { n: 87, s: "Fr", name: "Francium", cat: "alkali", b: "s", r: 7, c: 1, v: "1", m: "223", conf: "[Rn] 7s¹", info: "Extremely rare." },
  { n: 88, s: "Ra", name: "Radium", cat: "alkaline", b: "s", r: 7, c: 2, v: "2", m: "226", conf: "[Rn] 7s²", info: "Luminous paints." },
  { n: 89, s: "Ac", name: "Actinium", cat: "actinide", b: "f", r: 9, c: 3, v: "3", m: "227", conf: "[Rn] 6d¹ 7s²", info: "Alpha source." },
  { n: 90, s: "Th", name: "Thorium", cat: "actinide", b: "f", r: 9, c: 4, v: "4", m: "232.04", conf: "[Rn] 6d² 7s²", info: "Nuclear fuel." },
  { n: 91, s: "Pa", name: "Protactinium", cat: "actinide", b: "f", r: 9, c: 5, v: "4, 5", m: "231.04", conf: "[Rn] 5f² 6d¹ 7s²", info: "Nuclear fuel." },
  { n: 92, s: "U", name: "Uranium", cat: "actinide", b: "f", r: 9, c: 6, v: "4, 6", m: "238.03", conf: "[Rn] 5f³ 6d¹ 7s²", info: "Nuclear fuel." },
  { n: 93, s: "Np", name: "Neptunium", cat: "actinide", b: "f", r: 9, c: 7, v: "3-6", m: "237", conf: "[Rn] 5f⁴ 6d¹ 7s²", info: "Transuranic." },
  { n: 94, s: "Pu", name: "Plutonium", cat: "actinide", b: "f", r: 9, c: 8, v: "3-6", m: "244", conf: "[Rn] 5f⁶ 7s²", info: "Weapons." },
  { n: 95, s: "Am", name: "Americium", cat: "actinide", b: "f", r: 9, c: 9, v: "3-6", m: "243", conf: "[Rn] 5f⁷ 7s²", info: "Smoke detectors." },
  { n: 96, s: "Cm", name: "Curium", cat: "actinide", b: "f", r: 9, c: 10, v: "3", m: "247", conf: "[Rn] 5f⁷ 6d¹ 7s²", info: "Space probes." },
  { n: 97, s: "Bk", name: "Berkelium", cat: "actinide", b: "f", r: 9, c: 11, v: "3, 4", m: "247", conf: "[Rn] 5f⁹ 7s²", info: "UC Berkeley." },
  { n: 98, s: "Cf", name: "Californium", cat: "actinide", b: "f", r: 9, c: 12, v: "2-4", m: "251", conf: "[Rn] 5f¹⁰ 7s²", info: "Neutron emitter." },
  { n: 99, s: "Es", name: "Einsteinium", cat: "actinide", b: "f", r: 9, c: 13, v: "2, 3", m: "252", conf: "[Rn] 5f¹¹ 7s²", info: "H-bomb debris." },
  { n: 100, s: "Fm", name: "Fermium", cat: "actinide", b: "f", r: 9, c: 14, v: "2, 3", m: "257", conf: "[Rn] 5f¹² 7s²", info: "Neutron capture." },
  { n: 101, s: "Md", name: "Mendelevium", cat: "actinide", b: "f", r: 9, c: 15, v: "2, 3", m: "258", conf: "[Rn] 5f¹³ 7s²", info: "Dmitri Mendeleev." },
  { n: 102, s: "No", name: "Nobelium", cat: "actinide", b: "f", r: 9, c: 16, v: "2, 3", m: "259", conf: "[Rn] 5f¹⁴ 7s²", info: "Alfred Nobel." },
  { n: 103, s: "Lr", name: "Lawrencium", cat: "actinide", b: "f", r: 9, c: 17, v: "3", m: "266", conf: "[Rn] 5f¹⁴ 7s² 7p¹", info: "Ernest Lawrence." },
  { n: 104, s: "Rf", name: "Rutherfordium", cat: "transition", b: "d", r: 7, c: 4, v: "4", m: "267", conf: "[Rn] 6d² 7s²", info: "Synthetic." },
  { n: 105, s: "Db", name: "Dubnium", cat: "transition", b: "d", r: 7, c: 5, v: "5", m: "268", conf: "[Rn] 6d³ 7s²", info: "Synthetic." },
  { n: 106, s: "Sg", name: "Seaborgium", cat: "transition", b: "d", r: 7, c: 6, v: "6", m: "269", conf: "[Rn] 6d⁴ 7s²", info: "Synthetic." },
  { n: 107, s: "Bh", name: "Bohrium", cat: "transition", b: "d", r: 7, c: 7, v: "7", m: "270", conf: "[Rn] 6d⁵ 7s²", info: "Synthetic." },
  { n: 108, s: "Hs", name: "Hassium", cat: "transition", b: "d", r: 7, c: 8, v: "8", m: "277", conf: "[Rn] 6d⁶ 7s²", info: "Synthetic." },
  { n: 109, s: "Mt", name: "Meitnerium", cat: "transition", b: "d", r: 7, c: 9, v: "9", m: "278", conf: "[Rn] 6d⁷ 7s²", info: "Synthetic." },
  { n: 110, s: "Ds", name: "Darmstadtium", cat: "transition", b: "d", r: 7, c: 10, v: "10", m: "281", conf: "[Rn] 6d⁸ 7s²", info: "Synthetic." },
  { n: 111, s: "Rg", name: "Roentgenium", cat: "transition", b: "d", r: 7, c: 11, v: "11", m: "282", conf: "[Rn] 6d⁹ 7s²", info: "Synthetic." },
  { n: 112, s: "Cn", name: "Copernicium", cat: "transition", b: "d", r: 7, c: 12, v: "12", m: "285", conf: "[Rn] 6d¹⁰ 7s²", info: "Synthetic." },
  { n: 113, s: "Nh", name: "Nihonium", cat: "post-transition", b: "p", r: 7, c: 13, v: "3", m: "286", conf: "[Rn] 7p¹", info: "Synthetic." },
  { n: 114, s: "Fl", name: "Flerovium", cat: "post-transition", b: "p", r: 7, c: 14, v: "4", m: "289", conf: "[Rn] 7p²", info: "Synthetic." },
  { n: 115, s: "Mc", name: "Moscovium", cat: "post-transition", b: "p", r: 7, c: 15, v: "3, 5", m: "290", conf: "[Rn] 7p³", info: "Synthetic." },
  { n: 116, s: "Lv", name: "Livermorium", cat: "post-transition", b: "p", r: 7, c: 16, v: "2, 4", m: "293", conf: "[Rn] 7p⁴", info: "Synthetic." },
  { n: 117, s: "Ts", name: "Tennessine", cat: "halogen", b: "p", r: 7, c: 17, v: "1, 3, 5", m: "294", conf: "[Rn] 7p⁵", info: "Synthetic." },
  { n: 118, s: "Og", name: "Oganesson", cat: "noble", b: "p", r: 7, c: 18, v: "0", m: "294", conf: "[Rn] 7p⁶", info: "Predicted noble gas." },
];

function PeriodicTable({ onSelect, selectedId }) {
  return (
    <div className="mb-12 -mx-4 md:mx-0 overflow-x-auto custom-scrollbar pb-6 px-4 scroll-smooth">
      <div className="w-max mx-auto grid grid-cols-[repeat(18,40px)] md:grid-cols-[repeat(18,52px)] gap-1 p-2 md:p-3 pt-1 bg-slate-900/40 rounded-[2rem] border border-white/10 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)]">
        {/* Legend in the 'Hole' (Rows 1-3, Columns 4-12) */}
        <div style={{ gridColumn: '4 / 13', gridRow: '1 / 4' }} className="flex flex-col items-center justify-center p-2 self-center">
           <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 max-w-[400px]">
              {Object.entries(ELEMENT_CATEGORIES).map(([key, cat]) => (
                <div key={key} className="flex items-center gap-1.5 group cursor-default">
                   <div className={`h-1.5 w-1.5 rounded-full ${cat.color} group-hover:scale-125 transition-transform`} />
                   <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">{cat.name}</span>
                </div>
              ))}
           </div>
           <div className="mt-4 flex items-center gap-6 px-4 py-1.5 bg-white/[0.03] rounded-lg border border-white/5">
              <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Blocks</span>
              <div className="flex items-center gap-4">
                {['s', 'p', 'd', 'f'].map(block => (
                  <span key={block} className="text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors cursor-default">{block}</span>
                ))}
              </div>
           </div>
        </div>

        {ALL_ELEMENTS.map((el) => {
          const category = ELEMENT_CATEGORIES[el.cat] || ELEMENT_CATEGORIES.transition;
          const isSelected = selectedId === el.n;
          
          return (
            <motion.button
              key={el.n}
              whileHover={{ scale: 1.25, zIndex: 50 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(el)}
              style={{ gridColumn: el.c, gridRow: el.r }}
              className={`relative flex flex-col items-center justify-center h-[40px] md:h-[52px] rounded-md border transition-all duration-300 ${
                isSelected
                  ? `${category.border} ${category.color.replace('bg-', 'bg-opacity-20 ')} ring-1 ring-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]`
                  : `border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]`
              }`}
            >
              <span className="absolute top-0.5 left-1 text-[6px] md:text-[7px] font-black text-slate-500">{el.n}</span>
              <span className={`text-sm md:text-base font-black ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                {el.s}
              </span>
              <span className="hidden md:block text-[5px] font-black text-slate-500 uppercase tracking-tight truncate w-full px-1 text-center leading-none mt-0.5">
                {el.name}
              </span>
              
              {/* Category Indicator Line */}
              <div className={`absolute bottom-0.5 w-5 md:w-6 h-0.5 rounded-full ${category.color} ${isSelected ? 'opacity-100 shadow-[0_0_8px_currentColor]' : 'opacity-40'}`} />

              {/* Selected Glow Halo */}
              {isSelected && (
                <motion.div 
                  layoutId="halo"
                  className={`absolute -inset-1 rounded-lg border-2 ${category.border} opacity-40 blur-[1px]`}
                  initial={false}
                />
              )}
            </motion.button>
          );
        })}
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
  const { currentUser, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const subjectParam = searchParams.get("subject");
  const initialSubject = SUBJECT_CONFIG[subjectParam] ? subjectParam : "physics";
  
  const [activeSubject, setActiveSubject] = useState(initialSubject);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiGeneratedFormula, setAiGeneratedFormula] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [customFormulae, setCustomFormulae] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { success: boolean, message: string }
  const config = SUBJECT_CONFIG[activeSubject];

  // Sync activeSubject with query param
  useEffect(() => {
    if (subjectParam && SUBJECT_CONFIG[subjectParam] && subjectParam !== activeSubject) {
      setActiveSubject(subjectParam);
    }
  }, [subjectParam]);

  const handleSubjectChange = (id) => {
    setActiveSubject(id);
    setSearchParams({ subject: id });
    setAiGeneratedFormula(null);
    setSearchQuery("");
    setSelectedElement(null);
  };

  // Fetch custom formulae
  useEffect(() => {
    if (currentUser) {
      getCustomFormulae(currentUser.uid, activeSubject).then(setCustomFormulae);
    }
  }, [currentUser, activeSubject]);

  const allFormulae = useMemo(() => {
    return [...config.data, ...customFormulae];
  }, [config.data, customFormulae]);

  const { items: filteredFormulae, topConfidence: formulaConfidence, bestMatch: bestFormula, hasExactFullMatch: formulaExactMatch } = useMemo(() => {
    return intelligentSearch(allFormulae, searchQuery, ['name', 'formula']);
  }, [allFormulae, searchQuery]);

  const { bestMatch: bestElement, topConfidence: elementConfidence, hasExactFullMatch: elementExactMatch } = useMemo(() => {
    if (activeSubject !== 'chemistry') return { bestMatch: null, topConfidence: 0, hasExactFullMatch: false };
    return intelligentSearch(ALL_ELEMENTS, searchQuery, ['s', 'name']);
  }, [searchQuery, activeSubject]);

  // Auto-select element or target formula if confidence is high
  useEffect(() => {
    if (searchQuery.trim().length > 0 && activeSubject === "chemistry") {
      // Do not auto-select element if there's an exact formula match or very high formula confidence
      const hasStrongFormulaMatch = formulaExactMatch || (searchQuery.length >= 3 && formulaConfidence > 0.85);
      if (!hasStrongFormulaMatch && (elementExactMatch || (searchQuery.length >= 3 && elementConfidence > 0.75))) {
        if (bestElement) setSelectedElement(bestElement);
      }
    }
  }, [searchQuery, elementConfidence, bestElement, activeSubject, elementExactMatch, formulaExactMatch, formulaConfidence]);

  const handleAiSearch = async () => {
    if (!searchQuery.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setAiGeneratedFormula(null);
    setSaveStatus(null);

    try {
      let subjectPrompt = "";
      let visualPrompt = "";
      
      if (activeSubject === "physics") {
        subjectPrompt = "Focus on the physical law, formula, and a clear breakdown of variables/units with SI units.";
        visualPrompt = "visualUnderstanding: Connect formula to motion/concept";
      } else if (activeSubject === "maths") {
        subjectPrompt = "Focus on the equation, its geometric significance, and any specific conditions (like domain/range).";
        visualPrompt = "visualUnderstanding: Connect equation to graph/geometry";
      } else if (activeSubject === "chemistry") {
        subjectPrompt = "Focus on the molecular formula or chemical reaction equation. Explain the structure, bonding, or stoichiometry.";
        visualPrompt = "visualUnderstanding: Connect formula to reaction/molecule";
      }

      const prompt = `You are an elite JEE mentor. Generate a unique, detailed educational JSON for the ${activeSubject} topic: "${searchQuery}". 
      ${subjectPrompt}
      CRITICAL: Ensure the content is specifically tailored to "${searchQuery}" and not a generic response.
      Include these EXACT fields for the best teaching experience:
      - name: Full Name of the concept
      - formula: The main formula/equation/reaction (use standard text notation)
      - stepByStep: Step-by-step logical explanation of the formula
      - variables: Clear breakdown of variable meanings (comma-separated, format like 'v: Velocity, t: Time')
      - practicalMeaning: The real-world or practical meaning of the formula
      - ${visualPrompt}
      - trick: An easy memory trick or mnemonic
      - jeeExplanation: A JEE-style explanation focusing on exam relevance and common questions
      
      Response format:
      {
        "name": "...",
        "formula": "...",
        "stepByStep": "...",
        "variables": "...",
        "practicalMeaning": "...",
        "visualUnderstanding": "...",
        "trick": "...",
        "jeeExplanation": "..."
      }
      ONLY return raw JSON. No markdown. No preamble.`;

      const response = await askVoltSensei([
        {
          role: "student",
          text: prompt
        }
      ], activeSubject, { max_tokens: 1500, temperature: 0.85 }); // Higher temperature for variety

      const cleanJson = response.replace(/```json|```/g, "").trim();
      const data = JSON.parse(cleanJson);
      
      const newFormula = { ...data, id: `ai-${Date.now()}`, isAi: true };
      setAiGeneratedFormula(newFormula);
      setShowSaveModal(true);
    } catch (err) {
      console.error("AI Generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveFormula = async () => {
    if (!aiGeneratedFormula) return;
    
    if (authLoading) {
      setSaveStatus({ success: false, message: "Checking login..." });
      return;
    }

    if (!currentUser) {
      setSaveStatus({ success: false, message: "Please login to save formula" });
      return;
    }

    const result = await saveCustomFormula(currentUser.uid, aiGeneratedFormula, activeSubject);
    setSaveStatus(result);
    
    if (result.success) {
      // Refresh custom formulae list immediately
      const updated = await getCustomFormulae(currentUser.uid, activeSubject);
      setCustomFormulae(updated);
      // Wait a bit to show success message before closing
      setTimeout(() => {
        setShowSaveModal(false);
        setSaveStatus(null);
      }, 1500);
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
                onClick={() => handleSubjectChange(sub.id)}
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
          <div className="mb-20">
            <div className="flex flex-col md:flex-row items-end justify-between mb-8 px-2 gap-4">
               <div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Periodic Table</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Master the elements for JEE Chemistry</p>
               </div>
               <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-white/10 to-transparent mx-8 mb-4" />
               <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                  <div className="flex flex-col items-end">
                     <span className="text-[8px] font-black text-slate-500 uppercase">Elements</span>
                     <span className="text-sm font-black text-white">118</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="flex flex-col items-end">
                     <span className="text-[8px] font-black text-slate-500 uppercase">Interactive</span>
                     <span className="text-sm font-black text-emerald-400 uppercase">Live</span>
                  </div>
               </div>
            </div>
            <PeriodicTable onSelect={setSelectedElement} selectedId={selectedElement?.n} />
            <AnimatePresence>
               {selectedElement && (
                 <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-8 mb-12 relative overflow-hidden backdrop-blur-3xl"
                 >
                   {/* Background Symbol Watermark */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5">
                      <span className="text-[240px] font-black">{selectedElement.s}</span>
                   </div>

                   <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-12">
                      {/* Atomic Card */}
                      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-3xl border border-white/10 shadow-2xl">
                        <span className="text-[12px] font-black uppercase text-slate-500 mb-2">Atomic Number</span>
                        <span className="text-6xl font-black text-white">{selectedElement.n}</span>
                        <div className={`mt-6 h-px w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent`} />
                        <span className="text-4xl font-black text-white mt-6">{selectedElement.s}</span>
                        <span className={`text-sm font-bold mt-2 ${ELEMENT_CATEGORIES[selectedElement.cat]?.text || 'text-teal-400'}`}>{selectedElement.name}</span>
                      </div>

                      {/* Details Grid */}
                      <div className="lg:col-span-3 space-y-8">
                        <div className="flex flex-wrap gap-4">
                           <DetailChip label="Mass" value={selectedElement.m || "N/A"} />
                           <DetailChip label="Valency" value={selectedElement.v} />
                           <DetailChip label="Block" value={(selectedElement.b || "N/A").toUpperCase()} />
                           <DetailChip label="Category" value={ELEMENT_CATEGORIES[selectedElement.cat]?.name || "N/A"} color={ELEMENT_CATEGORIES[selectedElement.cat]?.text} />
                        </div>
                        
                        <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                           <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2">
                             <Zap size={14} className="text-electric" /> Electron Configuration
                           </h4>
                           <p className="text-xl font-black text-white tracking-widest font-mono">
                             {selectedElement.conf || "Unknown"}
                           </p>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2">
                            <Info size={14} /> JEE Core Concept
                          </h4>
                          <p className="text-sm font-medium text-slate-300 leading-relaxed max-w-3xl">
                            {selectedElement.info}
                          </p>
                        </div>

                        <div className="flex justify-end pt-4">
                          <button 
                            onClick={() => setSelectedElement(null)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all hover:bg-white/10"
                          >
                            <X size={14} /> Close Periodic Details
                          </button>
                        </div>
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
          {!formulaExactMatch && searchQuery.trim().length > 0 && (
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

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative"
            >
              <div className="relative z-10 text-center">
                <div className="mb-6 mx-auto h-16 w-16 rounded-full bg-electric/10 flex items-center justify-center">
                  <Sparkles size={32} className="text-electric" />
                </div>
                
                <h3 className="text-2xl font-black text-white mb-2">Save this formula?</h3>
                <p className="text-slate-400 text-sm mb-8">
                  Would you like to add <span className="text-white font-bold">"{aiGeneratedFormula?.name}"</span> to your personal library for quick access?
                </p>

                {saveStatus ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-8 p-4 rounded-2xl border ${saveStatus.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}
                  >
                    <p className="text-sm font-black uppercase tracking-widest">{saveStatus.message}</p>
                  </motion.div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleSaveFormula}
                      className="w-full py-4 rounded-2xl bg-electric text-slate-950 text-sm font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
                    >
                      Save to Library
                    </button>
                    <button
                      onClick={() => setShowSaveModal(false)}
                      className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Let it go
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailChip({ label, value, color = "text-white" }) {
  return (
    <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col gap-1 min-w-[120px]">
       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
       <span className={`text-lg font-black ${color}`}>{value}</span>
    </div>
  );
}

function FormulaCard({ formula, theme, border, subject }) {
  // Variables processing for highlighting
  const renderVariables = (text) => {
    if (!text) return null;
    return text.split(',').map((v, i) => {
      const parts = v.split(':');
      if (parts.length < 2) return <span key={i} className="block mb-1">{v.trim()}</span>;
      const key = parts[0];
      const rest = parts.slice(1).join(':');
      return (
        <span key={i} className="block mb-1">
          <span className={`font-black ${theme}`}>{key.trim()}</span>: {rest.trim()}
        </span>
      );
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04] hover:border-white/20 h-full flex flex-col`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-white group-hover:text-electric transition-colors line-clamp-1">{formula.name}</h3>
        {formula.isAi && <div className="rounded-full bg-electric/20 px-2 py-0.5 text-[8px] font-black text-electric ring-1 ring-electric/30">AI</div>}
      </div>

      <div className="mb-6 rounded-2xl bg-black/40 p-5 text-center border border-white/5 shadow-inner min-h-[100px] flex items-center justify-center">
        <p className={`text-xl md:text-2xl font-black tracking-wider ${theme} break-words line-clamp-2`}>{formula.formula}</p>
      </div>

      <div className="space-y-5 flex-1">
        {/* Step-by-Step Explanation */}
        <div>
          <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1 flex items-center gap-1.5">
            <Info size={10} /> Step-by-Step Logic
          </p>
          <p className="text-xs font-medium text-slate-300 leading-relaxed">{formula.stepByStep || formula.explanation}</p>
        </div>

        {/* Highlighted Variables */}
        <div className="rounded-xl bg-black/20 p-3 border border-white/5">
          <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2">Variable Breakdown</p>
          <div className="text-[11px] font-medium text-slate-300">
            {renderVariables(formula.variables)}
          </div>
        </div>

        {/* Visual Understanding */}
        {(formula.visualUnderstanding || formula.graph || formula.usage) && (
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1 flex items-center gap-1.5">
              <BookOpen size={10} /> Visual Understanding
            </p>
            <p className="text-xs font-medium text-slate-400 leading-relaxed">{formula.visualUnderstanding || formula.graph || formula.usage}</p>
          </div>
        )}

        {/* Practical Meaning & Derivation */}
        {(formula.practicalMeaning || formula.derivation) && (
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Practical Meaning</p>
            <p className="text-xs font-medium text-slate-400 leading-relaxed">{formula.practicalMeaning || formula.derivation}</p>
          </div>
        )}

        {/* Easy Memory Trick */}
        {formula.trick && (
          <div className="rounded-xl bg-electric/5 border border-electric/10 p-3 mt-4">
            <p className="text-[9px] font-black uppercase text-electric tracking-widest mb-1 flex items-center gap-1.5">
              <Sparkles size={10} /> Memory Trick
            </p>
            <p className="text-[11px] font-bold text-slate-200 leading-relaxed italic">"{formula.trick}"</p>
          </div>
        )}
      </div>

      {/* JEE-Style Explanation / Relevance */}
      <div className="pt-5 border-t border-white/5 mt-6 space-y-3 bg-black/20 -mx-6 -mb-6 p-6 rounded-b-[2rem]">
        <div className="flex items-start gap-3">
           <div className={`mt-1 h-2 w-2 rounded-full bg-current ${theme} shrink-0 shadow-[0_0_10px_currentColor]`} />
           <div>
             <p className="text-[9px] font-black uppercase tracking-widest text-white mb-1">JEE-Style Context</p>
             <p className="text-xs font-bold text-slate-400 leading-relaxed">
               {formula.jeeExplanation || formula.relevance}
             </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Formulae;
