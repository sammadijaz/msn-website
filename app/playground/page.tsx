/**
 * MSN Playground v2 — Multi-format bidirectional converter (feature/playground-v2)
 *
 * Input formats:  MSN | JSON
 * Output formats: JSON | YAML | XML | TON | MSN
 *
 * The MSN compiler is a faithful port of @madsn/parser (lexer → parser → compiler).
 * Format converters (YAML, XML, TON, MSN) run on the parsed object.
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";

/* ====================================================================
   TYPES
   ==================================================================== */

type Format = "MSN" | "JSON" | "YAML" | "XML" | "TON";

const INPUT_FORMATS: Format[] = ["MSN", "JSON"];
const OUTPUT_FORMATS: Format[] = ["JSON", "YAML", "XML", "TON", "MSN"];

const FORMAT_META: Record<Format, { color: string; bg: string; border: string; ext: string }> = {
  MSN:  { color: "text-msn-400",    bg: "bg-msn-500/15",    border: "border-msn-500/25",    ext: ".msn"  },
  JSON: { color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/25", ext: ".json" },
  YAML: { color: "text-red-400",    bg: "bg-red-500/15",    border: "border-red-500/25",    ext: ".yaml" },
  XML:  { color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/25", ext: ".xml"  },
  TON:  { color: "text-cyan-400",   bg: "bg-cyan-500/15",   border: "border-cyan-500/25",   ext: ".ton"  },
};

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };
type ASTType = "root" | "object" | "array" | "value" | "array-item";

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

    if (raw.trim() === "") {
      tokens.push({ type: TT.BLANK, depth: 0, raw, line: lineNum });
      continue;
    }
    if (raw.trimStart().startsWith("#")) {
      tokens.push({ type: TT.COMMENT, depth: 0, raw, line: lineNum });
      continue;
    }

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

    if (c === "*") {
      tokens.push({ type: TT.ARRAY_OBJECT, depth, raw, line: lineNum });
      continue;
    }
    if (c.startsWith("* ")) {
      tokens.push({ type: TT.ARRAY_ITEM, depth, value: c.slice(2).trim(), raw, line: lineNum });
      continue;
    }

    const colonIdx = c.indexOf(": ");
    if (colonIdx !== -1) {
      const key = c.slice(0, colonIdx).trim();
      const val = c.slice(colonIdx + 2).trim();
      if (val === "|" || val === ">") {
        tokens.push({ type: TT.MULTILINE_MARKER, depth, key, multilineMode: val as "|" | ">", raw, line: lineNum });
        continue;
      }
      tokens.push({ type: TT.KEY_VALUE, depth, key, value: val, raw, line: lineNum });
      continue;
    }

    const key = c.trim();
    if (key) tokens.push({ type: TT.CONTAINER, depth, key, raw, line: lineNum });
  }
  return tokens;
}

/* ====================================================================
   INFERENCE  — faithful port of parser.ts inferType
   ==================================================================== */

function inferType(value: string): JsonValue {
  if (value === "") return "";
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) return value.slice(1, -1);
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
  if (node.type !== "array" && node.type !== "root") node.type = "array";
}

function buildAST(tokens: Token[]): ASTNode {
  const root: ASTNode = { type: "root", children: [] };
  const stack: { node: ASTNode; depth: number }[] = [{ node: root, depth: 0 }];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];
    if (token.type === TT.BLANK || token.type === TT.COMMENT) { i++; continue; }

    const depth = token.depth;
    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) stack.pop();
    const parent = stack[stack.length - 1].node;

    switch (token.type) {
      case TT.KEY_VALUE:
        parent.children.push({ type: "value", key: token.key, value: inferType(token.value!), children: [], depth });
        i++;
        break;

      case TT.CONTAINER: {
        const node: ASTNode = { type: "object", key: token.key, children: [], depth };
        parent.children.push(node);
        stack.push({ node, depth });
        i++;
        break;
      }

      case TT.ARRAY_ITEM:
        ensureArray(parent);
        parent.children.push({ type: "array-item", value: inferType(token.value!), children: [], depth });
        i++;
        break;

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
          if (nt.type === TT.BLANK || nt.type === TT.COMMENT) { i++; continue; }
          if (nt.depth !== mlDepth) break;
          const dashPrefix = "-".repeat(nt.depth);
          let text = nt.raw.slice(dashPrefix.length).trimStart();
          if (nt.type === TT.CONTAINER && nt.key) text = nt.key;
          else if (nt.type === TT.KEY_VALUE) text = `${nt.key}: ${nt.value}`;
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

      default: i++;
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
      case "value":  obj[child.key] = child.value as JsonValue; break;
      case "object": obj[child.key] = astToJson(child); break;
      case "array":  obj[child.key] = buildArray(child.children); break;
      default:       obj[child.key] = astToJson(child);
    }
  }
  return obj;
}

