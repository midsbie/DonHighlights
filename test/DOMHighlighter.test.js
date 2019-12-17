// @flow

import { DOMHighlighter } from '../src';
import Group from '../src/Group';

import { instance, counts } from './helpers';

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

  it('reset removes all groups', () => {
    const g1 = dh.create('group-one');
    expect(dh.groups.size).toBe(1);
    const g2 = dh.create('group-two');
    expect(dh.groups.size).toBe(2);
    dh.reset();
    expect(dh.groups.size).toBe(0);
  });

  it('emits event for each group removed during reset', () => {
    let count = 0;
    dh.on('remove', () => ++count);

    const g1 = dh.create('group-one');
    expect(dh.groups.size).toBe(1);
    const g2 = dh.create('group-two');
    expect(dh.groups.size).toBe(2);
    dh.reset();
    expect(dh.groups.size).toBe(0);
    expect(count).toBe(2);
  });

  it('emits event when manually removing group', () => {
    let count = 0;
    dh.on('remove', () => ++count);

    const g1 = dh.create('yellow');
    expect(dh.groups.size).toBe(1);
    dh.group('yellow').remove();
    expect(dh.groups.size).toBe(0);
    expect(count).toBe(1);
  });

  it('does not remove groups when clearing', () => {
    const g1 = dh.create('group-one');
    expect(dh.groups.size).toBe(1);
    const g2 = dh.create('group-two');
    expect(dh.groups.size).toBe(2);
    dh.clear();
    expect(dh.groups.size).toBe(2);
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

  it('counts number of highlights', () => {
    const group = dh.create('test');
    dh.query('the', hit => group.highlight(hit));
    expect(dh.count()).toBe(counts.the);
  });

  it('produces highlight event when highlighting from query hit', () => {
    let count = 0;
    const group = dh.create('test');
    dh.on('highlight', () => ++count);
    dh.query('the', hit => group.highlight(hit));
    expect(count).toBe(counts.the);
  });

  it('produces unhighlight events when clearing', () => {
    let count = 0;
    const group = dh.create('test');
    dh.on('unhighlight', () => ++count);
    dh.query('the', hit => group.highlight(hit));
    dh.clear();
    expect(count).toBe(counts.the);
  });

  it('throws exception when XPath query fails', () => {
    const group = dh.create('test');
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      dh.query(
        {
          start: { xpath: '/path/to/nowhere', offset: 0 },
          end: { xpath: '/path/to/nowhere', offset: 0 },
        },
        hit => group.highlight(hit)
      )
    ).toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('throws exception on invalid query', () => {
    const group = dh.create('test');
    expect(() => dh.query(({}: any), () => {})).toThrow();
    expect(() => dh.query((12321: any), () => {})).toThrow();
  });
});
