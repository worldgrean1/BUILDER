import { beforeEach, describe, expect, it } from 'vitest';
import { creatorActions, creatorStore, getNodeAbsoluteLayout } from '@/features/creator/store';

describe('creator store', () => {
  beforeEach(() => {
    creatorActions.reset();
  });

  it('supports selection and duplication', () => {
    creatorActions.selectNode('text-title');
    expect(creatorStore.getState().selectionIds).toEqual(['text-title']);

    creatorActions.duplicateNode('text-title');

    expect(creatorStore.getState().selectionIds).toHaveLength(1);
    expect(Object.keys(creatorStore.getState().document.nodes).length).toBeGreaterThan(7);
  });

  it('moves nodes and supports undo-redo', () => {
    const original = getNodeAbsoluteLayout(creatorStore.getState().document, 'button-primary');

    creatorActions.updateNodeLayout('button-primary', { x: 140, y: 360 });
    let moved = getNodeAbsoluteLayout(creatorStore.getState().document, 'button-primary');
    expect(moved.x).not.toBe(original.x);

    creatorActions.undo();
    moved = getNodeAbsoluteLayout(creatorStore.getState().document, 'button-primary');
    expect(moved.x).toBe(original.x);

    creatorActions.redo();
    moved = getNodeAbsoluteLayout(creatorStore.getState().document, 'button-primary');
    expect(moved.x).not.toBe(original.x);
  });

  it('inserts and deletes nodes', () => {
    creatorActions.insertNode('card', { x: 200, y: 200 });
    const insertedId = creatorStore.getState().selectionIds[0];
    expect(insertedId).toContain('card');

    creatorActions.deleteNode(insertedId);
    expect(creatorStore.getState().document.nodes[insertedId]).toBeUndefined();
  });

  it('supports token, preset, component and interaction workflows', () => {
    const state = creatorStore.getState();
    const firstColorToken = state.colorTokens[0];
    const firstSpacingToken = state.spacingTokens[0];
    expect(firstColorToken).toBeDefined();
    expect(firstSpacingToken).toBeDefined();

    creatorActions.applyColorToken('text-title', 'color', firstColorToken.id);
    creatorActions.applySpacingToken('text-title', 'paddingTop', firstSpacingToken.id);
    expect(creatorStore.getState().document.nodes['text-title'].style.color).toBe(firstColorToken.value);
    expect(creatorStore.getState().document.nodes['text-title'].style.paddingTop).toBe(firstSpacingToken.value);

    creatorActions.saveStylePresetFromNode('text-title', 'Headline Preset');
    const presetId = creatorStore.getState().stylePresets[0].id;
    creatorActions.applyStylePreset('text-body', presetId);
    expect(creatorStore.getState().document.nodes['text-body'].style.fontSize).toBe(creatorStore.getState().document.nodes['text-title'].style.fontSize);

    creatorActions.markAsComponent('button-primary');
    const componentKey = creatorStore.getState().document.nodes['button-primary'].componentKey;
    expect(componentKey).toContain('component-');

    creatorActions.createInstanceFromNode('button-primary');
    const instanceNode = Object.values(creatorStore.getState().document.nodes).find((node) => node.id !== 'button-primary' && node.instanceOf === componentKey);
    expect(instanceNode).toBeDefined();

    creatorActions.updateNodeInteraction('button-primary', { action: 'toggleVisibility', targetId: 'text-body' });
    const beforeHidden = creatorStore.getState().document.nodes['text-body'].hidden;
    creatorActions.runNodeInteraction('button-primary');
    expect(creatorStore.getState().document.nodes['text-body'].hidden).toBe(!beforeHidden);
  });

  it('supports arming widgets and sized widget insertion', () => {
    creatorActions.armInsertType('threeD');
    expect(creatorStore.getState().pendingInsertType).toBe('threeD');
    expect(creatorStore.getState().activeTool).toBe('create');

    creatorActions.insertNode('embed', { x: 320, y: 240 }, undefined, { width: 420, height: 260 });
    const insertedId = creatorStore.getState().selectionIds[0];
    const inserted = creatorStore.getState().document.nodes[insertedId];

    expect(inserted.type).toBe('embed');
    expect(inserted.layout.width).toBe(420);
    expect(inserted.layout.height).toBe(260);
  });

  it('centers the frame by default and preserves manual pan intent', () => {
    const frame = creatorStore.getState().document.nodes[creatorStore.getState().document.rootId].layout;
    creatorActions.setStageSize(1000, 800);
    const centered = creatorStore.getState().viewport;
    expect(centered.panX).toBe(-(frame.x + frame.width / 2) * centered.zoom);
    expect(centered.panY).toBe(-(frame.y + frame.height / 2) * centered.zoom);

    creatorActions.setPan(42, -18);
    creatorActions.setStageSize(1200, 900);
    const afterManual = creatorStore.getState().viewport;
    expect(afterManual.panX).toBe(42);
    expect(afterManual.panY).toBe(-18);
  });
});
