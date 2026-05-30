// @graphrefly/react — reactive binding + presentation layer for GraphReFly.
// Currently the binding-core spike: node ⇄ widget hooks, boundary manifest, auto panel.

export { AutoPanel } from "./auto-panel.js";
export type { BoundaryManifest, BoundaryNode, BoundaryRole } from "./boundary.js";
export { boundaryManifest } from "./boundary.js";
export { useNodeInput, useNodeValue } from "./use-node.js";

export const VERSION = "0.0.0";
