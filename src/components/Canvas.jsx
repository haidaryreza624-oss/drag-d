// src/components/Canvas.jsx
import React, { useMemo, useCallback, useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import useGraphStore from '../store/graphStore';
import useUIStore from '../store/uiStore';
import ElementNode from './nodes/ElementNode';
import AttributeNode from './nodes/AttributeNode';
import StyleNode from './nodes/StyleNode';
import ComponentNode from './nodes/ComponentNode';
const nodeTypes = {
  element: ElementNode,
  attribute: AttributeNode,
  style: StyleNode,
  component: ComponentNode,
};

export default function Canvas() {
  const graph = useGraphStore((state) => state.graph);
  const connect = useGraphStore((s) => s.connect);
  const selectNode = useUIStore((s) => s.selectNode);
const deselectNode = useUIStore((s) => s.deselectNode);
  const removeNode = useGraphStore((s) => s.removeNode);
  const removeEdge = useGraphStore((s) => s.removeEdge);
const updateNode = useGraphStore((s) => s.updateNode);


useEffect(() => {
  const handleKeyDown = (e) => {
    // Don't fire shortcuts when user is typing in an input/textarea
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.isContentEditable
    ) {
      return;
    }

    // Delete / Backspace – remove selected node
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const id = useUIStore.getState().selectedNodeId;
      if (id) {
        removeNode(id);
        useUIStore.getState().deselectNode();
      }
    }

    // Ctrl+C – copy selected subgraph
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      useUIStore.getState().copySelection();
    }

    // Ctrl+V – paste clipboard
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault();
      useUIStore.getState().pasteClipboard();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [removeNode]);
  // Convert store nodes → React Flow format
  const nodes = useMemo(() => {
    return Object.values(graph.nodes).map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: { ...node },
    }));
  }, [graph.nodes]);
const onNodeDragStop = useCallback((event, node) => {
  updateNode(node.id, {
    position: { x: node.position.x, y: node.position.y },
  });
}, [updateNode]);
  // Convert store edges → React Flow format (with handle IDs)
const edges = useMemo(() => {
  return graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: 'source',
    targetHandle: 'target',
    style: {
      stroke: edge.relation === 'child' ? '#2196F3' : '#555',
      strokeWidth: 2,
      strokeDasharray: edge.relation === 'child' ? '5,5' : 'none',
    },
  }));
}, [graph.edges]);

  // Called when the user drags from a source handle to a target handle
const onConnect = useCallback((params) => {
  const sourceNode = graph.nodes[params.source];
  if (!sourceNode) return;
  if (sourceNode.type === 'element') {
    connect(params.source, params.target, 'child');
  } else if (sourceNode.type === 'attribute') {
    connect(params.source, params.target, 'hasAttribute');
  } else if (sourceNode.type === 'style') {
    connect(params.source, params.target, 'usesStyle');
  }
}, [graph.nodes, connect]);

  // Delete selected nodes (Backspace/Delete)
  const onNodesDelete = useCallback((deletedNodes) => {
  for (const node of deletedNodes) {
    removeNode(node.id);
  }
}, [removeNode]);

  // Delete selected edges (Backspace/Delete)
  const onEdgesDelete = useCallback((deletedEdges) => {
  for (const edge of deletedEdges) {
    removeEdge(edge.id);
  }
}, [removeEdge]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
     <ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  onConnect={onConnect}
  onNodeClick={(event, node) => {
  console.log('Node clicked:', node.id);
  selectNode(node.id);
}}
  onPaneClick={() => deselectNode()}
  onNodesDelete={onNodesDelete}
  onEdgesDelete={onEdgesDelete}
  onNodeDragStop={onNodeDragStop}   // ← this line
  deleteKeyCode={['Backspace', 'Delete']}
  fitView
>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}