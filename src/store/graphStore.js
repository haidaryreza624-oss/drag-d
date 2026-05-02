// src/store/graphStore.js

import { create } from 'zustand';
import {
  createElementNode,
  createAttributeNode,
  createStyleBlockNode,
  createEdge,
} from '../core/types.js';
import { canAddEdge } from '../core/graphOperations.js';
import { generateCode } from '../core/codegen.js';

const useGraphStore = create((set, get) => ({
  graph: {
    nodes: {},
    edges: [],
  },

  addElementNode: (id, tag, textContent = '', position = { x: 0, y: 0 }) => {
    const node = createElementNode(id, tag, textContent, position);
    set((state) => ({
      graph: {
        ...state.graph,
        nodes: { ...state.graph.nodes, [id]: node },
      },
    }));
  },

  addAttributeNode: (id, name, value, valueType = 'string', position = { x: 0, y: 0 }) => {
    const node = createAttributeNode(id, name, value, valueType, position);
    set((state) => ({
      graph: {
        ...state.graph,
        nodes: { ...state.graph.nodes, [id]: node },
      },
    }));
  },

  addStyleBlockNode: (id, declarations = {}, alias = '', position = { x: 0, y: 0 }) => {
    const node = createStyleBlockNode(id, declarations, alias, position);
    set((state) => ({
      graph: {
        ...state.graph,
        nodes: { ...state.graph.nodes, [id]: node },
      },
    }));
  },

  connect: (source, target, relation) => {
    const state = get();
    const result = canAddEdge(state.graph, source, target, relation);
    if (!result.valid) {
      console.warn('Invalid connection:', result.reason);
      return false;
    }
    const edge = createEdge(
      `${source}->${target}-${relation}`,
      source,
      target,
      relation,
    );
    set((state) => ({
      graph: {
        ...state.graph,
        edges: [...state.graph.edges, edge],
      },
    }));
    return true;
  },

  removeNode: (id) => {
    set((state) => {
      const { [id]: removed, ...remainingNodes } = state.graph.nodes;
      const remainingEdges = state.graph.edges.filter(
        (e) => e.source !== id && e.target !== id,
      );
      return {
        graph: {
          nodes: remainingNodes,
          edges: remainingEdges,
        },
      };
    });
  },

  updateNode: (id, updates) => {
    set((state) => {
      const node = state.graph.nodes[id];
      if (!node) return state;
      return {
        graph: {
          ...state.graph,
          nodes: {
            ...state.graph.nodes,
            [id]: { ...node, ...updates },
          },
        },
      };
    });
  },

  getCode: () => {
    return generateCode(get().graph);
  },
}));

export default useGraphStore;