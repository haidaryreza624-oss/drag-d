// types.js (just a reference, we don't export types, only factory functions & validators)

/**
 * Node shapes:
 * {
 *   id: string,
 *   type: 'element' | 'attribute' | 'style',
 *   position: { x: number, y: number },
 *   // ... type-specific fields
 * }
 */

// Factory functions ensure consistent shapes
export function createElementNode(id, tag, textContent = '', position = { x: 0, y: 0 }) {
  return {
    id,
    type: 'element',
    tag,
    textContent,
    position
  };
}

export function createAttributeNode(id, name, value, valueType = 'string', position = { x: 0, y: 0 }) {
  // For boolean attributes, value can be true/false
  return {
    id,
    type: 'attribute',
    name,
    value,
    valueType,   // 'string' | 'boolean' | 'enum'
    position
  };
}

export function createStyleBlockNode(id, declarations = {}, alias = '', position = { x: 0, y: 0 }) {
  return {
    id,
    type: 'style',
    declarations,
    alias,
    position
  };
}

// Edge shape: { id, source, target, relation }
export function createEdge(id, source, target, relation) {
  return { id, source, target, relation }; // relation: 'hasAttribute' | 'usesStyle'
}