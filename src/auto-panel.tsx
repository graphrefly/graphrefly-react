// ---------------------------------------------------------------------------
// AutoPanel (spike/reference UI) — slices 1 + 2 composed.
//
// Give it a graph and it grows a usable panel with ZERO hand-wiring:
//   boundaryManifest -> one input widget per writable source, one output per sink,
//   each bound to its live node via useNodeInput / useNodeValue.
//
// Widget choice is React-local presentation: callers may resolve each boundary
// entry to a trusted catalog key while @graphrefly/ts keeps owning generic
// boundary semantics.
// ---------------------------------------------------------------------------

import type { Graph } from "@graphrefly/ts";
import { useNodeInput, useNodeValue } from "@graphrefly/ts/adapters/react";
import type { InputBoundaryNode, OutputBoundaryNode } from "@graphrefly/ts/inspection/boundary";
import type { ComponentType } from "react";
import { useBoundaryManifest } from "./use-boundary-manifest.js";

export type AutoPanelInputWidgetKey = "boolean" | "number" | "text";
export type AutoPanelOutputWidgetKey = "json" | "null" | "sentinel" | "text";

export type AutoPanelInputSetter = (next: unknown) => void;

export interface AutoPanelInputWidgetProps {
	entry: InputBoundaryNode;
	kind: AutoPanelInputWidgetKey;
	set: AutoPanelInputSetter;
	testId: string;
	value: unknown;
}

export interface AutoPanelOutputWidgetProps {
	entry: OutputBoundaryNode;
	kind: AutoPanelOutputWidgetKey;
	testId: string;
	text: string;
	value: unknown;
}

export type AutoPanelInputWidget = ComponentType<AutoPanelInputWidgetProps>;
export type AutoPanelOutputWidget = ComponentType<AutoPanelOutputWidgetProps>;

export interface AutoPanelWidgetCatalog {
	inputs?: Record<string, AutoPanelInputWidget>;
	outputs?: Record<string, AutoPanelOutputWidget>;
}

export type AutoPanelWidgetResolverContext =
	| {
			defaultKey: AutoPanelInputWidgetKey;
			entry: InputBoundaryNode;
			role: "input";
			value: unknown;
	  }
	| {
			defaultKey: AutoPanelOutputWidgetKey;
			entry: OutputBoundaryNode;
			role: "output";
			value: unknown;
	  };

export type AutoPanelWidgetResolver = (
	context: AutoPanelWidgetResolverContext,
) => string | null | undefined;

function defaultInputKey(value: unknown): AutoPanelInputWidgetKey {
	if (typeof value === "boolean") {
		return "boolean";
	}
	if (typeof value === "number") {
		return "number";
	}
	return "text";
}

function defaultOutputKey(value: unknown): AutoPanelOutputWidgetKey {
	if (value === undefined) return "sentinel";
	if (value === null) return "null";
	if (typeof value === "object") return "json";
	return "text";
}

function formatOutputValue(value: unknown): string {
	if (value === undefined) return "—";
	if (value === null) return "null";
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}

function DefaultBooleanInputWidget({ entry, set, testId, value }: AutoPanelInputWidgetProps) {
	return (
		<label>
			{entry.name}
			<input
				data-testid={testId}
				type="checkbox"
				checked={value === true}
				onChange={(e) => set(e.target.checked)}
			/>
		</label>
	);
}

function DefaultNumberInputWidget({ entry, set, testId, value }: AutoPanelInputWidgetProps) {
	const inputValue = typeof value === "number" ? value : "";
	return (
		<label>
			{entry.name}
			<input
				data-testid={testId}
				type="number"
				value={inputValue}
				onChange={(e) => {
					const n = Number(e.target.value);
					if (!Number.isNaN(n)) set(n);
				}}
			/>
		</label>
	);
}

function DefaultTextInputWidget({ entry, set, testId, value }: AutoPanelInputWidgetProps) {
	return (
		<label>
			{entry.name}
			<input
				data-testid={testId}
				type="text"
				value={value == null ? "" : String(value)}
				onChange={(e) => set(e.target.value)}
			/>
		</label>
	);
}

