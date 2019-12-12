// @flow

import EventEmitter from 'events';

import type { HighlightQuery } from './typedefs';
import DOMHighlighter from './DOMHighlighter';
import TextRange from './TextRange';
import Highlight from './Highlight';
import type { HighlightJSON } from './Highlight';

export type GroupJSON = {|
  name: string,
  highlights: Array<HighlightJSON>,
|};

export default class Group extends EventEmitter {
  highlighter: DOMHighlighter;
  id: string;
  name: string;
  enabled: boolean;
  highlights: Map<string, Highlight>;

  constructor(name: string, highlighter: DOMHighlighter) {
    super();

    this.highlighter = highlighter;
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
        this.highlighter.highlightRenderer.decorate(hl);
      });
      this.enabled = enabled;
    }
  }

  highlight(range: TextRange): Highlight {
    const id = this.highlighter.idGenerator.generate();
    const hl = new Highlight(this, id, range);
    hl.render(this.highlighter.highlightRenderer);
    this.highlights.set(id, hl);
    this.highlighter.markers.add(hl);

    hl.on('remove', () => this.highlights.delete(hl.id));
    return hl;
  }

  unhighlight(id: string): void {
    const hl = this.highlights.get(id);
    if (hl == null) {
      throw new Error(`Highlight not found: ${id}`);
    }

    hl.remove();
    this.highlighter.markers.remove(hl);
  }

  remove(): void {
    this.highlighter.markers.removeGroup(this);
    this.highlights.forEach(hl => hl.remove());
    this.emit('remove', this);
  }
}
