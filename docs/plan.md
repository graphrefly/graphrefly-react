# graphrefly-react — plan (narrative)

> Live status lives in [`plan/slices.jsonl`](../plan/slices.jsonl) and the generated
> `dashboard/dashboard.html` (`pnpm dashboard`). This file is the **narrative**; it
> does not duplicate per-slice status. Single source of truth = the jsonl.

## What this is

`@graphrefly/react` — the reactive **binding + presentation SDK** for GraphReFly.
It builds on top of `@graphrefly/ts` (the engine); it **never reimplements the
substrate**. Today it is a **minimal binding SDK surface** grown from the validated
binding-core spike, not a Canvas product.

## What the spike proved

The riskiest, previously-unvalidated assumption of the workbench product vision is now
proven on the real substrate:

- **node ⇄ widget two-way reactive binding works** — input widget → boundary
  writable `state` node (reactive write), output widget ← boundary `derived`
  (push-on-subscribe); SENTINEL (`undefined`) is distinguishable from a valid `null`.
- **a graph's boundary can be read structurally** (`boundaryManifest`) and
  **auto-rendered into a bound, reactive UI with zero hand-wiring** (`AutoPanel`).
- **React consumers can observe boundary topology without copying binding wiring**
  (`useBoundaryManifest`), while package exports/declarations make the SDK consumable by
  product hosts such as `@graphrefly/canvas`.

→ the moat ("malleable reactive substrate → auto-grown UI") is technically real.

## Sequencing — when the rest happens

- **De-risking is done.** The spike's job (answer "does the binding core work?") is complete.
- **Product slices remain PARKED until graphrefly hits 1.0.** Building more on a still-converging
  substrate = rework + dilutes the ts/rust/py tracks. The spike exists precisely so the build
  can be deferred with confidence.
- **Parallel-safe now:** docs + dashboard (this), and keeping the spike green if a substrate
  API shifts. The binding only touches the *stable* part of the protocol
  (observe/subscribe/SENTINEL/teardown).

See the slice table (`pnpm dashboard`) for the post-1.0 backlog (capability-tag from meta,
A2UI widget catalog, topology flow-view, robustness, productionization).

## Layering (where code belongs)

- `@graphrefly/ts` (in graphrefly-ts) — substrate + graph layer. Untouched here.
- pure `GraphSpec → string` renderers (`graphSpecToMermaid/D2/Ascii`) — stay in graphrefly-ts
  (`extra/render`); framework-agnostic data layer.
- **this repo** — the binding core (the one irreplaceable piece) + presentation. React binding
  is binding-layer; the core stays React-free.
- registry / app-store / fork / relay / BYOK — the **product** repo, not here.
