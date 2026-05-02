import { createElementNode, createAttributeNode, createStyleBlockNode, createEdge } from './src/core/types.js';
import { canAddEdge } from './src/core/graphOperations.js';

// Build a small graph
const graph = {
  nodes: {
    elem1: createElementNode('elem1', 'button', 'Click'),
    elem2: createElementNode('elem2', 'div', 'Hello'),
    attrClass: createAttributeNode('attrClass', 'class', 'btn'),
    attrHref: createAttributeNode('attrHref', 'href', '/about'),
    styleRed: createStyleBlockNode('styleRed', { color: 'red' }),
  },
  edges: [],
};

// Test 1: Valid attribute connection (class → button)
let result = canAddEdge(graph, 'attrClass', 'elem1', 'hasAttribute');
console.log('class on button:', result); // { valid: true }

// Test 2: Invalid attribute (href → button) – href not valid on button
result = canAddEdge(graph, 'attrHref', 'elem1', 'hasAttribute');
console.log('href on button:', result); // { valid: false, reason: 'href is not valid on <button>.' }

// Test 3: Valid style connection
result = canAddEdge(graph, 'styleRed', 'elem1', 'usesStyle');
console.log('style on button:', result); // { valid: true }

// Test 4: Invalid source (element → element)
result = canAddEdge(graph, 'elem1', 'elem2', 'hasAttribute');
console.log('element to element (hasAttribute):', result); // false, reason about source type

// Test 5: Invalid target (attribute → attribute)
result = canAddEdge(graph, 'attrClass', 'attrHref', 'hasAttribute');
console.log('attr to attr:', result); // false, reason about target not element

// Test 6: Duplicate edge
graph.edges.push(createEdge('e1', 'attrClass', 'elem1', 'hasAttribute'));
result = canAddEdge(graph, 'attrClass', 'elem1', 'hasAttribute');
console.log('duplicate edge:', result); // false, reason about duplication

console.log('✅ Edge validation tests completed.');