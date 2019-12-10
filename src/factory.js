// @flow

import type { TextSubject, XPathSubject } from './typedefs';
import TextContent from './TextContent';
import Finder from './Finder';
import TextFinder from './TextFinder';
import XPathFinder from './XPathFinder';

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
function finder(content: TextContent, subject: TextSubject | XPathSubject): Finder {
  // FIXME: employ more robust check below that doesn't assume XPath finder by default
  return TextFinder.isSubject(subject)
    ? new TextFinder(content, (subject: any))
    : new XPathFinder(content, (subject: any));
}

export { finder };
