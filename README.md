# GraphReFly React

`@graphrefly/react` provides React live hooks and reference presentation over
GraphReFly. The engine remains [TypeScript-owned](https://github.com/graphrefly/graphrefly-ts).

## Where things are

| Path | Contents |
|---|---|
| [src/](src/) | React hooks, presentation and public package entry |
| [docs/](docs/README.md) | Documentation map, usage and development |
| [plan/slices.jsonl](plan/slices.jsonl) | Implementation state and evidence |
| [dashboard/](dashboard/) | Generated local view |

## Where things stand

- **Status and evidence:** [slice ledger](plan/slices.jsonl).
- **Context:** [narrative](docs/plan.md).
- **API and boundaries:** [usage](docs/usage.md) and [documentation map](docs/README.md).

## Start locally

```sh
mise trust
mise install
pnpm install
```

| Command | What it does |
|---|---|
| `pnpm test` | React package tests |
| `pnpm run lint` / `pnpm run typecheck` | Style and types |
| `pnpm run build` | ESM/CJS, declarations and export checks |
| `pnpm run dashboard:check` | Local slice/reference consistency |

[Development](docs/development.md) · [Agent entrypoint](AGENTS.md).
