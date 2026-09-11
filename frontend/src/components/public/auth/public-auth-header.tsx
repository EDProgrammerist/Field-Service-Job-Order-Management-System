import { ArrowLeft, Wrench } from "lucide-react";
import { Link } from "react-router";

export function PublicAuthHeader() {
  return (
    <header className="flex min-h-[72px] items-center justify-between gap-4 border-b border-[#dfe8e2]">
      <Link
        className="flex min-h-11 items-center gap-2.5 rounded-md text-[#14221d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7652] focus-visible:ring-offset-4"
        to="/"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#0d7652] text-white">
          <Wrench aria-hidden="true" className="size-5" strokeWidth={2.3} />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-black tracking-tight sm:text-base">
            Field Service
          </span>
          <span className="hidden text-[10px] font-semibold text-[#52635b] sm:block">
            Job Order Management
          </span>
        </span>
      </Link>

      <Link
        className="inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-sm font-bold text-[#405149] transition-colors hover:text-[#0d7652] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7652] focus-visible:ring-offset-4"
        to="/"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        <span className="hidden min-[360px]:inline">Back to homepage</span>
        <span className="min-[360px]:hidden">Home</span>
      </Link>
    </header>
  );
}
