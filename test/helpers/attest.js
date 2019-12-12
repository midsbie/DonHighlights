// @flow

import * as instance from './instance';
import * as ops from './operations';

export function clear(): void {
  expect(instance.querySelectorAll('.hh-highlight').length).toBe(0);
  totalHighlights(0, 0);
}

export function totalHighlights(hc: number, gc: number = 1): void {
  const groups = new Set();
  const highlights = new Set();

  for (const el of instance.querySelectorAll('.dh-highlight')) {
    /* eslint-disable no-empty */
    try {
      const gid = el.className.match(/dh-highlight-group-(\w+)/)[1];
      const hid = el.dataset.highlightId;
      expect(gid).toBeTruthy();
      expect(hid).toBeTruthy();
      groups.add(gid);
      highlights.add(hid);
    } catch (x) {}
    /* eslint-enable no-empty */
  }

  expect(groups.size).toBe(gc);
  expect(highlights.size).toBe(hc);

  const dl = instance.get();
  expect(dl.groups.size).toBe(gc);
}

export function selectionRange(range) {
  assert.isNotNull(range, 'have selection range');
  assert.isObject(range);
  assert.isFunction(range.computeXpath);

  const xpath = range.computeXpath();
  assert.isObject(xpath);
  assert.property(xpath, 'start', 'xpath has valid structure');
  assert.deepProperty(xpath, 'start.xpath', 'xpath has valid structure');
  assert.deepProperty(xpath, 'start.offset', 'xpath has valid structure');
  assert.property(xpath, 'end', 'xpath has valid structure');
  assert.deepProperty(xpath, 'end.xpath', 'xpath has valid structure');
  assert.deepProperty(xpath, 'end.offset', 'xpath has valid structure');
}

export function highlight(id, text) {
  let l = 0;
  let t = '';

  for (const el of instance.querySelectorAll(`.hh-highlight-id-${id}`)) {
    l += ops.lengthOf(el);
    t += ops.textOf(el);
  }

  assert.strictEqual(t, text, 'expected highlight text');
  assert.strictEqual(l, text.length, 'expected highlight length');
}

export function cursor(position, total = null) {
  const hl = instance.get();
  assert.strictEqual(hl.cursor.total, total == null ? hl.stats.total : total);
  assert.strictEqual(hl.cursor.index, position);
}

export function currentHighlight(id) {
  const el = document.querySelector(`.hh-highlight-id-${id}`);
  assert.ok(el != null);
  assert.ok(el.classList.contains('hh-enabled'));
}

// function className(element: Element, className: string | Array<string>): void {
export function className(element, classNames) {
  const elc = tools.classNameToSet(element.className);
  const cmpc = tools.classNameToSet(classNames);

  assert.strictEqual(elc.size, cmpc.size);
  for (const cl of elc) {
    assert.ok(cmpc.has(cl));
  }
}

// function classNameAll(elements: NodeList<Element>, classNames: string | Array<string>): void {
export function classNameAll(elements, classNames) {
  for (const el of elements) {
    className(el, classNames);
  }
}

export function snapshot(old) {
  const current = instance.snapshot();
  assert.deepEqual(current, old);
}
