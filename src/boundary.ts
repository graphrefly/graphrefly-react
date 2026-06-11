// ---------------------------------------------------------------------------
// Boundary manifest (spike, slice 2) — read a graph's BOUNDARY nodes so the
// presentation layer knows which widgets to offer and which node each binds to.
//
//   writable source            -> "input"  widget  (gauge;   useNodeInput)
//   sink   (no outgoing edge)  -> "output" widget  (display; useNodeValue)
//   interior (both)            -> omitted (plumbing)
//
// This is the structural half of "fork + one-click-config": a palette renders
// from this manifest, and (later) the capability/OAuth prompt walks it.
// Capability-tag extraction from node meta is the next refinement.
// ---------------------------------------------------------------------------

import type { Graph, Node } from "@graphrefly/ts";
import type { WritableNode } from "@graphrefly/ts/adapters";

export type BoundaryRole = "input" | "output";

export interface BaseBoundaryNode {
	/** Registered node name (path). */
	name: string;
	/** Where it sits on the graph boundary. */
	role: BoundaryRole;
	/** describe() factory: "state" | "producer" | "derived" | "effect" | ... */
	type: string;
	/** Live handle — bind a widget directly: `useNodeInput(node)` / `useNodeValue(node)`. */
	node: Node<unknown>;
}

export interface InputBoundaryNode extends BaseBoundaryNode {
	role: "input";
	node: WritableNode<unknown>;
}

export interface OutputBoundaryNode extends BaseBoundaryNode {
	role: "output";
}

export type BoundaryNode = InputBoundaryNode | OutputBoundaryNode;

export interface BoundaryManifest {
	/** Sources — gauges that feed the graph. */
	inputs: InputBoundaryNode[];
	/** Sinks — displays the graph produces. */
	outputs: OutputBoundaryNode[];
}

/**
 * Derive the boundary manifest from a graph's structure (no execution required).
 *
 * A node is an INPUT if it has no incoming deps (a source). Otherwise it is an
 * OUTPUT if nothing depends on it (a sink). Interior nodes are omitted. Operates
 * on the top-level `describe()` node map; nested subgraph paths are not expanded.
 */
export function boundaryManifest(graph: Graph): BoundaryManifest {
	const described = graph.describe();
	const nodes = described.nodes ?? [];
	const consumed = new Set((described.edges ?? []).map((e) => e.from));

	const inputs: InputBoundaryNode[] = [];
	const outputs: OutputBoundaryNode[] = [];

	for (const entry of nodes) {
		const node = graph.find(entry.id);
		// Auto-discovered graphless describe entries are snapshot-only; widgets need a live handle.
		if (node === undefined) continue;
		const isSource = (entry.deps?.length ?? 0) === 0;
		if (isSource && isWritableNode(node)) {
			inputs.push({ name: entry.id, role: "input", type: entry.factory, node });
		} else if (!consumed.has(entry.id)) {
			outputs.push({ name: entry.id, role: "output", type: entry.factory, node });
		}
	}

	return { inputs, outputs };
}

function isWritableNode(node: Node<unknown>): node is WritableNode<unknown> {
	return typeof (node as { set?: unknown }).set === "function";
}