function buildArray(children: ASTNode[]): JsonValue[] {
  const arr: JsonValue[] = [];
  for (const child of children) {
    switch (child.type) {
      case "array-item":
        arr.push(child.children.length > 0 ? buildObject(child.children) : child.value as JsonValue);
        break;
      case "object":
        arr.push(!child.key ? buildObject(child.children) : astToJson(child));
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
        c => c.type === "array-item" || (c.type === "object" && !c.key)
      );
      return hasArrayItems ? buildArray(node.children) : buildObject(node.children);
    }
    case "array":    return buildArray(node.children);
    case "value":    return node.value as JsonValue;
    case "array-item":
      return node.children.length > 0 ? buildObject(node.children) : node.value as JsonValue;
    default:
      return null;
  }
}

function compileMSN(source: string): JsonValue {
  return astToJson(buildAST(tokenize(source)));
}

/* ====================================================================
   FORMAT CONVERTERS  — object → string for each output format
   ==================================================================== */

function primitiveVal(v: JsonValue): string {
  if (v === null) return "null";
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  return String(v);
}

// MSN  ─────────────────────────────────────────────────────────────────
function objToMsn(obj: JsonValue, depth = 1): string {
  const pre = "-".repeat(depth);
  const lines: string[] = [];

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (item !== null && typeof item === "object" && !Array.isArray(item)) {
        lines.push(`${pre} *`);
        lines.push(objToMsn(item, depth + 1));
      } else {
        lines.push(`${pre} * ${primitiveVal(item)}`);
      }
    }
  } else if (obj !== null && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && typeof value === "object") {
        lines.push(`${pre} ${key}`);
        lines.push(objToMsn(value, depth + 1));
      } else {
        lines.push(`${pre} ${key}: ${primitiveVal(value)}`);
      }
    }
  }
  return lines.join("\n");
}

// YAML ─────────────────────────────────────────────────────────────────
function yamlQuote(v: JsonValue): string {
  if (v === null) return "null";
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  const s = String(v);
  if (
    s === "" ||
    /^[{}\[\],&*?|>!%#@`]/.test(s) ||
    /: |-$/.test(s) ||
    s === "true" || s === "false" || s === "null" ||
    /^\d/.test(s)
  ) return `"${s.replace(/"/g, '\\"')}"`;
  return s;
}

function objToYaml(obj: JsonValue, indent = 0): string {
  const pad = "  ".repeat(indent);
  const lines: string[] = [];

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (item !== null && typeof item === "object") {
        const inner = objToYaml(item, indent + 1).split("\n").filter(Boolean);
        lines.push(`${pad}- ${inner[0].trimStart()}`);
        for (let i = 1; i < inner.length; i++) lines.push(`${pad}  ${inner[i].trimStart()}`);
      } else {
        lines.push(`${pad}- ${yamlQuote(item)}`);
      }
    }
  } else if (obj !== null && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        lines.push(`${pad}${key}:`);
        lines.push(objToYaml(value, indent + 1));
      } else if (value !== null && typeof value === "object") {
        lines.push(`${pad}${key}:`);
        lines.push(objToYaml(value, indent + 1));
      } else {
        lines.push(`${pad}${key}: ${yamlQuote(value)}`);
      }
    }
  }
  return lines.join("\n");
}

