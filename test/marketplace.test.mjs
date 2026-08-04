import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
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
