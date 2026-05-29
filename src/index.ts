// @graphrefly/react — reactive binding + presentation layer for GraphReFly.
// Currently the binding-core spike: two-way node ⇄ widget hooks + boundary manifest.

export type { BoundaryManifest, BoundaryNode, BoundaryRole } from "./boundary.js";
export { boundaryManifest } from "./boundary.js";
export { useNodeInput, useNodeValue } from "./use-node.js";

export const VERSION = "0.0.0";
