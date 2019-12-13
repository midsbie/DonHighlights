// @flow

import * as instance from './instance';

export function clear(): void {
  expect(instance.querySelectorAll('.hh-highlight').length).toBe(0);
  totalHighlightsInDOM(0, 0);
}

export function totalHighlightsInDOM(hc: number, gc: number = 1): void {
  const groups = new Set();
  const highlights = new Set();

  for (const el of instance.querySelectorAll('.dh-highlight')) {
    try {
      // $FlowFixMe: expecting failure
      const gid = el.className.match(/dh-highlight-group-(\w+)/)[1];
      const hid = el.dataset.dhHighlightId;
      expect(gid).toBeTruthy();
      expect(hid).toBeTruthy();
      groups.add(gid);
      highlights.add(hid);
    } catch (x) {
      // nop
    }
  }

  expect(groups.size).toBe(gc);
  expect(highlights.size).toBe(hc);
}
