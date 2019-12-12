// @flow

import merge from 'merge';

import type { HighlightQuery, IIdGenerator } from './typedefs';
import DOMHighlighter from './DOMHighlighter';
import TextContent from './TextContent';
import Finder from './Finder';
import TextFinder from './TextFinder';
import XPathFinder from './XPathFinder';
import Group from './Group';
import Highlight from './Highlight';
import type { IHighlightDecorator } from './Highlight';
import IdGenerator from './IdGenerator';
import HighlightDecorator from './HighlightDecorator';

export type Options = {|
  container?: HTMLElement,
  idGenerator?: IIdGenerator,
  decorator?: IHighlightDecorator,
|};

const defaultOptions: Options = {
  container: (null: any),
};

export function createHighlighter(containerOrOptions?: HTMLElement | Options): DOMHighlighter {
  let options;
  if (containerOrOptions == null) {
    options = { container: document.body };
  } else if (typeof containerOrOptions !== 'object') {
    throw new Error('Invalid options specified');
  } else if (containerOrOptions.nodeType == null) {
    options = containerOrOptions;
  } else {
    options = { container: containerOrOptions };
  }

  if (options.container == null || options.container.nodeType !== Node.ELEMENT_NODE) {
    throw new Error('Container must be an HTML element node');
  }
  options = merge({}, defaultOptions, options);

  return new DOMHighlighter(
    options.container,
    options.idGenerator || new IdGenerator(),
    options.decorator || new HighlightDecorator()
  );
}

/**
 * Construct appropriate `Finder`-derived class for a given subject
 *
 * @param {TextContent} content - reference to `TextContent` holding a text representation of the
 * document
 * @param {TextSubject | XPathSubject} subject - subject to find; can be of `string` or `RegExp`
 * type
 *
 * @returns {Finder} finder instance ready for use
 */
export function createFinder(content: TextContent, query: HighlightQuery): Finder {
  // FIXME: employ more robust check below that doesn't assume XPath finder by default
  return TextFinder.isSubject(query)
    ? new TextFinder(content, (query: any))
    : new XPathFinder(content, (query: any));
}
