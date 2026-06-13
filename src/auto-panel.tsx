// ---------------------------------------------------------------------------
// AutoPanel (spike, slice 3) — slices 1 + 2 composed.
//
// Give it a graph and it grows a usable panel with ZERO hand-wiring:
//   boundaryManifest -> one input widget per writable source, one output per sink,
//   each bound to its live node via useNodeInput / useNodeValue.
//
// This is the "give a graph -> auto-render an interface" payoff. Widget choice
// here is a crude typeof switch; the real product swaps in A2UI-declared widgets
// from a trusted catalog (the rentable layer) without changing the binding.
// ---------------------------------------------------------------------------

import type { Graph } from "@graphrefly/ts";
import type { InputBoundaryNode, OutputBoundaryNode } from "./boundary.js";
import { useBoundaryManifest } from "./use-boundary-manifest.js";
import { useNodeInput, useNodeValue } from "./use-node.js";

function InputWidget({ entry }: { entry: InputBoundaryNode }) {
	const [value, set] = useNodeInput(entry.node);
	const testid = `in:${entry.name}`;

	if (typeof value === "boolean") {
		return (
			<label>
				{entry.name}
				<input
					data-testid={testid}
					type="checkbox"
					checked={value}
					onChange={(e) => set(e.target.checked)}
				/>
			</label>
		);
	}
	if (typeof value === "number") {
		return (
			<label>
				{entry.name}
				<input
					data-testid={testid}
					type="number"
					value={value}
					onChange={(e) => {
						const n = Number(e.target.value);
						if (!Number.isNaN(n)) set(n);
					}}
				/>
			</label>
		);
	}
	return (
		<label>
			{entry.name}
			<input
				data-testid={testid}
				type="text"
				value={value == null ? "" : String(value)}
				onChange={(e) => set(e.target.value)}
			/>
		</label>
	);
}

function OutputWidget({ entry }: { entry: OutputBoundaryNode }) {
	const v = useNodeValue(entry.node);
	const text =
		v === undefined
			? "—"
			: v === null
				? "null"
				: typeof v === "object"
					? JSON.stringify(v)
					: String(v);
	return (
		<div>
			{entry.name}: <output data-testid={`out:${entry.name}`}>{text}</output>
		</div>
	);
}

/**
 * Auto-render a usable panel straight from a graph's boundary: one input widget
 * per writable source, one output widget per sink — each bound to its node with zero
 * hand-wiring. Slices 1 + 2 composed: manifest → widgets → live reactive binding.
 */
export interface AutoPanelProps {
	graph: Graph;
}

export function AutoPanel({ graph }: AutoPanelProps) {
	const manifest = useBoundaryManifest(graph);
	return (
		<div>
			<section aria-label="inputs">
				{manifest.inputs.map((entry) => (
					<InputWidget key={entry.name} entry={entry} />
				))}
			</section>
			<section aria-label="outputs">
				{manifest.outputs.map((entry) => (
					<OutputWidget key={entry.name} entry={entry} />
				))}
			</section>
		</div>
	);
}
