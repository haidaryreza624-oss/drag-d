import { create } from 'zustand';
import { nanoid } from 'nanoid';
import useGraphStore from './graphStore';

const useUIStore = create((set, get) => ({
  // --- Modal ---
  showAttributeModal: false,
  attributeTargetElementId: null,
   showElementPicker: false,
  openElementPicker: () => set({ showElementPicker: true }),
  closeElementPicker: () => set({ showElementPicker: false }),
  openAttributeModal: (elementId = null) =>
    set({ showAttributeModal: true, attributeTargetElementId: elementId }),
  closeAttributeModal: () =>
    set({ showAttributeModal: false, attributeTargetElementId: null }),

  // --- Selection ---
  selectedNodeId: null,
  selectNode: (id) => set({ selectedNodeId: id }),
  deselectNode: () => set({ selectedNodeId: null }),

  // --- Clipboard ---
  clipboard: null,

  copySelection: () => {
    const { selectedNodeId } = get();
    const graph = useGraphStore.getState().graph;
    if (!selectedNodeId || !graph.nodes[selectedNodeId]) return;

    const node = graph.nodes[selectedNodeId];
    const nodesToCopy = { [node.id]: JSON.parse(JSON.stringify(node)) };
    const edgesToCopy = [];

    if (node.type === 'element') {
      graph.edges.forEach((edge) => {
        if (edge.target === node.id) {
          const sourceNode = graph.nodes[edge.source];
          if (sourceNode && (sourceNode.type === 'attribute' || sourceNode.type === 'style')) {
            if (!nodesToCopy[sourceNode.id]) {
              nodesToCopy[sourceNode.id] = JSON.parse(JSON.stringify(sourceNode));
            }
            edgesToCopy.push(JSON.parse(JSON.stringify(edge)));
          }
        }
      });
    }

    set({ clipboard: { nodes: nodesToCopy, edges: edgesToCopy } });
    console.log('Copied subgraph:', nodesToCopy, edgesToCopy);
  },

  pasteClipboard: () => {
    const { clipboard } = get();
    const graphStore = useGraphStore.getState();
    if (!clipboard || Object.keys(clipboard.nodes).length === 0) return;

    const idMap = {};
    const newNodes = {};
    const offset = { x: 50, y: 50 };

    Object.values(clipboard.nodes).forEach((node) => {
      const newId = nanoid();
      idMap[node.id] = newId;
      newNodes[newId] = {
        ...JSON.parse(JSON.stringify(node)),
        id: newId,
        position: {
          x: node.position.x + offset.x,
          y: node.position.y + offset.y,
        },
      };
    });

    const newEdges = clipboard.edges.map((edge) => ({
      ...JSON.parse(JSON.stringify(edge)),
      id: nanoid(),
      source: idMap[edge.source],
      target: idMap[edge.target],
    }));

    graphStore._pushHistory();
    const currentGraph = useGraphStore.getState().graph;
    const updatedNodes = { ...currentGraph.nodes, ...newNodes };
    const updatedEdges = [...currentGraph.edges, ...newEdges];

    useGraphStore.setState({
      graph: {
        nodes: updatedNodes,
        edges: updatedEdges,
      },
    });

    const firstNewId = Object.keys(newNodes)[0];
    if (firstNewId) set({ selectedNodeId: firstNewId });
  },
}));

export default useUIStore;