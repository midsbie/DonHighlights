// @flow

import DOMHighlighter from '../src/DOMHighlighter';
import TextFinder from '../src/TextFinder';

import { instance } from './helpers';

describe('TextFinder', () => {
  it('throws exception if regular expression not global', () => {
    const dh = instance.init();
    expect(() => new TextFinder(dh.content, new RegExp('test'))).toThrow();
    expect(() => new TextFinder(dh.content, new RegExp('test', 'i'))).toThrow();
    expect(() => new TextFinder(dh.content, new RegExp('test'))).toThrow();
    expect(() => new TextFinder(dh.content, TextFinder.createSafeRegExp('test', ''))).toThrow();
    expect(() => new TextFinder(dh.content, TextFinder.createSafeRegExp('test', 'i'))).toThrow();
  });

  it('does not throw exception if regular expression global', () => {
    const dh = instance.init();
    expect(() => new TextFinder(dh.content, new RegExp('test', 'g'))).not.toThrow();
    expect(() => new TextFinder(dh.content, new RegExp('test', 'gi'))).not.toThrow();
    expect(() => new TextFinder(dh.content, TextFinder.createSafeRegExp('test'))).not.toThrow();
    expect(
      () => new TextFinder(dh.content, TextFinder.createSafeRegExp('test', 'g'))
    ).not.toThrow();
    expect(
      () => new TextFinder(dh.content, TextFinder.createSafeRegExp('test', 'gi'))
    ).not.toThrow();
  });
});
