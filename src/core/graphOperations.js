// src/core/graphOperations.js
import { isAttributeValidForElement } from './validators.js';

/**
 * Checks if a new edge can be added to the graph.
 * @param {object} graph - { nodes: Record<string, object>, edges: Array }
 * @param {string} sourceId
 * @param {string} targetId
 * @param {'hasAttribute'|'usesStyle'|'child'} relation
 * @returns {{ valid: boolean, reason?: string }}
 */
export function canAddEdge(graph, sourceId, targetId, relation) {
  const sourceNode = graph.nodes[sourceId];
  const targetNode = graph.nodes[targetId];

  if (!sourceNode || !targetNode) {
    return { valid: false, reason: 'Source or target node does not exist.' };
  }

  // --- Child relation ---
  if (relation === 'child') {
    if (sourceNode.type !== 'element' || targetNode.type !== 'element') {
      return { valid: false, reason: 'Only elements can be parent/child.' };
    }

    // Target already has a parent?
    const hasParent = graph.edges.some(
      e => e.relation === 'child' && e.target === targetId
    );
    if (hasParent) {
      return { valid: false, reason: 'Element already has a parent.' };
    }

    // Cycle detection: is target an ancestor of source?
    if (isAncestor(graph, targetId, sourceId)) {
      return { valid: false, reason: 'Cannot create a cycle.' };
    }
  }

  // --- Attribute relation ---
  if (relation === 'hasAttribute') {
    if (sourceNode.type !== 'attribute') {
      return { valid: false, reason: 'Only attribute nodes can be used as source for hasAttribute.' };
    }
    if (targetNode.type !== 'element') {
      return { valid: false, reason: 'hasAttribute target must be an element node.' };
    }
    if (!isAttributeValidForElement(sourceNode.name, targetNode.tag)) {
      return { valid: false, reason: `${sourceNode.name} is not valid on <${targetNode.tag}>.` };
    }
  }

  // --- Style relation ---
  if (relation === 'usesStyle') {
    if (sourceNode.type !== 'style') {
      return { valid: false, reason: 'Only style block nodes can be used as source for usesStyle.' };
    }
    if (targetNode.type !== 'element') {
      return { valid: false, reason: 'usesStyle target must be an element node.' };
    }
  }

  // Duplicate edge
  const duplicate = graph.edges.some(
    e => e.source === sourceId && e.target === targetId && e.relation === relation
  );
  if (duplicate) {
    return { valid: false, reason: 'This connection already exists.' };
  }

  return { valid: true };
}

/**
 * Returns true if `ancestorId` is an ancestor of `nodeId` via child edges.
 * Uses a breadth‑first walk up the parent chain.
 */
function isAncestor(graph, ancestorId, nodeId) {
  const visited = new Set();
  const stack = [nodeId];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === ancestorId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    // Find all parents of current
    graph.edges
      .filter(e => e.relation === 'child' && e.target === current)
      .forEach(e => stack.push(e.source));
  }
  return false;
}