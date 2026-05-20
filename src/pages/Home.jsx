import HeroSection from "../components/home/HeroSection";
import SubjectCards from "../components/home/SubjectCards";
import ModelSection from "../components/home/ModelSection";
import QuickAccess from "../components/home/QuickAccess";

function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <HeroSection />
      <div className="relative z-10 bg-slate-50 dark:bg-slate-950">
        <SubjectCards />
        <ModelSection />
        <QuickAccess />
      </div>
    </div>
  );
}

export default Home;