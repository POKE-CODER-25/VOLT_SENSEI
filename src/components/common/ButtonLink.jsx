import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const variants = {
  primary:
    "premium-button bg-gradient-to-br from-primary via-yellow-300 to-amber-300 text-slate-950 hover:-translate-y-0.5 hover:shadow-[0_0_42px_rgba(255,217,61,0.48)]",
  ghost:
    "border border-electric/60 bg-electric/10 text-slate-900 shadow-[0_16px_34px_rgba(0,245,255,0.14)] hover:-translate-y-0.5 hover:bg-electric hover:text-slate-950 dark:text-electric",
};

function ButtonLink({ children, to, variant = "primary", icon = true }) {
  return (
    <Link
      to={to}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition duration-300 ${variants[variant]}`}
    >
      {children}
      {icon && <ArrowRight size={17} />}
    </Link>
  );
}

export default ButtonLink;
