#!/usr/bin/env node
/**
 * Backend consistency validator for Inbox Action Board.
 * Usage: node .cursor/skills/backend-consistency/scripts/validate-backend.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "../../../..");

const SCAN_DIRS = ["app/api", "lib"].map((d) => join(ROOT, d));
const ROOT_FILES = ["auth.ts", "auth.config.ts", "proxy.ts"].map((f) =>
  join(ROOT, f)
);

/** Routes that must NOT call auth() */
const AUTH_WHITELIST = [
  /app\/api\/auth\//,
  /app\/api\/webhook\/gmail\//,
];

/** Files allowed to use process.env directly */
const ENV_WHITELIST = [
  /lib\/env\.ts$/,
  /lib\/db\.ts$/,
  /auth\.config\.ts$/,
];

/** @type {{ file: string, line: number, rule: string, detail: string, severity: 'critical' | 'warning' }[]} */
const violations = [];

function walkDir(dir, files = []) {
  if (!existsSync(dir)) return files;
  if (!statSync(dir, { throwIfNoAccess: false })?.isDirectory()) return files;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkDir(full, files);
    } else if (/\.tsx?$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function rel(file) {
  return relative(ROOT, file);
}

function addViolation(file, line, rule, detail, severity = "critical") {
  violations.push({ file: rel(file), line, rule, detail, severity });
}

function isAuthWhitelisted(file) {
  const p = rel(file).replace(/\\/g, "/");
  return AUTH_WHITELIST.some((re) => re.test(p));
}

function isEnvWhitelisted(file) {
  const p = rel(file).replace(/\\/g, "/");
  return ENV_WHITELIST.some((re) => re.test(p));
}

function checkMissingAuth(file, content) {
  const p = rel(file).replace(/\\/g, "/");
  if (!p.endsWith("route.ts") || !p.startsWith("app/api/")) return;
  if (isAuthWhitelisted(file)) return;

  const exportsHandler = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\b/.test(
    content
  );
  if (!exportsHandler) return;

  if (!/\bauth\s*\(/.test(content)) {
    const line =
      content.split("\n").findIndex((l) => /export\s+async\s+function/.test(l)) + 1;
    addViolation(
      file,
      line || 1,
      "missing-auth",
      "API route handler exports HTTP methods but does not call auth() — protected routes require session checks",
      "critical"
    );
  }
}

function checkRawEnvAccess(file, content) {
  if (isEnvWhitelisted(file)) return;
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    if (/process\.env\b/.test(line) && !line.trim().startsWith("//")) {
      addViolation(
        file,
        i + 1,
        "raw-env-access",
        "Direct process.env access — use lib/env.ts for server config",
        "warning"
      );
    }
  });
}

function checkNonStandardError(file, content) {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/NextResponse\.json/.test(line)) continue;
    const statusMatch = line.match(/status:\s*(4\d\d|5\d\d)/);
    if (!statusMatch) {
      // Check next line for status (multi-line call)
      const next = lines[i + 1] ?? "";
      const nextStatus = next.match(/status:\s*(4\d\d|5\d\d)/);
      if (!nextStatus) continue;
      const block = line + next;
      if (!/error\s*:/.test(block) && !/'error'/.test(block) && !/"error"/.test(block)) {
        addViolation(
          file,
          i + 1,
          "non-standard-error",
          `Error response (status ${nextStatus[1]}) should include { error: string }`,
          "warning"
        );
      }
      continue;
    }
    if (!/error\s*:/.test(line) && !/'error'/.test(line) && !/"error"/.test(line)) {
      // Look one line ahead for error field
      const block = line + (lines[i + 1] ?? "");
      if (!/error\s*:/.test(block) && !/'error'/.test(block) && !/"error"/.test(block)) {
        addViolation(
          file,
          i + 1,
          "non-standard-error",
          `Error response (status ${statusMatch[1]}) should include { error: string }`,
          "warning"
        );
      }
    }
  }
}

function checkHardcodedSecret(file, content) {
  const lines = content.split("\n");
  const patterns = [
    { re: /sk-[a-zA-Z0-9]{20,}/, label: "OpenAI API key (sk-...)" },
    { re: /AIza[0-9A-Za-z_-]{30,}/, label: "Google API key" },
    { re: /['"]eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+['"]/, label: "JWT literal" },
    {
      re: /(?:api[_-]?key|secret|password)\s*[:=]\s*['"][a-zA-Z0-9_\-]{24,}['"]/i,
      label: "Hardcoded credential assignment",
    },
  ];
  lines.forEach((line, i) => {
    if (line.trim().startsWith("//")) return;
    for (const { re, label } of patterns) {
      if (re.test(line)) {
        addViolation(
          file,
          i + 1,
          "hardcoded-secret",
          `Possible hardcoded secret: ${label}`,
          "critical"
        );
      }
    }
  });
}

function checkDirectPrismaInPages() {
  const appDir = join(ROOT, "app");
  if (!existsSync(appDir)) return;
  const pageFiles = walkDir(appDir).filter((f) => {
    const p = rel(f).replace(/\\/g, "/");
    return p.endsWith(".tsx") && !p.includes("/api/");
  });
  for (const file of pageFiles) {
    const content = readFileSync(file, "utf-8");
    if (/@\/lib\/db/.test(content) || /from\s+['"]@\/lib\/db['"]/.test(content)) {
      const line =
        content.split("\n").findIndex((l) => /@\/lib\/db/.test(l)) + 1;
      addViolation(
        file,
        line || 1,
        "direct-prisma-in-page",
        "Prisma imported in a page component — prefer API routes or a shared lib helper (known debt in app/page.tsx)",
        "warning"
      );
    }
  }
}

// --- Run ---

const files = [
  ...SCAN_DIRS.flatMap((d) => walkDir(d)),
  ...ROOT_FILES.filter((f) => existsSync(f)),
];

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  checkMissingAuth(file, content);
  checkRawEnvAccess(file, content);
  checkNonStandardError(file, content);
  checkHardcodedSecret(file, content);
}

checkDirectPrismaInPages();

const critical = violations.filter((v) => v.severity === "critical");
const warnings = violations.filter((v) => v.severity === "warning");

console.log("\n=== Backend Consistency Validation ===\n");
console.log(`Scanned ${files.length} backend files (+ app pages for prisma rule)`);
console.log(`Critical: ${critical.length} | Warnings: ${warnings.length}\n`);

if (violations.length === 0) {
  console.log("All checks passed.\n");
  process.exit(0);
}

for (const v of violations) {
  const tag = v.severity === "critical" ? "CRITICAL" : "WARNING";
  console.log(`[${tag}] ${v.rule}`);
  console.log(`  ${v.file}:${v.line}`);
  console.log(`  ${v.detail}\n`);
}

console.log(JSON.stringify({ critical, warnings }, null, 2));
process.exit(critical.length > 0 ? 1 : 0);
