# Monodrive agent plugins

Install Monodrive in Claude Code or Codex. The marketplace includes the
production HTTP plugin and a local stdio diagnostic plugin.

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

To test local stdio discovery, install the diagnostic plugin:

```sh
/plugin install monodrive-stdio@monodrive
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

To test local stdio discovery, install the diagnostic plugin:

```sh
codex plugin add monodrive-stdio@monodrive
```

Start a new session. Then ask the agent to call the Monodrive stdio `hello`
tool. A successful call returns `Hello from Monodrive stdio.`

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
