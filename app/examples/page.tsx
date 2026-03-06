"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Example {
  title: string;
  description: string;
  filename: string;
  msn: string;
  json: string;
}

const examples: Example[] = [
  {
    title: "App Configuration",
    description:
      "A typical application configuration file with server settings, database, and feature flags.",
    filename: "app-config.msn",
    msn: `# Application Configuration
- app
-- name: my-awesome-app
-- version: 2.1.0
-- debug: false
- server
-- host: 0.0.0.0
-- port: 8080
-- cors
--- enabled: true
--- origins
---- * https://example.com
---- * https://app.example.com
- database
-- driver: postgres
-- host: db.internal
-- port: 5432
-- name: myapp_prod
-- pool
--- min: 5
--- max: 20
- features
-- * authentication
-- * rate-limiting
-- * websockets`,
    json: `{
  "app": {
    "name": "my-awesome-app",
    "version": "2.1.0",
    "debug": false
  },
  "server": {
    "host": "0.0.0.0",
    "port": 8080,
    "cors": {
      "enabled": true,
      "origins": [
        "https://example.com",
        "https://app.example.com"
      ]
    }
  },
  "database": {
    "driver": "postgres",
    "host": "db.internal",
    "port": 5432,
    "name": "myapp_prod",
    "pool": { "min": 5, "max": 20 }
  },
  "features": [
    "authentication",
    "rate-limiting",
    "websockets"
  ]
}`,
  },
  {
    title: "Docker Compose",
    description:
      "Docker Compose-style service definitions with networks and volumes.",
    filename: "docker-compose.msn",
    msn: `# Docker Compose Configuration
- version: "3.8"
- services
-- web
--- image: nginx:alpine
--- ports
---- * "80:80"
---- * "443:443"
--- volumes
---- * ./html:/usr/share/nginx/html
--- restart: always
-- api
--- build: ./api
--- ports
---- * "3000:3000"
--- environment
---- NODE_ENV: production
---- DB_HOST: db
--- depends_on
---- * db
-- db
--- image: postgres:15
--- environment
---- POSTGRES_DB: myapp
---- POSTGRES_PASSWORD: secret
--- volumes
---- * pgdata:/var/lib/postgresql/data`,
    json: `{
  "version": "3.8",
  "services": {
    "web": {
      "image": "nginx:alpine",
      "ports": ["80:80", "443:443"],
      "volumes": ["./html:/usr/share/nginx/html"],
      "restart": "always"
    },
    "api": {
      "build": "./api",
      "ports": ["3000:3000"],
      "environment": {
        "NODE_ENV": "production",
        "DB_HOST": "db"
      },
      "depends_on": ["db"]
    },
    "db": {
      "image": "postgres:15",
      "environment": {
        "POSTGRES_DB": "myapp",
        "POSTGRES_PASSWORD": "secret"
      },
      "volumes": ["pgdata:/var/lib/postgresql/data"]
    }
  }
}`,
  },
  {
    title: "CI Pipeline",
    description:
      "A continuous integration pipeline configuration with multiple stages.",
    filename: "ci-pipeline.msn",
    msn: `# CI Pipeline
- name: Build & Deploy
- on
-- push
--- branches
---- * main
---- * develop
-- pull_request
--- branches
---- * main
- jobs
-- test
--- runs-on: ubuntu-latest
--- steps
---- *
----- name: Checkout
----- uses: actions/checkout@v4
---- *
----- name: Setup Node
----- uses: actions/setup-node@v4
----- with
------ node-version: 20
---- *
----- name: Install
----- run: npm ci
---- *
----- name: Test
----- run: npm test`,
    json: `{
  "name": "Build & Deploy",
  "on": {
    "push": { "branches": ["main", "develop"] },
    "pull_request": { "branches": ["main"] }
  },
  "jobs": {
    "test": {
      "runs-on": "ubuntu-latest",
      "steps": [
        { "name": "Checkout", "uses": "actions/checkout@v4" },
        { "name": "Setup Node", "uses": "actions/setup-node@v4", "with": { "node-version": 20 } },
        { "name": "Install", "run": "npm ci" },
        { "name": "Test", "run": "npm test" }
      ]
    }
  }
}`,
  },
  {
    title: "Package.json",
    description: "An npm package manifest.",
    filename: "package.msn",
    msn: `- name: @myorg/utils
- version: 1.0.0
- description: Shared utility library
- main: dist/index.js
- types: dist/index.d.ts
- license: MIT
- scripts
-- build: tsc
-- test: vitest
-- lint: eslint src
- dependencies
-- lodash: ^4.17.21
-- zod: ^3.22.0
- devDependencies
-- typescript: ^5.3.0
-- vitest: ^1.2.0
- keywords
-- * utils
-- * shared
-- * library`,
    json: `{
  "name": "@myorg/utils",
  "version": "1.0.0",
  "description": "Shared utility library",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "license": "MIT",
  "scripts": {
    "build": "tsc",
    "test": "vitest",
    "lint": "eslint src"
  },
  "dependencies": {
    "lodash": "^4.17.21",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.2.0"
  },
  "keywords": ["utils", "shared", "library"]
}`,
  },
];

export default function ExamplesPage() {
  const [active, setActive] = useState(0);
  const ex = examples[active];

  return (
    <main className="pt-24 pb-16 min-h-screen">
      <div className="mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-4xl font-bold"
        >
          Examples
        </motion.h1>
        <p className="mb-10 text-gray-400 text-lg">
          Real-world configuration files written in MSN alongside their
          JSON&nbsp;output.
        </p>

        {/* Tab selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {examples.map((e, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                i === active
                  ? "bg-msn-500/20 text-msn-400 border border-msn-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              {e.title}
            </button>
          ))}
        </div>

        {/* Active example */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="mb-6 text-gray-400">{ex.description}</p>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border-white/10 border">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-white/5">
                <span className="text-xs text-gray-500 font-mono">
                  {ex.filename}
                </span>
                <span className="ml-auto px-2 py-0.5 text-xs text-msn-400 bg-msn-500/20 rounded">
                  MSN
                </span>
              </div>
              <pre className="overflow-x-auto p-6 max-h-[600px] text-sm font-mono leading-relaxed bg-gray-900/50">
                <code className="text-gray-300">{ex.msn}</code>
              </pre>
            </div>

            <div className="overflow-hidden rounded-2xl border-white/10 border">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-white/5">
                <span className="text-xs text-gray-500 font-mono">
                  {ex.filename.replace(".msn", ".json")}
                </span>
                <span className="ml-auto px-2 py-0.5 text-xs text-yellow-400 bg-yellow-500/20 rounded">
                  JSON
                </span>
              </div>
              <pre className="overflow-x-auto p-6 max-h-[600px] text-sm font-mono leading-relaxed bg-gray-900/50">
                <code className="text-gray-300">{ex.json}</code>
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
