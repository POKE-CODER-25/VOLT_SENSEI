import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Physics Sensei", to: "/learn?subject=physics" },
  { label: "Maths Sensei", to: "/learn?subject=maths" },
  { label: "Chemistry Sensei", to: "/learn?subject=chemistry" },
  { label: "Battle Ground", to: "/quiz" },
  { label: "XP Level", to: "/dashboard" },
];

const navLinkClass = ({ isActive, search }) => {
  // Simple check since NavLink might not fully match search params exactly
  // but react-router-dom handles it or we can just let it style natively
  return `rounded-2xl px-3 py-2 text-[13px] font-black transition duration-300 ${
    isActive && !search
      ? "bg-electric/15 text-electric shadow-[0_0_22px_rgba(0,245,255,0.22)] ring-1 ring-electric/30"
      : "text-slate-300 hover:bg-electric/10 hover:text-electric"
  }`;
};

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();

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
          <span className="text-xl font-black tracking-wide md:text-2xl cursor-default">
            VOLT <span className="glow-text text-electric">SENSEI</span>
          </span>
        </div>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.to} end={item.to === "/"} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {currentUser ? (
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-white transition hover:border-electric hover:text-electric"
            >
              <LogOut size={16} />
              Logout
            </button>
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
            <div className="premium-surface mx-auto mt-4 grid max-w-[1400px] gap-2 rounded-3xl p-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to === "/"}
                  className={navLinkClass}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-black text-white"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="premium-button rounded-2xl bg-gradient-to-br from-primary to-amber-300 px-4 py-3 text-center text-sm font-black text-slate-950"
                  >
                    Join Free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Navbar;
