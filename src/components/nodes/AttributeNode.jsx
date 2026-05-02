// src/components/nodes/AttributeNode.jsx
import { Handle, Position } from 'reactflow';

export default function AttributeNode({ data }) {
  const val = data.valueType === 'boolean' ? (data.value ? 'true' : 'false') : data.value;
  return (
    <div style={{
      position: 'relative',
      background: '#e6e6ff',
      border: '1px solid #8884d8',
      borderRadius: 6,
      padding: 6,
      minWidth: 80,
      textAlign: 'center',
    }}>
      <div>{data.name} = "{val}"</div>

      {/* Source handle – edges start here */}
      <Handle type="source" position={Position.Bottom} id="source" />
    </div>
  );
}