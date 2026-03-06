"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/docs", label: "Docs" },
  { href: "/examples", label: "Examples" },
  { href: "/playground", label: "Playground" },
  { href: "/comparison", label: "Compare" },
  { href: "/contribute", label: "Contribute" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="z-50 sticky top-0 bg-gray-950/80 border-b border-white/5 backdrop-blur-xl">
      <div className="mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold gradient-text">MSN</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-gray-400 rounded-lg transition-colors hover:text-white hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://github.com/madsam/msn"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 px-4 py-2 text-sm text-white bg-msn-600 rounded-lg transition-colors hover:bg-msn-500"
            >
              GitHub
            </a>
          </div>

          <button
            className="p-2 text-gray-400 hover:text-white md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="pb-4 space-y-1 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm text-gray-400 rounded-lg hover:text-white hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
