# Agent context (vendored)

## `remotion/`

Official **Remotion best-practices** skill files (from [remotion-dev/skills](https://github.com/remotion-dev/skills)), copied into the repo so Netlify functions can load them into the Remotion coding agent system prompt.

Refresh by replacing the contents of `remotion/` from the upstream repo ([remotion-dev/skills](https://github.com/remotion-dev/skills) → `skills/remotion/`), or run:

```bash
cd packages/remotion && npx remotion skills add -y
```

Then copy the installed skill folder (e.g. from `.claude/skills/remotion-best-practices/` or the clone) over `agent-context/remotion/`.
