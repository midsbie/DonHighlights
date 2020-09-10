// @flow

import EventEmitter from "events";

import type { QuerySubject } from "./typedefs";
import type { ForEachPredicate, SomePredicate } from "./interfaces";
import createFinder from "./createFinder";
import TextContent from "./TextContent";
import HighlightMarkers from "./HighlightMarkers";
import Group from "./Group";
import Cursor from "./Cursor";
import TextRange from "./TextRange";
import IdGenerator from "./IdGenerator";
import HighlightRenderer from "./HighlightRenderer";
import HighlightDecorator from "./HighlightDecorator";

type QueryPredicate = (hit: TextRange, index: number) => any;

export default class DOMHighlighter extends EventEmitter {
  container: HTMLElement;
  cursor: Cursor;
  content: TextContent;
  idGenerator: IdGenerator;
  markers: HighlightMarkers;
  groups: Map<string, Group>;
  renderer: HighlightRenderer;

  constructor(
    container: HTMLElement,
    idGenerator: IdGenerator,
    highlightDecorator: HighlightDecorator
  ) {
    super();

    this.container = container;
    this.content = new TextContent(container);
    this.content.parse();
    this.groups = new Map();
    this.markers = new HighlightMarkers(this.groups);
    this.cursor = new Cursor(this.markers, highlightDecorator);

    this.renderer = new HighlightRenderer(this.content, highlightDecorator);
    this.idGenerator = idGenerator;
  }

  dispose(): void {
    this.removeAllListeners();
    this.clear();
    this.content.dispose();
    this.markers.dispose();
  }

  setContainer(container: HTMLElement): void {
    this.container = container;
    this.refresh();
  }

  refresh(): void {
    // Forcefully normalise text nodes but take care to make sure that we're _only_ normalizing the
    // BODY element when the container element is a document.  It is important to leave the HEAD
    // element untouched as some websites (like cnn.com) may be sensitive to changes to the
    // content, which could lead to breakage on the page.
    if (this.container.nodeType === Node.DOCUMENT_NODE && (this.container: any).body != null) {
      this.container.body.normalize();
    } else {
      this.container.normalize();
    }

    if (this.content.root !== this.container) {
      this.content.setRoot(this.container);
    } else {
      this.content.parse();
    }
  }

  create(name: string): Group {
    if (this.groups.has(name)) {
      throw new Error(`Group already exists (${name})`);
    }

    const group = new Group(name, this.markers, this.renderer, this.idGenerator);
    group.on("remove", () => {
      this.groups.delete(name);
      this.emit("remove", group);
    });

    group.on("highlight", (hl) => this.emit("highlight", hl));
    group.on("unhighlight", (hl) => this.emit("unhighlight", hl));

    this.groups.set(name, group);
    return group;
  }

  reset(): void {
    this.groups.forEach((g) => g.remove());
    this.refresh();
  }

  clear(): void {
    this.groups.forEach((g) => g.clear());
    this.refresh();
  }

  has(name: string): boolean {
    return this.groups.has(name);
  }

  group(name: string): Group {
    const group = this.groups.get(name);
    if (group == null) {
      throw new Error(`Group not found: ${name}`);
    }

    return group;
  }

  count(): number {
    let count = 0;
    this.groups.forEach((g) => (count += g.highlights.size));
    return count;
  }

  forEach(predicate: ForEachPredicate): void {
    this.groups.forEach((g) => g.forEach(predicate));
  }

  some(predicate: SomePredicate): boolean {
    for (const [, grp] of this.groups) {
      if (grp.some(predicate)) return true;
    }

    return false;
  }

  query(query: QuerySubject, predicate: QueryPredicate): boolean {
    const finder = createFinder(this.content, query);
    let hit;
    let idx = 0;
    while ((hit = finder.next()) != null) {
      // $FlowFixMe: not accounting for hit != null check above
      if (predicate(hit, idx++) === false) return false;
    }
    return true;
  }
}
