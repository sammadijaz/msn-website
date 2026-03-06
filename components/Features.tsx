"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "⚡",
    title: "Token Efficient",
    description:
      "Up to 60% fewer tokens than JSON. Dramatically reduces costs in AI/LLM workflows.",
  },
  {
    icon: "🏗️",
    title: "Unlimited Nesting",
    description:
      "Use dash prefixes for any depth level. No brackets, no braces, just dashes.",
  },
  {
    icon: "🔧",
    title: "Simple Parsing",
    description:
      "Line-by-line parsing with zero ambiguity. Count dashes, read values, done.",
  },
  {
    icon: "🔄",
    title: "JSON Compatible",
    description:
      "Every MSN file compiles to valid JSON. Use MSN anywhere JSON is accepted.",
  },
  {
    icon: "📖",
    title: "Open Source",
    description:
      "MIT licensed with a full ecosystem: parser, CLI, validator, formatter, VS Code extension.",
  },
  {
    icon: "🎯",
    title: "Type Inference",
    description:
      "Numbers, booleans, and null are automatically detected. No explicit typing needed.",
  },
];

export function Features() {
  return (
    <section className="relative py-24">
      <div className="mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Built for the <span className="gradient-text">Modern Stack</span>
          </h2>
          <p className="mx-auto max-w-2xl text-gray-400 text-lg">
            Everything you need to work with structured data, optimized for AI
            workflows.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 transition-colors glass-card hover:bg-white/[0.08] group"
            >
              <span className="block mb-4 text-3xl">{feature.icon}</span>
              <h3 className="mb-2 text-lg font-semibold text-white transition-colors group-hover:text-msn-400">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
