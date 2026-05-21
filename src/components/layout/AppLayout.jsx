import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";
import ParticleBackground from "../visuals/ParticleBackground";

function AppLayout() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-darkbg text-white">
      <ParticleBackground />
      {!isFullscreen && <Navbar />}
      <main className={`relative flex-1 ${isFullscreen ? "z-[100]" : "z-10"}`}>
        <Outlet context={{ isFullscreen, setIsFullscreen }} />
      </main>
    </div>
  );
}

export default AppLayout;
