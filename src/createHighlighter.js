// @flow

import merge from 'merge';

import type { IIdGenerator } from './typedefs';
import DOMHighlighter from './DOMHighlighter';
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

export default function createHighlighter(
  containerOrOptions?: HTMLElement | Options
): DOMHighlighter {
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
