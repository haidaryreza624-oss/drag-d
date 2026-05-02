import { createElementNode, createAttributeNode, createStyleBlockNode, createEdge } from './src/core/types.js';
import { generateCode } from './src/core/codegen.js';

// Build graph
const graph = {
  nodes: {
    btn: createElementNode('btn', 'button', 'Submit'),
    div: createElementNode('div', 'div', 'Container'),

    classAttr: createAttributeNode('classAttr', 'class', 'btn primary'),
    typeAttr: createAttributeNode('typeAttr', 'type', 'submit', 'enum'),
    disabledAttr: createAttributeNode('disabledAttr', 'disabled', true, 'boolean'),

    styleRed: createStyleBlockNode('styleRed', { color: 'red', margin: '10px' }, ''),
    styleBg: createStyleBlockNode('styleBg', { background: 'blue' }, 'bg'),
  },
  edges: [
    createEdge('e1', 'classAttr', 'btn', 'hasAttribute'),
    createEdge('e2', 'typeAttr', 'btn', 'hasAttribute'),
    createEdge('e3', 'disabledAttr', 'btn', 'hasAttribute'),
    createEdge('e4', 'styleRed', 'btn', 'usesStyle'),
    createEdge('e5', 'styleBg', 'div', 'usesStyle'),
  ],
};

const result = generateCode(graph);

console.log('Generated CSS:\n', result.css);
console.log('\nGenerated HTML:\n', result.html);

// Expected CSS:
// .gs-styleRed { color: red; margin: 10px; }
// .bg { background: blue; }
//
// Expected HTML:
// <button class="btn primary gs-styleRed" type="submit" disabled>Submit</button>
// <div class="bg">Container</div>