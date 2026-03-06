"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

const defaultMsn = `# Try editing this!
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

// Minimal inline MSN compiler for the playground page
function compileMsn(source: string): string {
  const lines = source.split("\n");
  const root: Record<string, unknown> = {};
  const stack: Array<{
    depth: number;
    obj: Record<string, unknown>;
    key: string;
    isArray: boolean;
  }> = [];
  let currentObj = root;
  let currentDepth = 0;

  for (const rawLine of lines) {
    const line = rawLine.replace(/#.*$/, "").trimEnd();
    if (!line.trim()) continue;

    const match = line.match(/^(-+)\s*(.*)/);
    if (!match) continue;

    const depth = match[1].length;
    const content = match[2];

    // Navigate stack
    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      const popped = stack.pop()!;
      currentObj = popped.obj;
      currentDepth = popped.depth;
    }

    if (content.startsWith("* ")) {
      const val = content.slice(2).trim();
      const parentKey = stack.length > 0 ? stack[stack.length - 1].key : "";
      const target =
        stack.length > 0 ? stack[stack.length - 1].obj : currentObj;
      if (parentKey && !Array.isArray(target[parentKey])) {
        target[parentKey] = [];
      }
      if (parentKey && Array.isArray(target[parentKey])) {
        (target[parentKey] as unknown[]).push(inferType(val));
      }
      continue;
    }

    if (content === "*") {
      const parentKey = stack.length > 0 ? stack[stack.length - 1].key : "";
      const target =
        stack.length > 0 ? stack[stack.length - 1].obj : currentObj;
      if (parentKey && !Array.isArray(target[parentKey])) {
        target[parentKey] = [];
      }
      const newObj: Record<string, unknown> = {};
      if (parentKey && Array.isArray(target[parentKey])) {
        (target[parentKey] as unknown[]).push(newObj);
      }
      stack.push({ depth, obj: currentObj, key: "", isArray: false });
      currentObj = newObj;
      currentDepth = depth;
      continue;
    }

    const kvMatch = content.match(/^([^:]+):\s*(.*)?$/);
    if (kvMatch) {
      const key = kvMatch[1].trim();
      const val = (kvMatch[2] ?? "").trim();
      if (val === "" || val === undefined) {
        // Container
        const newObj: Record<string, unknown> = {};
        currentObj[key] = newObj;
        stack.push({ depth, obj: currentObj, key, isArray: false });
        currentObj = newObj;
        currentDepth = depth;
      } else {
        currentObj[key] = inferType(val);
      }
    } else {
      // Container without colon
      const key = content.trim();
      const newObj: Record<string, unknown> = {};
      currentObj[key] = newObj;
      stack.push({ depth, obj: currentObj, key, isArray: false });
      currentObj = newObj;
      currentDepth = depth;
    }
  }

  return JSON.stringify(root, null, 2);
}

function inferType(val: string): unknown {
  if (val === "true") return true;
  if (val === "false") return false;
  if (val === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
  if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);
  return val;
}

export default function PlaygroundPage() {
  const [msn, setMsn] = useState(defaultMsn);
  const [error, setError] = useState<string | null>(null);

  const json = (() => {
    try {
      const result = compileMsn(msn);
      if (error) setError(null);
      return result;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Compilation error";
      return `Error: ${msg}`;
    }
  })();

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(json);
  }, [json]);

  return (
    <main className="pt-24 pb-16 min-h-screen">
      <div className="mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-4xl font-bold"
        >
          Playground
        </motion.h1>
        <p className="mb-8 text-gray-400 text-lg">
          Write MSN on the left, see compiled JSON on the right. Changes apply
          instantly.
        </p>

        <div className="grid grid-cols-1 gap-6 h-[calc(100vh-280px)] min-h-[500px] lg:grid-cols-2">
          {/* MSN Editor */}
          <div className="overflow-hidden flex flex-col rounded-2xl border-white/10 border">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-500/80 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500/80 rounded-full" />
                <div className="w-3 h-3 bg-green-500/80 rounded-full" />
              </div>
              <span className="ml-2 text-xs text-gray-500 font-mono">
                input.msn
              </span>
              <span className="ml-auto px-2 py-0.5 text-xs text-msn-400 bg-msn-500/20 rounded">
                MSN
              </span>
            </div>
            <textarea
              value={msn}
              onChange={(e) => setMsn(e.target.value)}
              className="flex-1 p-6 text-sm font-mono text-gray-300 leading-relaxed bg-gray-900/50 resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>

          {/* JSON Output */}
          <div className="overflow-hidden flex flex-col rounded-2xl border-white/10 border">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-500/80 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500/80 rounded-full" />
                <div className="w-3 h-3 bg-green-500/80 rounded-full" />
              </div>
              <span className="ml-2 text-xs text-gray-500 font-mono">
                output.json
              </span>
              <span className="ml-auto px-2 py-0.5 text-xs text-yellow-400 bg-yellow-500/20 rounded">
                JSON
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-xs text-gray-400 bg-white/5 rounded-lg transition-colors hover:bg-white/10 hover:text-white"
              >
                Copy
              </button>
            </div>
            <pre className="overflow-auto flex-1 p-6 text-sm font-mono text-gray-300 leading-relaxed bg-gray-900/50">
              <code>{json}</code>
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}
