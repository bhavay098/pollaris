// Site footer: brand, placeholder legal/utility links, and copyright.
export default function Footer() {
  return (
    <footer className="border-t border-white/6 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">P</span>
          </div>
          <span className="text-sm font-bold text-zinc-400">Pollaris</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-zinc-600">
          {["Privacy", "Terms", "Security", "Status", "Docs"].map((link) => (
            <a
              key={link}
              href="#"
              className="hover:text-zinc-400"
            >
              {link}
            </a>
          ))}
        </div>
        <p className="text-xs text-zinc-700">
          © 2025 Pollaris. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
