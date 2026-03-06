"use client";

import { motion } from "framer-motion";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Comprehensive documentation — from docs/ folder + spec            */
/* ------------------------------------------------------------------ */

interface DocSection {
  id: string;
  title: string;
  content: string;
  group: string;
}

const sections: DocSection[] = [
  /* ==================== GETTING STARTED ==================== */
  {
    id: "introduction",
    title: "What is MSN?",
    group: "Getting Started",
    content: `**Mad Sam Notation (MSN)** is a token-efficient hierarchical data language that compiles directly to JSON. It was designed to minimize token usage in AI/LLM workflows while remaining human-readable and writable.

**Key characteristics:**
- Uses **dash prefixes** to represent hierarchy depth — no brackets, braces, or commas
- Up to **60% fewer tokens** than equivalent JSON
- **Automatic type inference** for numbers, booleans, null, and strings
- Full **JSON compatibility** — every MSN file compiles to valid JSON
- **Unlimited nesting depth** — just keep adding dashes
- **Comments** are first-class citizens
- **MIT licensed** and fully open source

MSN files use the \`.msn\` extension and the MIME type \`application/x-msn\`. All files MUST be encoded in **UTF-8**.`,
  },
  {
    id: "installation",
    title: "Installation",
    group: "Getting Started",
    content: `**CLI Tool** — for compiling, validating, and formatting MSN files from the terminal:

\`\`\`bash
npm install -g @madsn/cli
\`\`\`

**Parser Library** — for integrating MSN into your Node.js / TypeScript projects:

\`\`\`bash
npm install @madsn/parser
\`\`\`

**Validator** — standalone validation of MSN syntax:

\`\`\`bash
npm install @madsn/validator
\`\`\`

**Formatter** — auto-format MSN source files:

\`\`\`bash
npm install @madsn/formatter
\`\`\`

**VS Code Extension** — search for **"MSN"** in the VS Code extensions marketplace, or install \`msn-vscode\` for syntax highlighting and language support.`,
  },
  {
    id: "quick-start",
    title: "Quick Start",
    group: "Getting Started",
    content: `**1. Create a file** called \`config.msn\`:

\`\`\`msn
- name: My Application
- version: 1.0.0
- server
-- host: localhost
-- port: 3000
\`\`\`

**2. Compile with the CLI:**

\`\`\`bash
msn compile config.msn
\`\`\`

**Output:**

\`\`\`json
{
  "name": "My Application",
  "version": "1.0.0",
  "server": {
    "host": "localhost",
    "port": 3000
  }
}
\`\`\`

**3. Or use the library in code:**

\`\`\`typescript
import { compile } from "@madsn/parser";
import { readFileSync } from "fs";

const source = readFileSync("config.msn", "utf-8");
const result = compile(source);
console.log(result);
// { name: "My Application", version: "1.0.0", server: { host: "localhost", port: 3000 } }
\`\`\`

**4. Save to a file:**

\`\`\`bash
msn compile config.msn --output config.json
\`\`\``,
  },

  /* ==================== LANGUAGE SYNTAX ==================== */
  {
    id: "line-structure",
    title: "Line Structure",
    group: "Language Syntax",
    content: `Every MSN line follows one of these patterns:

| Pattern | Meaning |
|---------|---------|
| \`- key: value\` | Key-value pair |
| \`- key\` | Container (creates nested object) |
| \`-- * value\` | Array item (simple value) |
| \`-- *\` | Array object marker (children become object properties) |
| \`# comment\` | Comment (ignored during compilation) |
| *(blank line)* | Ignored |

**Rules:**
- Every data line MUST start with one or more dashes \`-\`
- There MUST be a space after the dash prefix
- Lines not starting with \`-\` or \`#\` (excluding blank lines) are invalid`,
  },
  {
    id: "depth-nesting",
    title: "Depth & Nesting",
    group: "Language Syntax",
    content: `The number of dashes determines the depth level. Each additional dash increases the nesting depth by one.

\`\`\`msn
- root                 # depth 1 (1 dash)
-- child               # depth 2 (2 dashes)
--- grandchild: value  # depth 3 (3 dashes)
---- deep: value       # depth 4 (4 dashes)
\`\`\`

Compiles to:
\`\`\`json
{
  "root": {
    "child": {
      "grandchild": "value",
      "deep": "value"
    }
  }
}
\`\`\`

**Depth Rules:**
1. Depth can **increase by at most 1** per line (you can't jump from 1 dash to 3 dashes)
2. Depth can **decrease by any amount** (closing multiple levels at once)
3. A line with N dashes is a **child** of the nearest preceding line with N-1 dashes
4. There is **no limit** to nesting depth — just keep adding dashes

**Example — decreasing depth:**

\`\`\`msn
- server
-- ssl
--- enabled: true
--- cert: /path/to/cert.pem
-- host: localhost
- database
-- host: db.example.com
\`\`\`

Notice how \`-- host: localhost\` drops back to depth 2, closing the \`ssl\` object. Then \`- database\` drops to depth 1, closing \`server\`.`,
  },
  {
    id: "key-value-pairs",
    title: "Key-Value Pairs",
    group: "Language Syntax",
    content: `A key-value pair is written as dashes, a space, the key, a colon, a space, and the value:

\`\`\`msn
- name: John
- age: 30
- active: true
- score: 95.5
- data: null
\`\`\`

Compiles to:
\`\`\`json
{
  "name": "John",
  "age": 30,
  "active": true,
  "score": 95.5,
  "data": null
}
\`\`\`

**Rules:**
1. The colon \`:\` separates the key from the value
2. There MUST be a **space after the colon**
3. Keys MUST NOT contain colons (unless the value part is used correctly)
4. Keys are **case-sensitive**
5. Leading/trailing whitespace in values is trimmed`,
  },
  {
    id: "type-inference",
    title: "Type Inference",
    group: "Language Syntax",
    content: `MSN automatically infers types from values — no explicit typing needed:

| MSN Value | JSON Type | JSON Output | Example |
|-----------|-----------|-------------|---------|
| \`42\` | number | \`42\` | \`- count: 42\` |
| \`3.14\` | number | \`3.14\` | \`- pi: 3.14\` |
| \`-7\` | number | \`-7\` | \`- offset: -7\` |
| \`true\` | boolean | \`true\` | \`- active: true\` |
| \`false\` | boolean | \`false\` | \`- debug: false\` |
| \`null\` | null | \`null\` | \`- data: null\` |
| \`hello\` | string | \`"hello"\` | \`- name: hello\` |
| \`"42"\` | string | \`"42"\` | \`- code: "42"\` |

**Rules:**
1. Unquoted integers and floats become \`number\`
2. \`true\` and \`false\` become \`boolean\`
3. \`null\` becomes \`null\`
4. Everything else becomes \`string\`
5. Values wrapped in **double quotes** are always treated as \`string\` (use this to force a number to be a string)
6. Leading/trailing whitespace is trimmed before inference`,
  },
  {
    id: "containers",
    title: "Containers (Objects)",
    group: "Language Syntax",
    content: `A key without a value creates a **container** — a nested object whose properties are defined by its children:

\`\`\`msn
- database
-- host: localhost
-- port: 5432
-- credentials
--- username: admin
--- password: secret
\`\`\`

Compiles to:
\`\`\`json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "credentials": {
      "username": "admin",
      "password": "secret"
    }
  }
}
\`\`\`

Containers can be nested to any depth. Any line with only a key (no colon, no value) signals that the following deeper lines are its children.`,
  },
  {
    id: "arrays",
    title: "Arrays",
    group: "Language Syntax",
    content: `Use an asterisk \`*\` after the dash prefix to create array items:

**Simple arrays** — values on the same line as \`*\`:

\`\`\`msn
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

**Rules:**
1. Array items use \`*\` after the dash prefix: \`-- * value\`
2. There MUST be a **space after the \`*\`**
3. All array items under a parent MUST be at the **same depth**
4. Array items inherit type inference (\`-- * 42\` becomes the number \`42\`)
5. Array items and key-value pairs SHOULD NOT be mixed under the same parent`,
  },
  {
    id: "array-objects",
    title: "Array Objects",
    group: "Language Syntax",
    content: `A bare \`*\` with no value creates an **array object entry**. Children at a deeper level become the properties of that object:

\`\`\`msn
- users
-- *
--- name: Alice
--- age: 30
--- role: admin
-- *
--- name: Bob
--- age: 25
--- role: user
\`\`\`

Compiles to:
\`\`\`json
{
  "users": [
    { "name": "Alice", "age": 30, "role": "admin" },
    { "name": "Bob", "age": 25, "role": "user" }
  ]
}
\`\`\`

**Nested array objects** — arrays of objects can contain their own nested objects:

\`\`\`msn
- services
-- *
--- name: web
--- config
---- port: 80
---- ssl: true
-- *
--- name: api
--- config
---- port: 3000
---- ssl: false
\`\`\`

Compiles to:
\`\`\`json
{
  "services": [
    { "name": "web", "config": { "port": 80, "ssl": true } },
    { "name": "api", "config": { "port": 3000, "ssl": false } }
  ]
}
\`\`\``,
  },
  {
    id: "multiline",
    title: "Multiline Values",
    group: "Language Syntax",
    content: `MSN supports two multiline modes using the pipe \`|\` and angle bracket \`>\` characters:

**Literal Block (\`|\`)** — preserves line breaks:

\`\`\`msn
- description: |
-- This is line one.
-- This is line two.
-- This is line three.
\`\`\`

Produces: \`"This is line one.\\nThis is line two.\\nThis is line three."\`

**Folded Block (\`>\`)** — joins lines with spaces:

\`\`\`msn
- summary: >
-- This is a long paragraph
-- that will be joined into
-- a single line with spaces.
\`\`\`

Produces: \`"This is a long paragraph that will be joined into a single line with spaces."\`

**Rules:**
1. \`|\` preserves line breaks (literal block)
2. \`>\` folds lines into a single line joined by spaces (folded block)
3. Continuation lines MUST be at depth **N+1** relative to the key
4. Continuation lines are treated as **text**, not as key-value pairs`,
  },
  {
    id: "comments",
    title: "Comments",
    group: "Language Syntax",
    content: `Lines starting with \`#\` are comments and are ignored during compilation:

\`\`\`msn
# Full line comment
- app
-- name: my-app    # inline comment
-- debug: false
# Another comment between entries
-- port: 3000
\`\`\`

**Rules:**
1. Lines starting with \`#\` (after optional whitespace) are **full-line comments**
2. \`#\` after a value (preceded by a space) starts an **inline comment**
3. Comments are **stripped during parsing** and do not appear in output
4. \`#\` inside quoted strings is NOT treated as a comment`,
  },

  /* ==================== API REFERENCE ==================== */
  {
    id: "api-parser",
    title: "Parser API (@madsn/parser)",
    group: "API Reference",
    content: `The core parser package provides tokenization, parsing, AST construction, and compilation to JSON.

**\`compile(source: string): JsonValue\`**

Compiles MSN source text to a JSON-compatible JavaScript value (object, array, string, number, boolean, or null).

\`\`\`typescript
import { compile } from "@madsn/parser";

const result = compile(\`
- name: My App
- version: 1.0.0
- server
-- host: localhost
-- port: 3000
\`);
console.log(result);
// { name: "My App", version: "1.0.0", server: { host: "localhost", port: 3000 } }
\`\`\`

**\`compileToString(source: string, indent?: number): string\`**

Compiles MSN source and returns a formatted JSON string.

\`\`\`typescript
import { compileToString } from "@madsn/parser";

const json = compileToString("- name: hello\\n- count: 42", 2);
// '{ "name": "hello", "count": 42 }'
\`\`\`

**\`class Lexer\`**

Tokenizes MSN source code into a stream of typed tokens.

\`\`\`typescript
import { Lexer } from "@madsn/parser";

const lexer = new Lexer("- name: hello");
const tokens = lexer.tokenize();
// [{ type: "KEY_VALUE", depth: 1, key: "name", value: "hello", ... }]
\`\`\`

**\`class Parser\`**

Parses MSN source into an Abstract Syntax Tree (AST).

\`\`\`typescript
import { Parser } from "@madsn/parser";

const parser = new Parser();
const ast = parser.parse("- name: hello");
// { type: "root", children: [{ type: "value", key: "name", value: "hello", ... }] }
\`\`\`

**\`class Compiler\`**

Converts MSN source to JSON (combines Lexer + Parser + AST evaluation).

\`\`\`typescript
import { Compiler } from "@madsn/parser";

const compiler = new Compiler();
const obj = compiler.compile("- name: hello");
const str = compiler.compileToString("- name: hello", 2);
\`\`\`

**\`inferType(value: string): string | number | boolean | null\`**

Infers the JSON type from a raw string value.

\`\`\`typescript
import { inferType } from "@madsn/parser";

inferType("42");      // 42 (number)
inferType("true");    // true (boolean)
inferType("null");    // null
inferType("hello");   // "hello" (string)
inferType('"42"');    // "42" (forced string)
\`\`\``,
  },
  {
    id: "api-validator",
    title: "Validator API (@madsn/validator)",
    group: "API Reference",
    content: `The validator checks MSN syntax and returns an array of errors and warnings.

**\`validate(source: string): ValidationError[]\`**

Validates MSN syntax and returns errors.

\`\`\`typescript
import { validate } from "@madsn/validator";

const errors = validate("- name: hello");
// [] (no errors)

const bad = validate("name: hello");
// [{ message: "Line must start with dashes", line: 1, severity: "error" }]
\`\`\`

**\`validateIndentation(source: string): ValidationError[]\`**

Checks for indentation-related issues (warnings about inconsistent spacing, depth jumps, etc.).

**\`validateAll(source: string): ValidationError[]\`**

Runs **all** validation checks — syntax errors, indentation warnings, and structural issues.

**\`ValidationError\` type:**

\`\`\`typescript
interface ValidationError {
  message: string;
  line: number;
  column?: number;
  severity: "error" | "warning";
}
\`\`\``,
  },
  {
    id: "api-formatter",
    title: "Formatter API (@madsn/formatter)",
    group: "API Reference",
    content: `The formatter normalizes MSN source code for consistent style.

**\`format(source: string, options?: FormatOptions): string\`**

Formats MSN source text — trims whitespace, normalizes dash spacing, ensures consistent style.

\`\`\`typescript
import { format } from "@madsn/formatter";

const formatted = format("  -  name:  hello  ");
// "- name: hello\\n"
\`\`\`

**\`FormatOptions\`:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| \`finalNewline\` | boolean | \`true\` | Add a newline at the end of the file |
| \`removeBlankLines\` | boolean | \`false\` | Remove blank lines between entries |

\`\`\`typescript
import { format } from "@madsn/formatter";

const formatted = format(source, {
  finalNewline: true,
  removeBlankLines: false,
});
\`\`\``,
  },
  {
    id: "api-types",
    title: "TypeScript Types",
    group: "API Reference",
    content: `All packages export TypeScript types for full type safety.

**\`Token\`** — represents a single lexer token:

\`\`\`typescript
interface Token {
  type: TokenType;
  depth: number;
  key?: string;
  value?: string;
  raw: string;
  line: number;
  multilineMode?: "|" | ">";
}
\`\`\`

**\`ASTNode\`** — a node in the abstract syntax tree:

\`\`\`typescript
interface ASTNode {
  type: "object" | "array" | "value" | "array-item" | "root";
  key?: string;
  value?: JsonValue;
  children: ASTNode[];
  line?: number;
  depth?: number;
}
\`\`\`

**\`JsonValue\`** — any valid JSON value:

\`\`\`typescript
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
\`\`\`

**\`ValidationError\`** — returned by the validator:

\`\`\`typescript
interface ValidationError {
  message: string;
  line: number;
  column?: number;
  severity: "error" | "warning";
}
\`\`\``,
  },

  /* ==================== CLI REFERENCE ==================== */
  {
    id: "cli-install",
    title: "CLI Installation",
    group: "CLI Reference",
    content: `Install the MSN CLI globally:

\`\`\`bash
npm install -g @madsn/cli
\`\`\`

Verify the installation:

\`\`\`bash
msn --version
msn --help
\`\`\``,
  },
  {
    id: "cli-commands",
    title: "CLI Commands",
    group: "CLI Reference",
    content: `**\`msn compile <file>\`** — Compile an MSN file to JSON

\`\`\`bash
msn compile config.msn
msn compile config.msn --indent 4
msn compile config.msn --output config.json
\`\`\`

**\`msn parse <file>\`** — Parse an MSN file and output the AST (useful for debugging)

\`\`\`bash
msn parse config.msn
\`\`\`

**\`msn validate <file>\`** — Validate an MSN file for syntax errors

\`\`\`bash
msn validate config.msn
\`\`\`

**\`msn format <file>\`** — Auto-format an MSN file

\`\`\`bash
msn format config.msn
msn format config.msn --output formatted.msn
\`\`\``,
  },
  {
    id: "cli-options",
    title: "CLI Options & Stdin",
    group: "CLI Reference",
    content: `**Options:**

| Option | Description |
|--------|-------------|
| \`-o, --output <file>\` | Write output to a file instead of stdout |
| \`-i, --indent <n>\` | JSON indentation level (default: 2) |
| \`--stdin\` | Read MSN input from stdin instead of a file |
| \`-h, --help\` | Show help information |
| \`-v, --version\` | Show the installed version |

**Reading from stdin:**

\`\`\`bash
cat config.msn | msn compile --stdin
echo "- name: test" | msn compile --stdin
\`\`\`

**Piping output:**

\`\`\`bash
msn compile config.msn | jq '.server.port'
msn compile config.msn > output.json
\`\`\``,
  },

  /* ==================== SPECIFICATION ==================== */
  {
    id: "json-mapping",
    title: "JSON Mapping",
    group: "Specification",
    content: `MSN maps to JSON with these correspondences:

| MSN Construct | JSON Equivalent |
|---------------|-----------------|
| \`- key: value\` | \`{ "key": value }\` |
| \`- key\` (with children) | \`{ "key": { ... } }\` |
| \`-- * value\` | \`[ value, ... ]\` |
| \`-- *\` (with children) | \`[ { ... }, ... ]\` |
| \`- key: \\|\` (multiline) | \`{ "key": "line1\\nline2" }\` |
| \`- key: >\` (folded) | \`{ "key": "line1 line2" }\` |
| \`# comment\` | *(omitted)* |`,
  },
  {
    id: "grammar",
    title: "Formal Grammar (EBNF)",
    group: "Specification",
    content: `The formal grammar of MSN in Extended Backus-Naur Form:

\`\`\`ebnf
document    = { line } ;
line        = comment | entry | blank ;
comment     = { whitespace } , "#" , { any_char } ;
entry       = dashes , " " , ( array_item | key_value | container ) , [ inline_comment ] ;
dashes      = "-" , { "-" } ;
array_item  = "* " , ( value | "" ) ;
key_value   = key , ": " , value ;
container   = key ;
key         = identifier ;
value       = string | number | boolean | null_val | multiline_marker ;
string      = quoted_string | unquoted_string ;
number      = integer | float ;
boolean     = "true" | "false" ;
null_val    = "null" ;
multiline_marker = "|" | ">" ;
inline_comment   = " #" , { any_char } ;
\`\`\``,
  },
  {
    id: "error-handling",
    title: "Error Handling",
    group: "Specification",
    content: `MSN parsers MUST report errors for:

1. **Invalid line start** — Lines not starting with \`-\` or \`#\` (excluding blank lines)
2. **Depth jump** — Depth increase greater than 1 between consecutive non-comment lines
3. **Missing space after dashes** — e.g. \`-name: value\` instead of \`- name: value\`
4. **Missing space after colon** — e.g. \`- name:value\` instead of \`- name: value\`
5. **Mixed children** — Array items and key-value pairs at the same depth under the same parent
6. **Invalid multiline continuation** — Continuation lines at wrong depth (must be exactly N+1)

**Example error messages:**

\`\`\`
Error on line 3: Depth increased by 2 (from 1 to 3). Maximum increase is 1.
Error on line 5: Line must start with dashes (-).
Error on line 8: Missing space after colon in key-value pair.
Warning on line 12: Mixed array items and key-value pairs under the same parent.
\`\`\``,
  },

  /* ==================== ECOSYSTEM ==================== */
  {
    id: "project-structure",
    title: "Project Structure",
    group: "Ecosystem",
    content: `The MSN monorepo is organized into focused packages:

\`\`\`
msn/
├── packages/
│   ├── parser/              Core parser (lexer, parser, compiler)
│   ├── cli/                 Command-line interface
│   ├── validator/           Syntax validation
│   ├── formatter/           Auto-formatting
│   └── vscode-extension/    VS Code language support
├── tests/                   Full test suite (Vitest)
├── docs/                    Documentation source
├── examples/                Example MSN files
├── spec/                    Language specification
├── playground/              Interactive web playground (standalone)
└── website/                 Official website (Next.js)
\`\`\`

**Packages overview:**

| Package | npm | Purpose |
|---------|-----|---------|
| \`@madsn/parser\` | \`npm i @madsn/parser\` | Core tokenizer, parser, and compiler |
| \`@madsn/cli\` | \`npm i -g @madsn/cli\` | Terminal commands: compile, parse, validate, format |
| \`@madsn/validator\` | \`npm i @madsn/validator\` | Syntax and structure validation |
| \`@madsn/formatter\` | \`npm i @madsn/formatter\` | Auto-format MSN source files |
| \`msn-vscode\` | VS Code Marketplace | Syntax highlighting, language config |`,
  },
  {
    id: "vscode-extension",
    title: "VS Code Extension",
    group: "Ecosystem",
    content: `The MSN VS Code extension provides:

- **Syntax highlighting** — full TextMate grammar for \`.msn\` files
- **Language configuration** — bracket matching, auto-closing, comment toggling
- **File icon** — recognizable icon for \`.msn\` files in the explorer

**Installation:**
Search for **"MSN"** in the VS Code extensions marketplace, or install via the command palette.

**Features:**
- Comments toggle with \`Ctrl+/\`
- Bracket matching for multiline blocks
- Auto-indentation for nested structures
- Recognized \`.msn\` file association

**Contributing to the extension:**
The extension source is in \`packages/vscode-extension/\`. The TextMate grammar is defined in \`syntaxes/msn.tmLanguage.json\`.`,
  },

  /* ==================== CONTRIBUTING ==================== */
  {
    id: "contributing",
    title: "How to Contribute",
    group: "Contributing",
    content: `MSN is fully open source under the **MIT License**. We welcome contributions of all kinds — code, documentation, bug reports, and ideas.

**Step-by-step:**

1. **Fork** the repository at \`github.com/sammadijaz/msn\`
2. **Clone** your fork locally:
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/msn.git
   cd msn
   \`\`\`
3. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`
4. **Build all packages:**
   \`\`\`bash
   npm run build
   \`\`\`
5. **Create a branch:**
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`
6. **Make changes**, write tests, update docs
7. **Run tests:**
   \`\`\`bash
   npm test
   \`\`\`
8. **Submit a pull request** with a clear description

**Coding standards:**
- TypeScript strict mode
- No \`any\` types without justification
- Write tests for all new features
- Follow the existing code style`,
  },
  {
    id: "contribution-areas",
    title: "Contribution Areas",
    group: "Contributing",
    content: `**Core Parser** — Improve the lexer, parser, and compiler. Add error recovery, source maps, streaming support. *(Intermediate)*

**CLI Tool** — Add new commands, improve error messages, add watch mode, support config files. *(Beginner)*

**VS Code Extension** — Improve syntax highlighting, add IntelliSense, auto-completion, go-to-definition. *(Intermediate)*

**Documentation** — Write tutorials, improve API docs, add more examples, translate docs. *(Beginner)*

**Playground** — Improve the web playground with better error display, shareable URLs, themes. *(Beginner)*

**Language Ports** — Port the parser to other languages: Python, Rust, Go, Java, C#. *(Advanced)*

**Reporting issues:**
Please include the MSN input, expected output, actual output, Node.js version, and OS information.`,
  },
];

