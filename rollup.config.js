import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'js/app.js',
  dest: 'js/bundle.js', // equivalent to --output
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

    // Convert CommonJS modules to ES6, so they can be included in the bundle
    commonjs({
      include: 'node_modules/**'
    })
  ]
};
