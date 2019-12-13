// @flow
/* eslint-disable no-use-before-define */

import { createHighlighter, DOMHighlighter } from '../../src';

import { documents } from './tests';

// Test-wide global attributes
let container;
let instance;

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
  (document.body: any).innerHTML = data;
  container = document.body;

  instance = createHighlighter(options);
  return instance;
}

export function querySelector(selector: string): ?HTMLElement {
  return getContainer().querySelector(selector);
}

export function querySelectorAll(selector: string): NodeList<HTMLElement> {
  return getContainer().querySelectorAll(selector);
}

export function getInstance(): DOMHighlighter {
  if (!instance) throw new Error('Highlighter not instantiated');
  return instance;
}

export function getContainer(): HTMLElement {
  if (!container) throw new Error('Invalid or null container');
  return container;
}
