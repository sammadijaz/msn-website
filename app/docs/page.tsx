"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: `Install the MSN CLI globally:

\`\`\`bash
npm install -g @msn/cli
\`\`\`

Or add the parser to your project:

\`\`\`bash
npm install @msn/parser
\`\`\`

Compile an MSN file to JSON:

\`\`\`bash
msn compile config.msn
msn compile config.msn -o config.json
\`\`\``,
  },
  {
    id: "basic-syntax",
    title: "Basic Syntax",
    content: `MSN uses **dashes** to indicate hierarchy depth. One dash \`-\` means top level, two dashes \`--\` for the next level, and so on.

**Key-value pairs:**
\`\`\`
- name: my-app
- version: 1.0.0
- private: true
\`\`\`

Compiles to:
\`\`\`json
{
  "name": "my-app",
  "version": "1.0.0",
  "private": true
}
\`\`\``,
  },
  {
    id: "nesting",
    title: "Nesting",
    content: `Increase the number of dashes to nest objects:

\`\`\`
- server
-- host: localhost
-- port: 3000
-- ssl
--- enabled: true
--- key: /path/to/key.pem
\`\`\`

Compiles to:
\`\`\`json
{
  "server": {
    "host": "localhost",
    "port": 3000,
    "ssl": {
      "enabled": true,
      "key": "/path/to/key.pem"
    }
  }
}
\`\`\`

There is **no limit** to nesting depth. Just keep adding dashes.`,
  },
  {
    id: "arrays",
    title: "Arrays",
    content: `Use an asterisk \`*\` to create array items:

\`\`\`
- colors
-- * red
-- * green
-- * blue
\`\`\`

Compiles to:
\`\`\`json
{
  "colors": ["red", "green", "blue"]
}
\`\`\`

**Array objects** — items in arrays that have properties:

\`\`\`
- users
-- *
--- name: Alice
--- role: admin
-- *
--- name: Bob
--- role: user
\`\`\`

Compiles to:
\`\`\`json
{
  "users": [
    { "name": "Alice", "role": "admin" },
    { "name": "Bob", "role": "user" }
  ]
}
\`\`\``,
  },
  {
    id: "multiline",
    title: "Multiline Values",
    content: `Use \`|\` for literal multiline (preserves newlines) and \`>\` for folded multiline (joins with spaces):

**Literal block (\`|\`):**
\`\`\`
- description: |
  This is line one.
  This is line two.
  This is line three.
\`\`\`

Produces: \`"This is line one.\\nThis is line two.\\nThis is line three."\`

**Folded block (\`>\`):**
\`\`\`
- description: >
  This is a long paragraph
  that will be joined into
  a single line with spaces.
\`\`\`

Produces: \`"This is a long paragraph that will be joined into a single line with spaces."\``,
  },
  {
    id: "comments",
    title: "Comments",
    content: `Lines starting with \`#\` are comments and are ignored during compilation:

\`\`\`
# Application configuration
- app
-- name: my-app    # inline comments are also supported
-- debug: false
\`\`\``,
  },
  {
    id: "types",
    title: "Type Inference",
    content: `MSN automatically infers types from values:

| Value | Type | JSON Output |
|-------|------|-------------|
| \`42\` | number | \`42\` |
| \`3.14\` | number | \`3.14\` |
| \`true\` / \`false\` | boolean | \`true\` / \`false\` |
| \`null\` | null | \`null\` |
| \`"hello"\` | quoted string | \`"hello"\` |
| \`hello\` | unquoted string | \`"hello"\` |

Wrap a numeric value in quotes to force it to be a string: \`"3000"\`.`,
  },
  {
    id: "cli",
    title: "CLI Reference",
    content: `**Commands:**

| Command | Description |
|---------|-------------|
| \`msn compile <file>\` | Compile MSN to JSON |
| \`msn parse <file>\` | Output the AST |
| \`msn validate <file>\` | Check for syntax errors |
| \`msn format <file>\` | Auto-format an MSN file |

**Flags:**

| Flag | Description |
|------|-------------|
| \`-o, --output <file>\` | Write output to a file |
| \`-i, --indent <n>\` | JSON indentation (default: 2) |
| \`--stdin\` | Read from stdin |
| \`-h, --help\` | Show help |
| \`-v, --version\` | Show version |`,
  },
  {
    id: "api",
    title: "API Reference",
    content: `**Quick start:**

\`\`\`typescript
import { compile, compileToString } from '@msn/parser';

// Get a JavaScript object
const obj = compile(\`
- name: my-app
- port: 3000
\`);

// Get formatted JSON string
const json = compileToString(\`
- name: my-app
- port: 3000
\`, 2);
\`\`\`

**Classes:**

- \`Lexer\` — Tokenizes MSN source into a token stream
- \`Parser\` — Builds an AST from tokens
- \`Compiler\` — Converts AST to JSON

**Validator:**

\`\`\`typescript
import { validate } from '@msn/validator';
const errors = validate(source);
\`\`\`

**Formatter:**

\`\`\`typescript
import { format } from '@msn/formatter';
const formatted = format(source);
\`\`\``,
  },
];

export default function DocsPage() {
  return (
    <main className="pt-24 pb-16 min-h-screen">
      <div className="mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row">
          {/* Sidebar */}
          <aside className="shrink-0 lg:w-64">
            <nav className="space-y-1 lg:sticky top-28">
              <p className="mb-3 px-3 text-xs font-semibold text-gray-500 tracking-wider uppercase">
                Documentation
              </p>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block px-3 py-2 text-sm text-gray-400 rounded-lg transition-colors hover:text-white hover:bg-white/5"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-4xl font-bold"
            >
              Documentation
            </motion.h1>
            <p className="mb-12 text-gray-400 text-lg">
              Everything you need to know about Mad Sam Notation.
            </p>

            <div className="space-y-16">
              {sections.map((s, i) => (
                <motion.section
                  key={s.id}
                  id={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="mb-6 pb-3 text-2xl font-bold border-b border-white/10">
                    {s.title}
                  </h2>
                  <div className="prose prose-invert prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-code:text-msn-400 max-w-none">
                    <FormattedContent content={s.content} />
                  </div>
                </motion.section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FormattedContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const lines = part.split("\n");
          const lang = lines[0].replace("```", "").trim();
          const code = lines.slice(1, -1).join("\n");
          return (
            <pre
              key={i}
              className="overflow-x-auto p-4 rounded-xl !bg-white/5 !border !border-white/10"
            >
              <code className="text-sm font-mono text-gray-300">{code}</code>
            </pre>
          );
        }
        // Render paragraphs with inline formatting
        return (
          <div
            key={i}
            className="text-gray-300 leading-relaxed whitespace-pre-wrap"
          >
            {part.split("\n").map((line, j) => {
              if (line.startsWith("| ")) {
                // Render table-like rows
                return (
                  <div key={j} className="font-mono text-sm text-gray-400">
                    {line}
                  </div>
                );
              }
              if (line.trim() === "") return <br key={j} />;
              return (
                <p
                  key={j}
                  className="mb-2"
                  dangerouslySetInnerHTML={{
                    __html: line
                      .replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="text-white">$1</strong>',
                      )
                      .replace(
                        /`(.*?)`/g,
                        '<code class="text-msn-400 bg-white/5 px-1.5 py-0.5 rounded text-sm">$1</code>',
                      ),
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
}
