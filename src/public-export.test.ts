import { graph } from "@graphrefly/ts";
import {
	useNodeInput as tsUseNodeInput,
	useNodeRecord as tsUseNodeRecord,
	useNodeValue as tsUseNodeValue,
} from "@graphrefly/ts/adapters/react";
import {
	type BoundaryManifest as TsBoundaryManifest,
	type BoundaryNode as TsBoundaryNode,
	type BoundaryRole as TsBoundaryRole,
	boundaryManifest as tsBoundaryManifest,
} from "@graphrefly/ts/inspection/boundary";
import { describe, expect, expectTypeOf, it } from "vitest";
import {
	A2UI_VERSION,
	type A2UIBoundaryDataModel,
	type A2UIUpdateDataModelMessage,
	AutoPanel,
	type AutoPanelInputWidgetProps,
	type AutoPanelOutputWidgetProps,
	type AutoPanelWidgetCatalog,
	type AutoPanelWidgetResolverContext,
	type BoundaryManifest,
	type BoundaryNode,
	type BoundaryRole,
	boundaryManifest,
	boundaryManifestToA2UIDataModel,
	boundaryManifestToA2UIDataModelUpdate,
	TopologyFlowPanel,
	type TopologyFlowPanelProps,
	useA2UIBoundaryDataModel,
	useA2UIBoundaryDataModelUpdate,
	useBoundaryManifest,
	useNodeInput,
	useNodeRecord,
	useNodeValue,
} from "./index.js";

describe("public root exports", () => {
	it("re-exports TS node hooks and boundary contract by identity", () => {
		expect(useNodeInput).toBe(tsUseNodeInput);
		expect(useNodeRecord).toBe(tsUseNodeRecord);
		expect(useNodeValue).toBe(tsUseNodeValue);
		expect(boundaryManifest).toBe(tsBoundaryManifest);
	});

	it("exports runtime values with the expected shape", () => {
		expect(typeof useBoundaryManifest).toBe("function");
		expect(typeof AutoPanel).toBe("function");
		expect(typeof TopologyFlowPanel).toBe("function");
		expect(A2UI_VERSION).toBe("v0.9.1");
		expect(typeof boundaryManifestToA2UIDataModel).toBe("function");
		expect(typeof boundaryManifestToA2UIDataModelUpdate).toBe("function");
		expect(typeof useA2UIBoundaryDataModel).toBe("function");
		expect(typeof useA2UIBoundaryDataModelUpdate).toBe("function");

		const manifested = boundaryManifest(graph({ name: "public-export-smoke" }));
		expect(manifested.inputs.length).toBe(0);
		expect(manifested.outputs.length).toBe(0);
	});

	it("exports boundary types as TS contract-equivalent aliases", () => {
		expectTypeOf<BoundaryManifest>().toEqualTypeOf<TsBoundaryManifest>();
		expectTypeOf<BoundaryNode>().toEqualTypeOf<TsBoundaryNode>();
		expectTypeOf<BoundaryRole>().toEqualTypeOf<TsBoundaryRole>();
	});

	it("exports AutoPanel widget catalog types", () => {
		expectTypeOf<AutoPanelWidgetCatalog>().toHaveProperty("inputs");
		expectTypeOf<AutoPanelWidgetCatalog>().toHaveProperty("outputs");
		expectTypeOf<AutoPanelWidgetResolverContext>().toHaveProperty("role");
		expectTypeOf<AutoPanelInputWidgetProps>().toHaveProperty("set");
		expectTypeOf<AutoPanelOutputWidgetProps>().toHaveProperty("text");
	});

	it("exports topology flow panel types", () => {
		expectTypeOf<TopologyFlowPanelProps>().toHaveProperty("graph");
	});

	it("exports A2UI boundary data-model types", () => {
		expectTypeOf<A2UIBoundaryDataModel>().toHaveProperty("inputs");
		expectTypeOf<A2UIBoundaryDataModel>().toHaveProperty("outputs");
		expectTypeOf<A2UIUpdateDataModelMessage>().toHaveProperty("updateDataModel");
	});
});
