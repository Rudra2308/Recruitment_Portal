"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function MobileNav({ isOpen }: { isOpen: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center border border-line text-ink"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full border-b border-line bg-white px-5 py-5 shadow-sm">
          <nav className="flex flex-col divide-y divide-line">
            <Link
              href="/jobs"
              onClick={() => setOpen(false)}
              className="py-3.5 text-[15px] font-medium"
            >
              Open positions
            </Link>
            <Link
              href="/departments"
              onClick={() => setOpen(false)}
              className="py-3.5 text-[15px] font-medium"
            >
              Departments
            </Link>
            <Link
              href="/jobs"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex min-h-11 items-center justify-center bg-brand px-5 text-sm font-medium text-white"
            >
              {isOpen ? "View open roles" : "View recruitment status"}
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
