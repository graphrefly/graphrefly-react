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

const ROOT = resolve(import.meta.dirname, "..");
const packageRoot = resolve(process.argv[2] ?? ".");
const packageJson = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
const expectedExports = {
	"@graphrefly/solid": ["createNodeInput", "createNodeRecord", "createNodeValue"],
	"@graphrefly/svelte": ["nodeReadable", "nodeRecord", "nodeWritable"],
	"@graphrefly/vue": ["useNodeInput", "useNodeRecord", "useNodeValue"],
}[packageJson.name];

function fail(message) {
	throw new Error(`check-ecosystem-package: ${message}`);
}

function assert(condition, message) {
	if (!condition) fail(message);
}

function resolveInstalledPackage(name) {
	const segments = name.split("/");
	const local = join(packageRoot, "node_modules", ...segments);
	if (existsSync(local)) return local;
	const root = join(ROOT, "node_modules", ...segments);
	if (existsSync(root)) return root;
	fail(`peer package is not installed: ${name}`);
}

assert(expectedExports, `unknown ecosystem package: ${packageJson.name}`);
assert(packageJson.dependencies === undefined, "package must not declare runtime dependencies");
assert(
	packageJson.optionalDependencies === undefined,
	"package must not declare optional dependencies",
);
assert(packageJson.sideEffects === false, "sideEffects must be false");

const rootExport = packageJson.exports?.["."];
for (const [label, target] of [
	["ESM", rootExport?.import?.default],
	["CJS", rootExport?.require?.default],
	["ESM DTS", rootExport?.import?.types],
	["CJS DTS", rootExport?.require?.types],
]) {
	assert(typeof target === "string", `${label} export target must be declared`);
	assert(existsSync(join(packageRoot, target)), `${label} export target is missing: ${target}`);
}

const tmp = mkdtempSync(join(tmpdir(), "graphrefly-ecosystem-package-"));
try {
	const packageInstall = join(tmp, "node_modules", ...packageJson.name.split("/"));
	mkdirSync(packageInstall, { recursive: true });
	cpSync(join(packageRoot, "package.json"), join(packageInstall, "package.json"));
	cpSync(join(packageRoot, "dist"), join(packageInstall, "dist"), { recursive: true });

	for (const peerName of Object.keys(packageJson.peerDependencies ?? {})) {
		const target = resolveInstalledPackage(peerName);
		const link = join(tmp, "node_modules", ...peerName.split("/"));
		mkdirSync(dirname(link), { recursive: true });
		symlinkSync(target, link, "dir");
	}

	writeFileSync(join(tmp, "package.json"), JSON.stringify({ private: true, type: "module" }));
	writeFileSync(
		join(tmp, "esm-smoke.mjs"),
		`import assert from "node:assert/strict";
import * as sdk from ${JSON.stringify(packageJson.name)};
assert.deepEqual(Object.keys(sdk).sort(), ${JSON.stringify(expectedExports)}.sort());
`,
	);
	writeFileSync(
		join(tmp, "cjs-smoke.cjs"),
		`const assert = require("node:assert/strict");
const sdk = require(${JSON.stringify(packageJson.name)});
assert.deepEqual(Object.keys(sdk).sort(), ${JSON.stringify(expectedExports)}.sort());
`,
	);
	execFileSync(process.execPath, ["esm-smoke.mjs"], { cwd: tmp, stdio: "pipe" });
	execFileSync(process.execPath, ["cjs-smoke.cjs"], { cwd: tmp, stdio: "pipe" });
} finally {
	rmSync(tmp, { recursive: true, force: true });
}

console.log(`check-ecosystem-package: ${packageJson.name} ESM/CJS/DTS smoke passed`);
