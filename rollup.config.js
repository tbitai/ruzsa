import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import jison from 'rollup-plugin-jison';
import copy from 'rollup-plugin-copy';
import clear from 'rollup-plugin-clear';
import execute from 'rollup-plugin-execute';

const isDev = process.env.BUILD === 'dev';
export default {
  input: 'src/js/app.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    sourcemap: isDev,
    globals: {
      angular: 'angular'
    },
  },
  watch: {
    exclude: 'docs/**',
  },
  plugins: [
    !isDev ? clear({
      targets: ['dist'],
    }) : undefined,
    copy({
      targets: [
        {src: 'src/app.html', dest: 'dist', rename: 'index.html'},
        {src: 'src/img', dest: 'dist'},
        {src: 'node_modules/roboto-fontface/fonts/roboto', dest: 'dist/fonts'},
        {src: 'node_modules/material-design-icons/iconfont/MaterialIcons-Regular.*', dest: 'dist/fonts/material-icons'},
      ],
    }),
    execute(
      `node-sass ${isDev ? '--source-map true' : '--output-style compressed'} src/stylesheets/main.sass dist/bundle.css`
    ),
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
      preferBuiltins: false,
    }),
    commonjs({
      include: ['node_modules/**']
    }),
    !isDev ?
      terser({
        output: {
          comments: function(node, comment) {
            if (comment.type === "comment2") {
              return /@preserve|@license|@cc_on/i.test(comment.value);
            }
          }
        }
      }) : undefined,
    isDev ? serve('dist') : undefined,
    isDev ? livereload('dist') : undefined,
  ]
};