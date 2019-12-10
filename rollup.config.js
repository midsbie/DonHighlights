import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const extensions = ['.js'];

const babelRuntimeVersion = pkg.dependencies['@babel/runtime'].replace(/^[^0-9]*/, '');

const makeExternalPredicate = externalArr => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
  return id => pattern.test(id);
};

const input = 'src/main.js';

export default [
  // CommonJS
  {
    input,
    output: { file: 'lib/html-highlighter.js', format: 'cjs', indent: false },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ]),
    plugins: [
      nodeResolve({
        extensions,
      }),
      babel({
        extensions,
        plugins: [['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }]],
        runtimeHelpers: true,
      }),
    ],
  },

  // ES
  {
    input,
    output: { file: 'es/html-highlighter.js', format: 'es', indent: false },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ]),
    plugins: [
      nodeResolve({
        extensions,
      }),
      babel({
        extensions,
        plugins: [
          ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion, useESModules: true }],
        ],
        runtimeHelpers: true,
      }),
    ],
  },

  // ES for Browsers
  {
    input,
    output: { file: 'es/html-highlighter.mjs', format: 'es', indent: false },
    plugins: [
      nodeResolve({
        extensions,
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      babel({
        extensions,
        exclude: 'node_modules/**',
        plugins: [
          '@babel/plugin-transform-flow-strip-types',
          '@babel/plugin-proposal-export-default-from',
          '@babel/plugin-proposal-export-namespace-from',
          '@babel/plugin-proposal-object-rest-spread',
          '@babel/plugin-proposal-class-properties',
        ],
      }),
      commonjs(),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },

  // UMD Development
  {
    input,
    output: {
      file: 'dist/html-highlighter.js',
      format: 'umd',
      name: 'HTML Highlighter',
      indent: false,
    },
    plugins: [
      nodeResolve({
        extensions,
      }),
      babel({
        extensions,
        exclude: 'node_modules/**',
      }),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
    ],
  },

  // UMD Production
  {
    input,
    output: {
      file: 'dist/html-highlighter.min.js',
      format: 'umd',
      name: 'HTML Highlighter',
      indent: false,
    },
    plugins: [
      nodeResolve({
        extensions,
      }),
      babel({
        extensions,
        exclude: 'node_modules/**',
      }),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },
];
