import { graph } from "@graphrefly/ts";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AutoPanel } from "./auto-panel.js";

// A graph with one source (input) -> interior reduce -> one sink (output).
function doublerGraph() {
	const g = graph({ name: "auto" });
	const amount = g.state<number>(0, { name: "amount" });
	g.derived([amount], (value) => value * 2, { name: "doubled" });
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

	it("updates its manifest when the graph topology changes after mount", () => {
		const g = graph({ name: "dynamic" });
		const amount = g.state<number>(1, { name: "amount" });

		render(<AutoPanel graph={g} />);
		expect(screen.queryByTestId("out:incremented")).toBeNull();

		act(() => {
			g.derived([amount], (value) => value + 1, { name: "incremented" });
		});

		expect(screen.getByTestId("out:incremented").textContent).toBe("2");
	});
});
