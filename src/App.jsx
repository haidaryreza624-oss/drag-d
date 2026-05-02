import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import AttributeModal from './components/AttributeModal';
import Inspector from './components/Inspector';
import Preview from './components/Preview';
import ComponentPanel from './components/ComponentPanel';
import ElementPickerModal from './components/ElementPickerModal';
export default function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <Toolbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Canvas />
        </div>
        <ComponentPanel />
        <Inspector />
      </div>
      <div style={{ height: 250 }}>
        <Preview />
      </div>
      <AttributeModal />
      <ElementPickerModal />
    </div>
  );
}