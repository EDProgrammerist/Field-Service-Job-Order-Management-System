import { Wrench } from "lucide-react";
import { Link } from "react-router";

export function PublicFooter() {
  return (
    <footer className="border-t border-[#dfe8e2] bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1240px] gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <a
            className="inline-flex min-h-11 items-center gap-2.5 rounded-md text-[#14221d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7652] focus-visible:ring-offset-4"
            href="#home"
          >
            <span className="flex size-9 items-center justify-center rounded-md bg-[#0d7652] text-white">
              <Wrench aria-hidden="true" className="size-5" />
            </span>
            <span className="font-black">Field Service</span>
          </a>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#607068]">
            Public access for customer service requests and job-order updates.
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-[#405149]"
        >
          <a
            className="inline-flex min-h-11 items-center hover:text-[#0d7652] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7652]"
            href="#about"
          >
            About
          </a>
          <a
            className="inline-flex min-h-11 items-center hover:text-[#0d7652] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7652]"
            href="#services"
          >
            Services
          </a>
          <a
            className="inline-flex min-h-11 items-center hover:text-[#0d7652] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7652]"
            href="#contact"
          >
            Contact
          </a>
          <Link
            className="inline-flex min-h-11 items-center hover:text-[#0d7652] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7652]"
            to="/login"
          >
            Sign In
          </Link>
        </nav>

        <p className="border-t border-[#dfe8e2] pt-6 text-xs text-[#687870] md:col-span-2">
          © {new Date().getFullYear()} Field Service Job Order Management System.
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}
