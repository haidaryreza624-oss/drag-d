// store.js
import { create } from 'zustand';
import { createElementNode, createAttributeNode, createStyleBlockNode, createEdge } from './types.js';
import { addEdge } from '../graphOperations.js';
import { generateCode } from '../codegen.js';

const useGraphStore = create((set, get) => ({
  graph: {
    nodes: {},
    edges: []
  },

  // Add a new element node
  addElementNode: (id, tag, text = '', position) => {
    const node = createElementNode(id, tag, text, position);
    set(state => ({
      graph: {
        ...state.graph,
        nodes: { ...state.graph.nodes, [id]: node }
      }
    }));
  },

  // Add an attribute node (after modal)
  addAttributeNode: (id, name, value, valueType, position) => {
    const node = createAttributeNode(id, name, value, valueType, position);
    set(state => ({
      graph: {
        ...state.graph,
        nodes: { ...state.graph.nodes, [id]: node }
      }
    }));
  },

  // Add style block node
  addStyleBlockNode: (id, declarations, alias, position) => {
    const node = createStyleBlockNode(id, declarations, alias, position);
    set(state => ({
      graph: {
        ...state.graph,
        nodes: { ...state.graph.nodes, [id]: node }
      }
    }));
  },

  // Try to connect nodes (edge)
  connect: (source, target, relation) => {
    const state = get();
    const edge = createEdge(`${source}->${target}`, source, target, relation);
    try {
      const newGraph = addEdge(state.graph, edge);
      set({ graph: newGraph });
    } catch (err) {
      // Could set an error state to display toast
      console.warn(err.message);
    }
  },

  // Update node properties (tag, text, attribute value, styles)
  updateNode: (id, updates) => {
    set(state => {
      const node = state.graph.nodes[id];
      if (!node) return state;
      return {
        graph: {
          ...state.graph,
          nodes: {
            ...state.graph.nodes,
            [id]: { ...node, ...updates }
          }
        }
      };
    });
  },

  // Delete node (and all edges connected to it)
  removeNode: (id) => {
    set(state => {
      const { [id]: removed, ...remainingNodes } = state.graph.nodes;
      const remainingEdges = state.graph.edges.filter(
        e => e.source !== id && e.target !== id
      );
      return {
        graph: { nodes: remainingNodes, edges: remainingEdges }
      };
    });
  },

  // Export code
  getCode: () => {
    return generateCode(get().graph);
  }
}));

export default useGraphStore;