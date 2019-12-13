// @flow

export type XPathRange = {|
  start: {| xpath: string, offset: number |},
  end: {| xpath: string, offset: number |},
|};

export type TextQuery = string | RegExp;
export type QuerySubject = TextQuery | XPathRange;
