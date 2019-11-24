// @flow

import { findPreviousTextNode, findLastTextNode } from './dom';

export type RangeBoundaryPoint = {| node: Node, offset: number |};

export function getNormalizedStartBoundaryPoint(range: Range): RangeBoundaryPoint {
  let node, offset;
  node = range.startContainer;
  offset = range.startOffset;

  if (node.nodeType !== Node.TEXT_NODE) {
    node = node.childNodes[offset];
    if (node == null) {
      throw new Error('[InvalidNodeTypeError] Invalid start container');
    }
  }

  return { node, offset };
}

/**
 * Skip whitespace at the end of a given node
 *
 * Traverses the tree in reverse direction until the first non-whitespace character is found.  Only
 * the text of the start node until the given offset is considered.
 *
 * Throws an exception if it can't find a text node before the start node containing regular
 * characters.
 *
 * @param {Node} node - Text node to start at
 * @param {number} offset - Offset in the start node's text
 *
 * @returns {RangeBoundaryPoint} Range boundary point
 */
function skipEndWhitespace(node: Node, offset: number): RangeBoundaryPoint {
  if (node.nodeType !== Node.TEXT_NODE) {
    throw new Error('Start node not text type');
  }

  // If the start node selection (thus up to nth char given by offset) contains non-whitespace
  // characters, adjust offset accordingly and return.
  if (offset > 0) {
    const match = node.textContent.slice(0, offset).match(/[^\s][\s]*$/);
    if (match != null) {
      // $FlowFixMe: `match` contains an `index` property, as per the standard.
      return { node, offset: match.index + 1 };
    }
  }

  // Given start node selection is either empty (offset is 0) or all characters are whitespace,
  // which means we must look for the most recent text node that contains regular characters.
  let it = node;
  it = findPreviousTextNode(it);

  while (it != null) {
    const match = it.textContent.match(/[^\s][\s]*$/);
    if (match != null) {
      // $FlowFixMe: `match` contains an `index` property, as per the standard.
      return { node: it, offset: match.index + 1 };
    }

    it = findPreviousTextNode(it);
  }

  throw new Error('No previous text nodes or content is whitespace');
}

export function getNormalizedEndBoundaryPoint(range: Range): RangeBoundaryPoint {
  let node, offset;
  node = range.endContainer;
  offset = range.endOffset;

  if (node.nodeType === Node.TEXT_NODE) {
    return skipEndWhitespace(node, offset);
  }

  const children = node.childNodes;
  const length = children.length;

  // The standard [0] states that the setEndAfter(node) method, when invoked, must run these steps:
  //
  //   1. Let parent be node’s parent.
  //   2. If parent is null, then throw an "InvalidNodeTypeError" DOMException.
  //   3. Set the end of the context object to boundary point (parent, node’s index plus 1).
  //
  // However, in respect to setting the start or end of a range to a boundary point, it further
  // states that:
  //
  //   1. If node is a doctype, then throw an "InvalidNodeTypeError" DOMException.
  //   2. If offset is greater than node’s length, then throw an "IndexSizeError" DOMException.
  //
  // The testcase "onpremWrappedHighlightByChild" [1] tests for a specific case whereby the offset
  // of the end node can, in some circumstances, be equal to the node's (contained children)
  // length.  For instance, consider the following HTML snippet:
  //
  //     <p><span class="target">located in </span><span class="website-entity-class" title="Entity
  // type: City"><span class="target">Boston</span></span></p>
  //
  // ... and then running:
  //
  //    const range = document.createRange();
  //    range.setStartBefore(document.querySelector('.target'));
  //    range.setEndAfter(document.querySelector('.target:last-child'));
  //
  // ... which produces a range where the end container/offset are:
  //
  //    endContainer: span.website-entity-class
  //    endOffset: 1
  //
  // ... however, document.querySelector('span.website-entity-class').childNode.length === 1
  //
  // This is significant because a range's offset is 0-based.  Special logic to account for this is
  // given below.
  //
  // [0] https://dom.spec.whatwg.org/#concept-range-bp-set
  // [1] in `./StarringSelectionNormalizer.testcases.js`
  if (offset > length) {
    throw new Error('[InvalidNodeTypeError] Invalid end container');
  } else if (offset === length) {
    // Attempt to find the last available text node as required by the normalizer, but do not fail
    // if not possible.
    node = findLastTextNode((node: any));
    if (node == null) {
      // Revert to given end container.
      node = range.endContainer;
      offset = 0;
    } else {
      offset = node.textContent.length;
    }
  } else if (offset === 0) {
    // No text in the end container is selected so find previous text node and select its contents.
    node = findPreviousTextNode(node);
    if (node == null) {
      throw new Error('[InvalidNodeTypeError] Invalid end container');
    }
    offset = node.textContent.length;
  } else {
    node = node.childNodes[offset];
    offset = 0;
  }

  return skipEndWhitespace(node, offset);
}
