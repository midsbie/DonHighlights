// @flow

export * as instance from './instance';
export * as attest from './attest';

// The following form does not seem to work:
//   export * from './tests';
import { documents, counts, tests } from './tests';
export { documents, counts, tests };
