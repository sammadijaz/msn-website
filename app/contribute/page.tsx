"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const areas = [
  {
    title: "Core Parser",
    description:
      "Improve the lexer, parser, and compiler. Add error recovery, source maps, and streaming support.",
    difficulty: "Intermediate",
    tags: ["TypeScript", "Parsing"],
  },
  {
    title: "CLI Tool",
    description:
      "Add new commands, improve error messages, add watch mode, and support config files.",
    difficulty: "Beginner",
    tags: ["Node.js", "CLI"],
  },
  {
    title: "VSCode Extension",
    description:
      "Improve syntax highlighting, add IntelliSense, auto-completion, go-to-definition.",
    difficulty: "Intermediate",
    tags: ["VSCode API", "TextMate"],
  },
  {
    title: "Documentation",
    description: "Write tutorials, improve API docs, add more examples, translate docs.",
    difficulty: "Beginner",
    tags: ["Markdown", "Technical Writing"],
  },
  {
    title: "Playground",
    description:
      "Improve the web playground with better error display, shareable URLs, and themes.",
    difficulty: "Beginner",
    tags: ["React", "Monaco Editor"],
  },
  {
    title: "Language Ports",
    description: "Port the parser to other languages: Python, Rust, Go, Java, C#.",
    difficulty: "Advanced",
    tags: ["Multi-language"],
  },
];

const steps = [
  {
    num: "1",
    title: "Fork the Repository",
    desc: "Fork https://github.com/sammadijaz/msn and clone it locally.",
  },
  {
    num: "2",
    title: "Install Dependencies",
    desc: "Run npm install in the project root to set up the monorepo.",
  },
  {
    num: "3",
    title: "Create a Branch",
    desc: "git checkout -b feature/your-feature-name",
  },
  {
    num: "4",
    title: "Make Your Changes",
    desc: "Write code, add tests, update docs as needed.",
  },
  {
    num: "5",
    title: "Run Tests",
    desc: "npm test to make sure everything passes.",
  },
  {
    num: "6",
    title: "Submit a PR",
    desc: "Push your branch and open a pull request with a clear description.",
  },
];

export default function ContributePage() {
  return (
    <main className="pt-24 pb-16 min-h-screen">
      <div className="mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-4xl font-bold"
        >
          Contribute
        </motion.h1>
        <p className="mb-12 max-w-3xl text-gray-400 text-lg">
          MSN is fully open source under the MIT license. We welcome contributions of all kinds —
          code, documentation, bug reports, and ideas.
        </p>

        {/* How to contribute */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="mb-8 text-2xl font-bold">How to Contribute</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl glass-card"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-8 h-8 text-msn-400 text-sm font-bold bg-msn-500/20 rounded-full">
                    {step.num}
                  </span>
                  <h3 className="font-semibold">{step.title}</h3>
                </div>
                <p className="text-sm text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Areas to contribute */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="mb-8 text-2xl font-bold">Areas to Contribute</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {areas.map((area, i) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-xl glass-card"
              >
                <h3 className="mb-2 text-lg font-semibold">{area.title}</h3>
                <p className="mb-4 text-sm text-gray-400">{area.description}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      area.difficulty === "Beginner"
                        ? "bg-green-500/20 text-green-400"
                        : area.difficulty === "Intermediate"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {area.difficulty}
                  </span>
                  {area.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 text-xs text-gray-400 bg-white/5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Guidelines */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 text-2xl font-bold">Guidelines</h2>
          <div className="p-8 text-gray-300 rounded-xl glass-card space-y-4">
            <ul className="space-y-3 list-disc list-inside">
              <li>
                Write clear commit messages following{" "}
                <strong className="text-white">Conventional&nbsp;Commits</strong>.
              </li>
              <li>
                Add tests for new features. We use <strong className="text-white">Vitest</strong>.
              </li>
              <li>Keep PRs focused — one feature or fix per PR.</li>
              <li>Update documentation when changing public APIs.</li>
              <li>Be kind and respectful in all interactions.</li>
              <li>
                All contributions are under the <strong className="text-white">MIT license</strong>.
              </li>
            </ul>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
