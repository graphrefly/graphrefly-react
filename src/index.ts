// @graphrefly/react — reactive binding + presentation layer for GraphReFly.
// TS owns framework node bindings and boundary manifests; React owns live hooks and UI.

export { useNodeInput, useNodeRecord, useNodeValue } from "@graphrefly/ts/adapters/react";
export type {
	BoundaryCapabilityKind,
	BoundaryCapabilityRef,
	BoundaryManifest,
	BoundaryNode,
	BoundaryRole,
	InputBoundaryNode,
	OutputBoundaryNode,
} from "@graphrefly/ts/inspection/boundary";
export { boundaryManifest } from "@graphrefly/ts/inspection/boundary";
export type {
	A2UIBoundaryDataModel,
	A2UIBoundaryDataModelEntry,
	A2UIBoundaryDataModelOptions,
	A2UIBoundaryValue,
	A2UIJsonValue,
	A2UIUpdateDataModelMessage,
	A2UIVersion,
} from "./a2ui.js";
export {
	A2UI_VERSION,
	boundaryManifestToA2UIDataModel,
	boundaryManifestToA2UIDataModelUpdate,
	useA2UIBoundaryDataModel,
	useA2UIBoundaryDataModelUpdate,
} from "./a2ui.js";
export type {
	AutoPanelInputSetter,
	AutoPanelInputWidget,
	AutoPanelInputWidgetKey,
	AutoPanelInputWidgetProps,
	AutoPanelOutputWidget,
	AutoPanelOutputWidgetKey,
	AutoPanelOutputWidgetProps,
	AutoPanelProps,
	AutoPanelWidgetCatalog,
	AutoPanelWidgetResolver,
	AutoPanelWidgetResolverContext,
} from "./auto-panel.js";
export { AutoPanel } from "./auto-panel.js";
export type {
	TopologyFlowEdge,
	TopologyFlowNode,
	TopologyFlowPanelProps,
} from "./topology-flow.js";
export { TopologyFlowPanel } from "./topology-flow.js";
export { useBoundaryManifest } from "./use-boundary-manifest.js";

export const VERSION = "0.0.0";
