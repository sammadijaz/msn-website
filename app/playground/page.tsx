/**
 * MSN Playground — precise browser-side port of @madsn/parser
 *
 * Implements exactly: Lexer → Parser → Compiler
 * Rules match packages/parser/src/{lexer,parser,compiler}.ts
 */

"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";

/* ====================================================================
   TYPES
   ==================================================================== */

type ASTType = "root" | "object" | "array" | "value" | "array-item";
type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

const enum TT {
  BLANK = "BLANK",
  COMMENT = "COMMENT",
  KEY_VALUE = "KEY_VALUE",
  CONTAINER = "CONTAINER",
  ARRAY_ITEM = "ARRAY_ITEM",
  ARRAY_OBJECT = "ARRAY_OBJECT",
  MULTILINE_MARKER = "MULTILINE_MARKER",
}

interface Token {
  type: TT;
  depth: number;
  key?: string;
  value?: string;
  raw: string;
  line: number;
  multilineMode?: "|" | ">";
}

interface ASTNode {
  type: ASTType;
  key?: string;
  value?: JsonValue;
  children: ASTNode[];
  depth?: number;
}

/* ====================================================================
   LEXER  — faithful port of packages/parser/src/lexer.ts
   ==================================================================== */

/** Strip inline comment: space-before-# rule, quote-aware (same as lexer.ts) */
function stripInlineComment(content: string): string {
  let inQuote = false;
  let quoteChar = "";
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (inQuote) {
      if (ch === quoteChar && content[i - 1] !== "\\") inQuote = false;
    } else {
      if (ch === '"' || ch === "'") {
        inQuote = true;
        quoteChar = ch;
      } else if (ch === "#" && i > 0 && content[i - 1] === " ") {
        return content.slice(0, i).trimEnd();
      }
    }
  }
  return content;
}

function tokenize(source: string): Token[] {
  const lines = source.split(/\r?\n/);
  const tokens: Token[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const lineNum = i + 1;

    // Blank line
    if (raw.trim() === "") {
      tokens.push({ type: TT.BLANK, depth: 0, raw, line: lineNum });
      continue;
    }

    // Full-line comment (trimStart — allows leading spaces before #)
    if (raw.trimStart().startsWith("#")) {
      tokens.push({ type: TT.COMMENT, depth: 0, raw, line: lineNum });
      continue;
    }

    // Require dashes followed by a space
    const dashMatch = raw.match(/^(-+)\s/);
    if (!dashMatch) {
      const hint = raw.match(/^(-+)/)
        ? "Missing space after dash prefix"
        : 'Expected line to start with dashes (e.g. "- key: value")';
      throw new Error(`${hint}, got: "${raw.trimEnd()}" (line ${lineNum})`);
    }

    const dashes = dashMatch[1];
    const depth = dashes.length;
    const content = raw.slice(dashes.length).trimStart();
    const c = stripInlineComment(content);

    // Bare * → ARRAY_OBJECT
    if (c === "*") {
      tokens.push({ type: TT.ARRAY_OBJECT, depth, raw, line: lineNum });
      continue;
    }

    // "* value" → ARRAY_ITEM
    if (c.startsWith("* ")) {
      tokens.push({ type: TT.ARRAY_ITEM, depth, value: c.slice(2).trim(), raw, line: lineNum });
      continue;
    }

    // Key-value or multiline marker
    const colonIdx = c.indexOf(": ");
    if (colonIdx !== -1) {
      const key = c.slice(0, colonIdx).trim();
      const val = c.slice(colonIdx + 2).trim();

      if (val === "|" || val === ">") {
        tokens.push({
          type: TT.MULTILINE_MARKER,
          depth,
          key,
          multilineMode: val as "|" | ">",
          raw,
          line: lineNum,
        });
        continue;
      }

      tokens.push({ type: TT.KEY_VALUE, depth, key, value: val, raw, line: lineNum });
      continue;
    }

    // Container (key with no value)
    const key = c.trim();
    if (key) {
      tokens.push({ type: TT.CONTAINER, depth, key, raw, line: lineNum });
    }
  }

  return tokens;
}

/* ====================================================================
   TYPE INFERENCE  — faithful port of parser.ts inferType
   ==================================================================== */

function inferType(value: string): JsonValue {
  if (value === "") return "";

  // Quoted string → strip quotes
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  const lower = value.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  if (lower === "null") return null;
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);

  return value;
}

