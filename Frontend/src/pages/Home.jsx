// Public landing page (route "/"). Assembles all the marketing section
// components in order, plus a small app-link banner at the bottom.
import Navbar from "../Components/Navbar.jsx";
import Hero from "../Components/Hero.jsx";
import Features from "../Components/Features.jsx";
import HowItWorks from "../Components/HowItWorks.jsx";
import Integrations from "../Components/Integrations.jsx";
import Testimonials from "../Components/Testimonials.jsx";
import CtaBanner from "../Components/CtaBanner.jsx";
import Footer from "../Components/Footer.jsx";

import { useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export default function Home() {
  // Wake the Render backend (free-tier sleeps after inactivity) as soon as
  // the landing page mounts, so it's ready by the time the user signs in.
  useEffect(() => {
    fetch(`${API_BASE}/health`).catch(() => {});
  }, []);

  return (
    <div className="home-shell relative min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <a className="skip-link" href="#main-content">Skip to content</a>
      <main id="main-content" className="relative z-10">
        <Hero />
        <Features />
        <HowItWorks />
        <Integrations />
        <Testimonials />

        <CtaBanner />
        <Footer />
      </main>
    </div>
  );
}
