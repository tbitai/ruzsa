# Developer documentation

[![Deploy status](https://img.shields.io/netlify/ea5f46df-0fa4-4673-bca9-a5b378b76dd1?label=deploy&logo=netlify&style=flat-square)](https://app.netlify.com/sites/ruzsa/deploys)
[![Documentation status](https://img.shields.io/readthedocs/ruzsa/stable?logo=read-the-docs&style=flat-square)](https://readthedocs.org/projects/ruzsa/builds)
[![Dependencies status](https://img.shields.io/david/tbitai/ruzsa?logo=npm&style=flat-square)](https://david-dm.org/tbitai/ruzsa)
[![Development dependencies status](https://img.shields.io/david/dev/tbitai/ruzsa?logo=npm&style=flat-square)](https://david-dm.org/tbitai/ruzsa?type=dev)
[![Requirements status](https://img.shields.io/requires/github/tbitai/ruzsa?logo=pypi&style=flat-square)](https://requires.io/github/tbitai/ruzsa/requirements/?branch=master)

## Getting started

Clone the repo:

```sh
git clone git@github.com:tbitai/ruzsa.git
```

Install dependencies:

```sh
npm install
```

Build in development mode and start LiveReload development server:

```sh
npm run dev
```

## Testing

A good general test case is to prove the first exercise from Fitch's first-order [video tutorial](https://youtu.be/uw44RB2A4uQ) 
(available on the Openproof Courseware website's [video tutorials page](https://www.gradegrinder.net/Support/videoTutorial.html)):

```math
\newcommand{\Tet}{\mathrm{Tet}}
\newcommand{\Small}{\mathrm{Small}}

& ∃x\ \Tet(x) \\
& ∀x\ (\Tet(x) → \Small(x)) \\
& ∴\ ∃x\ \Small(x) \\
```

## Version bumping

1. Increase `"version"` in `package.json`.
2. `git tag` new version.
3. Add new section to [`RELEASES.md`](RELEASES.md), following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) 
   and the conventions of earlier releases' notes.

## Deploying

Build in production mode:

```sh
npm run build
```

Deploy to production...

```sh
npm run deploy-production
```

... or to staging:

```sh
npm run deploy-staging
```

## Documentation

The documentation is under the `docs` directory. In the following commands we assume that's the current directory.

Set up environment according to `.readthedocs.yml`, installing requirements ([Sphinx](https://www.sphinx-doc.org) etc.):

```sh
mkvirtualenv ruzsa-docs -p python3.8 -r requirements.txt 
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