function DefaultOutputWidget({ entry, testId, text }: AutoPanelOutputWidgetProps) {
	return (
		<div>
			{entry.name}: <output data-testid={testId}>{text}</output>
		</div>
	);
}

const defaultInputWidgets: Record<AutoPanelInputWidgetKey, AutoPanelInputWidget> = {
	boolean: DefaultBooleanInputWidget,
	number: DefaultNumberInputWidget,
	text: DefaultTextInputWidget,
};

const defaultOutputWidgets: Record<AutoPanelOutputWidgetKey, AutoPanelOutputWidget> = {
	json: DefaultOutputWidget,
	null: DefaultOutputWidget,
	sentinel: DefaultOutputWidget,
	text: DefaultOutputWidget,
};

function resolveInputWidget(
	catalog: AutoPanelWidgetCatalog | undefined,
	resolver: AutoPanelWidgetResolver | undefined,
	entry: InputBoundaryNode,
	value: unknown,
): { kind: AutoPanelInputWidgetKey; Widget: AutoPanelInputWidget } {
	const kind = defaultInputKey(value);
	const resolvedKey = resolver?.({ defaultKey: kind, entry, role: "input", value }) ?? kind;
	const Widget = catalog?.inputs?.[resolvedKey] ?? defaultInputWidgets[kind];
	return { kind, Widget };
}

function resolveOutputWidget(
	catalog: AutoPanelWidgetCatalog | undefined,
	resolver: AutoPanelWidgetResolver | undefined,
	entry: OutputBoundaryNode,
	value: unknown,
): { kind: AutoPanelOutputWidgetKey; Widget: AutoPanelOutputWidget } {
	const kind = defaultOutputKey(value);
	const resolvedKey = resolver?.({ defaultKey: kind, entry, role: "output", value }) ?? kind;
	const Widget = catalog?.outputs?.[resolvedKey] ?? defaultOutputWidgets[kind];
	return { kind, Widget };
}

function InputWidget({
	entry,
	widgetCatalog,
	widgetResolver,
}: {
	entry: InputBoundaryNode;
	widgetCatalog?: AutoPanelWidgetCatalog;
	widgetResolver?: AutoPanelWidgetResolver;
}) {
	const [value, set] = useNodeInput(entry.node);
	const testId = `in:${entry.name}`;
	const { kind, Widget } = resolveInputWidget(widgetCatalog, widgetResolver, entry, value);
	return <Widget entry={entry} kind={kind} set={set} testId={testId} value={value} />;
}

function OutputWidget({
	entry,
	widgetCatalog,
	widgetResolver,
}: {
	entry: OutputBoundaryNode;
	widgetCatalog?: AutoPanelWidgetCatalog;
	widgetResolver?: AutoPanelWidgetResolver;
}) {
	const value = useNodeValue(entry.node);
	const testId = `out:${entry.name}`;
	const text = formatOutputValue(value);
	const { kind, Widget } = resolveOutputWidget(widgetCatalog, widgetResolver, entry, value);
	return <Widget entry={entry} kind={kind} testId={testId} text={text} value={value} />;
}

/**
 * Auto-render a usable panel straight from a graph's boundary: one input widget
 * per writable source, one output widget per sink — each bound to its node with zero
 * hand-wiring. Callers may provide a trusted widget catalog and resolver without
 * changing graph or boundary semantics.
 */
export interface AutoPanelProps {
	graph: Graph;
	widgetCatalog?: AutoPanelWidgetCatalog;
	widgetResolver?: AutoPanelWidgetResolver;
}

export function AutoPanel({ graph, widgetCatalog, widgetResolver }: AutoPanelProps) {
	const manifest = useBoundaryManifest(graph);
	return (
		<div>
			<section aria-label="inputs">
				{manifest.inputs.map((entry) => (
					<InputWidget
						key={entry.name}
						entry={entry}
						widgetCatalog={widgetCatalog}
						widgetResolver={widgetResolver}
					/>
				))}
			</section>
			<section aria-label="outputs">
				{manifest.outputs.map((entry) => (
					<OutputWidget
						key={entry.name}
						entry={entry}
						widgetCatalog={widgetCatalog}
						widgetResolver={widgetResolver}
					/>
				))}
			</section>
		</div>
	);
}
