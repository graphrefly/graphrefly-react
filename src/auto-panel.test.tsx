import { Graph } from "@graphrefly/pure-ts";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AutoPanel } from "./auto-panel.js";

// A graph with one source (input) -> interior reduce -> one sink (output).
function doublerGraph() {
	const g = new Graph("auto");
	g.state<number>("amount", 0);
	g.derived<number>("doubled", ["amount"], (data, ctx) => {
		const latest = data[0]?.at(-1) ?? ctx.prevData[0];
		return latest == null ? [] : [(latest as number) * 2];
	});
	return g;
}

describe("AutoPanel — a usable UI auto-grown from a graph", () => {
	it("renders an input widget per source and an output widget per sink, no hand-wiring", () => {
		render(<AutoPanel graph={doublerGraph()} />);
		expect(screen.getByTestId("in:amount")).toBeTruthy();
		expect(screen.getByTestId("out:doubled")).toBeTruthy();
		expect(screen.getByTestId("out:doubled").textContent).toBe("0"); // 0 * 2
	});

	it("typing into an auto-rendered input propagates reactively to the auto-rendered output", () => {
		render(<AutoPanel graph={doublerGraph()} />);
		const input = screen.getByTestId("in:amount") as HTMLInputElement;
		act(() => {
			fireEvent.change(input, { target: { value: "21" } });
		});
		expect(screen.getByTestId("out:doubled").textContent).toBe("42"); // 21 * 2
	});
});
