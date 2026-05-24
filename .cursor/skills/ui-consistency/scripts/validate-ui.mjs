#!/usr/bin/env node
/**
 * UI consistency validator for Inbox Action Board.
 * Usage: node .cursor/skills/ui-consistency/scripts/validate-ui.mjs
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "../../../..");

const SCAN_DIRS = ["components", "app"].map((d) => join(ROOT, d));
const UI_DIR = join(ROOT, "components/ui");
const ALLOWED_FONT_SIZES = new Set([8, 9, 10, 11, 12, 13]);
const ALLOWED_TAILWIND_SIZES = new Set(["lg", "xl", "sm", "xs", "2xl"]);

/** @type {{ file: string, line: number, rule: string, detail: string, severity: 'critical' | 'warning' }[]} */
const violations = [];

function walkDir(dir, files = []) {
  if (!statSync(dir, { throwIfNoAccess: false })?.isDirectory()) return files;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "ui" && full.endsWith("components/ui")) continue;
      walkDir(full, files);
    } else if (/\.(tsx|css)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function rel(file) {
  return relative(ROOT, file);
}

function isOutsideUiDir(file) {
  return !file.startsWith(UI_DIR);
}

function addViolation(file, line, rule, detail, severity = "critical") {
  violations.push({ file: rel(file), line, rule, detail, severity });
}

function checkDynamicTailwind(file, content) {
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    if (/className=\{[`'"].*\$\{/.test(line) || /className=\{\`/.test(line) && line.includes("${")) {
      if (
        /hover:\$\{|border:\$\{|bg-\$\{|text-\$\{|group-hover:\$\{/.test(line) ||
        (line.includes("${") && /border|bg-|text-|hover:/.test(line))
      ) {
        addViolation(
          file,
          i + 1,
          "dynamic-tailwind",
          "Dynamic Tailwind class in className template literal — use static maps from lib/ui-tokens.ts"
        );
      }
    }
  });
}

function checkRawPill(file, content) {
  if (!isOutsideUiDir(file)) return;
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    if (
      line.includes("rounded-full") &&
      line.includes("border") &&
      line.includes("px-2 py-0.5") &&
      !line.trim().startsWith("//") &&
      !line.includes("functionalColors")
    ) {
      addViolation(
        file,
        i + 1,
        "raw-pill",
        "Inline pill pattern — use <Pill> from components/ui/Pill",
        "warning"
      );
    }
  });
}

function checkRawAiChip(file, content) {
  if (!isOutsideUiDir(file)) return;
  if (content.includes("✦") && content.includes("bg-gray-50") && content.includes("border-gray-100")) {
    const lines = content.split("\n");
    lines.forEach((line, i) => {
      if (line.includes("✦") && line.includes("bg-gray-50")) {
        addViolation(
          file,
          i + 1,
          "raw-ai-chip",
          "Inline AI chip — use <AiChip> from components/ui/AiChip",
          "warning"
        );
      }
    });
  }
}

function checkFontSizeDrift(file, content) {
  const regex = /text-\[(\d+)px\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const size = parseInt(match[1], 10);
    if (!ALLOWED_FONT_SIZES.has(size)) {
      const line = content.slice(0, match.index).split("\n").length;
      addViolation(
        file,
        line,
        "font-size-drift",
        `text-[${size}px] is outside allowed scale (9, 10, 11, 12, 13)`,
        "warning"
      );
    }
  }
}

function checkColConfigBypass(file, content) {
  if (!isOutsideUiDir(file)) return;
  if (file.includes("col-config")) return;
  if (file.includes("ui-tokens")) return;

  const categoryColorPattern =
    /(?:bg|text|border)-(?:orange|red|violet|amber)-(?:\d+)/g;
  const hasTokenImport =
    content.includes("col-config") ||
    content.includes("COL_CONFIG") ||
    content.includes("functionalColors") ||
    content.includes("actionGroupHeaders") ||
    content.includes("ui-tokens");

  if (categoryColorPattern.test(content) && !hasTokenImport) {
    const lines = content.split("\n");
    lines.forEach((line, i) => {
      if (
        categoryColorPattern.test(line) &&
        !line.includes("functionalColors") &&
        !line.trim().startsWith("//")
      ) {
        addViolation(
          file,
          i + 1,
          "col-config-bypass",
          "Category color used without COL_CONFIG or functionalColors import",
          "warning"
        );
      }
    });
  }
}

function checkDuplicateCardShell(file, content) {
  if (!isOutsideUiDir(file)) return;
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    if (
      line.includes("rounded-xl") &&
      line.includes("border-gray-200") &&
      (line.includes("p-3") || line.includes("p-4")) &&
      line.includes("bg-white")
    ) {
      addViolation(
        file,
        i + 1,
        "duplicate-card-shell",
        "Inline card shell — use <Card> from components/ui/Card",
        "warning"
      );
    }
  });
}

function checkRawDot(file, content) {
  if (!isOutsideUiDir(file)) return;
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    if (line.includes("w-2 h-2 rounded-full") && !line.includes("DotIndicator")) {
      addViolation(
        file,
        i + 1,
        "raw-dot",
        "Inline dot indicator — use <DotIndicator> from components/ui/DotIndicator",
        "warning"
      );
    }
  });
}

function checkRawSvg(file, content) {
  if (!isOutsideUiDir(file)) return;
  if (file.endsWith(`${UI_DIR}/Icon.tsx`) || file.endsWith("components/ui/Icon.tsx")) return;

  const lines = content.split("\n");
  lines.forEach((line, i) => {
    if (line.includes("<svg") && !line.trim().startsWith("//")) {
      addViolation(
        file,
        i + 1,
        "raw-svg",
        "Inline SVG — use <Icon> from components/ui/Icon with Tabler icons",
        "warning"
      );
    }
  });
}

function checkDirectTablerImport(file, content) {
  if (file.endsWith(`${UI_DIR}/Icon.tsx`) || file.endsWith("components/ui/Icon.tsx")) return;
  if (!content.includes("@tabler/icons-react")) return;

  const lines = content.split("\n");
  lines.forEach((line, i) => {
    if (line.includes("@tabler/icons-react") && !line.trim().startsWith("//")) {
      addViolation(
        file,
        i + 1,
        "direct-tabler-import",
        "Import Tabler icons only via components/ui/Icon",
        "critical"
      );
    }
  });
}

function checkEmojiIcons(file, content) {
  if (!isOutsideUiDir(file)) return;
  const emojiPattern =
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2705}\u{2714}\u{2716}\u{2728}\u{274C}\u{2764}\u{2B50}\u{1F4E7}\u{1F514}\u{1F4C4}\u{1F4A1}\u{23F0}\u{2709}\u{2728}\u{2714}]/u;
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    if (emojiPattern.test(line) && !line.trim().startsWith("//")) {
      addViolation(
        file,
        i + 1,
        "emoji-icon",
        "Emoji used as icon — use <Icon> from components/ui/Icon",
        "warning"
      );
    }
  });
}

// --- Run ---

const files = SCAN_DIRS.flatMap((d) => walkDir(d));

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  checkDynamicTailwind(file, content);
  checkRawPill(file, content);
  checkRawAiChip(file, content);
  checkFontSizeDrift(file, content);
  checkColConfigBypass(file, content);
  checkDuplicateCardShell(file, content);
  checkRawDot(file, content);
  checkRawSvg(file, content);
  checkDirectTablerImport(file, content);
  checkEmojiIcons(file, content);
}

const critical = violations.filter((v) => v.severity === "critical");
const warnings = violations.filter((v) => v.severity === "warning");

console.log("\n=== UI Consistency Validation ===\n");
console.log(`Scanned ${files.length} files`);
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
