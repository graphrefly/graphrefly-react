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
	AutoPanel,
	type BoundaryManifest,
	type BoundaryNode,
	type BoundaryRole,
	boundaryManifest,
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

		const manifested = boundaryManifest(graph({ name: "public-export-smoke" }));
		expect(manifested.inputs.length).toBe(0);
		expect(manifested.outputs.length).toBe(0);
	});

	it("exports boundary types as TS contract-equivalent aliases", () => {
		expectTypeOf<BoundaryManifest>().toEqualTypeOf<TsBoundaryManifest>();
		expectTypeOf<BoundaryNode>().toEqualTypeOf<TsBoundaryNode>();
		expectTypeOf<BoundaryRole>().toEqualTypeOf<TsBoundaryRole>();
	});
});
