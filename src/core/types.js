// src/core/types.js

/**
 * Factory for an HTML element node
 */

export function createComponentNode(id, componentId, name, position = { x: 0, y: 0 }) {
  return {
    id,
    type: 'component',
    componentId,
    name,      // display name
    position,
  };
}
export function createElementNode(id, tag, textContent = '', position = { x: 0, y: 0 }) {
  return {
    id,
    type: 'element',
    tag,
    textContent,
    position,
  };
}

/**
 * Factory for an attribute node
 */
export function createAttributeNode(id, name, value, valueType = 'string', position = { x: 0, y: 0 }) {
  return {
    id,
    type: 'attribute',
    name,
    value,
    valueType,   // 'string' | 'boolean' | 'enum'
    position,
  };
}

/**
 * Factory for a style block node
 */
export function createStyleBlockNode(id, declarations = {}, alias = '', position = { x: 0, y: 0 }) {
  return {
    id,
    type: 'style',
    declarations,
    alias,
    position,
  };
}

/**
 * Factory for a connection edge
 */
export function createEdge(id, source, target, relation) {
  return {
    id,
    source,
    target,
    relation,   // 'hasAttribute' or 'usesStyle'
  };
}