import type { CreatorDocument, CreatorFramePreset, CreatorInsertItem, CreatorNode, CreatorNodeType } from './types';

const baseStyle = {
  fill: 'hsl(var(--surface-1))',
  stroke: 'hsl(var(--border-default) / var(--border-default-a))',
  strokeWidth: 1,
  rotation: 0,
  radius: 8,
  opacity: 1,
  shadow: 'var(--elevation-low)',
  color: 'hsl(var(--text-primary))',
  fontSize: 16,
  fontWeight: 500,
  letterSpacing: 0,
  lineHeight: 1.4,
  textAlign: 'left' as const,
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 16,
  paddingLeft: 16,
};

type CreatorNodeSeed = Omit<Partial<CreatorNode>, 'style' | 'layout' | 'content'> &
  Pick<CreatorNode, 'id' | 'type' | 'name'> & {
    style?: Partial<CreatorNode['style']>;
    layout?: Partial<CreatorNode['layout']>;
    content?: Partial<CreatorNode['content']>;
  };

const createNode = ({ style, layout, content, ...node }: CreatorNodeSeed): CreatorNode => ({
  parentId: null,
  children: [],
  layout: { x: 0, y: 0, width: 160, height: 80, ...layout },
  style: { ...baseStyle, ...style },
  content: { ...content },
  componentKey: null,
  instanceOf: null,
  variant: 'default',
  interaction: {
    trigger: 'click',
    action: 'none',
    targetId: null,
    transitionMs: 180,
    easing: 'ease-out',
    navigateUrl: '',
    setVariantValue: 'default',
  },
  interactionChain: null,
  instanceOverrides: [],
  responsive: {
    hideOnDesktop: false,
    hideOnTablet: false,
    hideOnMobile: false,
    widthMode: 'fixed',
    maxWidth: null,
  },
  locked: false,
  hidden: false,
  ...node,
});

export const CREATOR_FRAME_PRESETS: CreatorFramePreset[] = [
  { id: 'desktop', label: 'Desktop 1440', width: 1440, height: 900 },
  { id: 'laptop', label: 'Laptop 1280', width: 1280, height: 800 },
  { id: 'tablet', label: 'Tablet 834', width: 834, height: 1112 },
  { id: 'mobile', label: 'Mobile 390', width: 390, height: 844 },
];

export const CREATOR_INSERT_ITEMS: CreatorInsertItem[] = [
  { id: 'widget-container', label: 'Container', description: 'Flexible wrapper for nested content', type: 'container', group: 'Widgets' },
  { id: 'widget-text', label: 'Text', description: 'Heading, paragraph, or label block', type: 'text', group: 'Widgets' },
  { id: 'widget-image', label: 'Image', description: 'Image frame with editable media source', type: 'image', group: 'Widgets' },
  { id: 'widget-threeD', label: '3D', description: 'Spline or Three.js scene viewer widget', type: 'threeD', group: 'Widgets' },
  { id: 'widget-embed', label: 'Embed', description: 'IFrame or external content block', type: 'embed', group: 'Widgets' },
  { id: 'section', label: 'Section', description: 'Framed layout section', type: 'section', group: 'Layout' },
  { id: 'button', label: 'Button', description: 'Call-to-action button', type: 'button', group: 'Components' },
  { id: 'card', label: 'Card', description: 'Feature or content card', type: 'card', group: 'Components' },
];

export const createNodeTemplate = (type: CreatorNodeType, id: string, position: { x: number; y: number }, parentId: string): CreatorNode => {
  const common = {
    id,
    type,
    parentId,
    children: [],
    layout: {
      x: position.x,
      y: position.y,
      width: 220,
      height: 120,
    },
  };

  switch (type) {
    case 'section':
      return createNode({
        ...common,
        name: 'New Section',
        layout: { x: position.x, y: position.y, width: 480, height: 240 },
        style: { fill: 'linear-gradient(180deg, rgba(191,31,47,0.12), rgba(0,178,169,0.08))', radius: 8, paddingTop: 28, paddingRight: 28, paddingBottom: 28, paddingLeft: 28 },
      });
    case 'container':
      return createNode({
        ...common,
        name: 'Container',
        layout: { x: position.x, y: position.y, width: 360, height: 180 },
        style: { fill: 'hsl(var(--surface-1))', radius: 8, paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 20 },
      });
    case 'card':
      return createNode({
        ...common,
        name: 'Feature Card',
        layout: { x: position.x, y: position.y, width: 260, height: 180 },
        style: { fill: 'hsl(var(--surface-1))', radius: 8, shadow: 'var(--elevation-md)' },
      });
    case 'button':
      return createNode({
        ...common,
        name: 'CTA Button',
        layout: { x: position.x, y: position.y, width: 180, height: 56 },
        style: { fill: 'hsl(var(--brand))', stroke: 'transparent', color: '#ffffff', radius: 8, fontSize: 15, fontWeight: 600, textAlign: 'center' },
        content: { text: 'Take Action' },
      });
    case 'image':
      return createNode({
        ...common,
        name: 'Image Placeholder',
        layout: { x: position.x, y: position.y, width: 260, height: 180 },
        style: { fill: 'linear-gradient(135deg, rgba(0,178,169,0.24), rgba(255,255,255,0.06))', radius: 8 },
        content: { alt: 'Placeholder image' },
      });
    case 'threeD':
      return createNode({
        ...common,
        name: '3D Scene',
        layout: { x: position.x, y: position.y, width: 360, height: 240 },
        style: { fill: 'linear-gradient(160deg, rgba(18, 26, 46, 0.96), rgba(8, 12, 22, 1))', stroke: 'rgba(255,255,255,0.08)', radius: 8, shadow: 'var(--elevation-md)' },
        content: { runtime: 'spline', src: '' },
      });
    case 'embed':
      return createNode({
        ...common,
        name: 'Embed Block',
        layout: { x: position.x, y: position.y, width: 360, height: 220 },
        style: { fill: 'rgba(255,255,255,0.03)', stroke: 'rgba(255,255,255,0.1)', radius: 8, shadow: 'var(--elevation-low)' },
        content: { runtime: 'iframe', src: '' },
      });
    case 'text':
    default:
      return createNode({
        ...common,
        name: 'Text Block',
        layout: { x: position.x, y: position.y, width: 320, height: 74 },
        style: { fill: 'transparent', stroke: 'transparent', shadow: 'none', fontSize: 34, fontWeight: 600, lineHeight: 1.1, letterSpacing: -0.02 },
        content: { text: 'Design directly on canvas' },
      });
  }
};

