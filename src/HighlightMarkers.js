// @flow

import EventEmitter from 'events';

import Group from './Group';
import Highlight from './Highlight';
import { groupNamesToGroupSet } from './util';

export type Marker = {|
  highlight: Highlight,
  offset: number,
|};

/**
 * Positional highlight containment
 *
 * Manages highlights as they appear on the page rather than on the DOM to enable correct cursor
 * movement from highlight to highlight.
 */
class HighlightMarkers extends EventEmitter {
  groups: Map<string, Group>;
  markers: Array<Marker>;
  debouncedEmitTimerID: ?TimeoutID;

  constructor(groups: Map<string, Group>) {
    super();

    this.groups = groups;
    this.markers = [];
    this.debouncedEmitTimerID = null;
  }

  dispose(): void {
    if (this.debouncedEmitTimerID != null) {
      clearTimeout(this.debouncedEmitTimerID);
      this.debouncedEmitTimerID = null;
    }

    this.removeAllListeners();
    this.markers = [];
  }

  debouncedEmit(event: string, ...args: Array<any>): void {
    if (this.debouncedEmitTimerID != null) clearTimeout(this.debouncedEmitTimerID);
    this.debouncedEmitTimerID = setTimeout(() => this.emit(event, ...args), 1000 / 60);
  }

  add(highlight: Highlight): void {
    const offset = highlight.range.getAbsoluteStartOffset();
    let mid;
    let min = 0;
    let max = this.markers.length - 1;

    while (min < max) {
      mid = Math.floor((min + max) / 2);

      if (this.markers[mid].offset < offset) {
        min = mid + 1;
      } else {
        max = mid;
      }
    }

    this.markers.splice(
      this.markers.length > 0 && this.markers[min].offset < offset ? min + 1 : min,
      0,
      { highlight, offset }
    );
    this.debouncedEmit('update');
  }

  remove(highlight: Highlight): boolean {
    const markers = this.markers;

    for (let i = 0; i < markers.length; ++i) {
      if (markers[i].highlight === highlight) {
        markers.splice(i, 1);
        this.debouncedEmit('update');
        return true;
      }
    }

    return false;
  }

  removeGroup(group: Group): number {
    let count = 0;
    const markers = this.markers;

    for (let i = 0; i < markers.length; ) {
      if (markers[i].highlight.group === group) {
        markers.splice(i, 1);
        ++count;
      } else {
        ++i;
      }
    }

    if (count > 0) this.debouncedEmit('update');
    return count;
  }

  get(index: number): Marker | null {
    return this.markers[index] || null;
  }

  calculateTotal(groupNames: ?Array<string>): number {
    if (groupNames == null) {
      return this.markers.length;
    }

    const groups = groupNamesToGroupSet(groupNames, this.groups);
    return this.markers.reduce(
      (acc, marker) => (groups.has(marker.highlight.group) ? acc + 1 : acc),
      0
    );
  }

  calculateTotalActive(groupNames: ?Array<string>): number {
    if (groupNames == null) {
      return this.markers.reduce((acc, marker) => acc + Number(marker.highlight.isActive()), 0);
    }

    const groups = groupNamesToGroupSet(groupNames, this.groups);
    return this.markers.reduce(
      (acc, marker) =>
        groups.has(marker.highlight.group) && marker.highlight.isActive() ? acc + 1 : acc,
      0
    );
  }

  find(at: number, groupNames: ?Array<string>): Marker | null {
    const groups = groupNames == null ? null : groupNamesToGroupSet(groupNames, this.groups);
    let marker: Marker | null = null;

    this.markers.some(m => {
      const g = m.highlight.group;
      // Group must be enabled and highlight active.  Note that highlights are never active
      // in non-browser environments, in which case highlights are assumed to be active.
      if (!g.enabled) {
        return false;
      } else if (groups != null && !groups.has(g)) {
        return false;
      } else if (!m.highlight.isActive()) {
        return false;
      } else if (at < 1) {
        marker = m;
        return true;
      }

      --at;
      return false;
    });

    return marker;
  }
}

export default HighlightMarkers;
