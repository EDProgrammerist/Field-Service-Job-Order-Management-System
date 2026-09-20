import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router";

interface AuralisPublicHeaderProps {
  action?: "sign-in" | "register";
}

const navigationItems = [
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Contact", href: "/#contact" },
];

export function AuralisPublicHeader({
  action = "sign-in",
}: AuralisPublicHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const actionPath = action === "register" ? "/customer/register" : "/login";
  const actionLabel = action === "register" ? "Create account" : "Sign in";

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header
      className="auralis-enter auralis-enter--header relative z-20 flex items-center justify-between gap-3 py-7"
      style={{ animationDelay: "100ms" }}
    >
      <Link
        className="inline-flex items-center text-lg font-medium uppercase tracking-tight text-[#111827] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4f46e5]"
        to="/"
      >
        Field Service
        <span className="ml-0.5 text-xl leading-none text-[#4f46e5]">°</span>
      </Link>

      <nav
        aria-label="Public navigation"
        className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex"
      >
        {navigationItems.map((item) => (
          <a
            className="whitespace-nowrap text-sm font-medium text-[#4b5563] transition-colors hover:text-[#111827] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4f46e5]"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Link
          className="hidden rounded-full border border-white/80 bg-white/85 px-3 py-2 text-sm font-medium text-[#111827] shadow-sm backdrop-blur-md transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4f46e5] sm:inline-flex"
          to={actionPath}
        >
          {actionLabel}
        </Link>

        <button
          aria-controls="public-mobile-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          className="inline-flex size-10 items-center justify-center rounded-full border border-white/80 bg-white/85 text-[#111827] shadow-sm backdrop-blur-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4f46e5] lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
        </button>
      </div>

      <nav
        aria-label="Mobile public navigation"
        className={`absolute inset-x-0 top-full rounded-2xl border border-indigo-100 bg-white/95 p-3 shadow-xl shadow-indigo-950/10 backdrop-blur-xl lg:hidden ${
          menuOpen ? "block" : "hidden"
        }`}
        id="public-mobile-navigation"
      >
        {navigationItems.map((item) => (
          <a
            className="block rounded-xl px-4 py-3 text-sm font-medium text-[#374151] hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-[#4f46e5]"
            href={item.href}
            key={item.href}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <Link
          className="block rounded-xl px-4 py-3 text-sm font-medium text-[#4338ca] hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-[#4f46e5] sm:hidden"
          onClick={() => setMenuOpen(false)}
          to={actionPath}
        >
          {actionLabel}
        </Link>
      </nav>
    </header>
  );
}