// @flow
/* eslint-disable no-use-before-define */

import merge from 'merge';

import { createHighlighter, DOMHighlighter } from '../../src/main';

import { documents } from './tests';

// Test-wide global attributes
let container;
let instance;
let full = false;

export function assertJsDOM() {
  // Ensure window and document exist in jsdom environment
  if (window == null || document == null || document.body == null) {
    throw new Error('DOM environment not available');
  }
}

export function init(ndx: number = 0, options?: Object): DOMHighlighter {
  assertJsDOM();

  const data = documents[ndx || 0];
  expect(data).toBeTruthy();
  document.body.innerHTML = data;
  container = document.body;

  instance = createHighlighter(options);
  return instance;
}

export function get(what: 'instance' | 'container' | 'all') {
  switch (what) {
    case undefined:
    case null:
    case 'instance':
      return instance;

    case 'container':
      return container;

    case 'all':
      return { container, highlighter: instance };

    default:
      throw new Error(`Unknown type: ${what}`);
  }
}

export function querySelector(selector) {
  return container.querySelector(selector);
}

export function querySelectorAll(selector) {
  return container.querySelectorAll(selector);
}

export function snapshot() {
  const hl = get();
  return {
    stats: merge({}, hl.stats),
    lastId: hl.lastId,
    queries: new Map(hl.queries),
    state: new Map(hl.state),
  };
}
