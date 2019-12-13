// @flow

import EventEmitter from 'events';

import type { ForEachPredicate, SomePredicate } from './interfaces';
import HighlightMarkers from './HighlightMarkers';
import HighlightRenderer from './HighlightRenderer';
import IdGenerator from './IdGenerator';
import TextRange from './TextRange';
import Highlight from './Highlight';
import type { HighlightJSON } from './Highlight';

export type GroupJSON = {|
  name: string,
  highlights: Array<HighlightJSON>,
|};

export default class Group extends EventEmitter {
  markers: HighlightMarkers;
  renderer: HighlightRenderer;
  idGenerator: IdGenerator;
  id: string;
  name: string;
  enabled: boolean;
  highlights: Map<string, Highlight>;

  constructor(
    name: string,
    markers: HighlightMarkers,
    renderer: HighlightRenderer,
    idGenerator: IdGenerator
  ) {
    super();

    this.markers = markers;
    this.renderer = renderer;
    this.idGenerator = idGenerator;
    this.id = name.replace(/[^a-z0-9-]/gi, '_');
    this.name = name;
    this.enabled = true;
    this.highlights = new Map();
  }

  enable(): void {
    this.setEnabled(true);
  }

  disable(): void {
    this.setEnabled(false);
  }

  setEnabled(enabled: boolean): void {
    if (this.enabled !== enabled) {
      this.highlights.forEach(hl => {
        hl.setEnabled(enabled);
        this.renderer.decorate(hl);
      });
      this.enabled = enabled;
    }
  }

  get(id: string): Highlight {
    const hl = this.highlights.get(id);
    if (hl == null) {
      throw new Error(`Highlight not found: ${id}`);
    }

    return hl;
  }

  has(id: string): boolean {
    return this.highlights.has(id);
  }

  add(hl: Highlight): void {
    try {
      this.get(hl.id).remove();
    } catch (x) {
      // nop
    }

    hl.on('remove', () => {
      this.highlights.delete(hl.id);
      this.emit('unhighlight', hl);
    });

    hl.render();
    this.highlights.set(hl.id, hl);
    this.markers.add(hl);
    this.emit('highlight', hl);
  }

  highlight(range: TextRange): Highlight {
    const id = this.idGenerator.generate();
    const hl = new Highlight(this, id, range);
    this.add(hl);
    return hl;
  }

  unhighlight(id: string): void {
    const hl = this.get(id);
    hl.remove();
    this.markers.remove(hl);
  }

  remove(): void {
    this.markers.removeGroup(this);
    this.highlights.forEach(hl => hl.remove());
    this.emit('remove', this);
  }

  clear(): void {
    this.highlights.forEach(hl => hl.remove());
  }

  forEach(predicate: ForEachPredicate): void {
    this.highlights.forEach(predicate);
  }

  some(predicate: SomePredicate): boolean {
    for (const [, hl] of this.highlights) {
      if (predicate(hl)) return true;
    }

    return false;
  }
}
