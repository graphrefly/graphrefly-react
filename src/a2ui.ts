import type { Graph } from "@graphrefly/ts";
import { nodeSnapshot, subscribeNodeValues } from "@graphrefly/ts/adapters";
import {
	type BoundaryManifest,
	type BoundaryNode,
	boundaryManifest,
} from "@graphrefly/ts/inspection/boundary";
import { useMemo, useSyncExternalStore } from "react";

export const A2UI_VERSION = "v0.9.1" as const;

export type A2UIVersion = typeof A2UI_VERSION;
export type A2UIJsonValue =
	| null
	| boolean
	| number
	| string
	| A2UIJsonValue[]
	| { [key: string]: A2UIJsonValue };

export type A2UIBoundaryValue =
	| { state: "data"; value: A2UIJsonValue }
	| { state: "nonJson"; kind: string }
	| { state: "sentinel" };

export interface A2UIBoundaryDataModelEntry {
	name: string;
	nodeType: string;
	role: "input" | "output";
	value: A2UIBoundaryValue;
}

export interface A2UIBoundaryDataModel {
	inputs: Record<string, A2UIBoundaryDataModelEntry>;
	outputs: Record<string, A2UIBoundaryDataModelEntry>;
}

export interface A2UIUpdateDataModelMessage {
	version: A2UIVersion;
	updateDataModel: {
		path: string;
		surfaceId: string;
		value: A2UIBoundaryDataModel;
	};
}

export interface A2UIBoundaryDataModelOptions {
	path?: string;
	surfaceId: string;
}

const DEFAULT_A2UI_BOUNDARY_PATH = "/graphrefly/boundary";

export function boundaryManifestToA2UIDataModel(manifest: BoundaryManifest): A2UIBoundaryDataModel {
	return {
		inputs: entriesToRecord(manifest.inputs),
		outputs: entriesToRecord(manifest.outputs),
	};
}

export function boundaryManifestToA2UIDataModelUpdate(
	manifest: BoundaryManifest,
	options: A2UIBoundaryDataModelOptions,
): A2UIUpdateDataModelMessage {
	return {
		version: A2UI_VERSION,
		updateDataModel: {
			path: options.path ?? DEFAULT_A2UI_BOUNDARY_PATH,
			surfaceId: options.surfaceId,
			value: boundaryManifestToA2UIDataModel(manifest),
		},
	};
}

export function useA2UIBoundaryDataModel(graph: Graph): A2UIBoundaryDataModel {
	const store = useMemo(() => boundaryDataModelStore(graph), [graph]);
	const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
	return useMemo(() => JSON.parse(snapshot) as A2UIBoundaryDataModel, [snapshot]);
}

export function useA2UIBoundaryDataModelUpdate(
	graph: Graph,
	options: A2UIBoundaryDataModelOptions,
): A2UIUpdateDataModelMessage {
	const model = useA2UIBoundaryDataModel(graph);
	return useMemo(
		() => ({
			version: A2UI_VERSION,
			updateDataModel: {
				path: options.path ?? DEFAULT_A2UI_BOUNDARY_PATH,
				surfaceId: options.surfaceId,
				value: model,
			},
		}),
		[model, options.path, options.surfaceId],
	);
}

function boundaryDataModelStore(graph: Graph) {
	return {
		getSnapshot: () => boundaryDataModelSnapshot(graph),
		subscribe(onStoreChange: () => void) {
			let unsubscribeNodes = subscribeBoundaryNodes(graph, onStoreChange);
			const unsubscribeTopology = graph.observeTopology().subscribe(() => {
				unsubscribeNodes();
				unsubscribeNodes = subscribeBoundaryNodes(graph, onStoreChange);
				onStoreChange();
			});
			return () => {
				unsubscribeTopology();
				unsubscribeNodes();
			};
		},
	};
}

function boundaryDataModelSnapshot(graph: Graph): string {
	return JSON.stringify(boundaryManifestToA2UIDataModel(boundaryManifest(graph)));
}

function subscribeBoundaryNodes(graph: Graph, onStoreChange: () => void): () => void {
	const manifest = boundaryManifest(graph);
	const entries = [...manifest.inputs, ...manifest.outputs];
	const unsubscribes = entries.map((entry) =>
		subscribeNodeValues(entry.node, onStoreChange, { changesOnly: false }),
	);
	return () => {
		for (const unsubscribe of unsubscribes) unsubscribe();
	};
}

function entriesToRecord(
	entries: readonly BoundaryNode[],
): Record<string, A2UIBoundaryDataModelEntry> {
	const out: Record<string, A2UIBoundaryDataModelEntry> = {};
	for (const entry of [...entries].sort((a, b) => a.name.localeCompare(b.name))) {
		out[entry.name] = {
			name: entry.name,
			nodeType: entry.type,
			role: entry.role,
			value: encodeBoundaryValue(nodeSnapshot(entry.node)),
		};
	}
	return out;
}

function encodeBoundaryValue(value: unknown): A2UIBoundaryValue {
	if (value === undefined) return { state: "sentinel" };
	const json = toJsonValue(value, new WeakSet());
	if (json.ok) return { state: "data", value: json.value };
	return { state: "nonJson", kind: json.kind };
}

type JsonResult = { ok: true; value: A2UIJsonValue } | { kind: string; ok: false };

function toJsonValue(value: unknown, seen: WeakSet<object>): JsonResult {
	if (value === null) return { ok: true, value: null };
	if (typeof value === "string" || typeof value === "boolean") return { ok: true, value };
	if (typeof value === "number") {
		return Number.isFinite(value) ? { ok: true, value } : { kind: "nonFiniteNumber", ok: false };
	}
	if (typeof value === "bigint" || typeof value === "function" || typeof value === "symbol") {
		return { kind: typeof value, ok: false };
	}
	if (value === undefined) return { kind: "undefined", ok: false };
	if (value instanceof Date) return { ok: true, value: value.toISOString() };
	if (Array.isArray(value)) {
		if (seen.has(value)) return { kind: "cycle", ok: false };
		seen.add(value);
		const out: A2UIJsonValue[] = [];
		for (const item of value) {
			const encoded = toJsonValue(item, seen);
			if (!encoded.ok) return encoded;
			out.push(encoded.value);
		}
		seen.delete(value);
		return { ok: true, value: out };
	}
	if (!isPlainObject(value)) return { kind: objectKind(value), ok: false };
	if (seen.has(value)) return { kind: "cycle", ok: false };
	seen.add(value);
	const out: { [key: string]: A2UIJsonValue } = {};
	for (const [key, item] of Object.entries(value)) {
		const encoded = toJsonValue(item, seen);
		if (!encoded.ok) return encoded;
		out[key] = encoded.value;
	}
	seen.delete(value);
	return { ok: true, value: out };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	if (value === null || typeof value !== "object") return false;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
}

function objectKind(value: object): string {
	return value.constructor?.name ?? "object";
}
