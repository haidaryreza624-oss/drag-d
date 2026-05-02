import { Handle, Position } from 'reactflow';
import useUIStore from '../../store/uiStore';

export default function ElementNode({ data }) {
  const openModal = useUIStore((s) => s.openAttributeModal);

  return (
    <div style={{
      position: 'relative',
      background: '#f0f0f0',
      border: '2px solid #333',
      borderRadius: 8,
      padding: 10,
      minWidth: 100,
      textAlign: 'center',
    }}>
      <Handle type="target" position={Position.Top} id="target" />

      <div style={{ fontWeight: 'bold' }}>&lt;{data.tag}&gt;</div>
      {data.textContent && <div style={{ fontSize: 12 }}>{data.textContent}</div>}

      {/* + button to add attribute */}
      <button
          onClick={(e) => {
    e.stopPropagation();
    alert('Button clicked!');
    // call the function
    useUIStore.getState().openAttributeModal(data.id);
    // then log the new state
    console.log('After openModal, show =', useUIStore.getState().showAttributeModal);
  }}
        style={{
          position: 'absolute',
          top: -10,
          right: -10,
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: '1px solid #888',
          background: '#fff',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: '20px',
          textAlign: 'center',
          padding: 0,
        }}
        title="Add Attribute"
      >+</button>
  
      <Handle type="source" position={Position.Bottom} id="source" />
    </div>
  );
}