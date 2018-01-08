import $ from 'jquery';

/* eslint-disable camelcase */
import { Css } from './consts.js';
import { is_arr, inview, scrollIntoView } from './util.js';
/* eslint-enable camelcase */

/**
 * Class responsible for managing the state of the highlight cursor
 *
 * @param {Object} owner - Reference to the owning instance.
 * */
class Cursor {
  constructor(owner) {
    this.owner = owner;
    this.index = -1;
    this.iterableQueries = null;
    this.total = 0;
    this.setIterableQueries(null);
  }

  /**
   * Clear the current cursor state and recalculate number of total iterable highlights */
  clear() {
    this.clearActive_();
    this.index = -1;
    this.update();
  }

  /**
   * Set or clear the query sets that the cursor can move through
   *
   * When one or more query sets are specified, cursor movement is restricted to the specified
   * query sets.  When setting the cursor offset, the offset will then apply within the context of
   * the active iterable query sets.
   *
   * The restriction can be lifted at any time by passing `null` to the method.
   *
   * @param {(Array|string)} queries - An array (or string) containing the query set names.
   */
  setIterableQueries(queries) {
    if (queries === null) {
      this.iterableQueries = null;
    } else {
      this.iterableQueries = is_arr(queries) ? queries.slice() : [queries];
    }

    this.clear();
  }

  /**
   * Update the total of iterable highlights
   *
   * Does **not** update the UI state.  The caller is responsible for doing so.
   */
  update() {
    const iterable = this.iterableQueries;
    if (iterable === null) {
      this.total = this.owner.stats.total;
      return;
    } else if (iterable.length === 0) {
      this.total = 0;
      return;
    }

    let markers = this.owner.highlights;
    let total = 0;
    for (let i = markers.length - 1; i >= 0; --i) {
      if (iterable.indexOf(markers[i].query.name) >= 0) {
        ++total;
      }
    }

    this.total = total;
  }

  /**
   * Set cursor to query referenced by absolute query index
   *
   * @param {integer} index - Virtual cursor index
   * @param {boolean} dontRecurse - When `true` instructs the method not to employ recursion
   */
  set(index, dontRecurse) {
    const owner = this.owner;
    const markers = owner.highlights;

    if (index < 0) {
      throw new Error('Invalid cursor index specified: ' + index);
    } else if (owner.stats.total <= 0) {
      return;
    }

    let count = index;
    let ndx = null;
    const iterable = this.iterableQueries;

    markers.some(function(m, i) {
      const q = m.query;
      if (!q.enabled) {
        return false;
      } else if (iterable !== null && iterable.indexOf(q.name) < 0) {
        return false;
      } else if (count === 0) {
        ndx = i;
        return true;
      }

      --count;
      return false;
    });

    // If index overflown, set to first highlight
    if (ndx === null) {
      if (!dontRecurse) {
        this.set(0, true);
      }
      return;
    }

    // Clear currently active highlight, if any, and set requested highlight active
    this.clearActive_();
    const c = markers[ndx];
    let $el = $('.' + Css.highlight + '-id-' + (c.query.id + c.index))
      .addClass(Css.enabled)
      .eq(0);

    // Scroll viewport if element not visible
    if (typeof owner.options.scrollTo !== 'undefined') {
      owner.options.scrollTo($el);
    } else if (!inview($el)) {
      scrollIntoView($el, owner.options.scrollNode);
    }

    this.index = index;
  }

  // Private interface
  // -----------------
  /**
   * Clear the currently active cursor highlight
   *
   * The active cursor highlight is the element or elements at the current cursor position.
   * @access private
   */
  clearActive_() {
    $('.' + Css.highlight + '.' + Css.enabled).removeClass(Css.enabled);
  }
}

export default Cursor;
