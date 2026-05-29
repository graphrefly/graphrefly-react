// ---------------------------------------------------------------------------
// Binding core (spike) — the two-way node ⇄ widget reactive binding.
//
// This is the ONE irreplaceable piece of the presentation layer: everything
// else (canvas, widgets, charts, code editor) is rentable OSS. It bridges a
// GraphReFly `Node<T>` into React via `useSyncExternalStore`, mirroring the
// proven `@graphrefly/graphrefly/compat/react` adapter but oriented at the
// boundary-node / widget contract.
//
//   input widget  -> boundary `state`/`producer` node   (useNodeInput, write)
//   output widget <- boundary `derived` node            (useNodeValue, read)
// ---------------------------------------------------------------------------

import { DATA, DIRTY, type Node } from "@graphrefly/pure-ts/core";
import { useCallback, useSyncExternalStore } from "react";

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
	const subscribe = useCallback(
		(onStoreChange: () => void) => {
			let disposed = false;
			const unsub = node.subscribe(() => {
				if (!disposed) onStoreChange();
			});
			return () => {
				disposed = true;
				unsub();
			};
		},
		[node],
	);
	const getSnapshot = useCallback(() => node.cache, [node]);
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Bind a writable GraphReFly node as a React `[value, set]` tuple — the
 * INPUT-widget binding.
 *
 * `set(v)` pushes one wave `[[DIRTY], [DATA, v]]` into the node. This is the
 * reactive, protocol-correct write path — NOT an imperative trigger: downstream
 * derived nodes recompute and any `useNodeValue` bound to them re-renders.
 */
export function useNodeInput<T>(node: Node<T>): [T | undefined | null, (value: T) => void] {
	const value = useNodeValue(node);
	const set = useCallback(
		(v: T) => {
			node.down([[DIRTY], [DATA, v]]);
		},
		[node],
	);
	return [value, set];
}
