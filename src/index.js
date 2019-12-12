// @flow

export type { HighlightTextQuery, HighlightXPathQuery } from './typedefs';
export { createHighlighter } from './factory';
export type { Options } from './factory';
export type { RangeXPathDescriptor } from './TextRange';

export { default as DOMHighlighter } from './DOMHighlighter';
export { default as TextFinder } from './TextFinder';
export { default as XPathFinder } from './XPathFinder';
export { default as RangeTranslator } from './RangeTranslator';
