// @flow

import DOMHighlighter from '../src/DOMHighlighter';
import Group from '../src/Group';

import { instance, attest, tests, counts } from './helpers';

describe('Group', function() {
  let dh: DOMHighlighter, group: Group;

  beforeEach(() => {
    dh = instance.init();
    group = dh.create('standard');
  });

  afterEach(() => {
    dh = (null: any);
  });

  it('creates a group and highlights text matches', () => {
    dh.query('the', hit => group.highlight(hit));
    attest.totalHighlights(counts.the, 1);
  });

  it('creates a group and highlights multiple text matches', () => {
    dh.query('the', hit => group.highlight(hit));
    dh.query('viber', hit => group.highlight(hit));
    attest.totalHighlights(counts.the + counts.viber, 1);
  });

  it('emits event when removed', () => {
    let removed = false;
    dh.query('the', hit => group.highlight(hit));
    group.on('remove', () => (removed = true));
    group.remove();
    expect(removed).toBe(true);
  });

  it('clears internal state after removing single group', () => {
    dh.query('the', hit => group.highlight(hit));
    group.remove();
    expect(group.highlights.size).toBe(0);
  });

  it('clears DOM correctly after removing single group', () => {
    const text = (document.body: any).textContent;
    dh.query('the', hit => group.highlight(hit));
    dh.query('viber', hit => group.highlight(hit));
    dh.clear();
    attest.totalHighlights(0, 0);
    expect((document.body: any).textContent).toBe(text);
  });

  it('removes correct group when multiple exist', () => {
    dh.query('the', hit => group.highlight(hit));
    attest.totalHighlights(counts.the, 1);

    const text = (document.body: any).textContent;
    const viber = dh.create('viber');
    dh.query('viber', hit => viber.highlight(hit));
    attest.totalHighlights(counts.the + counts.viber, 2);

    group.remove();
    attest.totalHighlights(counts.viber, 1);
    expect((document.body: any).textContent).toBe(text);
  });

  it('restores document after removing multiple groups', () => {
    const text = (document.body: any).textContent;
    dh.query('the', hit => group.highlight(hit));
    const viber = dh.create('viber');
    dh.query('viber', hit => viber.highlight(hit));

    dh.clear();
    attest.totalHighlights(0, 0);
    expect((document.body: any).textContent).toBe(text);
  });

  it('restores document after removing group with overlapping highlights', () => {
    const text = (document.body: any).textContent;
    tests.overlapping.queries.forEach(q => dh.query(q, hit => group.highlight(hit)));
    attest.totalHighlights(counts.overlapping);

    dh.clear();
    attest.totalHighlights(0, 0);
    expect((document.body: any).textContent).toBe(text);
  });
});