// XML  ─────────────────────────────────────────────────────────────────
function escXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function objToXml(obj: JsonValue, indent = 1): string {
  const pad = "  ".repeat(indent);
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (item !== null && typeof item === "object") {
        return `${pad}<item>\n${objToXml(item, indent + 1)}\n${pad}</item>`;
      }
      return `${pad}<item>${escXml(String(item ?? ""))}</item>`;
    }).join("\n");
  }
  if (obj !== null && typeof obj === "object") {
    return Object.entries(obj).map(([key, value]) => {
      const tag = key.replace(/[^a-zA-Z0-9_\-]/g, "_");
      if (value !== null && typeof value === "object") {
        return `${pad}<${tag}>\n${objToXml(value, indent + 1)}\n${pad}</${tag}>`;
      }
      return `${pad}<${tag}>${escXml(String(value ?? ""))}</${tag}>`;
    }).join("\n");
  }
  return `${" ".repeat(indent * 2)}${escXml(String(obj ?? ""))}`;
}

// TON  ─────────────────────────────────────────────────────────────────
function tonLiteral(v: JsonValue): string {
  if (v === null) return "null";
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  return `"${String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function objToTon(obj: JsonValue, indent = 0): string {
  const pad = "  ".repeat(indent);
  const lines: string[] = [];

  if (Array.isArray(obj)) {
    const allPrimitive = obj.every(i => i === null || typeof i !== "object");
    if (allPrimitive) return `[${obj.map(tonLiteral).join(", ")}]`;
    return obj.map(item => {
      if (item !== null && typeof item === "object" && !Array.isArray(item)) {
        return `${pad}{\n${objToTon(item, indent + 1)}\n${pad}}`;
      }
      return `${pad}${tonLiteral(item)}`;
    }).join("\n");
  }

  if (obj !== null && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        const allPrimitive = value.every(i => i === null || typeof i !== "object");
        if (allPrimitive) {
          lines.push(`${pad}${key} = [${value.map(tonLiteral).join(", ")}]`);
        } else {
          lines.push(`${pad}${key} = [`);
          for (const item of value) {
            if (item !== null && typeof item === "object") {
              lines.push(`${pad}  {`);
              lines.push(objToTon(item, indent + 2));
              lines.push(`${pad}  }`);
            } else {
              lines.push(`${pad}  ${tonLiteral(item)}`);
            }
          }
          lines.push(`${pad}]`);
        }
      } else if (value !== null && typeof value === "object") {
        lines.push(`${pad}${key} {`);
        lines.push(objToTon(value, indent + 1));
        lines.push(`${pad}}`);
      } else {
        lines.push(`${pad}${key} = ${tonLiteral(value)}`);
      }
    }
  }
  return lines.join("\n");
}

/* ====================================================================
   CONVERSION ENGINE
   ==================================================================== */

function convert(source: string, inputFmt: Format, outputFmt: Format): string {
  if (!source.trim()) return "";

  let obj: JsonValue;
  if (inputFmt === "MSN") {
    obj = compileMSN(source);
  } else if (inputFmt === "JSON") {
    obj = JSON.parse(source) as JsonValue;
  } else {
    throw new Error(`Input format ${inputFmt} is not yet supported`);
  }

  switch (outputFmt) {
    case "JSON": return JSON.stringify(obj, null, 2);
    case "MSN":  return objToMsn(obj);
    case "YAML": return objToYaml(obj);
    case "TON":  return objToTon(obj);
    case "XML":  return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${objToXml(obj, 1)}\n</root>`;
  }
}

/* ====================================================================
   DEFAULT SOURCES
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

const DEFAULT_JSON = `{
  "app": {
    "name": "my-app",
    "version": "1.0.0",
    "debug": false
  },
  "server": {
    "host": "0.0.0.0",
    "port": 3000,
    "ssl": {
      "enabled": true,
      "cert": "/path/to/cert.pem"
    }
  },
  "database": {
    "driver": "postgres",
    "host": "db.example.com",
    "port": 5432
  },
  "features": ["auth", "api", "logging"]
}`;

function defaultSource(fmt: Format): string {
  return fmt === "JSON" ? DEFAULT_JSON : DEFAULT_MSN;
}

/* ====================================================================
   STATS
   ==================================================================== */

