// graphOperations.js
import { isAttributeValidForElement } from './validators.js';

/**
 * Checks if a new edge can be added to the graph.
 * Returns { valid: true } or { valid: false, reason: '...' }
 */
export function canAddEdge(graph, sourceNodeId, targetNodeId, relation) {
  const source = graph.nodes[sourceNodeId];
  const target = graph.nodes[targetNodeId];
  if (!source || !target) return { valid: false, reason: 'Missing node' };

  // Only attribute/style can be sources, only elements can be targets
  if (relation === 'hasAttribute') {
    if (source.type !== 'attribute' || target.type !== 'element') {
      return { valid: false, reason: 'Attributes can only connect to elements' };
    }
    if (!isAttributeValidForElement(source.name, target.tag)) {
      return { valid: false, reason: `${source.name} is not valid on <${target.tag}>` };
    }
  }

  if (relation === 'usesStyle') {
    if (source.type !== 'style' || target.type !== 'element') {
      return { valid: false, reason: 'Style blocks can only connect to elements' };
    }
  }

  // Prevent duplicate edges (same source, target, relation)
  const exists = graph.edges.some(
    e => e.source === sourceNodeId && e.target === targetNodeId && e.relation === relation
  );
  if (exists) return { valid: false, reason: 'Connection already exists' };

  return { valid: true };
}

/**
 * Adds an edge if valid, returns a new graph (immutable).
 */
export function addEdge(graph, newEdge) {
  const result = canAddEdge(graph, newEdge.source, newEdge.target, newEdge.relation);
  if (!result.valid) {
    throw new Error(result.reason); // or return null
  }
  return {
    ...graph,
    edges: [...graph.edges, newEdge]
  };
}