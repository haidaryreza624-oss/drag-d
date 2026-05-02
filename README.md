# GraphUI – Visual Graph‑Based HTML/CSS Builder

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
git clone https://github.com/yourusername/graphui.git
cd graphui
npm install
