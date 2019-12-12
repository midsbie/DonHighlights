// @flow

import RangeTranslator from '../../src/RangeTranslator';

import * as instance from './instance';
import * as attest from './attest';
import { tests } from './tests';

export function dedup(arr) {
  const seen = {};
  const result = [];

  for (let i = 0, l = arr.length; i < l; ++i) {
    const j = getHighlightID(arr[i]);

    if (seen[j] !== true) {
      seen[j] = true;
      result.push(j);
    }
  }

  return result;
}

export function select(sn, so, en, eo) {
  let result;
  const range = document.createRange();
  const sel = window.getSelection();

  if (!sel) {
    throw new Error('Unsupported: window.getSelection');
  }

  const { highlighter, container } = instance.get('all');
  container.style.display = 'block';
  highlighter.clearSelectedRange();

  range.setStart(sn, so);
  range.setEnd(en, eo);

  sel.removeAllRanges();
  sel.addRange(range);

  result = RangeTranslator.fromHighlighter(highlighter).translate();
  container.style.display = 'none';

  return result;
}

export function firstTextOf(node) {
  if (node.nodeType === 3) {
    return node;
  }

  for (let i = 0, l = node.childNodes.length; i < l; ++i) {
    node = firstTextOf(node.childNodes[i]);
    if (node !== null) {
      return node;
    }
  }

  return null;
}

export function lastTextOf(node) {
  if (node.nodeType === 3) {
    return node;
  }

  for (let i = node.childNodes.length - 1; i >= 0; --i) {
    node = firstTextOf(node.childNodes[i]);
    if (node !== null) {
      return node;
    }
  }

  return null;
}

export function lengthOf(node) {
  if (node.nodeType === 3) {
    return node.nodeValue.length;
  }

  let length = 0;
  for (let i = 0, l = node.childNodes.length; i < l; ++i) {
    length += lengthOf(node.childNodes[i]);
  }

  return length;
}

export function textOf(node) {
  if (node.nodeType === 3) {
    return node.nodeValue;
  }

  let text = '';
  for (let i = 0, l = node.childNodes.length; i < l; ++i) {
    text += textOf(node.childNodes[i]);
  }

  return text;
}

export function selectStandard() {
  const p = instance.querySelectorAll('p')[2];
  const ft = firstTextOf(p);
  const lt = lastTextOf(p);
  let result;

  expect(p.childNodes.length).toBeGreaterThan(1);
  expect(ft).not.toBeNull();
  expect(lt).not.toBeNull();

  try {
    result = select(ft, 0, lt, lt.nodeValue.length);
  } catch (x) {
    console.error('`window.document.createRange` unavailable in jsdom env: test disabled');
    return null;
  }

  const prefix = '/html[1]/body[1]';
  attest.selectionRange(result);
  expect(result.computeXpath()).toEqual({
    end: { offset: 260, xpath: `${prefix}/p[3]/text()[1]` },
    start: { offset: 0, xpath: `${prefix}/p[3]/a[1]/text()[1]` },
  });
  return result;
}

export function highlight(name, qsetname) {
  if (qsetname === undefined) {
    qsetname = name;
  }

  const hl = instance.get();
  const test = tests[name];
  return hl.add('test-' + qsetname, [test.xpath]).then(result => {
    attest.highlight(hl.lastId - 1, test.text);
    return result;
  });
}

export function getHighlightID(cl) {
  return cl.className.match(/hh-highlight-id-(\d+)/)[1];
}
