// Public landing page (route "/"). Assembles all the marketing section
// components in order, plus a small app-link banner at the bottom.
import { useAuthStore } from "../store/auth-store";
import Navbar from "../Components/Navbar.jsx";
import Hero from "../Components/Hero.jsx";
import Features from "../Components/Features.jsx";
import HowItWorks from "../Components/HowItWorks.jsx";
import Integrations from "../Components/Integrations.jsx";
import Testimonials from "../Components/Testimonials.jsx";
import CtaBanner from "../Components/CtaBanner.jsx";
import Footer from "../Components/Footer.jsx";

export default function Home() {
  // Check if someone is already logged in so we can show "Go to Dashboard"
  // instead of Login/Register buttons.
  const { user } = useAuthStore();

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