/* ====================================================================
   PARSER  — faithful port of packages/parser/src/parser.ts
   ==================================================================== */

function ensureArray(node: ASTNode): void {
  if (node.type !== "array" && node.type !== "root") {
    node.type = "array";
  }
}

function buildAST(tokens: Token[]): ASTNode {
  const root: ASTNode = { type: "root", children: [] };
  const stack: { node: ASTNode; depth: number }[] = [{ node: root, depth: 0 }];

  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === TT.BLANK || token.type === TT.COMMENT) {
      i++;
      continue;
    }

    const depth = token.depth;

    // Pop stack to find parent
    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }
    const parent = stack[stack.length - 1].node;

    switch (token.type) {
      case TT.KEY_VALUE: {
        parent.children.push({
          type: "value",
          key: token.key,
          value: inferType(token.value!),
          children: [],
          depth,
        });
        i++;
        break;
      }

      case TT.CONTAINER: {
        const node: ASTNode = { type: "object", key: token.key, children: [], depth };
        parent.children.push(node);
        stack.push({ node, depth });
        i++;
        break;
      }

      case TT.ARRAY_ITEM: {
        ensureArray(parent);
        parent.children.push({
          type: "array-item",
          value: inferType(token.value!),
          children: [],
          depth,
        });
        i++;
        break;
      }

      case TT.ARRAY_OBJECT: {
        ensureArray(parent);
        const node: ASTNode = { type: "object", children: [], depth };
        parent.children.push(node);
        stack.push({ node, depth });
        i++;
        break;
      }

      case TT.MULTILINE_MARKER: {
        const mode = token.multilineMode!;
        const mlDepth = depth + 1;
        const lines: string[] = [];
        i++;

        while (i < tokens.length) {
          const nt = tokens[i];
          if (nt.type === TT.BLANK || nt.type === TT.COMMENT) {
            i++;
            continue;
          }
          if (nt.depth !== mlDepth) break;

          // Extract text — matching parser.ts logic exactly
          const dashPrefix = "-".repeat(nt.depth);
          let text = nt.raw.slice(dashPrefix.length).trimStart();
          if (nt.type === TT.CONTAINER && nt.key) {
            text = nt.key; // already comment-stripped
          } else if (nt.type === TT.KEY_VALUE) {
            text = `${nt.key}: ${nt.value}`; // reconstructed without inline comment
          }
          lines.push(text);
          i++;
        }

        parent.children.push({
          type: "value",
          key: token.key,
          value: mode === "|" ? lines.join("\n") : lines.join(" "),
          children: [],
          depth,
        });
        break;
      }

      default:
        i++;
    }
  }

  return root;
}

/* ====================================================================
   COMPILER  — faithful port of packages/parser/src/compiler.ts
   ==================================================================== */

function buildObject(children: ASTNode[]): { [k: string]: JsonValue } {
  const obj: { [k: string]: JsonValue } = {};
  for (const child of children) {
    if (!child.key) continue;
    switch (child.type) {
      case "value":
        obj[child.key] = child.value as JsonValue;
        break;
      case "object":
        obj[child.key] = astToJson(child);
        break;
      case "array":
        obj[child.key] = buildArray(child.children);
        break;
      default:
        obj[child.key] = astToJson(child);
    }
  }
  return obj;
}

function buildArray(children: ASTNode[]): JsonValue[] {
  const arr: JsonValue[] = [];
  for (const child of children) {
    switch (child.type) {
      case "array-item":
        arr.push(
          child.children.length > 0 ? buildObject(child.children) : (child.value as JsonValue),
        );
        break;
      case "object":
        if (!child.key) arr.push(buildObject(child.children));
        else arr.push(astToJson(child));
        break;
      case "value":
        arr.push(child.value as JsonValue);
        break;
      default:
        arr.push(astToJson(child));
    }
  }
  return arr;
}

function astToJson(node: ASTNode): JsonValue {
  switch (node.type) {
    case "root":
      return buildObject(node.children);

    case "object": {
      if (node.children.length === 0) return {};
      const hasArrayItems = node.children.some(
        (c) => c.type === "array-item" || (c.type === "object" && !c.key),
      );
      return hasArrayItems ? buildArray(node.children) : buildObject(node.children);
    }

    case "array":
      return buildArray(node.children);

    case "value":
      return node.value as JsonValue;

    case "array-item":
      return node.children.length > 0 ? buildObject(node.children) : (node.value as JsonValue);

    default:
      return null;
  }
}

