"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function CTA() {
  return (
    <section className="overflow-hidden relative py-32">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-msn-950/30 to-gray-950" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-msn-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative mx-auto px-4 max-w-4xl text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-6 text-4xl font-bold sm:text-5xl">
            Ready to <span className="gradient-text">Simplify</span>{" "}
            Your&nbsp;Config?
          </h2>
          <p className="mb-10 mx-auto max-w-2xl text-gray-400 text-lg">
            Start writing cleaner, more efficient configuration files today. MSN
            is open source, easy to learn, and ready for production.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/docs"
              className="px-8 py-4 text-white font-semibold text-lg bg-msn-500 rounded-xl transition-colors hover:bg-msn-600"
            >
              Get Started
            </Link>
            <Link
              href="/playground"
              className="px-8 py-4 text-white font-semibold text-lg rounded-xl border-white/10 transition-colors border hover:border-white/20 glass-card"
            >
              Try the Playground
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12"
          >
            <p className="mb-3 text-gray-500 text-sm">Install in seconds</p>
            <code className="inline-block px-6 py-3 text-msn-400 font-mono text-sm bg-white/5 rounded-lg border-white/10 border">
              npm install -g @msn/cli
            </code>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
