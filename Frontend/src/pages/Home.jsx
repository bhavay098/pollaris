import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../Components/Navbar.jsx";
import Hero from "../Components/Hero.jsx";
import Features from "../Components/Features.jsx";
import HowItWorks from "../Components/HowItWorks.jsx";
import Integrations from "../Components/Integrations.jsx";
import Testimonials from "../Components/Testimonials.jsx";
import CtaBanner from "../Components/CtaBanner.jsx";
import Footer from "../Components/Footer.jsx";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white font-sans">
      <Navbar />

      <main className="relative z-10">
        <Hero />
        <Features />
        <HowItWorks />
        <Integrations />
        <Testimonials />

        <section className="max-w-7xl mx-auto px-6 pb-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-zinc-300 text-sm">
              Build and manage your polls from the app dashboard.
            </p>
            <div className="flex gap-2">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-xl font-semibold text-sm"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl font-semibold text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-xl font-semibold text-sm"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        <CtaBanner />
        <Footer />
      </main>
    </div>
  );
}
