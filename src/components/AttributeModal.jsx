// src/components/AttributeModal.jsx
import React, { useState, useEffect } from 'react';
import useUIStore from '../store/uiStore';
import useGraphStore from '../store/graphStore';
import { getValidAttributesForElement, getAttributeDef } from '../core/validators';
import { ATTRIBUTE_DB } from '../core/attributeDB';
import { nanoid } from 'nanoid';

export default function AttributeModal() {
  const show = useUIStore((s) => s.showAttributeModal);
  const targetElementId = useUIStore((s) => s.attributeTargetElementId);
  const closeModal = useUIStore((s) => s.closeAttributeModal);

  const graph = useGraphStore((s) => s.graph);
  const addAttributeNode = useGraphStore((s) => s.addAttributeNode);
  const connect = useGraphStore((s) => s.connect);

  const [step, setStep] = useState('selectName');
  const [attrName, setAttrName] = useState('');
  const [filterText, setFilterText] = useState('');
  const [availableNames, setAvailableNames] = useState([]);

  const [valueType, setValueType] = useState('string');
  const [enumOptions, setEnumOptions] = useState([]);
  const [value, setValue] = useState('');

  const targetElement = targetElementId ? graph.nodes[targetElementId] : null;
  const tag = targetElement ? targetElement.tag : null;

  useEffect(() => {
    if (tag) {
      const attrs = getValidAttributesForElement(tag, filterText);
      setAvailableNames(attrs);
    } else {
      let names = ATTRIBUTE_DB.map(d => d.name);
      if (filterText) names = names.filter(n => n.includes(filterText));
      setAvailableNames(names);
    }
  }, [tag, filterText]);

  const selectName = (name) => {
    setAttrName(name);
    const def = getAttributeDef(name);
    if (def) {
      setValueType(def.type);
      setEnumOptions(def.values || []);
      if (def.type === 'boolean') {
        setValue(true);
      } else {
        setValue('');
      }
    } else {
      setValueType('string');
      setValue('');
    }
    setStep('setValue');
  };

  const handleConfirm = () => {
    const id = nanoid();
    const pos = { x: Math.random() * 200 + 200, y: Math.random() * 200 + 100 };
    addAttributeNode(id, attrName, value, valueType, pos);
    if (targetElementId) {
      connect(id, targetElementId, 'hasAttribute');
    }
    closeModal();
  };

  if (!show) return null;     // ← restored guard

  return (
    <div style={{
      position: 'fixed', top: '30%', left: '35%',
      background: 'white', border: '2px solid #333', padding: 20,
      zIndex: 200, minWidth: 300,
    }}>
      {step === 'selectName' ? (
        <>
          <h4>Choose Attribute {tag ? `for <${tag}>` : ''}</h4>
          <input
            placeholder="Filter..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
          />
          <ul style={{ maxHeight: 200, overflow: 'auto', listStyle: 'none', padding: 0 }}>
            {availableNames.map((name) => (
              <li
                key={name}
                onClick={() => selectName(name)}
                style={{ cursor: 'pointer', padding: '4px 8px', borderBottom: '1px solid #eee' }}
              >
                {name}
              </li>
            ))}
          </ul>
          <button onClick={closeModal}>Cancel</button>
        </>
      ) : (
        <>
          <h4>Set Value for "{attrName}"</h4>
          {valueType === 'boolean' ? (
            <label>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setValue(e.target.checked)}
              />{' '}
              Enabled
            </label>
          ) : valueType === 'enum' ? (
            <select value={value} onChange={(e) => setValue(e.target.value)}>
              <option value="">-- select --</option>
              {enumOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Value"
            />
          )}
          <div style={{ marginTop: 12 }}>
            <button onClick={() => setStep('selectName')}>Back</button>
            <button onClick={handleConfirm}>Create & Connect</button>
          </div>
        </>
      )}
    </div>
  );
}