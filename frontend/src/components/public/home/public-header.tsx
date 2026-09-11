import { useEffect, useState } from "react";
import { Menu, Wrench, X } from "lucide-react";
import { Link } from "react-router";

import { navigationItems } from "@/components/public/home/homepage-content";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e3ebe6] bg-white">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <a
          className="flex min-h-11 items-center gap-2 rounded-md text-[#14221d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7652] focus-visible:ring-offset-4"
          href="#home"
          onClick={closeMenu}
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-[#0d7652] text-white">
            <Wrench aria-hidden="true" className="size-[18px]" strokeWidth={2.4} />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-black tracking-[-0.02em]">
              Field Service
            </span>
            <span className="hidden text-[9px] font-semibold text-[#52635b] sm:block">
              Job Order Management
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-6 lg:flex">
          {navigationItems.map((item) => (
            <a
              className="inline-flex min-h-11 items-center text-xs font-bold text-[#405149] transition-colors hover:text-[#0d7652] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7652] focus-visible:ring-offset-4"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Button
            className="h-10 rounded-md border-[#71847a] px-4 text-xs font-extrabold text-[#21352c] hover:bg-[#f1f7f3]"
            nativeButton={false}
            render={<Link to="/login" />}
            variant="outline"
          >
            Sign In
          </Button>
          <Button
            className="h-10 rounded-md bg-[#0d7652] px-4 text-xs font-extrabold text-white hover:bg-[#095f42]"
            nativeButton={false}
            render={<Link to="/customer/register" />}
          >
            Sign Up
          </Button>
        </div>

        <Button
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="h-11 gap-2 rounded-md border-[#71847a] px-3 text-xs font-extrabold text-[#21352c] hover:bg-[#f1f7f3] lg:hidden"
          onClick={() => setIsMenuOpen((current) => !current)}
          type="button"
          variant="outline"
        >
          {isMenuOpen ? (
            <X aria-hidden="true" className="size-4" />
          ) : (
            <Menu aria-hidden="true" className="size-4" />
          )}
          {isMenuOpen ? "Close" : "Menu"}
        </Button>
      </nav>

      {isMenuOpen ? (
        <div
          className="border-t border-[#dfe8e2] bg-white px-4 pb-5 pt-3 shadow-[0_12px_24px_rgba(20,34,29,0.08)] lg:hidden"
          id="mobile-navigation"
        >
          <div className="mx-auto flex max-w-[1180px] flex-col">
            {navigationItems.map((item) => (
              <a
                className="flex min-h-11 items-center rounded-md px-3 text-sm font-bold text-[#31463c] hover:bg-[#eef7f1] hover:text-[#0d7652] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7652]"
                href={item.href}
                key={item.href}
                onClick={closeMenu}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 grid gap-3 border-t border-[#dfe8e2] pt-4 min-[420px]:grid-cols-2">
              <Button
                className="h-11 border-[#71847a] font-bold"
                nativeButton={false}
                render={<Link onClick={closeMenu} to="/login" />}
                variant="outline"
              >
                Sign In
              </Button>
              <Button
                className="h-11 bg-[#0d7652] font-bold text-white hover:bg-[#095f42]"
                nativeButton={false}
                render={<Link onClick={closeMenu} to="/customer/register" />}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
