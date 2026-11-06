# React agent entrypoint

Start with [README](README.md) and the [documentation map](docs/README.md).
[Usage](docs/usage.md) and [development](docs/development.md) explain this package's
React-owned hooks, reference UI and existing binding constraints. Protocol/runtime
contracts remain [root](../graphrefly/AGENTS.md) and
[TS-owned](../graphrefly-ts/AGENTS.md).

[Local slices](plan/slices.jsonl) own status/evidence; [the narrative](docs/plan.md)
is context. Resolve decisions and new scope through
[root authority](../graphrefly/authority/README.md) and the
[ledger locator](../graphrefly/authority/ledgers.jsonl), without inventing a local ledger.

Follow [personal governance](/Users/davidchenallio/.codex/skills/project-governance/SKILL.md)
for records/execution classification. Use [bmad-build](.agents/skills/bmad-build/SKILL.md)
and [bmad-qa](.agents/skills/bmad-qa/SKILL.md) within approved scope.
Human review uses [bmad-checkpoint-preview](.agents/skills/bmad-checkpoint-preview/SKILL.md):
build-handoff normally, interactive for explicit checkpoint/`--practice`.
CLAUDE forwards here; this is the maintained agent entrypoint.
