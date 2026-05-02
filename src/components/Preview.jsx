// src/components/Preview.jsx
import React, { useMemo } from 'react';
import useGraphStore from '../store/graphStore';
import { generateCode } from '../core/codegen';

export default function Preview() {
  const graph = useGraphStore((s) => s.graph);

  const { html, css } = useMemo(() => {
  try {
    const result = generateCode(graph);
    console.log('Preview HTML:', result.html);
    console.log('Preview CSS:', result.css);
    return result;
  } catch (err) {
    console.error('Code generation error:', err);
    return { html: '', css: '' };
  }
}, [graph]);

  const fullDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

  return (
    <div style={{ height: '100%', borderTop: '2px solid #333' }}>
      <h4 style={{ margin: '4px 8px' }}>Live Preview</h4>
      <iframe
        srcDoc={fullDoc}
        style={{ width: '100%', height: 'calc(100% - 30px)', border: 'none' }}
        title="preview"
      />
    </div>
  );
}