# drag_html – Visual Graph‑Based HTML/CSS Builder

Build web interfaces by connecting nodes on a canvas.  
Drag elements, attach attributes and styles, nest children, and export clean HTML/CSS.  
No coding required – just drag, connect, and design.

---

## Features

- Three node types: HTML Elements, Attributes, Style Blocks
- Many‑to‑many connections: reuse one attribute or style across multiple elements
- Parent‑child nesting: drag edges to build DOM tree structures
- Live preview: see your page update in real time
- Smart attribute picker: modal filtered per tag, with recommended attributes starred
- Tag‑aware inspector: quick fields for src, href, type, etc., auto‑creation of attribute nodes
- CSS autocomplete: property name suggestions for style blocks
- Save as reusable components: persist subgraphs, insert them as single widget nodes
- Undo (Ctrl+Z) – experiment safely
- Export to a single .html file with embedded CSS
- Keyboard shortcuts: Delete, Ctrl+C/V for copy‑paste
- Dark mode toggle (persists across reloads)

---

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Canvas         | React Flow (reactflow)              |
| State          | Zustand                             |
| UI             | React (JavaScript)                  |
| Code generation| Pure functions (custom engine)      |
| Persistence    | localStorage for components & theme |
| Build          | Vite                                |

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

```bash
git clone https://github.com/haidaryreza624-oss/drag-d.git
cd drag-d
npm install
```

Run in development
```bash
npm run dev
Open http://localhost:5173.
```
Build for production
```bash
npm run build
npm run preview
```
### How to Use
1. Add Elements
Click the + Element button in the toolbar. A modal shows all HTML tags – choose one (div, button, img, etc.). It appears on the canvas.

2. Inspect & Edit
Click any node to open the Inspector (right sidebar).

Element: change tag, text, or use the Quick Attributes fields to add src, href, class, etc.

Style Block: add CSS declarations with autocomplete.

Attribute: change name/value.

3. Connect Nodes
Drag from a handle (small circle) to create edges:

Attribute -> Element = adds that attribute

Style -> Element = applies CSS class

Element -> Element = parent/child (nests HTML)

Delete nodes/edges with the Delete key or the red button in the Inspector.

4. Reuse with Components
Select an element (with its children, styles, and attributes).

Click Save as Component in the Inspector.

The component appears in the Components panel permanently.

Click + Add on any saved component to insert it as a single widget.

5. Live Preview & Export
The bottom panel shows the generated output. Press Export HTML to download a complete .html file.

### Keyboard Shortcuts
Delete / Backspace – delete selected node

Ctrl+C – copy selected element + its connected attributes/styles

Ctrl+V – paste a duplicate

Ctrl+Z – undo

### Project Structure
```text
drag_html/
├── src/
│   ├── core/                 # Pure logic (no React)
│   │   ├── types.js              Node factories
│   │   ├── attributeDB.js        HTML attribute definitions (legacy)
│   │   ├── recommendedAttributes.js   Recommended & full attribute DB
│   │   ├── cssProperties.js      CSS property list for autocomplete
│   │   ├── htmlElements.js       HTML tag list for element picker
│   │   ├── validators.js         Attribute validation helpers
│   │   ├── graphOperations.js    Edge validation & cycle detection
│   │   └── codegen.js            HTML/CSS code generator
│   ├── store/                # Zustand stores
│   │   ├── graphStore.js         Graph state, undo, CRUD
│   │   ├── uiStore.js            UI state (modals, selection, clipboard)
│   │   └── componentStore.js     Saved components (localStorage)
│   ├── components/           # React components
│   │   ├── Canvas.jsx            React Flow wrapper
│   │   ├── Toolbar.jsx           Top toolbar
│   │   ├── Inspector.jsx         Sidebar property editor
│   │   ├── Preview.jsx           Live preview iframe
│   │   ├── AttributeModal.jsx    Two‑step attribute creation
│   │   ├── ElementPickerModal.jsx Grid of HTML tags
│   │   ├── ComponentPanel.jsx    Saved components list
│   │   └── nodes/                Custom React Flow node types
│   ├── App.jsx               Main layout
│   └── main.jsx              Entry point
├── index.html
├── package.json
└── vite.config.js
```
