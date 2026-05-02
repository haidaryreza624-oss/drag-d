// attributeDB.js
export const ATTRIBUTE_DB = [
  { name: 'class', appliesTo: ['*'], type: 'string' },
  { name: 'id', appliesTo: ['*'], type: 'string' },
  { name: 'type', appliesTo: ['input','button','textarea'], type: 'enum', values: ['text','password','email','number','...'] },
  { name: 'href', appliesTo: ['a','link','area'], type: 'string' },
  { name: 'disabled', appliesTo: ['button','input','select','textarea','fieldset'], type: 'boolean' },
  { name: 'src', appliesTo: ['img','script','iframe','video','audio','source'], type: 'string' },
  { name: 'alt', appliesTo: ['img','area'], type: 'string' },
  // ... extend from MDN or a JSON dataset
];