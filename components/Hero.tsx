"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-msn-950/50 via-gray-950 to-gray-950" />
      <div className="absolute top-0 left-1/2 w-[800px] h-[600px] bg-msn-500/10 rounded-full blur-[128px] -translate-x-1/2" />

      <div className="relative mx-auto px-4 pt-24 pb-20 max-w-7xl text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-msn-400 text-sm bg-msn-500/10 rounded-full border-msn-500/20 border">
            <span className="w-2 h-2 bg-msn-400 rounded-full animate-pulse-glow" />
            Open Source Data Language
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="gradient-text">Mad Sam Notation</span>
          </h1>

          <p className="mx-auto mb-4 max-w-3xl text-xl text-gray-400 sm:text-2xl">
            The most token-efficient structured data format
            <br className="hidden sm:block" />
            for AI and modern applications.
          </p>

          <p className="mx-auto mb-12 max-w-2xl text-base text-gray-500">
            MSN is a hierarchical data language that compiles directly to JSON.
            Up to 60% fewer tokens than JSON — designed for LLM workflows.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/docs"
            className="px-8 py-3 text-white font-medium bg-msn-600 rounded-xl transition-all hover:bg-msn-500 hover:shadow-lg hover:shadow-msn-500/25"
          >
            Get Started
          </Link>
          <Link
            href="/playground"
            className="px-8 py-3 text-white font-medium bg-white/5 border-white/10 rounded-xl transition-all hover:bg-white/10 border"
          >
            Try Playground
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-12 text-sm text-gray-600"
        >
          <code className="px-4 py-2 bg-gray-900 rounded-lg border-gray-800 border">
            npm install @madsn/parser
          </code>
        </motion.div>
      </div>
    </section>
  );
}
