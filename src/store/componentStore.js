// final version
import { create } from 'zustand';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'graphui-components';

function loadComponents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(components) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(components));
}

const useComponentStore = create((set, get) => ({
  components: loadComponents(),

  saveComponent: (name, nodes, edges) => {
    const newComponent = {
      id: nanoid(),
      name,
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    const updated = [...get().components, newComponent];
    set({ components: updated });
    persist(updated);
  },

  deleteComponent: (id) => {
    const updated = get().components.filter(c => c.id !== id);
    set({ components: updated });
    persist(updated);
  },

  // Instantiate: returns new nodes/edges with fresh IDs and position offset
  instantiateComponent: (componentId) => {
    const component = get().components.find(c => c.id === componentId);
    if (!component) return null;

    const idMap = {};
    const newNodes = {};
    const offset = { x: 50, y: 50 };

    // Deep clone nodes
    const nodes = JSON.parse(JSON.stringify(component.nodes));
    const edges = JSON.parse(JSON.stringify(component.edges));

    // Assign new IDs
    for (const node of Object.values(nodes)) {
      const newId = nanoid();
      idMap[node.id] = newId;
      newNodes[newId] = {
        ...node,
        id: newId,
        position: {
          x: node.position.x + offset.x,
          y: node.position.y + offset.y,
        },
      };
    }

    const newEdges = edges.map(edge => ({
      ...edge,
      id: nanoid(),
      source: idMap[edge.source],
      target: idMap[edge.target],
    }));

    return { nodes: newNodes, edges: newEdges };
  },
}));

export default useComponentStore;