function countTokens(text: string): number {
  return text.split(/[\s,{}[\]:;"'<>/=]+/).filter(Boolean).length;
}

function countLines(text: string): number {
  return text ? text.split(/\r?\n/).length : 0;
}

/* ====================================================================
   PAGE COMPONENT
   ==================================================================== */

export default function PlaygroundPage() {
  const [inputFmt, setInputFmt] = useState<Format>("MSN");
  const [outputFmt, setOutputFmt] = useState<Format>("JSON");
  const [source, setSource] = useState(DEFAULT_MSN);
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    try {
      const result = convert(source, inputFmt, outputFmt);
      return { output: result, error: null };
    } catch (e: unknown) {
      return { output: "", error: e instanceof Error ? e.message : String(e) };
    }
  }, [source, inputFmt, outputFmt]);

  const inputStats  = useMemo(() => ({ chars: source.length, lines: countLines(source), tokens: countTokens(source) }), [source]);
  const outputStats = useMemo(() => ({ chars: output.length, lines: countLines(output), tokens: countTokens(output) }), [output]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [output]);

  const handleSwap = useCallback(() => {
    if (!output || error) return;
    const newIn = outputFmt;
    const newOut = inputFmt;
    if (INPUT_FORMATS.includes(newIn) && OUTPUT_FORMATS.includes(newOut)) {
      setSource(output);
      setInputFmt(newIn);
      setOutputFmt(newOut);
    }
  }, [output, error, inputFmt, outputFmt]);

  function handleInputFmtChange(fmt: Format) {
    setInputFmt(fmt);
    setSource(defaultSource(fmt));
    if (outputFmt === fmt) setOutputFmt(fmt === "MSN" ? "JSON" : "MSN");
  }

  const savings =
    !error && inputStats.chars > 0 && outputStats.chars > 0
      ? Math.round((1 - inputStats.chars / outputStats.chars) * 100)
      : null;

  const inputMeta  = FORMAT_META[inputFmt];
  const outputMeta = FORMAT_META[outputFmt];

  return (
    <main className="pt-24 pb-16 min-h-screen">
      <div className="mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">
              <span className="gradient-text">Playground</span>
            </h1>
            <span className="px-2 py-0.5 text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full">v2</span>
          </div>
          <p className="text-gray-400 text-lg">
            Convert between MSN, JSON, YAML, XML, and TON — bidirectionally.
          </p>
        </motion.div>

        {/* Format toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">Input</span>
            <div className="flex gap-1 p-1 bg-white/3 border border-white/8 rounded-xl">
              {INPUT_FORMATS.map(f => (
                <button
                  key={f}
                  onClick={() => handleInputFmtChange(f)}
                  className={`px-3 py-1 text-xs font-semibold font-mono rounded-lg transition-all ${
                    inputFmt === f
                      ? `${FORMAT_META[f].bg} ${FORMAT_META[f].color} ${FORMAT_META[f].border} border`
                      : "text-gray-500 hover:text-gray-300 border border-transparent hover:bg-white/5"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Swap button */}
          <button
            onClick={handleSwap}
            title="Swap input ↔ output"
            disabled={!!error || !output || !INPUT_FORMATS.includes(outputFmt) || !OUTPUT_FORMATS.includes(inputFmt)}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">Output</span>
            <div className="flex gap-1 p-1 bg-white/3 border border-white/8 rounded-xl">
              {OUTPUT_FORMATS.filter(f => f !== inputFmt).map(f => (
                <button
                  key={f}
                  onClick={() => setOutputFmt(f)}
                  className={`px-3 py-1 text-xs font-semibold font-mono rounded-lg transition-all ${
                    outputFmt === f
                      ? `${FORMAT_META[f].bg} ${FORMAT_META[f].color} ${FORMAT_META[f].border} border`
                      : "text-gray-500 hover:text-gray-300 border border-transparent hover:bg-white/5"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {savings !== null && savings > 0 && (
            <span className="ml-auto px-3 py-1 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 rounded-full">
              {inputFmt} is {savings}% smaller
            </span>
          )}
        </div>

        {/* Editor panels */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 min-h-[480px]">
          {/* Input */}
          <div className="flex flex-col rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-500/70 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500/70 rounded-full" />
                <div className="w-3 h-3 bg-green-500/70 rounded-full" />
              </div>
              <span className="ml-2 text-[11px] text-gray-500 font-mono">input{inputMeta.ext}</span>
              <span className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded ${inputMeta.bg} ${inputMeta.color}`}>
                {inputFmt}
              </span>
            </div>
            <textarea
              value={source}
              onChange={e => setSource(e.target.value)}
              spellCheck={false}
              placeholder={`Type ${inputFmt} here…`}
              aria-label="Input source"
              className="flex-1 p-5 text-sm font-mono text-gray-300 leading-relaxed bg-gray-900/50 resize-none focus:outline-none min-h-[380px] lg:min-h-0"
            />
            <StatsBar chars={inputStats.chars} lines={inputStats.lines} tokens={inputStats.tokens} />
          </div>

          {/* Output */}
          <div className="flex flex-col rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-500/70 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500/70 rounded-full" />
                <div className="w-3 h-3 bg-green-500/70 rounded-full" />
              </div>
              <span className="ml-2 text-[11px] text-gray-500 font-mono">output{outputMeta.ext}</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${outputMeta.bg} ${outputMeta.color}`}>
                {outputFmt}
              </span>
              <button
                onClick={handleCopy}
                disabled={!!error || !output}
                className="ml-auto px-3 py-1 text-[11px] font-medium text-gray-400 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {error ? (
              <div className="flex-1 p-6 bg-gray-900/50 min-h-[380px] lg:min-h-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500/15 text-red-400 text-xs font-bold">!</span>
                  <span className="text-sm font-semibold text-red-400">Parse Error</span>
                </div>
                <pre className="text-xs font-mono text-red-300/80 whitespace-pre-wrap leading-relaxed">{error}</pre>
              </div>
            ) : (
              <pre className="flex-1 overflow-auto p-5 text-sm font-mono text-gray-300 leading-relaxed bg-gray-900/50 min-h-[380px] lg:min-h-0">
                <code>{output}</code>
              </pre>
            )}

            <StatsBar chars={outputStats.chars} lines={outputStats.lines} tokens={outputStats.tokens} />
          </div>
        </div>

        {/* Summary stat cards */}
        {!error && output && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <StatCard label={`${inputFmt} Chars`}  value={inputStats.chars.toLocaleString()}  sub="input" />
            <StatCard label={`${outputFmt} Chars`}  value={outputStats.chars.toLocaleString()} sub="output" />
            <StatCard
              label="Char Diff"
              value={
                outputStats.chars > inputStats.chars
                  ? `+${(outputStats.chars - inputStats.chars).toLocaleString()}`
                  : (outputStats.chars - inputStats.chars).toLocaleString()
              }
              sub={outputStats.chars < inputStats.chars ? "input is smaller" : "output is smaller"}
              highlight={outputStats.chars > inputStats.chars}
            />
            <StatCard
              label="Size Ratio"
              value={`${((outputStats.chars / Math.max(inputStats.chars, 1)) * 100).toFixed(0)}%`}
              sub={`${outputFmt} of ${inputFmt}`}
            />
          </motion.div>
        )}
      </div>
    </main>
  );
}

function StatsBar({ chars, lines, tokens }: { chars: number; lines: number; tokens: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-900/80 border-t border-white/5 text-[11px] font-mono text-gray-600 select-none">
      <span>{chars.toLocaleString()} chars</span>
      <span className="w-px h-3 bg-white/10" />
      <span>{lines} lines</span>
      <span className="w-px h-3 bg-white/10" />
      <span>~{tokens} tokens</span>
    </div>
  );
}

function StatCard({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className="p-4 rounded-xl glass-card text-center">
      <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${highlight ? "text-green-400" : "text-white"}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
    </div>
  );
}
