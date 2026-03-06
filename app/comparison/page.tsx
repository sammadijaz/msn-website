"use client";

import { motion } from "framer-motion";

interface FormatInfo {
  name: string;
  tagColor: string;
  tagBg: string;
  pros: string[];
  cons: string[];
  example: string;
}

const formats: FormatInfo[] = [
  {
    name: "MSN",
    tagColor: "text-msn-400",
    tagBg: "bg-msn-500/20",
    pros: [
      "Fewest tokens/characters of any format",
      "Unlimited nesting via dash counting",
      "No brackets, braces, quotes, or commas needed",
      "Compiles directly to valid JSON",
      "Simple enough to parse with a few regex rules",
      "Comments supported",
    ],
    cons: ["New format — not yet widely adopted", "Tooling ecosystem still growing"],
    example: `- server
-- host: localhost
-- port: 3000
-- features
--- * auth
--- * logging`,
  },
  {
    name: "JSON",
    tagColor: "text-yellow-400",
    tagBg: "bg-yellow-500/20",
    pros: [
      "Universal support across languages",
      "Native in JavaScript/TypeScript",
      "Strict and unambiguous",
    ],
    cons: [
      "Very verbose — lots of quotes, braces, commas",
      "No comments",
      "No trailing commas",
      "Hard to read deeply nested objects",
    ],
    example: `{
  "server": {
    "host": "localhost",
    "port": 3000,
    "features": ["auth", "logging"]
  }
}`,
  },
  {
    name: "YAML",
    tagColor: "text-red-400",
    tagBg: "bg-red-500/20",
    pros: [
      "Human-readable",
      "Widely used (Docker, K8s, CI/CD)",
      "Comments supported",
      "Rich type system",
    ],
    cons: [
      "Whitespace-sensitive — indentation errors crash parsers",
      'Implicit typing causes surprises (e.g. "no" → false)',
      "Complex spec — many edge cases",
      "Norway problem (NO → false)",
    ],
    example: `server:
  host: localhost
  port: 3000
  features:
    - auth
    - logging`,
  },
  {
    name: "TOML",
    tagColor: "text-blue-400",
    tagBg: "bg-blue-500/20",
    pros: [
      "Clear and unambiguous syntax",
      "Popular in Rust/Go ecosystems",
      "Good for flat configs",
    ],
    cons: [
      "Deeply nested structures get very verbose",
      "Arrays of tables syntax is confusing",
      "Inline tables cannot span multiple lines",
      "Limited ecosystem outside Rust/Go",
    ],
    example: `[server]
host = "localhost"
port = 3000
features = ["auth", "logging"]`,
  },
  {
    name: "XML",
    tagColor: "text-orange-400",
    tagBg: "bg-orange-500/20",
    pros: [
      "Very mature with rich tooling",
      "Supports attributes and namespaces",
      "Schema validation (XSD)",
    ],
    cons: [
      "Extremely verbose — opening and closing tags",
      "Hard to read for configuration",
      "Large file sizes",
      "Mostly replaced by JSON/YAML for configs",
    ],
    example: `<server>
  <host>localhost</host>
  <port>3000</port>
  <features>
    <item>auth</item>
    <item>logging</item>
  </features>
</server>`,
  },
  {
    name: "TON",
    tagColor: "text-cyan-400",
    tagBg: "bg-cyan-500/20",
    pros: [
      "Compact object syntax with curly braces",
      "No quoting for simple string values",
      "Clean key = value pairs",
      "Supports nested blocks naturally",
    ],
    cons: [
      "Requires curly braces for nesting",
      "Less widely adopted than TOML/YAML",
      "Limited tooling ecosystem",
      "Array syntax still uses brackets",
      "Not as token-efficient as MSN",
    ],
    example: `server {
  host = localhost
  port = 3000
  features = [auth, logging]
}`,
  },
];

export default function ComparisonPage() {
  return (
    <main className="pt-24 pb-16 min-h-screen">
      <div className="mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-4xl font-bold"
        >
          Format Comparison
        </motion.h1>
        <p className="mb-12 text-gray-400 text-lg">
          How MSN stacks up against JSON, YAML, TOML, and XML.
        </p>

        {/* Summary Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-x-auto p-6 mb-16 rounded-2xl glass-card"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-left text-gray-400 font-medium">Feature</th>
                {formats.map((f) => (
                  <th key={f.name} className="py-3 px-4 text-center">
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded ${f.tagBg} ${f.tagColor}`}
                    >
                      {f.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { label: "Comments", vals: ["yes", "no", "yes", "yes", "yes", "yes"] },
                {
                  label: "Unlimited Nesting",
                  vals: ["yes", "yes", "yes", "hard", "yes", "yes"],
                },
                {
                  label: "Token Efficient",
                  vals: ["best", "poor", "good", "fair", "worst", "good"],
                },
                {
                  label: "Compiles to JSON",
                  vals: ["yes", "native", "lib", "lib", "lib", "lib"],
                },
                {
                  label: "Type Inference",
                  vals: ["yes", "no", "yes", "yes", "no", "yes"],
                },
                {
                  label: "Easy to Learn",
                  vals: ["yes", "yes", "no", "fair", "no", "fair"],
                },
                {
                  label: "Simple Spec",
                  vals: ["yes", "yes", "no", "fair", "no", "fair"],
                },
                {
                  label: "No Brackets/Braces",
                  vals: ["yes", "no", "yes", "no", "no", "no"],
                },
              ].map((row) => (
                <tr key={row.label} className="border-b border-white/5">
                  <td className="py-3 px-4 text-gray-400">{row.label}</td>
                  {row.vals.map((val, i) => (
                    <td key={i} className="py-3 px-4 text-center">
                      <span
                        className={
                          val === "yes" || val === "best" || val === "native"
                            ? "text-green-400"
                            : val === "no" || val === "poor" || val === "worst"
                              ? "text-red-400"
                              : "text-yellow-400"
                        }
                      >
                        {val}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Detailed cards */}
        <div className="space-y-8">
          {formats.map((fmt, i) => (
            <motion.div
              key={fmt.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 rounded-2xl glass-card"
            >
              <div className="flex items-center gap-3 mb-6">
                <span
                  className={`text-sm font-mono px-3 py-1 rounded ${fmt.tagBg} ${fmt.tagColor}`}
                >
                  {fmt.name}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-green-400 tracking-wider uppercase">
                    Pros
                  </h3>
                  <ul className="space-y-2">
                    {fmt.pros.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="mt-0.5 text-green-400">+</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-red-400 tracking-wider uppercase">
                    Cons
                  </h3>
                  <ul className="space-y-2">
                    {fmt.cons.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="mt-0.5 text-red-400">-</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    Example
                  </h3>
                  <pre className="overflow-x-auto p-4 text-xs font-mono text-gray-300 bg-white/5 rounded-xl border-white/10 border">
                    <code>{fmt.example}</code>
                  </pre>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
