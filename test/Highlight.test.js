// @flow

import DOMHighlighter from '../src/DOMHighlighter';
import Group from '../src/Group';
import Highlight from '../src/Highlight';
import TextRange from '../src/TextRange';

import { instance, attest, tests, counts } from './helpers';

describe('Highlight', function() {
  let dh: DOMHighlighter, group, fauxTextRange;

  beforeEach(() => {
    dh = instance.init();
    group = dh.create('standard');
    fauxTextRange = new TextRange(
      dh.content,
      { marker: dh.content.markers[0], offset: 0 },
      { marker: dh.content.markers[1], offset: 0 }
    );
  });

  afterEach(() => {
    dh = (null: any);
  });

  it('is active by default', () => {
    let hl;
    dh.query(tests.overlapping.queries[0], hit => (hl = group.highlight(hit)));
    attest.totalHighlightsInDOM(1, 1);
    if (hl == null) throw new Error('null highlight');
    hl.elements[0].getBoundingClientRect = () => ({ height: 1, width: 1 });
    expect(hl.isActive()).toBe(true);
  });

  it('is not active when empty', () => {
    const hl = new Highlight(group, 'faux-id', fauxTextRange);
    expect(hl.isActive()).toBe(false);
  });

  it('is not active when not enabled', () => {
    const hl = new Highlight(group, 'faux-id', fauxTextRange);
    hl.setEnabled(false);
    expect(hl.isActive()).toBe(false);
  });

  it('is not active when group not enabled', () => {
    const hl = new Highlight(group, 'faux-id', fauxTextRange);
    group.setEnabled(false);
    expect(hl.isActive()).toBe(false);
  });

  it('emits event when removing', () => {
    let hl, removed;
    dh.query(tests.overlapping.queries[0], hit => (hl = group.highlight(hit)));
    attest.totalHighlightsInDOM(1, 1);
    if (hl == null) throw new Error('null highlight');
    hl.once('remove', () => (removed = true));
    hl.remove();
    expect(removed).toBe(true);
  });

  it('removes all highlight nodes', () => {
    let hl;
    dh.query(tests.overlapping.queries[0], hit => (hl = group.highlight(hit)));
    attest.totalHighlightsInDOM(1, 1);
    if (hl == null) throw new Error('null highlight');
    hl.elements.forEach(el => expect(el.parentNode).toBeTruthy());
    hl.remove();
    hl.elements.forEach(el => expect(el.parentNode).toBeFalsy());
  });

  it('contains state upon construction', () => {
    const state = { foo: 1, bar: 2 };
    const hl = new Highlight(group, 'faux-id', fauxTextRange, state);
    expect(hl.getState()).toEqual(state);
  });

  it('contains new state', () => {
    const hl = new Highlight(group, 'faux-id', fauxTextRange, { replace: 'this' });
    const newState = { foo: 1, bar: 2 };
    hl.setState(newState);
    expect(hl.getState()).toEqual(newState);
  });
});
