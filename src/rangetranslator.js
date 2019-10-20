// @flow

import merge from 'merge';

import logger from './logger';
import * as selection from './selection';
import HtmlHighlighter from './htmlhighlighter';
import TextContent from './textcontent';
import TextRange from './textrange';

/**
 * Support for translation of arbitrary ranges
 *
 * This class is an extension of HTML Highlighter which provides support for translation of
 * arbitrary browser `Range` instances to internal `TextRange` ones, which can be used to compute
 * XPath descriptors or create highlights.
 */
class RangeTranslator {
  content: TextContent;

  static fromHtmlHighlighter(instance: HtmlHighlighter): RangeTranslator {
    return new RangeTranslator(instance.content);
  }

  constructor(content: TextContent) {
    this.content = content;
  }

  /* eslint-disable complexity, max-statements */
  /**
   * Return the current selected text range in the form of a `TextRange` object
   *
   * If there is no selected text, `null` is returned.
   *
   * @param {Range} [range] - Optional range to translate.  If omitted, the range associated with
   * the current browser selection is used instead.
   *
   * @returns {TextRange|null} The current selected text range or `null` if it could not be
   * computed.
   */
  translate(range?: Range): TextRange | null {
    // Default to current browser selection if range omitted.
    if (range == null) {
      const sel = window.getSelection();
      if (sel == null) {
        return null;
      }

      range = sel.getRangeAt(0);
      if (range == null) {
        return null;
      }
    }

    let start, end;
    try {
      start = selection.getNormalizedStartBoundaryPoint(range);
      end = selection.getNormalizedEndBoundaryPoint(range);
    } catch (x) {
      logger.error('unable to compute boundary points:', x);
      return null;
    }

    if (start.node.nodeType !== Node.TEXT_NODE || end.node.nodeType !== Node.TEXT_NODE) {
      logger.info('selection anchor or focus node(s) not text: ignoring');
      return null;
    }

    // Account for selections where the start and end elements are the same *and* whitespace exists
    // longer than one character to account for the fact that browsers collapse whitespace.  For
    // instance, the element `<p>a b</p>` would be rendered as `a b`.  This means that in this
    // particular case, it is not possible to simply retrieve the length of the selection's text
    // and use that as the selection's end offset as it would be invalid.  The way to avoid
    // calculating an invalid end offset is by looking at the anchor and focus (start and end)
    // offsets.  Strangely, if the selection spans more than one element, one may simply use the
    // length of the selected text regardless of the occurrence of whitespace in between.
    const len =
      start.node === end.node ? Math.abs(end.offset - start.offset) : range.toString().length;
    if (len <= 0) {
      return null;
    }

    // Determine start and end indices in text offset markers array
    const startOffset = this.content.find(start.node);
    const endOffset = start.node === end.node ? startOffset : this.content.find(end.node);
    if (startOffset < 0 || endOffset < 0) {
      logger.error(
        'unable to retrieve offset of selection anchor or focus node(s):',
        range.startContainer,
        start.node,
        range.endContainer,
        end.node
      );
      return null;
    }

    // Create start and end range descriptors, whilst accounting for inverse selection where the
    // user selects text in a right to left orientation.
    let startDescr, endDescr;
    if (startOffset < endOffset || (startOffset === endOffset && start.offset < end.offset)) {
      startDescr = TextRange.descriptorRel(this.content.at(startOffset), start.offset);

      if (start.node === end.node) {
        endDescr = merge({}, startDescr);
        endDescr.offset += len - 1;
      } else {
        endDescr = TextRange.descriptorRel(this.content.at(endOffset), end.offset - 1);
      }
    } else {
      startDescr = TextRange.descriptorRel(this.content.at(endOffset), end.offset);

      if (end.node === start.node) {
        endDescr = merge({}, startDescr);
        endDescr.offset += len - 1;
      } else {
        endDescr = TextRange.descriptorRel(this.content.at(startOffset), start.offset - 1);
      }
    }

    return new TextRange(this.content, startDescr, endDescr);
  }
  /* eslint-enable complexity, max-statements */
}

export default RangeTranslator;
