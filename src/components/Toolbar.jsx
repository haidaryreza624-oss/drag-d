import useGraphStore from '../store/graphStore';
import { nanoid } from 'nanoid';

export default function Toolbar() {
  const addElementNode = useGraphStore((s) => s.addElementNode);
  const addStyleBlockNode = useGraphStore((s) => s.addStyleBlockNode);

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
    const alias = prompt('Style alias (optional)?', '');
    // start with a sample declarations
    addStyleBlockNode(id, { color: 'red', fontSize: '16px' }, alias || '', {
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    });
  };

  return (
    <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', gap: 8 }}>
      <button onClick={addElement}>+ Element</button>
      <button onClick={addStyle}>+ Style</button>
    </div>
  );
}