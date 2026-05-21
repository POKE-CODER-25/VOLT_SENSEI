import HeroSection from "../components/home/HeroSection";
import SubjectCards from "../components/home/SubjectCards";
import FormulaeSection from "../components/home/FormulaeSection";
import ChemistryVisualSection from "../components/home/ChemistryVisualSection";
import ModelSection from "../components/home/ModelSection";
import MathsVisualSection from "../components/home/MathsVisualSection";
import FeatureShowcase from "../components/home/FeatureShowcase";
import QuickAccess from "../components/home/QuickAccess";
import CreatorSection from "../components/home/CreatorSection";

function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 pb-20 overflow-x-hidden selection:bg-electric/30">
      <HeroSection />
      
      {/* Dynamic Section Blending */}
      <div className="relative z-10 space-y-12 md:space-y-24">
        <div className="relative">
          <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
          <SubjectCards />
        </div>

        <FormulaeSection />

        <div className="relative">
          <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
          <ChemistryVisualSection />
          <div className="absolute inset-x-0 -bottom-24 h-48 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none" />
        </div>

        <ModelSection />

        <div className="relative">
          <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
          <MathsVisualSection />
          <div className="absolute inset-x-0 -bottom-24 h-48 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none" />
        </div>

        <FeatureShowcase />

        <QuickAccess />

        <CreatorSection />
      </div>

      {/* Decorative ambient glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-electric/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}

export default Home;