export const createInitialCreatorDocument = (): CreatorDocument => {
  const rootId = 'frame-root';
  const heroId = 'section-hero';
  const titleId = 'text-title';
  const bodyId = 'text-body';
  const buttonId = 'button-primary';
  const cardId = 'card-insight';
  const imageId = 'image-preview';

  const nodes: Record<string, CreatorNode> = {
    [rootId]: createNode({
      id: rootId,
      type: 'frame',
      name: 'Landing Page',
      children: [heroId],
      layout: { x: 0, y: 0, width: 1440, height: 900 },
      style: {
        fill: 'linear-gradient(180deg, rgba(10,15,26,1) 0%, rgba(17,23,38,1) 100%)',
        stroke: 'hsl(var(--border-default) / 0.12)',
        radius: 8,
        shadow: 'var(--elevation-float)',
      },
    }),
    [heroId]: createNode({
      id: heroId,
      type: 'section',
      name: 'Hero Section',
      parentId: rootId,
      children: [titleId, bodyId, buttonId, cardId, imageId],
      layout: { x: 96, y: 92, width: 1248, height: 664 },
      style: {
        fill: 'linear-gradient(135deg, rgba(191,31,47,0.16), rgba(0,178,169,0.10))',
        stroke: 'hsl(var(--border-default) / 0.18)',
        radius: 8,
        paddingTop: 40,
        paddingRight: 40,
        paddingBottom: 40,
        paddingLeft: 40,
      },
    }),
    [titleId]: createNode({
      id: titleId,
      type: 'text',
      name: 'Headline',
      parentId: heroId,
      layout: { x: 60, y: 64, width: 560, height: 112 },
      style: { fill: 'transparent', stroke: 'transparent', shadow: 'none', fontSize: 56, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.04 },
      content: { text: 'A Creator canvas that feels like a real design engine.' },
    }),
    [bodyId]: createNode({
      id: bodyId,
      type: 'text',
      name: 'Body Copy',
      parentId: heroId,
      layout: { x: 60, y: 206, width: 500, height: 96 },
      style: { fill: 'transparent', stroke: 'transparent', shadow: 'none', color: 'hsl(var(--text-secondary))', fontSize: 18, fontWeight: 500, lineHeight: 1.5 },
      content: { text: 'Select, move, resize, duplicate, inspect, and structure the page in a connected visual workspace.' },
    }),
    [buttonId]: createNode({
      id: buttonId,
      type: 'button',
      name: 'Primary CTA',
      parentId: heroId,
      layout: { x: 60, y: 338, width: 188, height: 56 },
      style: { fill: 'hsl(var(--brand))', stroke: 'transparent', color: '#ffffff', radius: 8, fontSize: 15, fontWeight: 700, textAlign: 'center', shadow: '0 18px 45px rgba(191,31,47,0.35)' },
      content: { text: 'Open Visual Engine' },
    }),
    [cardId]: createNode({
      id: cardId,
      type: 'card',
      name: 'System Card',
      parentId: heroId,
      layout: { x: 60, y: 438, width: 342, height: 154 },
      style: { fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.08)', radius: 8 },
      content: { text: 'Layers, inspectors, and canvas controls stay in sync with every interaction.' },
    }),
    [imageId]: createNode({
      id: imageId,
      type: 'image',
      name: 'Preview Stage',
      parentId: heroId,
      layout: { x: 708, y: 78, width: 470, height: 472 },
      style: { fill: 'linear-gradient(135deg, rgba(0,178,169,0.28), rgba(255,255,255,0.08))', radius: 8, stroke: 'rgba(255,255,255,0.08)' },
      content: { alt: 'Preview stage' },
    }),
  };

  return { rootId, nodes };
};

