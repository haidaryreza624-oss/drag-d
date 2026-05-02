// src/components/Inspector.jsx
import useUIStore from '../store/uiStore';
import useGraphStore from '../store/graphStore';
import { CSS_PROPERTIES } from '../core/cssProperties';
import useComponentStore from '../store/componentStore';
export default function Inspector() {
  const selectedId = useUIStore((s) => s.selectedNodeId);
  const deselectNode = useUIStore((s) => s.deselectNode);
  const graph = useGraphStore((s) => s.graph);
  const updateNode = useGraphStore((s) => s.updateNode);
  const removeNode = useGraphStore((s) => s.removeNode);
const copySelection = useUIStore((s) => s.copySelection);
const pasteClipboard = useUIStore((s) => s.pasteClipboard);
const saveComponent = useComponentStore((s) => s.saveComponent);
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

  return (
    <div style={{
      width: 250,
      padding: 10,
      background: '#fafafa',
      borderLeft: '1px solid #ccc',
      overflowY: 'auto',
    }}>
      <h4>{node.type.toUpperCase()} Node</h4>
      <p><strong>ID:</strong> {node.id}</p>

      {/* ========== ELEMENT EDITOR ========== */}
      {node.type === 'element' && (
        <div>
          <label>
            Tag:
            <input
              value={node.tag}
              onChange={(e) => handleChange('tag', e.target.value)}
              style={{ width: '100%', marginBottom: 8 }}
            />
          </label>
          <label>
            Text:
            <input
              value={node.textContent}
              onChange={(e) => handleChange('textContent', e.target.value)}
              style={{ width: '100%', marginBottom: 8 }}
            />
          </label>
        </div>
      )}

      {/* ========== ATTRIBUTE EDITOR ========== */}
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

      {/* ========== STYLE EDITOR ========== */}
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
    {/* Datalist for property autocomplete */}
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
  const newDecls = { ...node.declarations };
  // Use a unique placeholder key so the user can type over it
  newDecls[''] = '';
  updateNode(selectedId, { declarations: newDecls });
}}>+ Add Property</button>
  </div>
)}

      {/* ========== DELETE BUTTON ========== */}
      <button
        onClick={() => {
          removeNode(selectedId);
          deselectNode();
        }}
        style={{
          marginTop: 12,
          width: '100%',
          padding: 6,
          background: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        🗑 Delete Node
      </button>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
  <button onClick={copySelection}
    style={{
      flex: 1, padding: 6, background: '#4CAF50', color: 'white',
      border: 'none', borderRadius: 4, cursor: 'pointer',
    }}
  >📋 Copy</button>

  <button onClick={pasteClipboard}
    style={{
      flex: 1, padding: 6, background: '#2196F3', color: 'white',
      border: 'none', borderRadius: 4, cursor: 'pointer',
    }}
  >📄 Paste</button>

</div>
{node.type === 'element' && (
  <button
    onClick={() => {
      const name = prompt('Component name?');
      if (!name) return;
      // Extract subgraph: selected element + all directly connected attribute/style nodes
      const elementId = selectedId;
      const element = graph.nodes[elementId];
      if (!element) return;
      const subNodes = { [elementId]: JSON.parse(JSON.stringify(element)) };
      const subEdges = [];
      for (const edge of graph.edges) {
        if (edge.target === elementId) {
          const sourceNode = graph.nodes[edge.source];
          if (sourceNode && (sourceNode.type === 'attribute' || sourceNode.type === 'style')) {
            if (!subNodes[sourceNode.id]) {
              subNodes[sourceNode.id] = JSON.parse(JSON.stringify(sourceNode));
            }
            subEdges.push(JSON.parse(JSON.stringify(edge)));
          }
        }
      }
      saveComponent(name, subNodes, subEdges);
    }}
    style={{
      marginTop: 8, width: '100%', padding: 6,
      background: '#FF9800', color: 'white', border: 'none',
      borderRadius: 4, cursor: 'pointer',
    }}
  >💾 Save as Component</button>
)}
    </div>
  );
}