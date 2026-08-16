import { Link } from "react-router-dom";
import AppShell from "../Components/AppShell";

export default function NotFound() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center text-center py-24 md:py-32">
        <div className="w-20 h-20 mb-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          Page not found
        </h1>
        
        <p className="text-zinc-400 max-w-md mx-auto mb-10 text-lg">
          We couldn't find the page you were looking for. It might have been moved or deleted.
        </p>
        
        <div className="flex items-center gap-4">
          <Link to="/" className="btn btn-primary">
            Back to home
          </Link>
          <Link to="/dashboard" className="btn btn-quiet">
            Go to dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
