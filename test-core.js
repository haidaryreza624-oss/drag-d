import useGraphStore from './src/store/graphStore.js';

// Get the store's API without React (using getState/setState)
const store = useGraphStore;

// Subscribe to changes (optional)
store.subscribe((state) => {
  console.log('State changed:', JSON.stringify(state.graph, null, 2));
});

// 1. Add an element node
store.getState().addElementNode('elem1', 'button', 'Click me');
// 2. Add an attribute node
store.getState().addAttributeNode('attr1', 'class', 'btn primary');
store.getState().addAttributeNode('attr2', 'disabled', true, 'boolean');
// 3. Add a style block
store.getState().addStyleBlockNode('style1', { color: 'red', margin: '10px' }, 'my-style');

// 4. Make connections
store.getState().connect('attr1', 'elem1', 'hasAttribute');
store.getState().connect('attr2', 'elem1', 'hasAttribute');
store.getState().connect('style1', 'elem1', 'usesStyle');

// 5. Verify state
const finalGraph = store.getState().graph;
console.log('Nodes:', Object.keys(finalGraph.nodes)); // ['elem1', 'attr1', 'attr2', 'style1']
console.log('Edges:', finalGraph.edges.length);       // 3

// 6. Generate code
const code = store.getState().getCode();
console.log('HTML:', code.html);
console.log('CSS:', code.css);

// 7. Test updateNode
store.getState().updateNode('attr1', { value: 'btn large' });
const updatedNode = store.getState().graph.nodes['attr1'];
console.log('Updated attr1 value:', updatedNode.value);

// 8. Test removeNode (removes attribute and all its edges)
store.getState().removeNode('attr1');
console.log('Edges after remove:', store.getState().graph.edges.length); // 2
console.log('Nodes remaining:', Object.keys(store.getState().graph.nodes));