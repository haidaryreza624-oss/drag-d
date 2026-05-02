// src/core/codegen.js
import useComponentStore from '../store/componentStore';

/**
 * Generates HTML and CSS from the graph.
 * @param {object} graph - { nodes: Record<string, object>, edges: Array }
 * @returns {{ html: string, css: string }}
 */
export function generateCode(graph) {
  // 1. Style block → class name map (collects styles from main graph AND from all components)
  const styleClassMap = new Map();

  // Process main graph's usesStyle edges
  for (const edge of graph.edges) {
    if (edge.relation === 'usesStyle') {
      const styleNode = graph.nodes[edge.source];
      if (styleNode && styleNode.type === 'style' && !styleClassMap.has(edge.source)) {
        const className = styleNode.alias || `gs-${edge.source.slice(0, 8)}`;
        styleClassMap.set(edge.source, className);
      }
    }
  }

  // Gather style blocks from components referenced by component nodes
  const componentStore = useComponentStore.getState();
  for (const node of Object.values(graph.nodes)) {
    if (node.type === 'component') {
      const comp = componentStore.components.find(c => c.id === node.componentId);
      if (comp) {
        for (const compEdge of comp.edges) {
          if (compEdge.relation === 'usesStyle') {
            const styleNode = comp.nodes[compEdge.source];
            if (styleNode && styleNode.type === 'style' && !styleClassMap.has(compEdge.source)) {
              const className = styleNode.alias || `gs-${compEdge.source.slice(0, 8)}`;
              styleClassMap.set(compEdge.source, className);
            }
          }
        }
      }
    }
  }

  // Generate CSS from the combined style map
  let css = '';
  for (const [styleId, className] of styleClassMap.entries()) {
    // The style node data might be in the main graph or inside a component; we need to fetch it.
    let styleNode = graph.nodes[styleId];
    if (!styleNode) {
      // Search in all components
      for (const node of Object.values(graph.nodes)) {
        if (node.type === 'component') {
          const comp = componentStore.components.find(c => c.id === node.componentId);
          if (comp && comp.nodes[styleId]) {
            styleNode = comp.nodes[styleId];
            break;
          }
        }
      }
    }
    if (styleNode) {
      const declarations = Object.entries(styleNode.declarations)
        .map(([prop, val]) => `  ${prop}: ${val};`)
        .join('\n');
      css += `.${className} {\n${declarations}\n}\n\n`;
    }
  }

  // 2. Build parent/child relationships (main graph only)
  const allElements = Object.values(graph.nodes).filter(n => n.type === 'element' || n.type === 'component');
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

  // Helper: render a subgraph (as used inside a component) to an HTML string
  function renderSubgraph(subNodes, subEdges, subStyleMap) {
    // Build child relationships for the subgraph
    const subAllElements = Object.values(subNodes).filter(n => n.type === 'element' || n.type === 'component');
    const subChildrenOf = new Map();
    const subParentOf = new Map();
    for (const edge of subEdges) {
      if (edge.relation === 'child') {
        if (!subChildrenOf.has(edge.source)) subChildrenOf.set(edge.source, []);
        subChildrenOf.get(edge.source).push(edge.target);
        subParentOf.set(edge.target, edge.source);
      }
    }
    const subRoots = subAllElements.filter(el => !subParentOf.has(el.id));

    // Recursive renderer for the subgraph (using the main style map)
    function renderSubElement(nodeId) {
      const elem = subNodes[nodeId];
      if (!elem) return '';

      if (elem.type === 'component') {
        // Expand nested component recursively
        const nestedComp = componentStore.components.find(c => c.id === elem.componentId);
        if (nestedComp) {
          return renderSubgraph(nestedComp.nodes, nestedComp.edges, subStyleMap);
        }
        return '';
      }

      // It's an element
      const attrEdges = subEdges.filter(e => e.relation === 'hasAttribute' && e.target === nodeId);
      const attrParts = [];
      const classNames = [];

      for (const edge of attrEdges) {
        const attrNode = subNodes[edge.source];
        if (!attrNode || attrNode.type !== 'attribute') continue;
        if (attrNode.name === 'class' && typeof attrNode.value === 'string') {
          classNames.push(...attrNode.value.split(/\s+/).filter(Boolean));
        } else if (attrNode.valueType === 'boolean') {
          if (attrNode.value) attrParts.push(attrNode.name);
        } else {
          attrParts.push(`${attrNode.name}="${attrNode.value}"`);
        }
      }

      // Add style block classes from subgraph
      const styleEdges = subEdges.filter(e => e.relation === 'usesStyle' && e.target === nodeId);
      for (const edge of styleEdges) {
        const className = subStyleMap.get(edge.source);
        if (className) classNames.push(className);
      }

      if (classNames.length > 0) {
        attrParts.push(`class="${classNames.join(' ')}"`);
      }

      const attrString = attrParts.length > 0 ? ' ' + attrParts.join(' ') : '';
      const children = (subChildrenOf.get(nodeId) || []).map(childId => renderSubElement(childId)).join('\n');
      const text = elem.textContent || '';
      const inner = text + (children ? '\n' + children + '\n' : '');

      return `<${elem.tag}${attrString}>${inner.trim()}</${elem.tag}>`;
    }

    return subRoots.map(root => renderSubElement(root.id)).join('\n').trim();
  }

  // 3. Render main graph
  function renderNode(nodeId) {
    const node = graph.nodes[nodeId];
    if (!node) return '';

    if (node.type === 'component') {
      const comp = componentStore.components.find(c => c.id === node.componentId);
      if (!comp) return '<!-- unknown component -->';
      // Use the subgraph renderer with the global style map
      return renderSubgraph(comp.nodes, comp.edges, styleClassMap);
    }

    // Normal element rendering
    const elem = node;
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

    // Style classes from main graph
    const styleEdges = graph.edges.filter(e => e.relation === 'usesStyle' && e.target === nodeId);
    for (const edge of styleEdges) {
      const className = styleClassMap.get(edge.source);
      if (className) classNames.push(className);
    }

    if (classNames.length > 0) {
      attrParts.push(`class="${classNames.join(' ')}"`);
    }

    const attrString = attrParts.length > 0 ? ' ' + attrParts.join(' ') : '';
    const children = (childrenOf.get(nodeId) || []).map(childId => renderNode(childId)).join('\n');
    const text = elem.textContent || '';
    const inner = text + (children ? '\n' + children + '\n' : '');

    return `<${elem.tag}${attrString}>${inner.trim()}</${elem.tag}>`;
  }

  let html = '';
  if (roots.length === 0) {
    html = allElements.map(el => renderNode(el.id)).join('\n').trim();
  } else {
    html = roots.map(el => renderNode(el.id)).join('\n').trim();
  }

  return { html, css: css.trim() };
}