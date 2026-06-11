// ---------------------------------------------------------------------------
// Binding core (spike) — the two-way node ⇄ widget reactive binding.
//
// This is the ONE irreplaceable piece of the presentation layer: everything
// else (canvas, widgets, charts, code editor) is rentable OSS. It bridges a
// GraphReFly `Node<T>` into React via `useSyncExternalStore`, using the
// dependency-free `@graphrefly/ts/adapters` store bridge underneath.
//
//   input widget  -> boundary writable `state` node     (useNodeInput, write)
//   output widget <- boundary `derived` node            (useNodeValue, read)
// ---------------------------------------------------------------------------

import type { Node } from "@graphrefly/ts";
import { reactExternalStore, type WritableNode } from "@graphrefly/ts/adapters";
import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Read a GraphReFly node as a React value — the OUTPUT-widget binding.
 *
 * Re-renders whenever the node settles a new value (push-on-subscribe). The
 * subscription lifecycle is tied to React mount/unmount, not to node terminal
 * messages.
 *
 * SENTINEL semantics (graphrefly guard rules v5):
 *  - `undefined` → the node has NEVER emitted DATA (the global SENTINEL).
 *  - `null`      → a *valid* DATA value the node actually emitted.
 *
 * Distinguish "no value yet" with `=== undefined`, never with falsiness.
 */
export function useNodeValue<T>(node: Node<T>): T | undefined | null {
	const store = useMemo(() => reactExternalStore(node), [node]);
	return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

/**
 * Bind a writable GraphReFly node as a React `[value, set]` tuple — the
 * INPUT-widget binding.
 *
 * `set(v)` writes through the clean-slate writable node boundary. This is the
 * reactive write path — NOT a presentation-owned trigger: downstream derived
 * nodes recompute and any `useNodeValue` bound to them re-renders.
 */
export function useNodeInput<T>(node: WritableNode<T>): [T | undefined | null, (value: T) => void] {
	const value = useNodeValue(node);
	const set = useCallback(
		(v: T) => {
			node.set(v);
		},
		[node],
	);
	return [value, set];
}
