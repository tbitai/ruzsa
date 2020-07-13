# Development

After cloning the repo, install the dependencies:

```shell
npm install
```

Build:

```shell
npm run build
```

Serve the project root directory (not the `dist` directory!) with a static server, for example if you have Python 3, you can run the included `dev_server.py` script, and the app will be available at `http://localhost:8000/dist`. (You can customize the host and the port, run `python dev_server.py --help` to see all the available options of the script.)

Serving the project root directory is necessary in order to use the source map files, which point outside of the `dist` directory.

Besides the `build` NPM script, scripts for the individual build steps are available for using during development. Have a look at the `package.json`'s `"scripts"` field to examine them!

## Deploying

Make a build for deployment:

```shell
npm run build-for-deploy
```

Deploy to production...

```shell
npm run deploy
```

... or to staging:

```shell
npm run deploy-staging
```
