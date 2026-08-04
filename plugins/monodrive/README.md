# Monodrive

This plugin connects Claude and Codex to the Monodrive MCP server at
`https://app.monodrive.ai/mcp`.

The plugin includes the `/hello-world` skill. Claude namespaces the command as
`/monodrive:hello-world`.

The MCP server uses OAuth. The agent host asks the user to sign in when the
connection needs authorization.
