import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

test("the repository is a valid Monodrive marketplace", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/validate-marketplace.mjs"],
    {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    },
  );

  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  assert.match(result.stdout, /Monodrive marketplace is valid/);
});

test("the marketplace uses its canonical repository identity", () => {
  const root = new URL("..", import.meta.url);
  const read = (path) => readFileSync(new URL(path, root), "utf8");
  const repositoryUrl =
    "https://github.com/monodrivehq/monodrive-plugin-marketplace";

  assert.equal(
    JSON.parse(read("package.json")).name,
    "@monodrivehq/monodrive-plugin-marketplace",
  );
  assert.equal(
    JSON.parse(read("plugins/monodrive/.claude-plugin/plugin.json"))
      .repository,
    repositoryUrl,
  );
  assert.equal(
    JSON.parse(read("plugins/monodrive/.codex-plugin/plugin.json")).repository,
    repositoryUrl,
  );
  assert.match(
    read("README.md"),
    /codex plugin marketplace add monodrivehq\/monodrive-plugin-marketplace/,
  );
  assert.doesNotMatch(
    [
      read("README.md"),
      read("package.json"),
      read("plugins/monodrive/.claude-plugin/plugin.json"),
      read("plugins/monodrive/.codex-plugin/plugin.json"),
    ].join("\n"),
    /monodriveHQ|agent-plugins/,
  );
});

test("the plugin exposes one model-invoked Monodrive skill", () => {
  const plugin = new URL("../plugins/monodrive/", import.meta.url);
  const skills = new URL("skills/", plugin);

  assert.deepEqual(readdirSync(skills), ["monodrive"]);

  const skill = readFileSync(new URL("monodrive/SKILL.md", skills), "utf8");
  assert.match(skill, /^name: monodrive$/m);
  assert.match(skill, /^user-invocable: false$/m);
  assert.match(skill, /^description: "Monodrive is the always-on context storage and retrieval layer/m);
  assert.match(skill, /context the Brain holds/);
  assert.match(skill, /high-value context should persist across sessions/);
  assert.match(skill, /setup, maintenance, or ingestion work/);
  assert.match(skill, /Trigger even when Monodrive is not named/);
  assert.match(skill, /avoid transient, duplicate, speculative, or low-value information/);
  assert.match(skill, /Call `guides_get`/);
  assert.doesNotMatch(skill, /guides_get\(\{/);

  const openAiMetadata = readFileSync(
    new URL("monodrive/agents/openai.yaml", skills),
    "utf8",
  );
  assert.match(openAiMetadata, /^  allow_implicit_invocation: true$/m);
});

test("the restructured plugin has one release version", () => {
  const root = new URL("..", import.meta.url);
  const claudeMarketplace = JSON.parse(
    readFileSync(new URL(".claude-plugin/marketplace.json", root), "utf8"),
  );
  const claudePlugin = JSON.parse(
    readFileSync(
      new URL("plugins/monodrive/.claude-plugin/plugin.json", root),
      "utf8",
    ),
  );
  const codexPlugin = JSON.parse(
    readFileSync(
      new URL("plugins/monodrive/.codex-plugin/plugin.json", root),
      "utf8",
    ),
  );
  const packageMetadata = JSON.parse(
    readFileSync(new URL("package.json", root), "utf8"),
  );

  assert.equal(claudeMarketplace.metadata.version, "0.2.3");
  assert.equal(claudePlugin.version, "0.2.3");
  assert.equal(codexPlugin.version, "0.2.3");
  assert.equal(packageMetadata.version, "0.2.3");
});
