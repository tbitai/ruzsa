import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';

export default {
  input: 'js/app.js',
  output: {
    file: 'dist/js/bundle.js',
    format: 'iife',
    sourcemap: true,
    globals: {
      angular: 'angular'
    },
  },
  plugins: [
    json({
      include: 'package.json'
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: ['node_modules/**'],
    }),
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs({
      include: ['node_modules/**', 'js/lib/tarskiFOL.js']
    }),
    process.env.BUILD !== 'dev' ?
      terser({
        output: {
          comments: function(node, comment) {
            if (comment.type === "comment2") {
              return /@preserve|@license|@cc_on/i.test(comment.value);
            }
          }
        }
      }) : undefined
  ]
};