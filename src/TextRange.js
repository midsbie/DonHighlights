// @flow

import type { XPathRange } from './typedefs';
import TextContent from './TextContent';
import TextNodeVisitor from './TextNodeVisitor';
import XPathResolver from './XPathResolver';
import type { Marker } from './TextContent';

export type RangeDescriptor = {| marker: Marker, offset: number |};

/**
 * Holds a representation of a range between two text nodes
 *
 * @param {TextContent} content - text representation instance
 * @param {Object} start - descriptor of start of range
 * @param {Object} end - descriptor of end of range
 */
export default class TextRange {
  content: TextContent;
  start: RangeDescriptor;
  end: RangeDescriptor;

  /**
   * Create a range descriptor from a global offset.
   *
   * @param {Marker} marker - Text offset marker object
   * @param {number} offset - Global offset
   *
   * @returns {RangeDescriptor} Range descriptor */
  static descriptorAbs(marker: Marker, offset: number): RangeDescriptor {
    return { marker, offset: offset - marker.offset };
  }

  /**
   * Create a range descriptor from an offset relative to the start of the text node
   *
   * @param {Marker} marker - Text offset marker object
   * @param {number} offset - Relative offset from start of text node
   *
   * @returns {RangeDescriptor} Range descriptor
   */
  static descriptorRel(marker: Marker, offset: number): RangeDescriptor {
    return { marker, offset };
  }

  constructor(content: TextContent, start: RangeDescriptor, end: RangeDescriptor) {
    this.content = content;

    // Sanity check:
    if (start.marker.offset + start.offset > end.marker.offset + end.offset) {
      throw new Error('Invalid range: start > end');
    }

    this.start = start;
    this.end = end;
  }

  /**
   * Compute the XPath representation of the active range
   *
   * @returns {RangeXPathDescriptor} XPath representation of active range
   */
  computeXPath(): XPathRange {
    const start = this.start.marker.node;
    const end = this.end.marker.node;
    const resolver = new XPathResolver(this.content.root);
    return {
      start: {
        xpath: resolver.xpathOf(start),
        offset: this.start.offset + resolver.offset(start),
      },
      end: {
        xpath: resolver.xpathOf(end),
        offset: this.end.offset + resolver.offset(end) + 1,
      },
    };
  }

  clearStartOffset(): void {
    this.start.offset = 0;
  }

  getAbsoluteStartOffset(): number {
    return this.start.marker.offset + this.start.offset;
  }

  /**
   * Compute the length of the active range
   *
   * @returns {number} Number of characters
   */
  length(): number {
    // Optimised case: range does not span multiple nodes
    if (this.start.marker.node === this.end.marker.node) {
      return this.end.offset - this.start.offset + 1;
    }

    // Range spans 2 or more nodes
    const visitor = new TextNodeVisitor(this.start.marker.node, this.content.root);
    const end = this.end.marker.node;
    let length = this.start.marker.node.nodeValue.length - this.start.offset + this.end.offset + 1;

    // Add (whole) lengths of text nodes in between
    while (visitor.next() !== end) {
      length += (visitor.current: any).nodeValue.length;
    }

    return length;
  }

  toString(): string {
    return this.content.substr(this.start.marker.offset + this.start.offset, this.length());
  }
}
