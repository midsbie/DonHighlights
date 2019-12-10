// @flow

import type { ClientOptions, TextSubject, XPathSubject } from './typedefs';
// For whatever reason, it is not possible to use the handy `export * from "module"` syntax.
import { setVerbose, getVerbose, setDebugging, getDebugging } from './globals';
import HtmlHighlighter from './HTMLHighlighter';
import RangeHighlighter from './RangeHighlighter';
import TextFinder from './TextFinder';
import XPathFinder from './XPathFinder';
import RangeTranslator from './RangeTranslator';
import type { RangeXPathDescriptor } from './TextRange';

export type { ClientOptions, TextSubject, XPathSubject };
export type { RangeXPathDescriptor };

export {
  HtmlHighlighter,
  RangeHighlighter,
  TextFinder,
  XPathFinder,
  RangeTranslator,
  setVerbose,
  getVerbose,
  setDebugging,
  getDebugging,
};
