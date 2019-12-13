// @flow

import Highlight from './Highlight';

export interface IIdGenerator {
  generate(): string;
}

export type ForEachPredicate = Highlight => void;
export type SomePredicate = Highlight => boolean;
