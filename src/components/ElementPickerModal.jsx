// src/components/ElementPickerModal.jsx
import React, { useState } from 'react';
import useUIStore from '../store/uiStore';
import useGraphStore from '../store/graphStore';
import { HTML_ELEMENTS } from '../core/htmlElements';
import { nanoid } from 'nanoid';

export default function ElementPickerModal() {
  const show = useUIStore((s) => s.showElementPicker);
  const close = useUIStore((s) => s.closeElementPicker);
  const addElementNode = useGraphStore((s) => s.addElementNode);

  const [filter, setFilter] = useState('');

  if (!show) return null;

  const filtered = HTML_ELEMENTS.filter(el => el.includes(filter.toLowerCase()));

  const handleSelect = (tag) => {
    const id = nanoid();
    addElementNode(id, tag, '', {
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 300,
    });
    close();
  };

  return (
    <div style={{
      position: 'fixed', top: '30%', left: '30%',
      background: 'white', border: '2px solid #333', padding: 20,
      zIndex: 300, minWidth: 350, maxHeight: '70vh', overflowY: 'auto',
    }}>
      <h3>Pick an HTML Element</h3>
      <input
        placeholder="Search element..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ width: '100%', marginBottom: 10, padding: 4 }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {filtered.map(tag => (
          <button
            key={tag}
            onClick={() => handleSelect(tag)}
            style={{
              padding: 8,
              background: '#e0e0e0',
              border: '1px solid #aaa',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            &lt;{tag}&gt;
          </button>
        ))}
      </div>
      <button onClick={close} style={{ marginTop: 12 }}>Cancel</button>
    </div>
  );
}