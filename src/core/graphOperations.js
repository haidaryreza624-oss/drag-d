// src/core/graphOperations.js

import { isAttributeValidForElement } from './validators.js';

/**
 * Checks if a new edge can be added to the graph.
 * @param {object} graph - The full graph with `nodes` (object) and `edges` (array)
 * @param {string} sourceId - The ID of the node the edge comes FROM
 * @param {string} targetId - The ID of the node the edge goes TO
 * @param {'hasAttribute'|'usesStyle'} relation - The type of connection
 * @returns {{ valid: boolean, reason?: string }}
 */
export function canAddEdge(graph, sourceId, targetId, relation) {
  const sourceNode = graph.nodes[sourceId];
  const targetNode = graph.nodes[targetId];

  if (!sourceNode || !targetNode) {
    return { valid: false, reason: 'Source or target node does not exist.' };
  }

  // Rule 1: Only attributes and style blocks can be sources
  if (relation === 'hasAttribute') {
    if (sourceNode.type !== 'attribute') {
      return { valid: false, reason: 'Only attribute nodes can be used as source for hasAttribute.' };
    }
    if (targetNode.type !== 'element') {
      return { valid: false, reason: 'hasAttribute target must be an element node.' };
    }
    // Rule 2: The attribute must be valid for that element's tag
    if (!isAttributeValidForElement(sourceNode.name, targetNode.tag)) {
      return { valid: false, reason: `${sourceNode.name} is not valid on <${targetNode.tag}>.` };
    }
  }

  if (relation === 'usesStyle') {
    if (sourceNode.type !== 'style') {
      return { valid: false, reason: 'Only style block nodes can be used as source for usesStyle.' };
    }
    if (targetNode.type !== 'element') {
      return { valid: false, reason: 'usesStyle target must be an element node.' };
    }
  }

  // Rule 3: No duplicate edges (same source, target, relation)
  const duplicate = graph.edges.some(
    e => e.source === sourceId && e.target === targetId && e.relation === relation
  );
  if (duplicate) {
    return { valid: false, reason: 'This connection already exists.' };
  }

  return { valid: true };
}