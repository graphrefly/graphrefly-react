import { Graph } from "@graphrefly/pure-ts";
import { describe, expect, it } from "vitest";
import { boundaryManifest } from "./boundary.js";

describe("boundaryManifest", () => {
	it("classifies sources as inputs, sinks as outputs, and omits interior nodes", () => {
		const g = new Graph("m");
		g.state("amount", 0); // source -> input
		g.derived("taxed", ["amount"], () => [1]); // interior (has a dep AND a consumer)
		g.derived("total", ["taxed"], () => [1]); // sink -> output

		const m = boundaryManifest(g);
		expect(m.inputs.map((n) => n.name)).toEqual(["amount"]);
		expect(m.outputs.map((n) => n.name)).toEqual(["total"]);
		expect(m.inputs[0].type).toBe("state");
		expect(m.inputs[0].role).toBe("input");
		expect(m.outputs[0].role).toBe("output");
	});

	it("exposes the live node handle so a widget can bind directly", () => {
		const g = new Graph("m2");
		const amount = g.state("amount", 0);
		g.derived("out", ["amount"], () => [1]);

		const m = boundaryManifest(g);
		expect(m.inputs[0].node).toBe(amount);
	});

	it("keeps a consumed source as an input (a gauge feeding the graph), not interior", () => {
		const g = new Graph("m3");
		g.state("amount", 0); // no deps but consumed by `out`
		g.derived("out", ["amount"], () => [1]);

		const m = boundaryManifest(g);
		expect(m.inputs.map((n) => n.name)).toContain("amount");
		expect(m.outputs.map((n) => n.name)).toContain("out");
	});
});
