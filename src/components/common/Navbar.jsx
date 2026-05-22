import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Menu, X, Zap, Cpu, Calculator, Atom } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const senseis = [
  { label: "Physics Sensei", to: "/learn?subject=physics", icon: Cpu, color: "text-electric" },
  { label: "Maths Sensei", to: "/learn?subject=maths", icon: Calculator, color: "text-purple-400" },
  { label: "Chemistry Sensei", to: "/learn?subject=chemistry", icon: Atom, color: "text-emerald-400" },
];

const models = [
  { label: "Physics Models", to: "/models/physics", icon: Cpu, color: "text-electric" },
  { label: "Maths Models", to: "/models/maths", icon: Calculator, color: "text-purple-400" },
  { label: "Chemistry Models", to: "/models/chemistry", icon: Atom, color: "text-emerald-400" },
];

const navLinkClass = ({ isActive }) => {
  return `rounded-2xl px-4 py-2 text-[13px] font-black transition duration-300 flex items-center gap-2 ${
    isActive
      ? "bg-electric/15 text-electric shadow-[0_0_22px_rgba(0,245,255,0.22)] ring-1 ring-electric/30"
      : "text-slate-300 hover:bg-white/5 hover:text-white"
  }`;
};

function SenseiDropdown({ isMobile, closeMobileMenu }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const location = useLocation();

  const isSenseiActive = location.pathname === "/learn";

  const handleMouseEnter = () => {
    if (isMobile) return;
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  if (isMobile) {
    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[13px] font-black transition ${
            isSenseiActive ? "text-electric" : "text-slate-300"
          }`}
        >
          Senseis
          <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-col gap-1 pl-4 overflow-hidden"
            >
              {senseis.map((sensei) => (
                <Link
                  key={sensei.label}
                  to={sensei.to}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-400 hover:text-white"
                >
                  <sensei.icon size={16} className={sensei.color} />
                  {sensei.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        className={`flex items-center gap-1 rounded-2xl px-4 py-2 text-[13px] font-black transition duration-300 ${
          isSenseiActive
            ? "bg-electric/15 text-electric shadow-[0_0_22px_rgba(0,245,255,0.22)] ring-1 ring-electric/30"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`}
      >
        Senseis
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-56 rounded-[1.5rem] border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl z-[100]"
          >
            {senseis.map((sensei) => (
              <Link
                key={sensei.label}
                to={sensei.to}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/5`}>
                  <sensei.icon size={16} className={sensei.color} />
                </div>
                {sensei.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModelsDropdown({ isMobile, closeMobileMenu }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const location = useLocation();

  const isModelsActive = location.pathname.startsWith("/models");

  const handleMouseEnter = () => {
    if (isMobile) return;
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  if (isMobile) {
    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[13px] font-black transition ${
            isModelsActive ? "text-electric" : "text-slate-300"
          }`}
        >
          3D Models
          <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-col gap-1 pl-4 overflow-hidden"
            >
              {models.map((model) => (
                <Link
                  key={model.label}
                  to={model.to}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-400 hover:text-white"
                >
                  <model.icon size={16} className={model.color} />
                  {model.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        className={`flex items-center gap-1 rounded-2xl px-4 py-2 text-[13px] font-black transition duration-300 ${
          isModelsActive
            ? "bg-electric/15 text-electric shadow-[0_0_22px_rgba(0,245,255,0.22)] ring-1 ring-electric/30"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`}
      >
        3D Models
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-56 rounded-[1.5rem] border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl z-[100]"
          >
            {models.map((model) => (
              <Link
                key={model.label}
                to={model.to}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/5`}>
                  <model.icon size={16} className={model.color} />
                </div>
                {model.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, profile, logout } = useAuth();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    if (isOpen) setIsOpen(false);
  }, [location.pathname]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55 }}
      className="sticky top-0 z-50 px-4 py-3 md:px-8"
    >
      <nav className="premium-surface mx-auto flex max-w-[1400px] items-center justify-between rounded-[1.35rem] px-4 py-2.5 shadow-[0_18px_65px_rgba(15,23,42,0.13)]">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-electric/30 bg-electric/10 text-electric shadow-[0_0_18px_rgba(0,245,255,0.28)]">
            <Zap size={22} fill="currentColor" />
          </span>
          <span className="text-xl font-black tracking-wide md:text-2xl cursor-default select-none">
            VOLT <span className="glow-text text-electric">SENSEI</span>
          </span>
        </div>

        <div className="hidden items-center gap-1 lg:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <SenseiDropdown isMobile={false} />
          <ModelsDropdown isMobile={false} />
          <NavLink to="/quiz" className={navLinkClass}>
            Battle Ground
          </NavLink>
          <NavLink to="/formulae" className={navLinkClass}>
            Formulae
          </NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>
            XP Level
          </NavLink>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-400">
                {profile?.name || currentUser.displayName || "Student"}
              </span>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-white transition hover:border-electric hover:text-electric"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:border-electric hover:text-electric"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="premium-button rounded-2xl bg-gradient-to-br from-primary to-amber-300 px-4 py-2.5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
              >
                Join Free
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 shadow-sm"
            aria-label="Open navigation"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden lg:hidden"
          >
            <div className="premium-surface mx-auto mt-4 flex flex-col gap-1 rounded-3xl p-3">
              <NavLink to="/" end className={navLinkClass} onClick={() => setIsOpen(false)}>
                Home
              </NavLink>
              <SenseiDropdown isMobile={true} closeMobileMenu={() => setIsOpen(false)} />
              <ModelsDropdown isMobile={true} closeMobileMenu={() => setIsOpen(false)} />
              <NavLink to="/quiz" className={navLinkClass} onClick={() => setIsOpen(false)}>
                Battle Ground
              </NavLink>
              <NavLink to="/formulae" className={navLinkClass} onClick={() => setIsOpen(false)}>
                Formulae
              </NavLink>
              <NavLink to="/dashboard" className={navLinkClass} onClick={() => setIsOpen(false)}>
                XP Level
              </NavLink>

              <div className="mt-4 flex flex-col gap-2 border-t border-white/5 pt-4">
                {currentUser ? (
                  <div className="flex flex-col gap-2">
                    <div className="px-4 py-2 text-center text-sm font-bold text-slate-400">
                      {profile?.name || currentUser.displayName || "Student"}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-black text-white"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-black text-white"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="premium-button flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-amber-300 py-4 text-sm font-black text-slate-950"
                    >
                      Join Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Navbar;