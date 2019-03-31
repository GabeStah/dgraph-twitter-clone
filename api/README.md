# Dgraph Twitter Clone - API

An Node/Express-based REST API for handling Dgraph Twitter Clone - Client requests.

## Prerequisites

The Dgraph 'trio' should be up and running.  All development was performed using a locally-installed Dgraph via the documentation's [Docker Compose](https://docs.dgraph.io/get-started/#docker-compose) file.

## Install

Install with Yarn or NPM.

```bash
$ yarn install
```

### dgraph-query-manager Package

Since the `packages/dgraph-query-manager` module isn't published to NPM it must be made available locally to the API and Client apps.  This is accomplished via the [`Yalc`](https://github.com/whitecolor/yalc) library, along with a few Gulp tasks in the root `dgraph-twitter-clone` directory.

First, make sure `yarn install` is executed in the root `dgraph-twitter-clone` directory to install required modules.  Then, perform a full rebuild of the `dgraph-query-manager` package by running the `gulp default` task:

```bash
$ gulp default
[03:02:38] Requiring external module @babel/register
[03:02:39] Using gulpfile D:\work\dgraph\projects\dgraph-twitter-clone\gulpfile.babel.js
[03:02:39] Starting 'default'...
[03:02:39] Starting 'packages:remove:modules'...
[03:02:39] Starting 'cleanupPackageDirectories'...
[03:02:40] Finished 'cleanupPackageDirectories' after 1.6 s
[03:02:40] Finished 'packages:remove:modules' after 1.6 s
[03:02:40] Starting 'packages:install:modules'...
[03:02:40] Starting 'installPackageModules'...
[03:02:47] Finished 'installPackageModules' after 6.47 s
[03:02:47] Finished 'packages:install:modules' after 6.47 s
[03:02:47] Starting 'packages:build'...
[03:02:47] Starting 'buildPackage'...
[03:02:49] Finished 'buildPackage' after 1.93 s
[03:02:49] Starting 'bumpVersion'...
[03:02:49] Bumped 0.6.34 to 0.6.35 with type: patch
[03:02:49] Finished 'bumpVersion' after 9.82 ms
[03:02:49] Starting 'publishToYalc'...
[03:02:49] Finished 'publishToYalc' after 278 ms
[03:02:49] Finished 'packages:build' after 2.22 s
[03:02:49] Finished 'default' after 10 s
```

This removes and reinstalls `node_modules`, rebuilds the `dist` output, bumps the version, and publishes the `dgraph-query-manager` package to the **local** `Yalc` repository on the machine.

Finally, to update the local version of `dgraph-query-manager` in the API or Client application, run `yalc update` within either directory to automatically pull the newest package version published to the local Yalc repo:

```bash
$ yalc update
Package dgraph-query-manager@0.6.34-caf89273 added ==> D:\work\dgraph\projects\dgraph-twitter-clone\api\node_modules\dgraph-query-manager.
```

## Configuration

You may need to change the location to your running Dgraph installation in the `dgraph-adapter` or `dgraph-adapter-http` config files (`dgraph-adapter-http` is the default).

1. Open `packages/dgraph-adapter-http/config/development.ts` (or `production.ts` if applicable).
2. Set the `dgraph.adapter.address` to the Dgraph server endpoint:

```ts
const development = {
    dgraph: {
        adapter: {
            address: 'http://192.168.99.100:8080'
        },
    },
    // ...
}
```

## Build

Generate executable code and TypeScript map/definition files by running the `default` Gulp task.

```bash
$ gulp default
```

## Test

Run `yarn test` or manually execute `jest` to execute test suite.

## Running

Start server with `yarn start` or manual node command:

```bash
$ node -r ts-node/register dist/app.js --inspect
```

OR

```bash
$ nodemon -r ts-node/register dist/app.js --inspect
```

## Design

### Models and Packages

All helper packages and classes discussed below have now been added to the `dgraph-query-manager` module.
 
A handful of models were created after the official [Twitter API](https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/tweet-object) object specifications.  Even though this app doesn't use the Twitter API, it made sense to keep similar naming conventions wherever possible.  The `BaseModel` is the primary model class that provides most child classes with default behaviors.  In general, these models allow for simple manipulation of a `Tweet` or `User` object in the code base, and then can be easily serialized into a format acceptable by Dgraph.  Conversely, the models and the `DgraphAdapter/DgraphAdapterHttp` modules work together to deserialize data returned from Dgraph queries and mutations into data and class instances to be further manipulated.

The `Serialization` class is used throughout both the API and Client applications to help transmit relevant data, such as requests, responses, data, errors, statusCodes, and so forth.

The `dgraph-adapter` and `dgraph-adapter-http` packages are similar and merely use the `dgraph-js` and `dragph-js-http` dependencies, respectively.  Either package can be imported and used interchangeably, but `dgraph-adapter-http` is used by default since it can run in browser-based environments as well as on Node.  A `DgraphAdapter` instance executes all transactions with Dgraph server through the underlying Dgraph client.  By passing `Serialization` instances (and returning `Promise<Serialization>`) other apps and packages can uniformly create and respond to a transaction as expected.

The `dgraph-query-executor` module simplifies the creation and execution of Dgraph queries.  A `Query` class instance specifies an actual query string, an expected `API` route (if applicable), and a collection of required parameters and param types.  [Here](https://github.com/GabeStah/dgraph-twitter-clone-api/blob/master/packages/dgraph-query-executor/queries/tweet-queries.ts) are some simple `Tweet` `Query` definitions.

A `DgraphQueryExecutor` instance accepts optional params and checks the validity against the required params of the specified `Query`, then executes the query and returns a `Promise<Serialization>` for other packages/apps to utilize.

### Routes

Creating a new API endpoint and handling the incoming request and outgoing response is done through the Express router and a `DgraphQueryExecutor` instance.  For example, here's the router logic for the `Tweet.find` query:

```ts
/**
 * Find a Tweet
 */
TweetRoutes.get(Queries.Tweet.find.route,  asyncWrapper(async (req, res) => {
    const executor = new DgraphQueryExecutor(Queries.Tweet.find, { $id: req.params.id });
    const serialization = await executor.execute();
    res.status(serialization.statusCode).send(serialization);
}));
```

The full route endpoint in this case is `api/tweet/:id`, so by passing the `Queries.Tweet.find` query and the relevant params object to a new `DgraphQueryExecutor` we can easily execute the query and return the `Serialization` response.  The goal of this design was to allow the `Dgraph Twitter Clone - Client` to easily run either via direct calls and transactions to the Dgraph server, **or** indirectly through the `Dgraph Twitter Clone - API`.

Check out the [Dgraph Twitter Clone - Client](https://github.com/GabeStah/dgraph-twitter-clone-client) repo for more info.