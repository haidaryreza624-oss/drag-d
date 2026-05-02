// validators.js
import { ATTRIBUTE_DB } from './attributeDB.js';

/**
 * Returns true if an attribute can be applied on the given tag.
 * Custom data-* attributes are always allowed.
 */
export function isAttributeValidForElement(attributeName, tag) {
  const def = ATTRIBUTE_DB.find(d => d.name === attributeName);
  if (!def) return true; // likely a data-* attribute
  if (def.appliesTo.includes('*')) return true;
  return def.appliesTo.includes(tag);
}

/**
 * Given a tag and optional filter string, return a list of valid attribute names.
 */
export function getValidAttributesForElement(tag, filterText = '') {
  const all = ATTRIBUTE_DB.filter(def => def.appliesTo.includes('*') || def.appliesTo.includes(tag));
  return all
    .filter(def => def.name.includes(filterText))
    .map(def => def.name);
}

/**
 * Get the value definition (type/values) for an attribute.
 */
export function getAttributeDef(name) {
  return ATTRIBUTE_DB.find(d => d.name === name) || null;
}