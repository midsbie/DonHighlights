// @flow

export type XPath = {|
  start: { xpath: string, offset: number },
  end: { xpath: string, offset: number },
|};

export type HighlightTextQuery = string | RegExp;

export type HighlightXPathQuery = {|
  ...XPath,
  state: any,
|};

export type HighlightQuery = HighlightTextQuery | HighlightXPathQuery;

export interface IIdGenerator {
  generate(): string;
}
