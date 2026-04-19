import { v4 as uuidv4 } from 'uuid';
import { creatorActions, creatorStore } from '@/features/creator/store';
import { type AINodePayload, type ParsedAIResponse } from './geminiService';
import type { CreatorNode } from '@/features/creator/types';
import { createNodeTemplate } from '@/features/creator/mockDocument';

/**
 * Hydrates simplified AI payloads into strict CreatorNode trees.
 */
function hydrateAINode(payload: AINodePayload, parentId: string, depth = 0): CreatorNode {
  const id = `${payload.type}-${uuidv4().slice(0, 8)}`;
  
  // Create a base template so all nested defaults (like responsive, interaction) are populated
  const base = createNodeTemplate(payload.type, id, { x: payload.layout.x, y: payload.layout.y }, parentId);

  // Offset layout securely based on depth to ensure visibility 
  const layout = {
    x: payload.layout.x,
    y: payload.layout.y,
    width: payload.layout.width,
    height: payload.layout.height,
  };

  // Merge style & content if provided by AI
  const style = payload.style ? { ...base.style, ...payload.style } : base.style;
  const content = payload.content ? { ...base.content, ...payload.content } : base.content;

  const node: CreatorNode = {
    ...base,
    name: payload.name || `AI ${payload.type}`,
    layout,
    style,
    content,
    children: [], // will populate below
  };

  // Recurse children
  if (payload.children && payload.children.length > 0) {
    const childNodes = payload.children.map((childPayload) => hydrateAINode(childPayload, id, depth + 1));
    node.children = childNodes.map((c) => c.id);
    
    // The hydration happens before insertion, so we need to inject the children into the store 
    // manually when the root is inserted, but for now we attach them to a temporary map or 
    // just return the flattened list.
    // To cleanly dispatch to Zustand, we should return a flat array of nodes.
  }

  return node;
}

/** Flatten a nested node tree into a list of nodes to insert */
function flattenHydratedTree(root: CreatorNode, payload: AINodePayload): CreatorNode[] {
  const flat: CreatorNode[] = [root];
  
  if (payload.children && payload.children.length > 0) {
    payload.children.forEach((childPayload, index) => {
      const childNode = hydrateAINode(childPayload, root.id, 1);
      root.children[index] = childNode.id; // update reference
      flat.push(...flattenHydratedTree(childNode, childPayload));
    });
  }
  return flat;
}

/**
 * Executes the parsed AI instruction against the Creator Zustand store.
 */
export function executeAICommand(parsed: ParsedAIResponse) {
  if (parsed.action === 'reply' || !parsed.nodes || parsed.nodes.length === 0) {
    return; // Handled by chat UI
  }

  const { document, selectionIds } = creatorStore.getState();

  if (parsed.action === 'insert') {
    // Generate nodes
    parsed.nodes.forEach((payload, index) => {
      // If there's a selection, insert inside the first selected frame/section/container
      let targetParentId = document.rootId;
      if (selectionIds.length > 0) {
        const activeNode = document.nodes[selectionIds[0]];
        if (activeNode && ['frame', 'section', 'container'].includes(activeNode.type)) {
          targetParentId = activeNode.id;
        } else if (activeNode && activeNode.parentId) {
          targetParentId = activeNode.parentId;
        }
      }

      // Cascade insert positions slightly if multiple roots
      const rootNode = hydrateAINode({
        ...payload,
        layout: { ...payload.layout, x: payload.layout.x + (index * 20), y: payload.layout.y + (index * 20) }
      }, targetParentId);
      
      const flatNodes = flattenHydratedTree(rootNode, payload);
      
      // We need a specific action to insert a batch of nodes, but currently we can insert them one by one
      // Since existing `insertNode` creates from template, we need a new action in creatorActions or 
      // we can use a direct manipulation (for safety, let's use the store).
      creatorStore.setState((state) => {
        const nextNodes = { ...state.document.nodes };
        const parent = nextNodes[targetParentId];
        
        if (parent) {
          parent.children = [...parent.children, rootNode.id];
        }

        flatNodes.forEach(n => {
          nextNodes[n.id] = n;
        });

        // Select the newly inserted root
        return {
          document: { ...state.document, nodes: nextNodes },
          selectionIds: [rootNode.id],
          dirty: true,
        };
      });
    });
  }

  if (parsed.action === 'update' && parsed.targetNodeId) {
    // LLM wants to update an existing node
    const payload = parsed.nodes[0];
    if (payload.style) {
      creatorActions.updateNodeStyle(parsed.targetNodeId, payload.style);
    }
    if (payload.layout) {
      creatorActions.updateNodeLayout(parsed.targetNodeId, payload.layout);
    }
  }
}
