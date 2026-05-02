// src/components/Inspector.jsx
import React from 'react';
import useUIStore from '../store/uiStore';
import useGraphStore from '../store/graphStore';
import useComponentStore from '../store/componentStore';  // ← new
import { RECOMMENDED_ATTRIBUTES, VOID_TAGS } from '../core/recommendedAttributes';
import { CSS_PROPERTIES } from '../core/cssProperties';      // ← was missing
import { nanoid } from 'nanoid';

export default function Inspector() {
  const selectedId = useUIStore((s) => s.selectedNodeId);
  const deselectNode = useUIStore((s) => s.deselectNode);
  const graph = useGraphStore((s) => s.graph);
  const updateNode = useGraphStore((s) => s.updateNode);
  const removeNode = useGraphStore((s) => s.removeNode);
  const addAttributeNode = useGraphStore((s) => s.addAttributeNode);
  const connect = useGraphStore((s) => s.connect);
  const openAttributeModal = useUIStore((s) => s.openAttributeModal);
  const saveComponent = useComponentStore((s) => s.saveComponent);   // ← new

  if (!selectedId) {
    return (
      <div style={{ width: 250, padding: 10, background: '#fafafa', borderLeft: '1px solid #ccc' }}>
        <p>Click a node to inspect</p>
      </div>
    );
  }

  const node = graph.nodes[selectedId];
  if (!node) return null;

  const handleChange = (field, value) => {
    updateNode(selectedId, { [field]: value });
  };
const collectSubtree = (rootId) => {
  const subNodes = {};
  const subEdges = [];
  const visited = new Set();

  const stack = [rootId];
  while (stack.length > 0) {
    const currentId = stack.pop();
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    const currentNode = graph.nodes[currentId];
    if (!currentNode) continue;
    subNodes[currentId] = JSON.parse(JSON.stringify(currentNode));

    // Find all outgoing 'child' edges (children of current element)
    if (currentNode.type === 'element') {
      for (const edge of graph.edges) {
        if (edge.relation === 'child' && edge.source === currentId) {
          if (!visited.has(edge.target)) {
            stack.push(edge.target);
          }
          subEdges.push(JSON.parse(JSON.stringify(edge)));
        }
        // Collect incoming attribute/style edges for this element
        if (edge.relation === 'hasAttribute' || edge.relation === 'usesStyle') {
          if (edge.target === currentId) {
            const sourceNode = graph.nodes[edge.source];
            if (sourceNode && !subNodes[edge.source]) {
              subNodes[edge.source] = JSON.parse(JSON.stringify(sourceNode));
            }
            subEdges.push(JSON.parse(JSON.stringify(edge)));
          }
        }
      }
    }
  }
  return { nodes: subNodes, edges: subEdges };
};
  // ---- Recommended attribute helpers ----
  const getConnectedAttrNode = (attrName) => {
    const edge = graph.edges.find(
      e => e.relation === 'hasAttribute' && e.target === selectedId &&
      graph.nodes[e.source]?.name === attrName
    );
    if (edge) return graph.nodes[edge.source];
    return null;
  };

  const handleRecommendedAttrChange = (attrName, value, valueType) => {
    const existingNode = getConnectedAttrNode(attrName);
    if (value === '' || value === false) {
      if (existingNode) {
        const edge = graph.edges.find(
          e => e.relation === 'hasAttribute' && e.target === selectedId && e.source === existingNode.id
        );
        if (edge) useGraphStore.getState().removeEdge(edge.id);
        useGraphStore.getState().removeNode(existingNode.id);
      }
      return;
    }

    if (existingNode) {
      useGraphStore.getState().updateNode(existingNode.id, { value });
    } else {
      const newId = nanoid();
      addAttributeNode(newId, attrName, value, valueType || 'string', {
        x: node.position.x + 150 + Math.random() * 100,
        y: node.position.y - 50 + Math.random() * 100,
      });
      connect(newId, selectedId, 'hasAttribute');
    }
  };

  const getRecommendedAttrs = () => {
    const tagAttrs = RECOMMENDED_ATTRIBUTES[node.tag] || [];
    const globalAttrs = RECOMMENDED_ATTRIBUTES._global || [];
    return [...globalAttrs, ...tagAttrs];
  };

  const recommendedAttrs = getRecommendedAttrs();

  // ---- Save component handler ----
 const handleSaveComponent = () => {
  const name = prompt('Component name:');
  if (!name) return;
  const { nodes, edges } = collectSubtree(selectedId);
  saveComponent(name, nodes, edges);
};

  return (
    <div style={{
      width: 250, padding: 10, background: '#fafafa',
      borderLeft: '1px solid #ccc', overflowY: 'auto',
    }}>
      <h4>{node.type.toUpperCase()} Node</h4>
      <p><strong>ID:</strong> {node.id}</p>

      {node.type === 'element' && (
        <div>
          {/* Tag */}
          <label>
            Tag:
            <input
              value={node.tag}
              onChange={(e) => handleChange('tag', e.target.value)}
              style={{ width: '100%', marginBottom: 8 }}
            />
          </label>

          {/* Text content */}
          <label>
            Text:
            <input
              value={node.textContent || ''}
              onChange={(e) => handleChange('textContent', e.target.value)}
              disabled={VOID_TAGS.has(node.tag)}
              style={{ width: '100%', marginBottom: 8, opacity: VOID_TAGS.has(node.tag) ? 0.5 : 1 }}
            />
          </label>

          {/* Recommended attributes */}
          <h5>Quick Attributes</h5>
          {recommendedAttrs.map((attr) => {
            const existingNode = getConnectedAttrNode(attr.name);
            const currentValue = existingNode ? existingNode.value : '';
            const isBoolean = attr.type === 'boolean';
            const isEnum = attr.type === 'enum';

            return (
              <div key={attr.name} style={{ marginBottom: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 60, fontSize: 12 }}>{attr.name}:</span>
                  {isBoolean ? (
                    <input
                      type="checkbox"
                      checked={!!currentValue}
                      onChange={(e) => handleRecommendedAttrChange(attr.name, e.target.checked, 'boolean')}
                    />
                  ) : isEnum ? (
                    <select
                      value={currentValue}
                      onChange={(e) => handleRecommendedAttrChange(attr.name, e.target.value, 'enum')}
                      style={{ flex: 1 }}
                    >
                      <option value="">--</option>
                      {attr.values.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={currentValue}
                      placeholder={attr.placeholder || ''}
                      onChange={(e) => handleRecommendedAttrChange(attr.name, e.target.value, 'string')}
                      style={{ flex: 1 }}
                    />
                  )}
                </label>
              </div>
            );
          })}

          {/* More Attributes button */}
          <button
            onClick={() => openAttributeModal(selectedId)}
            style={{
              width: '100%', padding: 4, marginTop: 4,
              background: '#e0e0e0', border: '1px solid #aaa', borderRadius: 4, cursor: 'pointer',
            }}
          >
            + More Attributes…
          </button>

          {/* ---- Save as Component button ---- */}
          <button
            onClick={handleSaveComponent}
            style={{
              width: '100%', padding: 6, marginTop: 8,
              background: '#2196F3', color: 'white',
              border: 'none', borderRadius: 4, cursor: 'pointer',
            }}
          >
            💾 Save as Component
          </button>
        </div>
      )}

      {/* ... rest of the node types (attribute, style) and delete button remain unchanged */}
      {node.type === 'attribute' && (
        <div>
          <label>
            Name:
            <input
              value={node.name}
              onChange={(e) => handleChange('name', e.target.value)}
              style={{ width: '100%', marginBottom: 8 }}
            />
          </label>
          <label>
            Value:
            <input
              value={node.valueType === 'boolean' ? (node.value ? 'true' : 'false') : node.value}
              onChange={(e) => handleChange('value', e.target.value)}
              style={{ width: '100%', marginBottom: 8 }}
            />
          </label>
        </div>
      )}

      {node.type === 'style' && (
        <div>
          <label>
            Alias (class name):
            <input
              value={node.alias || ''}
              onChange={(e) => handleChange('alias', e.target.value)}
              placeholder="e.g., my-button"
              style={{ width: '100%', marginBottom: 8 }}
            />
          </label>
          <p style={{ fontSize: 11, color: '#666', margin: '0 0 8px' }}>
            {node.alias
              ? `Class: .${node.alias}`
              : `Auto class: .gs-${node.id.slice(0, 8)}`
            }
          </p>

          <h5>Declarations</h5>
          <datalist id="css-properties">
            {CSS_PROPERTIES.map((prop) => (
              <option key={prop} value={prop} />
            ))}
          </datalist>
          {Object.entries(node.declarations).map(([prop, val], idx) => (
            <div key={idx} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              <input
                value={prop}
                list="css-properties"
                onChange={(e) => {
                  const newPropName = e.target.value;
                  const newDecls = { ...node.declarations };
                  delete newDecls[prop];
                  newDecls[newPropName] = val;
                  updateNode(selectedId, { declarations: newDecls });
                }}
                placeholder="property"
                style={{ flex: 1 }}
              />
              <input
                value={val}
                onChange={(e) => {
                  const newDecls = { ...node.declarations, [prop]: e.target.value };
                  updateNode(selectedId, { declarations: newDecls });
                }}
                placeholder="value"
                style={{ flex: 1 }}
              />
            </div>
          ))}
          <button onClick={() => {
            const newDecls = { ...node.declarations, '': '' };
            updateNode(selectedId, { declarations: newDecls });
          }}>+ Add Property</button>
        </div>
      )}

      {/* Delete button */}
      <button
        onClick={() => {
          removeNode(selectedId);
          deselectNode();
        }}
        style={{
          marginTop: 12, width: '100%', padding: 6,
          background: '#ff4444', color: 'white',
          border: 'none', borderRadius: 4, cursor: 'pointer',
        }}
      >
        🗑 Delete Node
      </button>
    </div>
  );
}