"use client";

import { motion } from "framer-motion";

interface FormatData {
  name: string;
  color: string;
  bgColor: string;
  simple: number;
  nested: number;
  arrays: number;
  complex: number;
}

const formats: FormatData[] = [
  {
    name: "MSN",
    color: "text-msn-400",
    bgColor: "bg-msn-500/20",
    simple: 38,
    nested: 87,
    arrays: 52,
    complex: 214,
  },
  {
    name: "JSON",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    simple: 65,
    nested: 156,
    arrays: 98,
    complex: 418,
  },
  {
    name: "YAML",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    simple: 42,
    nested: 94,
    arrays: 61,
    complex: 248,
  },
  {
    name: "TOML",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    simple: 58,
    nested: 142,
    arrays: 85,
    complex: 396,
  },
  {
    name: "XML",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    simple: 124,
    nested: 298,
    arrays: 187,
    complex: 756,
  },
];

function Bar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="overflow-hidden flex-1 h-2 bg-white/5 rounded-full">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="w-12 text-sm text-gray-400 text-right font-mono">
        {value}
      </span>
    </div>
  );
}

export function TokenComparison() {
  const categories = [
    { key: "simple" as const, label: "Simple Config" },
    { key: "nested" as const, label: "Nested Objects" },
    { key: "arrays" as const, label: "Array Data" },
    { key: "complex" as const, label: "Complex Config" },
  ];

  return (
    <section className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-purple-950/10 to-gray-950" />

      <div className="relative mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Token <span className="gradient-text">Efficiency</span>
          </h2>
          <p className="mx-auto max-w-2xl text-gray-400 text-lg">
            MSN consistently uses fewer characters than other formats. Fewer
            tokens means faster parsing, less bandwidth, and smaller prompts for
            AI&nbsp;models.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {categories.map((cat, i) => {
            const max = Math.max(...formats.map((f) => f[cat.key]));
            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl glass-card"
              >
                <h3 className="mb-6 text-lg font-semibold">{cat.label}</h3>
                <div className="space-y-4">
                  {formats.map((fmt) => (
                    <div key={fmt.name}>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded ${fmt.bgColor} ${fmt.color}`}
                        >
                          {fmt.name}
                        </span>
                        {fmt.name === "MSN" && (
                          <span className="text-[10px] text-msn-400 font-semibold tracking-wider uppercase">
                            smallest
                          </span>
                        )}
                      </div>
                      <Bar
                        value={fmt[cat.key]}
                        max={max}
                        color={
                          fmt.name === "MSN"
                            ? "bg-gradient-to-r from-msn-500 to-msn-400"
                            : "bg-white/20"
                        }
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 text-center text-gray-500 text-sm"
        >
          Character counts measured on equivalent configurations. Lower is
          better.
        </motion.p>
      </div>
    </section>
  );
}
