// @flow

import EventEmitter from 'events';

import type { XPath } from './typedefs';
import Group from './Group';
import TextRange from './TextRange';
import HighlightRenderer from './HighlightRenderer';

export type HighlightJSON = XPath;

export interface IHighlightDecorator {
  decorate(highlight: Class<Highlight>): void;
}

export default class Highlight extends EventEmitter {
  group: Group;
  id: string;
  range: TextRange;
  state: any;
  elements: Array<HTMLElement>;
  enabled: boolean;

  constructor(group: Group, id: string, range: TextRange, state: any) {
    super();

    this.group = group;
    this.id = id;
    this.range = range;
    this.state = state;
    this.elements = [];
    this.enabled = group.enabled;
  }

  render(renderer: HighlightRenderer): Array<HTMLElement> {
    const elements = renderer.surround(this);
    return (this.elements = elements);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  // TODO: consider automatically normalising text nodes during removal
  remove(): void {
    for (const el of this.elements) {
      let child;
      while ((child = el.childNodes[0]) != null) {
        (el.parentNode: any).insertBefore(child, el);
      }

      el.remove();
    }

    this.emit('remove', this);
  }

  isActive(): boolean {
    if (!this.enabled || !this.group.enabled || this.elements.length < 1) return false;
    // A highlight is considered to be active if its first (and usually only) element possesses
    // height and width greater than 0.
    const bbox = this.elements[0].getBoundingClientRect();
    return bbox.height > 0 && bbox.width > 0;
  }

  getState(): any {
    return this.state;
  }

  setState(state: any): void {
    this.state = state;
  }

  toJSON(): HighlightJSON {
    return this.range.computeXPath();
  }
}
