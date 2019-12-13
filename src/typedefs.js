// @flow

import Highlight from './Highlight';

export type XPath = {|
  start: { xpath: string, offset: number },
  end: { xpath: string, offset: number },
|};

export type HighlightTextQuery = string | RegExp;

export type HighlightXPathQuery = {|
  ...XPath,
  state?: any,
|};

export type HighlightQuery = HighlightTextQuery | HighlightXPathQuery;

export interface IIdGenerator {
  generate(): string;
}

export type ForEachPredicate = Highlight => void;
export type SomePredicate = Highlight => boolean;
