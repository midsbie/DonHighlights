// @flow

import { DOMHighlighter } from '../src/main';
import Group from '../src/Group';

import { instance } from './helpers';

describe('DOM Highlighter', function() {
  let dh: DOMHighlighter;

  beforeEach(() => {
    dh = instance.init();
  });

  afterEach(() => {
    dh = (null: any);
  });

  it('creates a group', () => {
    const group = dh.create('standard');
    expect(group).toBeInstanceOf(Group);
  });

  it('has created group', () => {
    const group = dh.create('standard');
    expect(dh.has('standard')).toBe(true);
  });

  it('returns created group', () => {
    const group = dh.create('standard');
    expect(dh.group('standard')).toBe(group);
  });

  it('does not allow creation of group that already exists', () => {
    const group = dh.create('standard');
    expect(() => dh.create('standard')).toThrow();
  });

  it('removes all groups', () => {
    const g1 = dh.create('group-one');
    expect(dh.groups.size).toBe(1);
    const g2 = dh.create('group-two');
    expect(dh.groups.size).toBe(2);
    dh.clear();
    expect(dh.groups.size).toBe(0);
  });

  it('emits event when removing group', () => {
    let count = 0;
    dh.on('remove', () => ++count);

    const g1 = dh.create('group-one');
    expect(dh.groups.size).toBe(1);
    const g2 = dh.create('group-two');
    expect(dh.groups.size).toBe(2);
    dh.clear();
    expect(dh.groups.size).toBe(0);
    expect(count).toBe(2);
  });

  it('sets default container to document body', () => {
    expect(dh.container).toBe(document.body);
    expect(dh.content.root).toBe(document.body);
  });

  it('sets arbitrary container', () => {
    const div = document.createElement('div');
    dh.setContainer(div);
    expect(dh.container).toBe(div);
    expect(dh.content.root).toBe(div);
  });
});
