// @flow

import type { QuerySubject } from "./typedefs";
import TextContent from "./TextContent";
import Finder from "./Finder";
import TextFinder from "./TextFinder";
import XPathFinder from "./XPathFinder";

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
export default function createFinder(content: TextContent, query: QuerySubject): Finder {
  if (TextFinder.isQuery(query)) return new TextFinder(content, (query: any));
  else if (XPathFinder.isQuery(query)) return new XPathFinder(content, (query: any));

  throw new Error("Unknown or invalid query");
}
