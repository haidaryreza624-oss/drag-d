// src/core/recommendedAttributes.js

// Recommended attributes for each tag – shown as quick fields in the Inspector.
// Format: { name, type? (string|boolean), placeholder? }
export const RECOMMENDED_ATTRIBUTES = {
  a: [
    { name: 'href', placeholder: 'https://...' },
    { name: 'target', type: 'enum', values: ['_self', '_blank', '_parent', '_top'] },
    { name: 'title' },
  ],
  img: [
    { name: 'src', placeholder: 'image.jpg' },
    { name: 'alt', placeholder: 'Description' },
    { name: 'width' },
    { name: 'height' },
  ],
  input: [
    { name: 'type', type: 'enum', values: ['text', 'password', 'email', 'number', 'checkbox', 'radio', 'submit'] },
    { name: 'placeholder' },
    { name: 'value' },
    { name: 'disabled', type: 'boolean' },
    { name: 'required', type: 'boolean' },
  ],
  button: [
    { name: 'type', type: 'enum', values: ['button', 'submit', 'reset'] },
    { name: 'disabled', type: 'boolean' },
  ],
  textarea: [
    { name: 'placeholder' },
    { name: 'rows' },
    { name: 'cols' },
    { name: 'disabled', type: 'boolean' },
  ],
  select: [
    { name: 'disabled', type: 'boolean' },
  ],
  form: [
    { name: 'action', placeholder: '/submit' },
    { name: 'method', type: 'enum', values: ['GET', 'POST'] },
  ],
  video: [
    { name: 'src' },
    { name: 'controls', type: 'boolean' },
    { name: 'autoplay', type: 'boolean' },
    { name: 'loop', type: 'boolean' },
    { name: 'muted', type: 'boolean' },
    { name: 'poster' },
  ],
  audio: [
    { name: 'src' },
    { name: 'controls', type: 'boolean' },
    { name: 'autoplay', type: 'boolean' },
    { name: 'loop', type: 'boolean' },
    { name: 'muted', type: 'boolean' },
  ],
  // Any tag can have these global attributes
  _global: [
    { name: 'class' },
    { name: 'id' },
    { name: 'style' },  // style will be handled separately via style blocks, but quick inline okay
  ],
};

// Tags that are self‑closing (no text content)
export const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);