// src/components/nodes/ComponentNode.jsx
import { Handle, Position } from 'reactflow';

export default function ComponentNode({ data }) {
  return (
    <div style={{
      background: '#f9e79f', border: '2px solid #f1c40f',
      borderRadius: 8, padding: 10, minWidth: 120, textAlign: 'center',
      fontStyle: 'italic'
    }}>
      <Handle type="target" position={Position.Top} id="target" />
      📦 {data.name}
      <Handle type="source" position={Position.Bottom} id="source" />
    </div>
  );
}