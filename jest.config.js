module.exports = {
  bail: false,
  verbose: true,
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.js?$',
  testEnvironment: 'jsdom',
  reporters: ['default', 'jest-junit'],
};
