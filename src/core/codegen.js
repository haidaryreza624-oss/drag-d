// codegen.js

/**
 * Generates HTML + CSS from the graph.
 * Returns { html: string, css: string }
 */
export function generateCode(graph) {
  const styleRules = [];
  const usedClassNames = new Map(); // style node id -> class name

  // 1. Assign class names to style blocks that are connected
  graph.edges
    .filter(e => e.relation === 'usesStyle')
    .forEach(e => {
      const styleNode = graph.nodes[e.source];
      if (styleNode && styleNode.type === 'style') {
        if (!usedClassNames.has(styleNode.id)) {
          const className = styleNode.alias || `gs-${styleNode.id.slice(0, 8)}`;
          usedClassNames.set(styleNode.id, className);
          const decls = Object.entries(styleNode.declarations)
            .map(([prop, val]) => `${prop}: ${val};`)
            .join(' ');
          styleRules.push(`.${className} { ${decls} }`);
        }
      }
    });

  // 2. Build each element's HTML
  const elements = Object.values(graph.nodes).filter(n => n.type === 'element');

  let html = '';
  elements.forEach(el => {
    // collect connected attributes
    const attrs = [];
    graph.edges
      .filter(e => e.relation === 'hasAttribute' && e.target === el.id)
      .forEach(e => {
        const attrNode = graph.nodes[e.source];
        if (!attrNode || attrNode.type !== 'attribute') return;

        if (attrNode.name === 'class') {
          // collect class values from all attributes + style classes
          // (handled later)
        } else if (attrNode.valueType === 'boolean') {
          if (attrNode.value) attrs.push(attrNode.name);
        } else {
          attrs.push(`${attrNode.name}="${attrNode.value}"`);
        }
      });

    // Collect classes from attributes and style blocks
    let classes = [];
    // From attribute nodes of type 'class'
    graph.edges
      .filter(e => e.relation === 'hasAttribute' && e.target === el.id)
      .forEach(e => {
        const attrNode = graph.nodes[e.source];
        if (attrNode && attrNode.type === 'attribute' && attrNode.name === 'class') {
          if (typeof attrNode.value === 'string') {
            classes.push(...attrNode.value.split(/\s+/).filter(Boolean));
          }
        }
      });

    // From style blocks
    graph.edges
      .filter(e => e.relation === 'usesStyle' && e.target === el.id)
      .forEach(e => {
        const className = usedClassNames.get(e.source);
        if (className) classes.push(className);
      });

    if (classes.length > 0) {
      attrs.push(`class="${classes.join(' ')}"`);
    }

    const attrString = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
    const text = el.textContent || '';
    html += `<${el.tag}${attrString}>${text}</${el.tag}>\n`;
  });

  return {
    html: html.trim(),
    css: styleRules.join('\n')
  };
}