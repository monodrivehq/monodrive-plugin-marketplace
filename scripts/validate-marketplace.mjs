#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function fail(code, message, context = {}) {
  failures.push({ code, message, context });
}

function readJson(path, code) {
  const fullPath = resolve(repositoryRoot, path);
  if (!existsSync(fullPath)) {
    fail(code, "Required JSON file is missing.", { path });
    return null;
  }

  try {
    return JSON.parse(readFileSync(fullPath, "utf8"));
  } catch (error) {
    fail(code, "JSON is not valid.", {
      path,
      reason: error instanceof Error ? error.message : "Unknown parse error",
    });
    return null;
  }
}

function requireEqual(actual, expected, code, message, context = {}) {
  if (actual !== expected) {
    fail(code, message, { ...context, expected, actual });
  }
}

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if ([".git", "node_modules"].includes(entry.name)) return [];
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

const codexMarketplace = readJson(
  ".agents/plugins/marketplace.json",
  "MARKETPLACE_CODEX_MISSING",
);
const claudeMarketplace = readJson(
  ".claude-plugin/marketplace.json",
  "MARKETPLACE_CLAUDE_MISSING",
);
const codexManifest = readJson(
  "plugins/monodrive/.codex-plugin/plugin.json",
  "PLUGIN_CODEX_MISSING",
);
const claudeManifest = readJson(
  "plugins/monodrive/.claude-plugin/plugin.json",
  "PLUGIN_CLAUDE_MISSING",
);
const mcp = readJson(
  "plugins/monodrive/.mcp.json",
  "PLUGIN_MCP_MISSING",
);
if (codexMarketplace) {
  requireEqual(
    codexMarketplace.name,
    "monodrive",
    "MARKETPLACE_CODEX_NAME",
    "The Codex marketplace name must be monodrive.",
  );
  const plugin = codexMarketplace.plugins?.[0];
  requireEqual(
    codexMarketplace.plugins?.length,
    1,
    "MARKETPLACE_CODEX_PLUGIN_COUNT",
    "The Codex marketplace must contain one plugin.",
  );
  requireEqual(
    plugin?.name,
    "monodrive",
    "MARKETPLACE_CODEX_PLUGIN_NAME",
    "The Codex marketplace plugin name must be monodrive.",
  );
  requireEqual(
    plugin?.source?.path,
    "./plugins/monodrive",
    "MARKETPLACE_CODEX_SOURCE",
    "The Codex marketplace must use the Monodrive plugin directory.",
  );
  requireEqual(
    plugin?.policy?.installation,
    "AVAILABLE",
    "MARKETPLACE_CODEX_INSTALL_POLICY",
    "The Codex plugin must be available to install.",
  );
  requireEqual(
    plugin?.policy?.authentication,
    "ON_INSTALL",
    "MARKETPLACE_CODEX_AUTH_POLICY",
    "The Codex plugin must request authentication during installation.",
  );
}

if (claudeMarketplace) {
  requireEqual(
    claudeMarketplace.name,
    "monodrive",
    "MARKETPLACE_CLAUDE_NAME",
    "The Claude marketplace name must be monodrive.",
  );
  requireEqual(
    claudeMarketplace.plugins?.length,
    1,
    "MARKETPLACE_CLAUDE_PLUGIN_COUNT",
    "The Claude marketplace must contain one plugin.",
  );
  requireEqual(
    claudeMarketplace.plugins?.[0]?.source,
    "./plugins/monodrive",
    "MARKETPLACE_CLAUDE_SOURCE",
    "The Claude marketplace must use the Monodrive plugin directory.",
  );
}

for (const [host, manifest] of [
  ["Codex", codexManifest],
  ["Claude", claudeManifest],
]) {
  if (!manifest) continue;
  requireEqual(
    manifest.name,
    "monodrive",
    `PLUGIN_${host.toUpperCase()}_NAME`,
    `The ${host} plugin name must be monodrive.`,
  );
  requireEqual(
    manifest.skills,
    "./skills/",
    `PLUGIN_${host.toUpperCase()}_SKILLS`,
    `The ${host} plugin must expose the skills directory.`,
  );
  requireEqual(
    manifest.mcpServers,
    "./.mcp.json",
    `PLUGIN_${host.toUpperCase()}_MCP`,
    `The ${host} plugin must use the shared MCP configuration.`,
  );
}

if (mcp) {
  requireEqual(
    mcp.mcpServers?.monodrive?.type,
    "http",
    "MCP_TRANSPORT",
    "The Monodrive MCP transport must be HTTP.",
  );
  requireEqual(
    mcp.mcpServers?.monodrive?.url,
    "https://app.monodrive.ai/mcp",
    "MCP_URL",
    "The plugin must use the production Monodrive MCP URL.",
  );
}

const skillPath = resolve(
  repositoryRoot,
  "plugins/monodrive/skills/monodrive/SKILL.md",
);
if (!existsSync(skillPath)) {
  fail("SKILL_MONODRIVE_MISSING", "The Monodrive skill is missing.", {
    path: relative(repositoryRoot, skillPath),
  });
} else {
  const skill = readFileSync(skillPath, "utf8");
  if (!skill.includes("name: monodrive")) {
    fail("SKILL_MONODRIVE_NAME", "The Monodrive skill name is invalid.", {
      path: relative(repositoryRoot, skillPath),
    });
  }
  if (!skill.includes("user-invocable: false")) {
    fail("SKILL_MONODRIVE_INVOCATION", "The Monodrive skill must be model-invoked only.", {
      path: relative(repositoryRoot, skillPath),
    });
  }
  if (!skill.includes("guides_get")) {
    fail("SKILL_MONODRIVE_GUIDE", "The Monodrive skill must route tasks through guides_get.", {
      path: relative(repositoryRoot, skillPath),
    });
  }
}

for (const unsupportedDirectory of [".cursor-plugin", "plugins/monodrive/.cursor-plugin"]) {
  if (existsSync(resolve(repositoryRoot, unsupportedDirectory))) {
    fail("UNSUPPORTED_CURSOR_CONTENT", "Cursor content is not in this release.", {
      path: unsupportedDirectory,
    });
  }
}

const sourceBrandPattern = new RegExp(
  `${["pa", "per"].join("")}(?:-design|\\.design| desktop)?`,
  "i",
);

for (const path of listFiles(repositoryRoot)) {
  if (!statSync(path).isFile()) continue;
  const content = readFileSync(path, "utf8");
  if (sourceBrandPattern.test(content)) {
    fail("FOREIGN_BRAND_REFERENCE", "A source brand reference remains.", {
      path: relative(repositoryRoot, path),
    });
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(
      `[${failure.code}] ${failure.message} Context: ${JSON.stringify(failure.context)}. Write effect: none. Retry: safe after you correct the file.`,
    );
  }
  process.exitCode = 1;
} else {
  console.log("Monodrive marketplace is valid for Claude and Codex.");
}
