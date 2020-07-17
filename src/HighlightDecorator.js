// @flow

import Highlight from "./Highlight";

export default class HighlightDecorator {
  decorate(elements: Array<HTMLElement>, hl: Highlight): void {
    const groupClass = `dh-highlight-group-${hl.group.id}`;

    for (const el of elements) {
      el.dataset.dhHighlightId = hl.id;
      el.classList.add("dh-highlight", groupClass);

      if (hl.enabled) el.classList.remove("dh-disabled");
      else el.classList.add("dh-disabled");
    }
  }

  setActive(hl: Highlight): void {
    const cl = `dh-highlight-active`;
    for (const el of hl.elements) {
      el.classList.add(cl);
    }
  }

  setInactive(hl: Highlight): void {
    const cl = `dh-highlight-active`;
    for (const el of hl.elements) {
      el.classList.remove(cl);
    }
  }
}
