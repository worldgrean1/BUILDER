export type CreatorNodeType = 'frame' | 'section' | 'container' | 'card' | 'text' | 'button' | 'image' | 'threeD' | 'embed';

export type CreatorTool = 'select' | 'create' | 'move' | 'scale';
export type CreatorVariant = 'default' | 'hover' | 'pressed';
export type CreatorInteractionTrigger = 'click' | 'hover' | 'doubleClick' | 'mouseEnter' | 'mouseLeave';
export type CreatorInteractionAction = 'none' | 'duplicate' | 'delete' | 'toggleVisibility' | 'focus' | 'toggleLock' | 'navigate' | 'setVariant';
export type CreatorEasingCurve = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
export type CreatorEmbedRuntime = 'iframe' | 'spline' | 'threejs';

export interface CreatorNodeLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CreatorNodeStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
  radius: number;
  opacity: number;
  shadow: string;
  color: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right';
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
}

export interface CreatorNodeContent {
  text?: string;
  alt?: string;
  src?: string;
  runtime?: CreatorEmbedRuntime;
}

export interface CreatorNodeInteraction {
  trigger: CreatorInteractionTrigger;
  action: CreatorInteractionAction;
  targetId: string | null;
  transitionMs: number;
  easing: CreatorEasingCurve;
  navigateUrl: string;
  setVariantValue: CreatorVariant;
}

export interface CreatorChainedAction {
  id: string;
  action: CreatorInteractionAction;
  targetId: string | null;
  transitionMs: number;
  easing: CreatorEasingCurve;
  delayMs: number;
  navigateUrl: string;
  setVariantValue: CreatorVariant;
}

export interface CreatorInteractionChain {
  trigger: CreatorInteractionTrigger;
  actions: CreatorChainedAction[];
}

export interface CreatorInstanceOverride {
  field: 'style' | 'content' | 'layout' | 'name';
  path: string;
  value: unknown;
}

export interface CreatorNodeResponsive {
  hideOnDesktop: boolean;
  hideOnTablet: boolean;
  hideOnMobile: boolean;
  widthMode: 'fixed' | 'fluid';
  maxWidth: number | null;
}

export interface CreatorNode {
  id: string;
  type: CreatorNodeType;
  name: string;
  parentId: string | null;
  children: string[];
  layout: CreatorNodeLayout;
  style: CreatorNodeStyle;
  content: CreatorNodeContent;
  componentKey: string | null;
  instanceOf: string | null;
  variant: CreatorVariant;
  interaction: CreatorNodeInteraction;
  interactionChain: CreatorInteractionChain | null;
  instanceOverrides: CreatorInstanceOverride[];
  responsive: CreatorNodeResponsive;
  locked: boolean;
  hidden: boolean;
}

export interface CreatorDocument {
  rootId: string;
  nodes: Record<string, CreatorNode>;
}

export interface CreatorSelectionState {
  ids: string[];
}

export interface CreatorViewportState {
  zoom: number;
  panX: number;
  panY: number;
  framePreset: string;
  stageWidth: number;
  stageHeight: number;
}

export interface CreatorHistoryEntry {
  document: CreatorDocument;
  selectedIds: string[];
  viewport: CreatorViewportState;
  activeTool: CreatorTool;
  previewMode: boolean;
}

export interface CreatorFramePreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

export interface CreatorInsertItem {
  id: string;
  label: string;
  description: string;
  type: CreatorNodeType;
  group: 'Widgets' | 'Layout' | 'Text' | 'Media' | 'Components';
}

export interface CreatorColorToken {
  id: string;
  label: string;
  value: string;
}

export interface CreatorSpacingToken {
  id: string;
  label: string;
  value: number;
}

export interface CreatorStylePreset {
  id: string;
  name: string;
  style: Partial<CreatorNodeStyle>;
}
