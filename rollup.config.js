import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import jison from 'rollup-plugin-jison';

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
    jison(),
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
      include: ['node_modules/**']
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
      }) : undefined,
    serve({
      contentBase: 'dist',
      port: 8080,
    }),
    livereload('dist'),
  ]
};