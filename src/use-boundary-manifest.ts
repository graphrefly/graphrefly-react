import type { Graph } from "@graphrefly/ts";
import { useMemo, useSyncExternalStore } from "react";
import type { BoundaryManifest } from "./boundary.js";
import { boundaryManifest } from "./boundary.js";

function topologySnapshot(graph: Graph): string {
	const described = graph.describe();
	return JSON.stringify({
		nodes: described.nodes?.map((node) => ({
			id: node.id,
			deps: node.deps,
			factory: node.factory,
			name: node.name,
		})),
		edges: described.edges,
	});
}

/**
 * Read a live boundary manifest for a graph and rerender when topology changes.
 *
 * This hook is intentionally small and generic so presentation shells can reuse
 * the boundary-binding contract without copying internal manifest wiring.
 */
export function useBoundaryManifest(graph: Graph): BoundaryManifest {
	const store = useMemo(() => {
		return {
			subscribe: (onStoreChange: () => void) =>
				graph.observeTopology().subscribe(() => onStoreChange()),
			getSnapshot: () => topologySnapshot(graph),
		};
	}, [graph]);

	useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
	return boundaryManifest(graph);
}
