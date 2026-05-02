// src/core/codegen.js

/**
 * Generates HTML and CSS from the graph.
 * @param {object} graph - { nodes: Record<string, object>, edges: Array }
 * @returns {{ html: string, css: string }}
 */
export function generateCode(graph) {
  // Step 1: Assign class names to style blocks that are actually used
  const styleClassMap = new Map(); // styleNodeId -> className

  for (const edge of graph.edges) {
    if (edge.relation === 'usesStyle') {
      const styleNode = graph.nodes[edge.source];
      if (styleNode && styleNode.type === 'style' && !styleClassMap.has(edge.source)) {
        const className = styleNode.alias || `gs-${edge.source.slice(0, 8)}`;
        styleClassMap.set(edge.source, className);
      }
    }
  }

  // Step 2: Build CSS string
  let css = '';
  for (const [styleId, className] of styleClassMap.entries()) {
    const styleNode = graph.nodes[styleId];
    const declarations = Object.entries(styleNode.declarations)
      .map(([prop, val]) => `  ${prop}: ${val};`)
      .join('\n');
    css += `.${className} {\n${declarations}\n}\n\n`;
  }

  // Step 3: Build HTML for each element node
  const elementNodes = Object.values(graph.nodes).filter(n => n.type === 'element');
  let html = '';

  for (const elem of elementNodes) {
    // Collect all attribute nodes connected to this element
    const attrEdges = graph.edges.filter(
      e => e.relation === 'hasAttribute' && e.target === elem.id
    );

    // Build attribute list
    const attrParts = [];
    const classNames = [];

    for (const edge of attrEdges) {
      const attrNode = graph.nodes[edge.source];
      if (!attrNode || attrNode.type !== 'attribute') continue;

      if (attrNode.name === 'class' && typeof attrNode.value === 'string') {
        // Collect class names from attribute node
        classNames.push(...attrNode.value.split(/\s+/).filter(Boolean));
      } else if (attrNode.valueType === 'boolean') {
        // Boolean attribute: include only if true
        if (attrNode.value) {
          attrParts.push(attrNode.name);
        }
      } else {
        // Regular attribute (string/enum)
        attrParts.push(`${attrNode.name}="${attrNode.value}"`);
      }
    }

    // Add class names from connected style blocks
    const styleEdges = graph.edges.filter(
      e => e.relation === 'usesStyle' && e.target === elem.id
    );
    for (const edge of styleEdges) {
      const className = styleClassMap.get(edge.source);
      if (className) classNames.push(className);
    }

    if (classNames.length > 0) {
      attrParts.push(`class="${classNames.join(' ')}"`);
    }

    const attrString = attrParts.length > 0 ? ' ' + attrParts.join(' ') : '';
    const text = elem.textContent || '';
    html += `<${elem.tag}${attrString}>${text}</${elem.tag}>\n`;
  }

  return {
    html: html.trim(),
    css: css.trim(),
  };
}