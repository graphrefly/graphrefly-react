import { execFileSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TSC = join(ROOT, "node_modules", ".bin", "tsc");
const packageJson = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const peerLinks = {
	"@graphrefly/ts": resolve(ROOT, "..", "graphrefly-ts", "packages", "ts"),
	react: join(ROOT, "node_modules", "react"),
	"react-dom": join(ROOT, "node_modules", "react-dom"),
};

function fail(message) {
	console.error(`check-package-exports: ${message}`);
	process.exit(1);
}

function assert(condition, message) {
	if (!condition) fail(message);
}

function errorOutput(err) {
	const stdout =
		typeof err.stdout === "string"
			? err.stdout
			: Buffer.isBuffer(err.stdout)
				? err.stdout.toString("utf8")
				: "";
	const stderr =
		typeof err.stderr === "string"
			? err.stderr
			: Buffer.isBuffer(err.stderr)
				? err.stderr.toString("utf8")
				: "";
	return `${stdout}${stderr}`;
}

function validateExportTarget(path, target) {
	assert(typeof target === "string", `${path} must be a string target`);
	assert(target.startsWith("./"), `${path} must be package-relative`);
	assert(existsSync(join(ROOT, target)), `${path} target missing: ${target}`);
}

validateExportTarget("exports.import", packageJson.exports?.["."]?.import);
validateExportTarget("exports.default", packageJson.exports?.["."]?.default);
validateExportTarget("exports.types", packageJson.exports?.["."]?.types);

const tmp = mkdtempSync(join(tmpdir(), "graphrefly-react-export-smoke-"));

try {
	const reactPkg = join(tmp, "node_modules", "@graphrefly", "react");
	mkdirSync(reactPkg, { recursive: true });
	cpSync(join(ROOT, "package.json"), join(reactPkg, "package.json"));
	cpSync(join(ROOT, "dist"), join(reactPkg, "dist"), { recursive: true });

	for (const [name, target] of Object.entries(peerLinks)) {
		assert(existsSync(target), `peer package target missing for ${name}: ${target}`);
		const link = join(tmp, "node_modules", ...name.split("/"));
		mkdirSync(dirname(link), { recursive: true });
		symlinkSync(target, link, "dir");
	}

	writeFileSync(
		join(tmp, "package.json"),
		JSON.stringify({ type: "module", private: true }, null, "\t"),
	);
	writeFileSync(
		join(tmp, "esm-smoke.mjs"),
		`import assert from "node:assert/strict";
import * as reactSdk from "@graphrefly/react";
import { useNodeInput, useNodeRecord, useNodeValue } from "@graphrefly/ts/adapters/react";
import { boundaryManifest } from "@graphrefly/ts/inspection/boundary";

assert.equal(reactSdk.useNodeInput, useNodeInput);
assert.equal(reactSdk.useNodeRecord, useNodeRecord);
assert.equal(reactSdk.useNodeValue, useNodeValue);
assert.equal(reactSdk.boundaryManifest, boundaryManifest);
assert.equal(typeof reactSdk.useBoundaryManifest, "function");
assert.equal(typeof reactSdk.AutoPanel, "function");
assert.equal(typeof reactSdk.TopologyFlowPanel, "function");
	`,
	);
	writeFileSync(
		join(tmp, "types-smoke.mts"),
		`import {
		AutoPanel,
		type AutoPanelInputWidgetProps,
		type AutoPanelOutputWidgetProps,
		type AutoPanelWidgetCatalog,
		type AutoPanelWidgetResolverContext,
			type BoundaryManifest,
			type BoundaryNode,
			type BoundaryRole,
			TopologyFlowPanel,
			type TopologyFlowPanelProps,
		boundaryManifest,
	useBoundaryManifest,
	useNodeInput,
	useNodeRecord,
	useNodeValue,
} from "@graphrefly/react";

void AutoPanel;
void TopologyFlowPanel;
void boundaryManifest;
void useBoundaryManifest;
void useNodeInput;
void useNodeRecord;
void useNodeValue;

	declare const manifest: BoundaryManifest;
	const role: BoundaryRole = "input";
	const node: BoundaryNode | undefined = manifest.inputs[0] ?? manifest.outputs[0];
	declare const inputProps: AutoPanelInputWidgetProps;
	declare const outputProps: AutoPanelOutputWidgetProps;
		declare const catalog: AutoPanelWidgetCatalog;
		declare const resolverContext: AutoPanelWidgetResolverContext;
		declare const topologyFlowProps: TopologyFlowPanelProps;
		void role;
		void node;
		void inputProps;
		void outputProps;
		void catalog;
		void resolverContext;
		void topologyFlowProps;
		`,
	);
	writeFileSync(
		join(tmp, "tsconfig.json"),
		JSON.stringify(
			{
				compilerOptions: {
					target: "ES2022",
					module: "NodeNext",
					moduleResolution: "NodeNext",
					jsx: "react-jsx",
					strict: true,
					noEmit: true,
					skipLibCheck: true,
				},
				include: ["types-smoke.mts"],
			},
			null,
			"\t",
		),
	);

	execFileSync(process.execPath, ["esm-smoke.mjs"], { cwd: tmp, stdio: "pipe" });
	execFileSync(TSC, ["-p", "tsconfig.json"], { cwd: tmp, stdio: "pipe" });
} catch (e) {
	fail(`${e.message ?? e}\n${errorOutput(e)}`.trim());
} finally {
	rmSync(tmp, { recursive: true, force: true });
}

console.log("check-package-exports: @graphrefly/react ESM/DTS smoke passed");
