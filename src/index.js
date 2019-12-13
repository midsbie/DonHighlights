// @flow

export type { XPathRange, HighlightTextQuery, HighlightXPathQuery } from './typedefs';
export { default as createHighlighter } from './createHighlighter';
export * from './createHighlighter';
export { default as createFinder } from './createFinder';
export * from './HighlightRenderer'; // skipping default

export { default as DOMHighlighter } from './DOMHighlighter';
export { default as Group } from './Group';
export { default as Highlight } from './Highlight';
export { default as TextFinder } from './TextFinder';
export { default as XPathFinder } from './XPathFinder';
export { default as RangeTranslator } from './RangeTranslator';
