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
  history: [],
  historyIndex: -1,

  // ---- History helpers ----
  _pushHistory: () => {
    const { graph, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      nodes: JSON.parse(JSON.stringify(graph.nodes)),
      edges: JSON.parse(JSON.stringify(graph.edges)),
    });
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

 undo: () => {
  const { history, historyIndex } = get();
  if (historyIndex < 0) return; // nothing to undo

  // The snapshot at historyIndex is the state BEFORE the last action
  const prev = history[historyIndex];
  const newIndex = historyIndex - 1;

  set({
    graph: {
      nodes: JSON.parse(JSON.stringify(prev.nodes)),
      edges: JSON.parse(JSON.stringify(prev.edges)),
    },
    historyIndex: newIndex,
  });
},



  // ---- Node actions ----
  addElementNode: (id, tag, textContent = '', position = { x: 0, y: 0 }) => {
    get()._pushHistory();
    const node = createElementNode(id, tag, textContent, position);
    set((state) => ({
      graph: {
        ...state.graph,
        nodes: { ...state.graph.nodes, [id]: node },
      },
    }));
  },

  addAttributeNode: (id, name, value, valueType = 'string', position = { x: 0, y: 0 }) => {
    get()._pushHistory();
    const node = createAttributeNode(id, name, value, valueType, position);
    set((state) => ({
      graph: {
        ...state.graph,
        nodes: { ...state.graph.nodes, [id]: node },
      },
    }));
  },

  addStyleBlockNode: (id, declarations = {}, alias = '', position = { x: 0, y: 0 }) => {
    get()._pushHistory();
    const node = createStyleBlockNode(id, declarations, alias, position);
    set((state) => ({
      graph: {
        ...state.graph,
        nodes: { ...state.graph.nodes, [id]: node },
      },
    }));
  },

  // ---- Connection ----
  connect: (source, target, relation) => {
    const state = get();
    const result = canAddEdge(state.graph, source, target, relation);
    if (!result.valid) {
      console.warn('Invalid connection:', result.reason);
      return false;
    }
    get()._pushHistory();
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

  // ---- Deletion ----
  removeNode: (id) => {
    get()._pushHistory();
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

  removeEdge: (edgeId) => {
    get()._pushHistory();
    set((state) => ({
      graph: {
        ...state.graph,
        edges: state.graph.edges.filter((e) => e.id !== edgeId),
      },
    }));
  },

  // ---- Update ----
  updateNode: (id, updates) => {
    get()._pushHistory();
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

  // ---- Code generation ----
  getCode: () => {
    return generateCode(get().graph);
  },
}));

export default useGraphStore;