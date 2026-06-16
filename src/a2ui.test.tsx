import { graph } from "@graphrefly/ts";
import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	A2UI_VERSION,
	boundaryManifest,
	boundaryManifestToA2UIDataModel,
	boundaryManifestToA2UIDataModelUpdate,
	useA2UIBoundaryDataModelUpdate,
} from "./index.js";

describe("A2UI boundary data-model lowering", () => {
	it("lowers boundary values without confusing SENTINEL, null DATA, and non-JSON DATA", () => {
		const g = graph({ name: "a2ui-values" });
		g.state<null>(null, { name: "nullable" });
		g.state<unknown>(1n, { name: "big" });
		g.node<number | null>([], null, { name: "pending" });

		const model = boundaryManifestToA2UIDataModel(boundaryManifest(g));

		expect(model.inputs.nullable?.value).toEqual({ state: "data", value: null });
		expect(model.inputs.big?.value).toEqual({ state: "nonJson", kind: "bigint" });
		expect(model.outputs.pending?.value).toEqual({ state: "sentinel" });
	});

	it("builds a versioned A2UI updateDataModel message with a stable default path", () => {
		const g = graph({ name: "a2ui-message" });
		g.state(7, { name: "amount" });

		const msg = boundaryManifestToA2UIDataModelUpdate(boundaryManifest(g), {
			surfaceId: "surface-1",
		});

		expect(msg.version).toBe(A2UI_VERSION);
		expect(msg.updateDataModel.surfaceId).toBe("surface-1");
		expect(msg.updateDataModel.path).toBe("/graphrefly/boundary");
		expect(msg.updateDataModel.value.inputs.amount?.value).toEqual({ state: "data", value: 7 });
	});

	it("keeps a fixed-schema A2UI data-model update live as graph values change", async () => {
		const g = graph({ name: "a2ui-live" });
		const amount = g.state(1, { name: "amount" });
		g.derived([amount], (value) => value * 2, { name: "doubled" });

		function Probe() {
			const msg = useA2UIBoundaryDataModelUpdate(g, {
				path: "/data",
				surfaceId: "surface-live",
			});
			return <output data-testid="msg">{JSON.stringify(msg)}</output>;
		}

		render(<Probe />);

		await waitFor(() => {
			const msg = JSON.parse(screen.getByTestId("msg").textContent ?? "{}");
			expect(msg.updateDataModel.value.outputs.doubled.value).toEqual({
				state: "data",
				value: 2,
			});
		});

		act(() => {
			amount.set(3);
		});

		await waitFor(() => {
			const msg = JSON.parse(screen.getByTestId("msg").textContent ?? "{}");
			expect(msg.updateDataModel.path).toBe("/data");
			expect(msg.updateDataModel.value.inputs.amount.value).toEqual({
				state: "data",
				value: 3,
			});
			expect(msg.updateDataModel.value.outputs.doubled.value).toEqual({
				state: "data",
				value: 6,
			});
		});
	});
});
