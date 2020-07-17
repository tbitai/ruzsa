# Development

## Getting started

Clone the repo:

```sh
git clone git@github.com:tbitai/ruzsa.git
```

Install dependencies:

```sh
npm install
```

Build:

```sh
npm run build
```

Start:

```sh
npm start
```

Besides the `build` NPM script, scripts for the individual build steps are available for using during development. Have 
a look at the `package.json`'s `"scripts"` field to examine them!

## Deploying

Make a build for deployment:

```sh
npm run build-for-deploy
```

Deploy to production...

```sh
npm run deploy
```

... or to staging:

```sh
npm run deploy-staging
```

## Documentation

The documentation is under the `docs` directory. In the following commands we assume that's the current directory.

Install requirements ([Sphinx](https://www.sphinx-doc.org) etc.):

```sh
pip install -r requirements.txt
```

Build:

```sh
./build_html.sh
```

Continuous deployment is set up to [Read the Docs](https://ruzsa.readthedocs.io). On every push to 
[GitHub](https://github.com/tbitai/ruzsa), deployment is triggered. Two versions are deployed:
* [`/en/stable`](https://ruzsa.readthedocs.io/en/stable) — the commit with the highest stable (i.e., non pre-release) 
  version tag.
* [`/en/latest`](https://ruzsa.readthedocs.io/en/latest) — the latest commit on `master`. This version is hidden, but it 
  can be accessed via the URL (well, or from here 🤓).