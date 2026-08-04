#!/usr/bin/env node

import { createInterface } from "node:readline";

const serverInfo = {
  name: "monodrive-stdio-test",
  version: "0.1.0",
};

const helloTool = {
  name: "hello",
  description: "Return a hello message from the local Monodrive stdio MCP server.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
};

function result(id, value) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result: value })}\n`);
}

function error(id, code, message) {
  process.stdout.write(
    `${JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } })}\n`,
  );
}

function handleRequest(request) {
  if (request.id === undefined) return;

  switch (request.method) {
    case "initialize":
      result(request.id, {
        protocolVersion: request.params?.protocolVersion ?? "2025-06-18",
        capabilities: { tools: {} },
        serverInfo,
        instructions:
          "This is a diagnostic Monodrive MCP server. Call hello to verify stdio plugin loading.",
      });
      return;
    case "ping":
      result(request.id, {});
      return;
    case "tools/list":
      result(request.id, { tools: [helloTool] });
      return;
    case "tools/call":
      if (request.params?.name !== helloTool.name) {
        error(request.id, -32602, "Unknown tool name.");
        return;
      }
      result(request.id, {
        content: [{ type: "text", text: "Hello from Monodrive stdio." }],
      });
      return;
    default:
      error(request.id, -32601, "Method not found.");
  }
}

const input = createInterface({ input: process.stdin });

input.on("line", (line) => {
  if (line.trim() === "") return;

  try {
    handleRequest(JSON.parse(line));
  } catch {
    error(null, -32700, "Invalid JSON request.");
  }
});
