// @flow

import Group from './Group';

export function abstract() {
  throw new Error('Abstract method not implemented');
}

export function groupNamesToGroupSet(names: Array<string>, all: Map<string, Group>): Set<Group> {
  return names.reduce((map, name) => {
    const g = all.get(name);
    if (g == null) {
      console.error('invalid group name or not found:', name);
    } else {
      map.add(g);
    }

    return map;
  }, new Set());
}
