// @flow
/* eslint-disable no-use-before-define */
// --

export type Position = {| x: number, y: number |};
export type ForEachNodeCallback = Node => boolean;

export function insertBefore(newNode: Node, beforeNode: Node): Node {
  (beforeNode.parentNode: any).insertBefore(newNode, beforeNode);
  return newNode;
}

export function insertAfter(newNode: Node, afterNode: Node): Node {
  // Automatically adds to the end of the list when `nextSibling` is `null`
  (afterNode.parentNode: any).insertBefore(newNode, afterNode.nextSibling);
  return newNode;
}

export function isInView(el: HTMLElement): boolean {
  const bbox = el.getBoundingClientRect();
  return bbox.top >= 0 && bbox.top + bbox.height < window.innerHeight;
}

/**
 * Simple DOM visitor
 *
 * Given a starting node, visits every node while invoking a callback that is expected to produce a
 * boolean value.  Ends when there are no more nodes to visit or the callback returns true.  Note
 * that a truthy value will not terminate visitation; only an explicit `true` value will.
 *
 * @param {Node} node - Node to begin visiting
 * @param {ForEachNodeCallback} callback - Callback to invoke for each node
 *
 * @returns {boolean} Result of last callback call
 */
export function visitDOM(node: Node, callback: ForEachNodeCallback): boolean {
  try {
    if (callback(node) === true) {
      return true;
    }
  } catch (x) {
    console.error('exception raised while executing visitor callback:', x);
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return false;
  }

  for (const child of node.childNodes) {
    if (visitDOM(child, callback)) {
      return true;
    }
  }

  return false;
}

export function findPreviousTextNode(fromNode: Node): ?Node {
  let it = fromNode;
  while (it != null) {
    if (it.previousSibling == null) {
      it = it.parentElement;
      continue;
    } else {
      it = it.previousSibling;
    }

    if (it.nodeType === Node.TEXT_NODE) {
      return it;
    }

    const lastNode = findLastTextNode((it: any));
    if (lastNode != null) {
      return lastNode;
    }
  }

  return null;
}

/**
 * Find last text node in given DOM sub-tree
 *
 * @param {HTMLElement} container - container element on whose tree to perform search
 * @returns {Node | null} Last text node found or `null` if none
 */
export function findLastTextNode(container: HTMLElement): Node | null {
  let lastTextNode = null;
  visitDOM(container, node => {
    if (node.nodeType === Node.TEXT_NODE) {
      lastTextNode = node;
    }

    return false;
  });

  return lastTextNode;
}
