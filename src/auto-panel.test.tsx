import { graph } from "@graphrefly/ts";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AutoPanel, type AutoPanelWidgetCatalog } from "./auto-panel.js";

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

	it("uses caller-supplied boolean, number, and text widgets from a trusted catalog", () => {
		const g = graph({ name: "catalog-inputs" });
		const enabled = g.state(true, { name: "enabled" });
		const amount = g.state(2, { name: "amount" });
		const label = g.state("base", { name: "label" });
		g.derived([enabled], (value) => String(value), { name: "enabled-out" });
		g.derived([amount], (value) => value * 10, { name: "amount-out" });
		g.derived([label], (value) => `${value}!`, { name: "label-out" });
		const widgetCatalog: AutoPanelWidgetCatalog = {
			inputs: {
				boolean: ({ entry, set, value }) => (
					<button
						data-testid={`custom:${entry.name}`}
						type="button"
						onClick={() => set(value !== true)}
					>
						bool:{String(value)}
					</button>
				),
				number: ({ entry, set, value }) => (
					<button
						data-testid={`custom:${entry.name}`}
						type="button"
						onClick={() => set(Number(value) + 1)}
					>
						number:{String(value)}
					</button>
				),
				text: ({ entry, set, value }) => (
					<button
						data-testid={`custom:${entry.name}`}
						type="button"
						onClick={() => set(`${value}:custom`)}
					>
						text:{String(value)}
					</button>
				),
			},
		};

		render(<AutoPanel graph={g} widgetCatalog={widgetCatalog} />);

		expect(screen.getByTestId("custom:enabled").textContent).toBe("bool:true");
		expect(screen.getByTestId("custom:amount").textContent).toBe("number:2");
		expect(screen.getByTestId("custom:label").textContent).toBe("text:base");

		act(() => {
			screen.getByTestId("custom:amount").click();
			screen.getByTestId("custom:label").click();
			screen.getByTestId("custom:enabled").click();
		});

		expect(screen.getByTestId("out:amount-out").textContent).toBe("30");
		expect(screen.getByTestId("out:label-out").textContent).toBe("base:custom!");
		expect(screen.getByTestId("out:enabled-out").textContent).toBe("false");
	});

	it("falls back to default widgets when the resolver selects a missing catalog key", () => {
		render(
			<AutoPanel
				graph={doublerGraph()}
				widgetCatalog={{ inputs: {} }}
				widgetResolver={() => "missing-widget"}
			/>,
		);

		const input = screen.getByTestId("in:amount") as HTMLInputElement;
		expect(input.type).toBe("number");

		act(() => {
			fireEvent.change(input, { target: { value: "5" } });
		});
		expect(screen.getByTestId("out:doubled").textContent).toBe("10");
	});

	it("resolves SENTINEL and null outputs as distinct widget keys, not fallback text", () => {
		const g = graph({ name: "catalog-output-sentinel" });
		const maybe = g.node<null>([], null, { name: "maybe" });
		const widgetCatalog: AutoPanelWidgetCatalog = {
			outputs: {
				null: ({ entry, testId }) => <output data-testid={testId}>null:{entry.name}</output>,
				sentinel: ({ entry, testId }) => (
					<output data-testid={testId}>sentinel:{entry.name}</output>
				),
				text: ({ entry, testId }) => <output data-testid={testId}>text:{entry.name}</output>,
			},
		};

		render(<AutoPanel graph={g} widgetCatalog={widgetCatalog} />);
		expect(screen.getByTestId("out:maybe").textContent).toBe("sentinel:maybe");

		act(() => {
			maybe.down([["DATA", null]]);
		});
		expect(screen.getByTestId("out:maybe").textContent).toBe("null:maybe");
	});
});
