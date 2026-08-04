# Monodrive

This plugin connects Claude and Codex to the Monodrive MCP server at
`https://app.monodrive.ai/mcp`.

The plugin includes one small, model-invoked `monodrive` skill. It loads current
instructions and task guides from the MCP server when Monodrive is relevant.

The MCP server uses OAuth. The agent host asks the user to sign in when the
connection needs authorization.
