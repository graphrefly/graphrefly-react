# React package development

Use the [package scripts/export map](../package.json) and [mise toolchain](../.mise.toml).

```sh
mise trust
mise install
pnpm install
pnpm test
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run dashboard:check
```

## Existing ownership and binding constraints

This package owns React live hooks and reference presentation. Protocol/runtime
ownership stays with [root](../../graphrefly/AGENTS.md) and
[TypeScript](../../graphrefly-ts/AGENTS.md). Generic adapter and boundary contracts
remain TS-owned; do not reimplement the substrate or silently fork binding meaning.
Pure renderer/package surfaces resolve through current TS exports, not retired
GraphSpec/extra paths in historical instructions. Canvas product state, registry,
credential/provider flows, layout policy and execution admission stay with product
or owning solution layers, as described by [usage](usage.md).

Input writes use graph-owned writable node surfaces rather than a presentation-owned
trigger. Preserve the distinction between undefined/no DATA and valid null DATA;
use explicit presence checks rather than falsiness. The governing subscription and
callback behavior comes from the owning runtime contract, not this prose.

[Local slices](../plan/slices.jsonl) own checked status;
[the narrative](plan.md) explains context and retained history. Do not infer product
implementation authorization from the old spike's completion. Follow personal
governance and the shared build/QA/human-preview workflow through [AGENTS](../AGENTS.md).
