// @flow

export type XPathRange = {|
  start: {| xpath: string, offset: number |},
  end: {| xpath: string, offset: number |},
|};

export type HighlightTextQuery = string | RegExp;

export type HighlightXPathQuery = {|
  ...XPathRange,
  state?: any,
|};

export type HighlightQuery = HighlightTextQuery | HighlightXPathQuery;