function compile(source: string): JsonValue {
  return astToJson(buildAST(tokenize(source)));
}

/* ====================================================================
   STATS
   ==================================================================== */

function countTokens(text: string): number {
  // Approximate: split on whitespace + punctuation boundaries
  return text.split(/[\s,{}[\]:;"']+/).filter(Boolean).length;
}

/* ====================================================================
   DEFAULT SOURCE
   ==================================================================== */

const DEFAULT_MSN = `# App configuration
- app
-- name: my-app
-- version: 1.0.0
-- debug: false
- server
-- host: 0.0.0.0
-- port: 3000
-- ssl
--- enabled: true
--- cert: /path/to/cert.pem
- database
-- driver: postgres
-- host: db.example.com
-- port: 5432
- features
-- * auth
-- * api
-- * logging`;

/* ====================================================================
   PAGE COMPONENT
   ==================================================================== */

export default function PlaygroundPage() {
  const [source, setSource] = useState(DEFAULT_MSN);
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!source.trim()) return { output: "", error: null };
    try {
      const json = compile(source);
      return { output: JSON.stringify(json, null, 2), error: null };
    } catch (e: unknown) {
      return { output: "", error: e instanceof Error ? e.message : String(e) };
    }
  }, [source]);

  const inputStats = useMemo(
    () => ({
      chars: source.length,
      tokens: countTokens(source),
      lines: source ? source.split(/\r?\n/).length : 0,
    }),
    [source],
  );

  const outputStats = useMemo(
    () => ({
      chars: output.length,
      tokens: countTokens(output),
      lines: output ? output.split(/\r?\n/).length : 0,
    }),
    [output],
  );

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const savings =
    output && inputStats.chars > 0 && outputStats.chars > 0
      ? Math.round((1 - inputStats.chars / outputStats.chars) * 100)
      : null;

  return (
    <main className="pt-24 pb-16 min-h-screen">
      <div className="mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">
            <span className="gradient-text">Playground</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Write MSN, see JSON output in real time — powered by the same compiler as{" "}
            <code className="text-msn-400 font-mono">@madsn/parser</code>.
          </p>
        </motion.div>

        {/* Savings badge */}
        {savings !== null && savings > 0 && (
          <div className="mb-4">
            <span className="px-3 py-1 text-xs font-semibold text-green-400 bg-green-500/10 rounded-full border-green-500/20 border">
              MSN is {savings}% smaller than the JSON output
            </span>
          </div>
        )}

        {/* Editor panels */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* ── Input: MSN ── */}
          <div className="overflow-hidden flex flex-col rounded-2xl border-white/10 border">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-500/80 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500/80 rounded-full" />
                <div className="w-3 h-3 bg-green-500/80 rounded-full" />
              </div>
              <span className="ml-2 text-xs text-gray-500 font-mono">input.msn</span>
              <span className="ml-auto px-2 py-0.5 text-xs text-msn-400 bg-msn-500/20 rounded">
                MSN
              </span>
            </div>

            <textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="flex-1 p-5 min-h-[420px] text-sm font-mono text-gray-300 leading-relaxed bg-gray-900/50 resize-none focus:outline-none"
              spellCheck={false}
              placeholder="Type your MSN here..."
              aria-label="MSN source input"
            />

            {/* Input stats bar */}
            <div className="flex items-center gap-4 px-4 py-2.5 text-[11px] font-mono text-gray-500 bg-gray-900/80 border-t border-white/5 select-none">
              <span>{inputStats.chars.toLocaleString()} chars</span>
              <span className="w-px h-3 bg-white/10" />
              <span>{inputStats.lines} lines</span>
              <span className="w-px h-3 bg-white/10" />
              <span>~{inputStats.tokens} tokens</span>
            </div>
          </div>

          {/* ── Output: JSON ── */}
          <div className="overflow-hidden flex flex-col rounded-2xl border-white/10 border">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-500/80 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500/80 rounded-full" />
                <div className="w-3 h-3 bg-green-500/80 rounded-full" />
              </div>
              <span className="ml-2 text-xs text-gray-500 font-mono">output.json</span>
              <span className="ml-auto px-2 py-0.5 text-xs text-yellow-400 bg-yellow-500/20 rounded">
                JSON
              </span>
              <button
                onClick={handleCopy}
                disabled={!!error || !output}
                className="px-3 py-1 ml-2 text-xs text-gray-400 bg-white/5 rounded-lg transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {error ? (
              <div className="flex-1 flex flex-col items-start justify-start p-6 min-h-[420px] bg-gray-900/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center w-5 h-5 text-red-400 text-xs font-bold bg-red-500/20 rounded-full">
                    !
                  </span>
                  <span className="text-sm font-semibold text-red-400">Parse Error</span>
                </div>
                <pre className="text-xs font-mono text-red-300/80 whitespace-pre-wrap leading-relaxed">
                  {error}
                </pre>
              </div>
            ) : (
              <pre className="overflow-auto flex-1 p-5 min-h-[420px] text-sm font-mono text-gray-300 leading-relaxed bg-gray-900/50">
                <code>{output}</code>
              </pre>
            )}

            {/* Output stats bar */}
            <div className="flex items-center gap-4 px-4 py-2.5 text-[11px] font-mono text-gray-500 bg-gray-900/80 border-t border-white/5 select-none">
              <span>{outputStats.chars.toLocaleString()} chars</span>
              <span className="w-px h-3 bg-white/10" />
              <span>{outputStats.lines} lines</span>
              <span className="w-px h-3 bg-white/10" />
              <span>~{outputStats.tokens} tokens</span>
            </div>
          </div>
        </div>

        {/* Stat summary cards */}
        {!error && output && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 gap-4 mt-6 sm:grid-cols-4"
          >
            <StatCard
              label="MSN Characters"
              value={inputStats.chars.toLocaleString()}
              sub="input"
            />
            <StatCard
              label="JSON Characters"
              value={outputStats.chars.toLocaleString()}
              sub="output"
            />
            <StatCard
              label="Char Savings"
              value={
                outputStats.chars > inputStats.chars
                  ? `${Math.round((1 - inputStats.chars / outputStats.chars) * 100)}%`
                  : "—"
              }
              sub="MSN vs JSON"
              highlight={outputStats.chars > inputStats.chars}
            />
            <StatCard
              label="Token Savings"
              value={
                outputStats.tokens > inputStats.tokens
                  ? `${Math.round((1 - inputStats.tokens / outputStats.tokens) * 100)}%`
                  : "—"
              }
              sub="approx. estimate"
              highlight={outputStats.tokens > inputStats.tokens}
            />
          </motion.div>
        )}

        {/* Syntax quick-reference */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8 p-6 glass-card"
        >
          <h2 className="mb-4 text-sm font-semibold text-gray-400 tracking-wider uppercase">
            Quick Reference
          </h2>
          <div className="grid grid-cols-1 gap-4 text-xs font-mono sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_REF.map(({ msn, desc }) => (
              <div key={msn} className="flex items-baseline gap-3">
                <code className="text-msn-400 shrink-0">{msn}</code>
                <span className="text-gray-500">{desc}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="p-4 text-center rounded-xl glass-card">
      <p className="mb-1 text-[11px] text-gray-500 font-medium tracking-wider uppercase">{label}</p>
      <p className={`text-2xl font-bold font-mono ${highlight ? "text-green-400" : "text-white"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-gray-500">{sub}</p>
    </div>
  );
}

const QUICK_REF: { msn: string; desc: string }[] = [
  { msn: "- key", desc: "Container (object)" },
  { msn: "-- key: value", desc: "Key-value pair" },
  { msn: "--- key", desc: "Nested container" },
  { msn: "-- * item", desc: "Array element (scalar)" },
  { msn: "-- *", desc: "Array element (object)" },
  { msn: "-- key: |", desc: "Multiline block (preserves newlines)" },
  { msn: "-- key: >", desc: "Multiline folded (joins lines)" },
  { msn: "# comment", desc: "Full-line comment" },
  { msn: "-- key: value # c", desc: "Inline comment (space before #)" },
  { msn: "-- on: true", desc: "Boolean (true / false)" },
  { msn: "-- port: 3000", desc: "Integer" },
  { msn: "-- pi: 3.14", desc: "Float" },
  { msn: "-- x: null", desc: "Null" },
  { msn: '-- k: "hello"', desc: "Quoted string" },
];
