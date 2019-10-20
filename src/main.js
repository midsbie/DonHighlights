// @flow

// For whatever reason, it is not possible to use the handy `export * from "module"` syntax.
import { setVerbose, getVerbose, setDebugging, getDebugging } from './globals';
import HtmlHighlighter from './htmlhighlighter';
import RangeHighlighter from './rangehighlighter';
import TextFinder from './textfinder';
import XPathFinder from './xpathfinder';
import RangeTranslator from './rangetranslator';
import type { ClientOptions, TextSubject, XpathSubject } from './typedefs';
import type { RangeXpathDescriptor } from './textrange';

export type { ClientOptions, TextSubject, XpathSubject };
export type { RangeXpathDescriptor };

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
