import useGraphStore from '../store/graphStore';
import { generateCode } from '../core/codegen';
import { nanoid } from 'nanoid';
import useUIStore from '../store/uiStore';
export default function Toolbar() {
    const openElementPicker = useUIStore((s) => s.openElementPicker);
  const addElementNode = useGraphStore((s) => s.addElementNode);
  const addStyleBlockNode = useGraphStore((s) => s.addStyleBlockNode);
  const undo = useGraphStore((s) => s.undo);
const redo = useGraphStore((s) => s.redo);
  const graph = useGraphStore((s) => s.graph);

  const addElement = () => {
    const id = nanoid();
    const tag = prompt('HTML tag?', 'div');
    if (tag) {
      addElementNode(id, tag.toLowerCase(), '', {
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
      });
    }
  };

  const addStyle = () => {
    const id = nanoid();
    // No alias prompt – uses auto‑generated class name
    addStyleBlockNode(
      id,
      { color: 'red', fontSize: '16px' },  // starter declarations
      '',                                    // empty alias (auto‑named on export)
      { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 }
    );
    
  };

  const handleExport = () => {
    try {
      const { html, css } = generateCode(graph);
      const fullDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>GraphUI Export</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
</body>
</html>`;

      const blob = new Blob([fullDoc], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export.html';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  return (
   <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', gap: 8 }}>
  <button onClick={openElementPicker}>+ Element</button>
  <button onClick={addStyle}>+ Style</button>
  <button onClick={handleExport}>⬇ Export HTML</button>
  <span style={{ margin: '0 8px' }}>|</span>
  <button onClick={undo}>↩ Undo</button>
  
</div>
  );
}