# graphrefly-react — agent context

`@graphrefly/react` — reactive **binding + presentation** layer for GraphReFly. Builds on
`@graphrefly/pure-ts` (the engine); **never reimplements the substrate**. Currently a
**validated binding-core spike** (not a product) — see `docs/plan.md` and the dashboard.

> **This file points, it does not host.** Authority for the engine + protocol lives elsewhere;
> do not duplicate it here.

## Where the truth lives

| Concern | Source |
|---|---|
| Engine / protocol / substrate | `~/src/graphrefly-ts` (`@graphrefly/pure-ts`, `@graphrefly/graphrefly`) + `~/src/graphrefly` (spec/decisions) |
| Product vision (why this repo exists) | memory `project_workbench_platform_vision` |
| Narrative plan + layering | `docs/plan.md` |
| **Live slice status (single source)** | `plan/slices.jsonl` → `dashboard/dashboard.html` (`pnpm dashboard`) |

## Architectural floor (cite, never violate)

- **Substrate stays in graphrefly-ts** — data/render separation + no cross-language peer-deps.
  This repo is React/binding-layer; the engine is never reimplemented here.
- **Pure `GraphSpec → string` projections** (mermaid/d2/ascii) live in graphrefly-ts
  `extra/render`, NOT here. Only the interactive, DOM-bound layer lives here.
- **The binding core is the one irreplaceable piece** (`src/use-node.ts`). Canvas / widgets /
  charts / code-editor are rentable OSS layered on top.

## Binding invariants (from the family — keep bulletproof)

- **Reactive, not imperative** — writes go through `node.down([[DIRTY],[DATA,v]])` (a reactive
  signal), never an imperative trigger.
- **SENTINEL** — `undefined` = node never emitted DATA (global SENTINEL); `null` = a *valid*
  DATA value. Distinguish with `=== undefined`, never falsiness.
- **push-on-subscribe** — subscribing delivers cached DATA; wire observers before any kick.
- Mirror the proven `@graphrefly/graphrefly/compat/react` adapter; don't diverge silently.

## Commands

```bash
pnpm test            # vitest (jsdom + RTL)
pnpm run lint        # biome
pnpm run typecheck   # tsc --noEmit
pnpm run build       # tsc
pnpm run dashboard       # regenerate dashboard/dashboard.html
pnpm run dashboard:check # consistency gate (non-zero on broken state)
```

## Status

Binding-core spike DONE + PARKED (3 slices, 8 tests green). Product slices = post-graphrefly-1.0
(see dashboard). Do not build product layers on the still-converging substrate.
