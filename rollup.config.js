import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import json from 'rollup-plugin-json';

var config = {
  entry: 'js/app.js',
  dest: 'dist/js/bundle.js', // equivalent to --output
  format: 'iife',
  sourceMap: true,
  globals: {
      angular: 'angular'
  },
  plugins: [
    nodeResolve({
        // use "module" field for ES6 module if possible
        module: true, // Default: true

        // use "jsnext:main" if possible
        // – see https://github.com/rollup/rollup/wiki/jsnext:main
        jsnext: true,  // Default: false

        // use "main" field or index.js, even if it's not an ES6 module
        // (needs to be converted from CommonJS to ES6
        // – see https://github.com/rollup/rollup-plugin-commonjs
        main: true,  // Default: true

        // if there's something your bundle requires that you DON'T
        // want to include, add it to 'skip'. Local and relative imports
        // can be skipped by giving the full filepath. E.g.,
        // `path.resolve('src/relative-dependency.js')`
        skip: [],  // Default: []

        // some package.json files have a `browser` field which
        // specifies alternative files to load for people bundling
        // for the browser. If that's you, use this option, otherwise
        // pkg.browser will be ignored
        browser: true,  // Default: false

        // not all files you want to resolve are .js files
        extensions: ['.js'],  // Default: ['.js']

        // whether to prefer built-in modules (e.g. `fs`, `path`) or
        // local ones with the same names
        preferBuiltins: false  // Default: true
    }),
    commonjs({
      include: ['node_modules/**', 'js/lib/tarskiPL.js']
    }),
    json({
      include: 'package.json'
    })
  ]
};
if (process.env.BUILD !== 'dev') {
  config.plugins.push(
    uglify({
      output: {
        // Preserve license comments.
        comments: function(node, comment) {
            var text = comment.value;
            var type = comment.type;
            if (type == "comment2") {
                // multiline comment
                return /@preserve|@license|@cc_on/i.test(text);
            }
        }
      }
    })
  );
}
export default config;
