// src/core/validators.js

import { ATTRIBUTE_DB } from './attributeDB.js';

export function isAttributeValidForElement(attrName, tag) {
  const def = ATTRIBUTE_DB.find(d => d.name === attrName);
  if (!def) return true; // custom data-* etc.
  if (def.appliesTo.includes('*')) return true;
  return def.appliesTo.includes(tag);
}

export function getAttributeDef(attrName) {
  return ATTRIBUTE_DB.find(d => d.name === attrName) || null;
}

// ADD THIS FUNCTION:
export function getValidAttributesForElement(tag, filterText = '') {
  const filtered = ATTRIBUTE_DB.filter(
    def => def.appliesTo.includes('*') || def.appliesTo.includes(tag)
  );
  let names = filtered.map(def => def.name);
  if (filterText) {
    names = names.filter(n => n.includes(filterText));
  }
  return names;
}