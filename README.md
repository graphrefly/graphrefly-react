# @graphrefly/react

Reactive binding + presentation layer for [GraphReFly](https://github.com/) on React.

**Status: minimal binding SDK.** The original binding-core spike validated the single
unverified assumption behind the workbench product vision: that a **two-way reactive
binding** between GraphReFly graph nodes and React widgets works cleanly —

- input widget → boundary writable `state` node (reactive input, not imperative)
- output widget ← boundary `derived` node (push-on-subscribe)

It builds **on top of** `@graphrefly/ts` (the engine); it never reimplements the substrate.
Pure `GraphSpec → string` projections (mermaid/d2/ascii) stay in `@graphrefly/ts`
(`extra/render`); only the interactive, DOM-bound layer lives here.

## Public SDK Surface

- `useNodeValue(node)` — bind output widgets to node DATA with SENTINEL-aware `undefined`.
- `useNodeInput(node)` — bind input widgets to writable GraphReFly state nodes.
- `boundaryManifest(graph)` — derive graph boundary inputs/outputs from `describe()`.
- `useBoundaryManifest(graph)` — React hook that refreshes the manifest on topology changes.
- `AutoPanel` — small reference presentation over the binding primitives.

## Toolchain

Mirrors the graphrefly-ts family: mise + Node 24 + Corepack/pnpm + Biome.

```bash
mise trust && mise install   # Node 24
corepack enable && pnpm install   # or: mise run bootstrap
pnpm lint
pnpm typecheck
```

## Not here (lives in the product repo)

registry / app-store, Canvas topology lens, widget-slot pinning, reactive-layout ownership,
measurement-provider policy, fork + one-click-config, BYOK/Nano wiring, OAuth/MCP connectors,
relay/push, billing. This package is the reusable SDK seam only.
