# Monodrive agent plugins

Install Monodrive in Claude Code or Codex. The plugin includes a small sample
skill and connects the agent to the production Monodrive MCP server.

## Claude Code

Add the marketplace:

```sh
/plugin marketplace add monodriveHQ/agent-plugins
```

Install the plugin:

```sh
/plugin install monodrive@monodrive
```

Run the sample skill:

```text
/monodrive:hello-world
```

## Codex

Add the marketplace:

```sh
codex plugin marketplace add monodriveHQ/agent-plugins
```

Install the plugin:

```sh
codex plugin add monodrive@monodrive
```

Start a new session. Then ask the agent to use the `hello-world` skill.

## Validate the repository

Run all tests:

```sh
npm test
```

Run only the marketplace validator:

```sh
npm run validate
```

You can also use the host validators:

```sh
claude plugin validate .
codex plugin marketplace add .
```
