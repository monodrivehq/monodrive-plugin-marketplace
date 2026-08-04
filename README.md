# Monodrive agent plugins

Connect Codex or Claude Code to the production Monodrive MCP server.

## Connect to Codex

Plugin installation is recommended.

1. Add the custom marketplace in a terminal:

   ```sh
   codex plugin marketplace add monodriveHQ/agent-plugins
   ```

2. Install the plugin. Use one of these methods:

   - Run `codex plugin add monodrive@monodrive` in a terminal.
   - Run `/plugins` in Codex, select the Monodrive marketplace, and install
     `monodrive`.

3. Start a new Codex thread.
4. Complete the Monodrive sign-in process when Codex requests it.

To connect without the plugin, open **Settings > MCP Servers**. Add a
**Streamable HTTP** server with these values:

- Name: `monodrive`
- URL: `https://app.monodrive.ai/mcp`

## Connect to Claude Code from a terminal

Plugin installation is recommended. Run these commands in Claude Code or the
Claude Code extension:

1. Add the custom marketplace:

   ```text
   /plugin marketplace add monodriveHQ/agent-plugins
   ```

2. Install the plugin:

   ```text
   /plugin install monodrive@monodrive
   ```

3. Run `/mcp` to confirm that the Monodrive MCP server is available.
4. Start a new session if the server does not appear in the current session.

To connect without the plugin, run:

```sh
claude mcp add monodrive --transport http https://app.monodrive.ai/mcp --scope user
```

## Connect to Claude Code from Claude Desktop

Plugin installation is recommended.

1. Open Claude Desktop and select the **Code** tab.
2. Select **Customize** in the sidebar.
3. Next to personal plugins, select **Add > Add
   marketplace**.
4. Select **Add from a repository**
5. Enter `https://github.com/monodriveHQ/agent-plugins/` and submit it..
6.  On the next screen select monodrive and click + to install the `monodrive` plugin.
7. Select `Connectors`, then **Monodrive > Install**.
8. Run `/mcp` to confirm that the Monodrive MCP server is available.

## Verify the connection

Start a new chat and ask the agent to use Monodrive. Complete the sign-in
process if the agent requests it. If the MCP server does not appear, restart
the agent client and start a new session.

## Validate the repository

Run all tests:

```sh
npm test
```

Run only the marketplace validator:

```sh
npm run validate
```

You can also validate the Claude marketplace manifest:

```sh
claude plugin validate .
```
