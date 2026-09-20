import { Link } from "react-router";

const footerLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

export function PublicFooter() {
  return (
    <footer className="relative z-[2] border-t border-indigo-100 bg-white/95 px-6 py-12 sm:px-8 md:px-12 lg:px-16">
      <div className="mx-auto grid w-full max-w-[88rem] gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Link
            className="inline-flex items-center text-lg font-medium uppercase tracking-tight text-[#111827] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4f46e5]"
            to="/"
          >
            Field Service
            <span className="ml-0.5 text-xl leading-none text-[#4f46e5]">
              °
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#4b5563]">
            One connected place for customer requests, technician choice,
            scheduling, and recorded repair progress.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="text-sm font-medium text-[#111827]">Explore</h2>
          <div className="mt-3 flex flex-col items-start">
            {footerLinks.map((item) => (
              <a
                className="inline-flex min-h-10 items-center text-sm text-[#4b5563] hover:text-[#4338ca] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <div>
          <h2 className="text-sm font-medium text-[#111827]">Account</h2>
          <div className="mt-3 flex flex-col items-start">
            <Link
              className="inline-flex min-h-10 items-center text-sm text-[#4b5563] hover:text-[#4338ca] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]"
              to="/login"
            >
              Sign in
            </Link>
            <Link
              className="inline-flex min-h-10 items-center text-sm text-[#4b5563] hover:text-[#4338ca] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5]"
              to="/customer/register"
            >
              Create Customer Account
            </Link>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-12 w-full max-w-[88rem] border-t border-indigo-100 pt-6 text-xs text-[#4b5563]">
        © {new Date().getFullYear()} Field Service Job Order Management System.
        All rights reserved.
      </p>
    </footer>
  );
}