"use client";

import { motion } from "framer-motion";

const msnCode = `# Server Configuration
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
-- credentials
--- username: admin
--- password: secret
- features
-- * auth
-- * api
-- * logging`;

const jsonCode = `{
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
    "port": 5432,
    "credentials": {
      "username": "admin",
      "password": "secret"
    }
  },
  "features": [
    "auth",
    "api",
    "logging"
  ]
}`;

export function CodeDemo() {
  return (
    <section className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-msn-950/20 to-gray-950" />

      <div className="relative mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            See the <span className="gradient-text">Difference</span>
          </h2>
          <p className="text-gray-400 text-lg">
            MSN on the left, compiled JSON on the right.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="overflow-hidden rounded-2xl border-white/10 border glow">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-500/80 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500/80 rounded-full" />
                  <div className="w-3 h-3 bg-green-500/80 rounded-full" />
                </div>
                <span className="ml-2 text-xs text-gray-500 font-mono">
                  config.msn
                </span>
                <span className="ml-auto px-2 py-0.5 text-xs text-msn-400 bg-msn-500/20 rounded">
                  MSN
                </span>
              </div>
              <pre className="overflow-x-auto p-6 text-sm font-mono leading-relaxed bg-gray-900/50">
                <code className="text-gray-300">{msnCode}</code>
              </pre>
            </div>
            <p className="mt-3 text-center text-sm text-gray-500">
              <span className="text-msn-400 font-semibold">
                {msnCode.length}
              </span>{" "}
              characters
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="overflow-hidden rounded-2xl border-white/10 border">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-500/80 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500/80 rounded-full" />
                  <div className="w-3 h-3 bg-green-500/80 rounded-full" />
                </div>
                <span className="ml-2 text-xs text-gray-500 font-mono">
                  config.json
                </span>
                <span className="ml-auto px-2 py-0.5 text-xs text-yellow-400 bg-yellow-500/20 rounded">
                  JSON
                </span>
              </div>
              <pre className="overflow-x-auto p-6 text-sm font-mono leading-relaxed bg-gray-900/50">
                <code className="text-gray-300">{jsonCode}</code>
              </pre>
            </div>
            <p className="mt-3 text-center text-sm text-gray-500">
              <span className="text-yellow-400 font-semibold">
                {jsonCode.length}
              </span>{" "}
              characters
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
