import { Graph } from "@graphrefly/pure-ts";
import { DATA, DIRTY, type Node } from "@graphrefly/pure-ts/core";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useNodeInput, useNodeValue } from "./use-node.js";

// A real graph (no mocks): an input `state` node feeding a `derived` output.
// This is the minimal "boundary input -> reduce -> boundary output" the
// presentation layer binds widgets to.
function makeDoublerGraph() {
	const g = new Graph("spike");
	const amount = g.state<number>("amount", 0);
	const doubled = g.derived<number>("doubled", [amount], (data, ctx) => {
		const latest = data[0]?.at(-1) ?? ctx.prevData[0];
		return latest == null ? [] : [(latest as number) * 2];
	});
	return { amount, doubled };
}

function Doubler({ amount, doubled }: { amount: Node<number>; doubled: Node<number> }) {
	const [value, setValue] = useNodeInput<number>(amount);
	const out = useNodeValue<number>(doubled);
	return (
		<div>
			<output data-testid="out">{out ?? "—"}</output>
			<button type="button" onClick={() => setValue((value ?? 0) + 21)}>
				+21
			</button>
		</div>
	);
}

describe("two-way node ⇄ widget binding", () => {
	it("output widget reflects the derived node's initial value (push-on-subscribe)", () => {
		const { amount, doubled } = makeDoublerGraph();
		render(<Doubler amount={amount} doubled={doubled} />);
		expect(screen.getByTestId("out").textContent).toBe("0"); // 0 * 2
	});

	it("input-widget write propagates reactively to the output widget", () => {
		const { amount, doubled } = makeDoublerGraph();
		render(<Doubler amount={amount} doubled={doubled} />);
		act(() => {
			screen.getByRole("button").click(); // setValue(0 + 21)
		});
		expect(screen.getByTestId("out").textContent).toBe("42"); // 21 * 2
	});

	it("distinguishes SENTINEL (no value yet) from a real null DATA at the widget boundary", () => {
		const g = new Graph("sentinel");
		const raw = g.state<number | null>("raw"); // no initial -> SENTINEL

		function Probe({ node }: { node: Node<number | null> }) {
			const v = useNodeValue<number | null>(node);
			const label = v === undefined ? "SENTINEL" : v === null ? "null-data" : String(v);
			return <output data-testid="probe">{label}</output>;
		}

		render(<Probe node={raw} />);
		expect(screen.getByTestId("probe").textContent).toBe("SENTINEL");

		act(() => {
			raw.down([[DIRTY], [DATA, null]]); // emit a *valid* null DATA
		});
		expect(screen.getByTestId("probe").textContent).toBe("null-data");
	});
});
