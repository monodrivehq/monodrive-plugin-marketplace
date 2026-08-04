import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";

function request(server, message) {
  return new Promise((resolve, reject) => {
    const onData = (data) => {
      server.stdout.off("data", onData);
      resolve(JSON.parse(data.toString()));
    };

    server.stdout.on("data", onData);
    server.once("error", reject);
    server.stdin.write(`${JSON.stringify(message)}\n`);
  });
}

test("the bundled stdio MCP server initializes and calls hello", async (context) => {
  const server = spawn(process.execPath, ["./mcp/server.mjs"], {
    cwd: new URL("../plugins/monodrive-stdio/", import.meta.url),
    stdio: ["pipe", "pipe", "pipe"],
  });
  context.after(() => server.kill());

  const initialized = await request(server, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2025-06-18" },
  });
  assert.equal(initialized.result.serverInfo.name, "monodrive-stdio-test");

  const tools = await request(server, {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
  });
  assert.equal(tools.result.tools[0].name, "hello");

  const called = await request(server, {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: { name: "hello", arguments: {} },
  });
  assert.equal(called.result.content[0].text, "Hello from Monodrive stdio.");
});
