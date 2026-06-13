import type { Graph } from "@graphrefly/ts";
import { graph } from "@graphrefly/ts";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { boundaryManifest, useBoundaryManifest } from "./index.js";

function ManifestProbe({ graph }: { graph: Graph }) {
	const manifest = useBoundaryManifest(graph);
	const label = `${manifest.inputs.map((entry) => entry.name).join(",")}|${manifest.outputs.map((entry) => entry.name).join(",")}`;

	return <output data-testid="manifest">{label}</output>;
}

describe("useBoundaryManifest hook", () => {
	it("recomputes the boundary manifest when graph topology changes", () => {
		const g = graph({ name: "manifest-hook" });
		g.state(0, { name: "source" });

		render(<ManifestProbe graph={g} />);
		expect(screen.getByTestId("manifest").textContent).toBe("source|");

		const source = g.find("source");
		act(() => {
			g.derived([source], (value) => value + 1, { name: "next" });
		});
		expect(screen.getByTestId("manifest").textContent).toBe("source|next");
	});

	it("exports through package entrypoint", () => {
		const g = graph({ name: "manifest-exports" });
		g.state(1, { name: "amount" });
		const manifest = boundaryManifest(g);

		expect(typeof useBoundaryManifest).toBe("function");
		expect(manifest.inputs.length).toBe(1);
	});
});
