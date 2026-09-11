import { Wrench } from "lucide-react";
import { Link } from "react-router";

const footerLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-[#dfe8e2] bg-white px-4 py-9 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1180px] gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.9fr_0.7fr]">
        <div>
          <a
            className="inline-flex min-h-11 items-center gap-2.5 rounded-md text-[#14221d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7652] focus-visible:ring-offset-4"
            href="#home"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-[#0d7652] text-white">
              <Wrench aria-hidden="true" className="size-[18px]" strokeWidth={2.3} />
            </span>
            <span className="font-black tracking-[-0.02em]">Field Service</span>
          </a>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#607068]">
            Job order management for customer requests, assignments, and
            recorded service updates.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <p className="text-sm font-black text-[#21352c]">Quick Links</p>
          <div className="mt-2 grid grid-cols-2 gap-x-6">
            {footerLinks.map((item) => (
              <a
                className="inline-flex min-h-11 items-center text-xs font-semibold text-[#52635b] hover:text-[#0d7652] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7652]"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <div>
          <p className="text-sm font-black text-[#21352c]">Account</p>
          <div className="mt-2 flex flex-col">
            <Link
              className="inline-flex min-h-11 items-center text-xs font-semibold text-[#52635b] hover:text-[#0d7652] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7652]"
              to="/login"
            >
              Sign In
            </Link>
            <Link
              className="inline-flex min-h-11 items-center text-xs font-semibold text-[#52635b] hover:text-[#0d7652] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7652]"
              to="/customer/register"
            >
              Create Customer Account
            </Link>
          </div>
        </div>

        <p className="border-t border-[#dfe8e2] pt-5 text-xs text-[#687870] sm:col-span-2 lg:col-span-3">
          © {new Date().getFullYear()} Field Service Job Order Management System.
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}