/* ------------------------------------------------------------------ */
/*  Groups for sidebar                                                */
/* ------------------------------------------------------------------ */
const groups = [
  "Getting Started",
  "Language Syntax",
  "API Reference",
  "CLI Reference",
  "Specification",
  "Ecosystem",
  "Contributing",
];

/* ------------------------------------------------------------------ */
/*  Markdown-like renderer                                            */
/* ------------------------------------------------------------------ */
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
            <div key={i} className="relative my-4 group">
              {lang && (
                <span className="absolute top-2 right-3 text-[10px] font-mono text-gray-500 tracking-wider uppercase">
                  {lang}
                </span>
              )}
              <pre className="overflow-x-auto p-4 text-sm bg-white/[0.03] rounded-xl border-white/10 border">
                <code className="font-mono text-gray-300 leading-relaxed">{code}</code>
              </pre>
            </div>
          );
        }
        return (
          <div key={i} className="text-gray-300 leading-relaxed">
            {part.split("\n").map((line, j) => {
              const trimmed = line.trim();

              // Table rows
              if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
                const cells = trimmed
                  .split("|")
                  .filter(Boolean)
                  .map((c) => c.trim());
                // Separator row
                if (cells.every((c) => /^[-:]+$/.test(c))) {
                  return <div key={j} className="border-b border-white/10" />;
                }
                return (
                  <div
                    key={j}
                    className="grid gap-4 py-2 px-1 font-mono text-xs border-b border-white/5"
                    style={{
                      gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {cells.map((cell, ci) => (
                      <span
                        key={ci}
                        className="text-gray-400"
                        dangerouslySetInnerHTML={{
                          __html: cell
                            .replace(
                              /\*\*(.*?)\*\*/g,
                              '<strong class="text-white font-semibold">$1</strong>',
                            )
                            .replace(
                              /`(.*?)`/g,
                              '<code class="text-msn-400 bg-white/5 px-1 py-0.5 rounded text-[11px]">$1</code>',
                            ),
                        }}
                      />
                    ))}
                  </div>
                );
              }

              if (trimmed === "") return <div key={j} className="h-3" />;

              return (
                <p
                  key={j}
                  className="mb-2 text-[15px]"
                  dangerouslySetInnerHTML={{
                    __html: line
                      .replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="text-white font-semibold">$1</strong>',
                      )
                      .replace(
                        /`(.*?)`/g,
                        '<code class="text-msn-400 bg-white/5 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>',
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

/* ------------------------------------------------------------------ */
/*  Page Component                                                    */
/* ------------------------------------------------------------------ */
export default function DocsPage() {
  return (
    <main className="pt-24 pb-16 min-h-screen">
      <div className="mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="shrink-0 lg:w-72">
            <nav className="space-y-6 lg:overflow-y-auto sticky top-28 pr-4 max-h-[calc(100vh-8rem)]">
              {groups.map((group) => (
                <div key={group}>
                  <p className="mb-2 px-3 text-[11px] font-bold text-gray-500 tracking-widest uppercase">
                    {group}
                  </p>
                  <div className="space-y-0.5">
                    {sections
                      .filter((s) => s.group === group)
                      .map((s) => (
                        <a
                          key={s.id}
                          href={`#${s.id}`}
                          className="block px-3 py-1.5 text-sm text-gray-400 rounded-lg transition-colors hover:text-white hover:bg-white/5"
                        >
                          {s.title}
                        </a>
                      ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h1 className="mb-4 text-4xl font-bold lg:text-5xl">
                <span className="gradient-text">Documentation</span>
              </h1>
              <p className="max-w-3xl text-gray-400 text-lg leading-relaxed">
                Complete reference for Mad Sam Notation — from first install to advanced usage.
                Everything you need to master MSN, its CLI, parser API, and ecosystem.
              </p>
            </motion.div>

            <div className="space-y-20">
              {groups.map((group) => (
                <div key={group}>
                  <div className="flex items-center gap-3 mb-10">
                    <div className="flex-1 h-px bg-gradient-to-r from-msn-500/40 to-transparent" />
                    <span className="text-xs font-bold text-msn-400 tracking-widest whitespace-nowrap uppercase">
                      {group}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-l from-msn-500/40 to-transparent" />
                  </div>

                  <div className="space-y-16">
                    {sections
                      .filter((s) => s.group === group)
                      .map((s) => (
                        <motion.section
                          key={s.id}
                          id={s.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ duration: 0.5 }}
                        >
                          <h2 className="mb-6 pb-3 text-2xl font-bold border-b border-white/10">
                            {s.title}
                          </h2>
                          <div className="prose-content">
                            <FormattedContent content={s.content} />
                          </div>
                        </motion.section>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
