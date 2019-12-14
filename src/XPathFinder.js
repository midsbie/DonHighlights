// @flow

import type { XPathRange } from './typedefs';
import TextContent from './TextContent';
import Finder from './Finder';
import XPathResolver from './XPathResolver';
import TextRange from './TextRange';

/**
 * Class responsible for locating text in a `TextContent` instance from an
 * XPath representation and start and end offsets.
 */
export default class XPathFinder extends Finder {
  /**
   * Class constructor
   *
   * @param {TextContent} content - Reference to `TextContent` instance
   * @param {XPathRange} subject - Descriptor containing an XPath representation with
   * start and end offsets.
   */
  constructor(content: TextContent, subject: XPathRange) {
    super(content);

    if (subject.start.offset < 0 || subject.end.offset < 0) {
      throw new Error('Invalid or no XPath object specified');
    }

    // Compute text node start and end elements that the XPath representation refers to.
    let end;
    let resolver = new XPathResolver(this.content.root);
    let start = resolver.elementAt(subject.start.xpath);

    // If an element could not be obtained from the XPath representation, abort now (messages will
    // have been output).
    if (start === null) {
      throw new Error(`Unable to locate start element: ${subject.start.xpath}`);
    }

    end = resolver.elementAt(subject.end.xpath);
    if (end === null) {
      throw new Error(`Unable to locate end element: ${subject.end.xpath}`);
    }

    // Retrieve global character offset of the text node.
    start = content.find(start);
    end = content.find(end);
    if (start < 0 || end < 0) {
      console.error(
        'unable to derive global offsets: %d:%d [xpath=%s:%s to end=%s:%s]',
        start,
        end,
        subject.start.xpath,
        subject.start.offset,
        subject.end.xpath,
        subject.end.offset
      );
      throw new Error('Unable to translate XPath range');
    }

    // Retrieve offset markers.
    start = content.at(start).offset + subject.start.offset;
    end = content.at(end).offset + subject.end.offset - 1;

    /* console.log("DEBUG start = ", start, "end = ", end, subject); */

    if (start > end) {
      throw new Error('Invalid XPath representation: start > end');
    }

    // Save global character offset and relative start and end offsets in descriptor.
    this.results.push({ start, end });
  }

  /**
   * Return next available match
   *
   * @returns {TextRange | null} Returns a `TextRange` if a match is available, or `null` if no
   * more matches are available.
   */
  next(): TextRange | null {
    if (this.current >= this.results.length) {
      return null;
    }

    const subject: any = this.results[this.current];
    if (subject == null) {
      throw new Error('Subject not found');
    }
    ++this.current;

    // TODO: we don't necessarily need to invoke getAt_ for the end offset.  A check has to be made
    // to ascertain if the end offset falls within the start node.
    return new TextRange(this.content, this.getAt_(subject.start), this.getAt_(subject.end));
  }
}
