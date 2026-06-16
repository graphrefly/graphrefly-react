# @graphrefly/react

Reactive binding + presentation layer for [GraphReFly](https://github.com/) on React.

**Status: minimal binding SDK.** The original binding-core spike validated the single
unverified assumption behind the workbench product vision: that a **two-way reactive
binding** between GraphReFly graph nodes and React widgets works cleanly —

- input widget → boundary writable `state` node (reactive input, not imperative)
- output widget ← boundary `derived` node (push-on-subscribe)

It builds **on top of** `@graphrefly/ts` (the engine); it never reimplements the substrate.
Framework node bindings and the framework-neutral boundary manifest are owned by
`@graphrefly/ts` focused subpaths. This package re-exports the React binding basics and
adds only React live topology hooks plus reference UI.

## Public SDK Surface

- `useNodeValue(node)` — re-export from `@graphrefly/ts/adapters/react`.
- `useNodeInput(node)` — re-export from `@graphrefly/ts/adapters/react`.
- `useNodeRecord(keysNode, factory)` — re-export from `@graphrefly/ts/adapters/react`; `factory` must have stable identity.
- `boundaryManifest(graph)` — re-export from `@graphrefly/ts/inspection/boundary`.
- `useBoundaryManifest(graph)` — React hook that refreshes the manifest on topology changes.
- `AutoPanel` — small reference presentation over the binding primitives, with optional
  caller-supplied trusted widget catalog/resolver props.
- `TopologyFlowPanel` — live DOM/SVG reference topology sidebar over `graph.describe()`.

## Toolchain

Mirrors the graphrefly-ts family: mise + Node 24 + Corepack/pnpm + Biome.

```bash
mise trust && mise install   # Node 24
corepack enable && pnpm install   # or: mise run bootstrap
pnpm lint
pnpm typecheck
```

## Not here (lives in the product repo)

Canvas product state, widget-slot pinning, workspace placement, dataPath ownership,
reactive-layout ownership, measurement-provider policy, registry / app-store, fork +
one-click-config, BYOK/Nano wiring, OAuth/MCP connectors, relay/push, billing. This package
is the reusable React live hook/reference UI layer only; its widget catalog is a trusted
React presentation hook, and its topology panel is DOM-bound reference UI, not generic
boundary metadata or a pure `GraphSpec → string` renderer.
