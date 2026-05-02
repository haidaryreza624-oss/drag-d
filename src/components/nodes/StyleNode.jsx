// src/components/nodes/StyleNode.jsx
import { Handle, Position } from 'reactflow';

export default function StyleNode({ data }) {
  return (
    <div style={{
      position: 'relative',
      background: '#e6ffe6',
      border: '2px solid #82ca9d',
      borderRadius: 10,
      padding: 8,
      minWidth: 100,
      textAlign: 'center',
    }}>
      🎨 Style
      {Object.entries(data.declarations).map(([k, v]) => (
        <div key={k} style={{ fontSize: 11 }}>{k}: {v}</div>
      ))}

      {/* Source handle */}
      <Handle type="source" position={Position.Bottom} id="source" />
    </div>
  );
}