// src/components/ComponentPanel.jsx
import React from 'react';
import useComponentStore from '../store/componentStore';
import useGraphStore from '../store/graphStore';
import { nanoid } from 'nanoid';
export default function ComponentPanel() {
  const components = useComponentStore((s) => s.components);
  const instantiateComponent = useComponentStore((s) => s.instantiateComponent);
  const deleteComponent = useComponentStore((s) => s.deleteComponent);
const addComponentNode = useGraphStore((s) => s.addComponentNode);
  const handleAdd = (compId) => {
  const comp = components.find(c => c.id === compId);
  if (!comp) return;
  const id = nanoid();
  addComponentNode(id, compId, comp.name, {
    x: 100 + Math.random() * 300,
    y: 100 + Math.random() * 300,
  });
};

  return (
    <div style={{
      width: 250, padding: 10, background: '#f5f5f5',
      borderLeft: '1px solid #ccc', overflowY: 'auto',
    }}>
      <h4>🧩 Components</h4>
      {components.length === 0 && <p style={{ fontSize: 12 }}>None saved yet</p>}
      {components.map((comp) => (
        <div key={comp.id} style={{
          background: 'white', marginBottom: 8, padding: 8,
          borderRadius: 4, border: '1px solid #ddd',
        }}>
          <strong>{comp.name}</strong>
          <div style={{ marginTop: 4, display: 'flex', gap: 4 }}>
            <button
              onClick={() => handleAdd(comp.id)}
              style={{ flex: 1, padding: 4, fontSize: 12 }}
            >+ Add</button>
            <button
              onClick={() => deleteComponent(comp.id)}
              style={{ flex: 1, padding: 4, fontSize: 12, background: '#ff4444', color: 'white', border: 'none' }}
            >🗑</button>
          </div>
        </div>
      ))}
    </div>
  );
}