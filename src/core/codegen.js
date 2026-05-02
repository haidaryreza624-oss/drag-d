// src/core/codegen.js

export function generateCode(graph) {
  console.log('Codegen graph:', graph);

  // 1. Style blocks → class map
  const styleClassMap = new Map();
  for (const edge of graph.edges) {
    if (edge.relation === 'usesStyle') {
      const styleNode = graph.nodes[edge.source];
      if (styleNode && styleNode.type === 'style' && !styleClassMap.has(edge.source)) {
        const className = styleNode.alias || `gs-${edge.source.slice(0, 8)}`;
        styleClassMap.set(edge.source, className);
      }
    }
  }

  let css = '';
  for (const [styleId, className] of styleClassMap.entries()) {
    const styleNode = graph.nodes[styleId];
    const declarations = Object.entries(styleNode.declarations)
      .map(([prop, val]) => `  ${prop}: ${val};`)
      .join('\n');
    css += `.${className} {\n${declarations}\n}\n\n`;
  }

  // 2. Build parent/child relationships
  const allElements = Object.values(graph.nodes).filter(n => n.type === 'element');
  const childrenOf = new Map();
  const parentOf = new Map();

  for (const edge of graph.edges) {
    if (edge.relation === 'child') {
      if (!childrenOf.has(edge.source)) childrenOf.set(edge.source, []);
      childrenOf.get(edge.source).push(edge.target);
      parentOf.set(edge.target, edge.source);
    }
  }

  const roots = allElements.filter(el => !parentOf.has(el.id));
  console.log('Roots:', roots.map(r => r.tag + '#' + r.id));

  // 3. Recursive render
  function renderElement(nodeId) {
    const elem = graph.nodes[nodeId];
    if (!elem || elem.type !== 'element') {
      console.warn('Missing or wrong type for node:', nodeId);
      return '';
    }

    const attrEdges = graph.edges.filter(e => e.relation === 'hasAttribute' && e.target === nodeId);
    const attrParts = [];
    const classNames = [];

    for (const edge of attrEdges) {
      const attrNode = graph.nodes[edge.source];
      if (!attrNode || attrNode.type !== 'attribute') continue;
      if (attrNode.name === 'class' && typeof attrNode.value === 'string') {
        classNames.push(...attrNode.value.split(/\s+/).filter(Boolean));
      } else if (attrNode.valueType === 'boolean') {
        if (attrNode.value) attrParts.push(attrNode.name);
      } else {
        attrParts.push(`${attrNode.name}="${attrNode.value}"`);
      }
    }

    // Style classes
    const styleEdges = graph.edges.filter(e => e.relation === 'usesStyle' && e.target === nodeId);
    for (const edge of styleEdges) {
      const className = styleClassMap.get(edge.source);
      if (className) classNames.push(className);
    }

    if (classNames.length > 0) {
      attrParts.push(`class="${classNames.join(' ')}"`);
    }

    const attrString = attrParts.length > 0 ? ' ' + attrParts.join(' ') : '';
    const children = (childrenOf.get(nodeId) || []).map(childId => renderElement(childId)).join('\n');
    const text = elem.textContent || '';
    const inner = text + (children ? '\n' + children + '\n' : '');

    return `<${elem.tag}${attrString}>${inner.trim()}</${elem.tag}>`;
  }

  let html = '';
  if (roots.length === 0) {
    html = allElements.map(el => renderElement(el.id)).join('\n').trim();
  } else {
    html = roots.map(el => renderElement(el.id)).join('\n').trim();
  }

  return { html, css: css.trim() };
}