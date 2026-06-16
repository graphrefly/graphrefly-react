import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { graph } from "@graphrefly/ts";
import {
	useNodeInput as tsUseNodeInput,
	useNodeRecord as tsUseNodeRecord,
	useNodeValue as tsUseNodeValue,
} from "@graphrefly/ts/adapters/react";
import {
	type BoundaryCapabilityKind as TsBoundaryCapabilityKind,
	type BoundaryCapabilityRef as TsBoundaryCapabilityRef,
	type BoundaryManifest as TsBoundaryManifest,
	type BoundaryNode as TsBoundaryNode,
	type BoundaryRole as TsBoundaryRole,
	boundaryManifest as tsBoundaryManifest,
} from "@graphrefly/ts/inspection/boundary";
import type { ComponentType } from "react";
import { describe, expect, expectTypeOf, it } from "vitest";
import * as reactRoot from "./index.js";
import {
	A2UI_VERSION,
	type A2UIBoundaryDataModel,
	type A2UIUpdateDataModelMessage,
	AutoPanel,
	type AutoPanelCapabilityRenderer,
	type AutoPanelCapabilityResolution,
	type AutoPanelCapabilityResolver,
	type AutoPanelCapabilityResolverContext,
	type AutoPanelCapabilityStatus,
	type AutoPanelCapabilityViewProps,
	type AutoPanelInputWidgetProps,
	type AutoPanelOutputWidgetProps,
	type AutoPanelWidgetCatalog,
	type AutoPanelWidgetResolverContext,
	type BoundaryCapabilityKind,
	type BoundaryCapabilityRef,
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

const SRC_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SRC_DIR, "..");
const packageJson = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
	exports?: Record<string, unknown>;
	files?: string[];
	sideEffects?: boolean;
	devDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
};

const allowedRuntimeRootExports = [
	"A2UI_VERSION",
	"AutoPanel",
	"TopologyFlowPanel",
	"VERSION",
	"boundaryManifest",
	"boundaryManifestToA2UIDataModel",
	"boundaryManifestToA2UIDataModelUpdate",
	"useA2UIBoundaryDataModel",
	"useA2UIBoundaryDataModelUpdate",
	"useBoundaryManifest",
	"useNodeInput",
	"useNodeRecord",
	"useNodeValue",
] as const;

const deniedRootExports = [
	"Canvas",
	"CanvasProvider",
	"CanvasRuntime",
	"ConfigForm",
	"DynamicA2UIRegistry",
	"DynamicA2UIRenderer",
	"ELK",
	"OAuthProvider",
	"ProviderRegistry",
	"ReactFlow",
	"RendererRegistry",
	"WorkspaceGraph",
] as const;

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
		expectTypeOf<BoundaryCapabilityKind>().toEqualTypeOf<TsBoundaryCapabilityKind>();
		expectTypeOf<BoundaryCapabilityRef>().toEqualTypeOf<TsBoundaryCapabilityRef>();
		expectTypeOf<BoundaryManifest>().toEqualTypeOf<TsBoundaryManifest>();
		expectTypeOf<BoundaryNode>().toEqualTypeOf<TsBoundaryNode>();
		expectTypeOf<BoundaryRole>().toEqualTypeOf<TsBoundaryRole>();
		expectTypeOf<BoundaryNode>()
			.toHaveProperty("capabilities")
			.toEqualTypeOf<BoundaryCapabilityRef[] | undefined>();
	});

	it("exports AutoPanel widget catalog types", () => {
		expectTypeOf<AutoPanelWidgetCatalog>().toHaveProperty("inputs");
		expectTypeOf<AutoPanelWidgetCatalog>().toHaveProperty("outputs");
		expectTypeOf<AutoPanelWidgetResolverContext>().toHaveProperty("role");
		expectTypeOf<AutoPanelInputWidgetProps>().toHaveProperty("set");
		expectTypeOf<AutoPanelInputWidgetProps>().toHaveProperty("disabled");
		expectTypeOf<AutoPanelOutputWidgetProps>().toHaveProperty("text");
	});

	it("exports AutoPanel capability affordance types without product registries", () => {
		expectTypeOf<AutoPanelCapabilityStatus>().toEqualTypeOf<"pending" | "ready" | "unavailable">();
		expectTypeOf<AutoPanelCapabilityResolverContext>()
			.toHaveProperty("capability")
			.toEqualTypeOf<TsBoundaryCapabilityRef>();
		expectTypeOf<AutoPanelCapabilityResolution>().toHaveProperty("status");
		expectTypeOf<AutoPanelCapabilityViewProps>()
			.toHaveProperty("capability")
			.toEqualTypeOf<TsBoundaryCapabilityRef>();
		expectTypeOf<AutoPanelCapabilityRenderer>().toEqualTypeOf<
			ComponentType<AutoPanelCapabilityViewProps>
		>();
		expectTypeOf<AutoPanelCapabilityResolver>().returns.toEqualTypeOf<
			AutoPanelCapabilityResolution | AutoPanelCapabilityStatus | null | undefined
		>();
	});

	it("exports topology flow panel types", () => {
		expectTypeOf<TopologyFlowPanelProps>().toHaveProperty("graph");
	});

	it("exports A2UI boundary data-model types", () => {
		expectTypeOf<A2UIBoundaryDataModel>().toHaveProperty("inputs");
		expectTypeOf<A2UIBoundaryDataModel>().toHaveProperty("outputs");
		expectTypeOf<A2UIUpdateDataModelMessage>().toHaveProperty("updateDataModel");
	});

	it("keeps the root runtime export surface D346-light", () => {
		expect(Object.keys(reactRoot).sort()).toEqual([...allowedRuntimeRootExports].sort());

		for (const name of deniedRootExports) {
			expect(Object.hasOwn(reactRoot, name)).toBe(false);
		}
	});

	it("keeps package metadata and root imports production-surface-only", () => {
		expect(Object.keys(packageJson.exports ?? {}).sort()).toEqual(["."]);
		expect(packageJson.files).toEqual(["dist", "README.md", "package.json"]);
		expect(packageJson.sideEffects).toBe(false);
		expect(packageJson.peerDependencies).toMatchObject({
			"@graphrefly/ts": ">=0.0.0 <1.0.0",
			react: "^18.0.0 || ^19.0.0",
			"react-dom": "^18.0.0 || ^19.0.0",
		});
		const tsDevDependency = packageJson.devDependencies?.["@graphrefly/ts"];
		expect(tsDevDependency?.startsWith("link:")).toBe(true);
		expect(existsSync(resolve(ROOT, tsDevDependency?.slice("link:".length) ?? ""))).toBe(true);

		const indexSource = readFileSync(join(SRC_DIR, "index.ts"), "utf8");
		const imports = [
			...new Set(Array.from(indexSource.matchAll(/\bfrom\s+"([^"]+)"/g), (match) => match[1])),
		].sort();
		expect(imports).toEqual([
			"./a2ui.js",
			"./auto-panel.js",
			"./topology-flow.js",
			"./use-boundary-manifest.js",
			"@graphrefly/ts/adapters/react",
			"@graphrefly/ts/inspection/boundary",
		]);
		expect(
			imports.some((specifier) =>
				/@graphrefly\/ts\/solutions|react-flow|elkjs|canvas/i.test(specifier),
			),
		).toBe(false);
	});
});
