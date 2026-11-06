# React documentation map

| Category | Question | Current entrypoint | Maintenance boundary |
|---|---|---|---|
| Rules | What applies now? | [Root protocol](../../graphrefly/authority/README.md#protocol-revision-contract), [TS adapter owner](../../graphrefly-ts/docs/README.md), [React usage](usage.md) | React owns hooks/reference UI, not substrate or product admission |
| Draft rules | What remains proposed? | Root inactive revisions; proposals in existing work | A proposal or parked slice does not change current API meaning |
| Decisions | Why this choice? | [Root locator](../../graphrefly/authority/ledgers.jsonl) | No separate React decision ledger was found or created |
| Work | What is being done? | [Local slices](../plan/slices.jsonl), [narrative context](plan.md) | Slice state/evidence is not copied into entrypoints |
| Evidence | What was checked? | Slice receipts and [B142 checks](../../graphrefly/sessions/active/docs-reorganization-evidence/2026-11-05-react.md) | Legacy spike results do not establish current product acceptance |
| Design / guides | How do I use it? | [Usage](usage.md), [development](development.md), [source/export map](../package.json) | API examples and binding scope stay package-local |
| Archive | What did earlier work say? | Retained narrative, [changelog](../CHANGELOG.md), Git history | No archive/trash candidate was established |
| Reference | What informs further work? | [TS guides](../../graphrefly-ts/docs/README.md), [root guides](../../graphrefly/guide/guide.jsonl) | Reference material does not dispatch product work |

AGENTS is the maintained agent entrypoint; CLAUDE forwards there. No API or runtime
change is made by this navigation cleanup. Use current TS package paths instead
of stale renderer/GraphSpec locations from former agent prose.
