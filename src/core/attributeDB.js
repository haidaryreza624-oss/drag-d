// src/core/attributeDB.js

export const ATTRIBUTE_DB = [
  {
    name: 'class',
    appliesTo: ['*'],         // global, any element
    type: 'string',
  },
  {
    name: 'id',
    appliesTo: ['*'],
    type: 'string',
  },
  {
    name: 'type',
    appliesTo: ['input', 'button', 'textarea', 'select'],
    type: 'enum',
    values: ['text', 'password', 'email', 'number', 'submit', 'checkbox'],
  },
  {
    name: 'href',
    appliesTo: ['a', 'link', 'area'],
    type: 'string',
  },
  {
    name: 'disabled',
    appliesTo: ['button', 'input', 'select', 'textarea', 'fieldset'],
    type: 'boolean',
  },
  {
    name: 'src',
    appliesTo: ['img', 'script', 'iframe', 'video', 'audio', 'source'],
    type: 'string',
  },
];