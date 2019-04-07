# Dgraph Twitter Clone

A Twitter clone using [Dgraph.io](https://dgraph.io/) for back end data management and [React](https://reactjs.org/) for front end UI.

## Installation

1.  Clone the [`GabeStah/dgraph-twitter-clone`](https://github.com/GabeStah/dgraph-twitter-clone) Git repository to a local directory.

    ```bash
    $ git clone https://github.com/GabeStah/dgraph-twitter-clone.git
    $ cd dgraph-twitter-clone
    ```

2.  Make sure Dgraph Alpha is installed and running. By default the Dgraph Alpha server is available at `localhost:8080`, but if you changed this endpoint during your installation, you'll need to update the configuration to match your setup. To do so open the `packages/dgraph-query-manager/src/config/development.ts` file and change the `dgraph.adapter.address` to your Dgraph Alpha server endpoint.

    ```ts
    // File: packages/dgraph-query-manager/src/config/development.ts
    const development = {
      dgraph: {
        adapter: {
          address: 'http://localhost:8080'
        }
      }
    };
    ```

3.  Now execute the `yarn run build` command from the `dgraph-twitter-clone` root directory.

    **WARNING: This command will _drop all existing data_ from your Dgraph database. If you prefer to keep your existing Dgraph data, please run the `yarn run build:safe` command instead, which _will not_ drop data, and will only add additional schema and data.**

    ```bash
    $ yarn run build
    ```

    This command will install a few global Node packages (`gulp-cli` and `yalc`), install all required local Node packages for the API and Client apps, transpile TypeScript source files into executable CommonJS, connect to Dgraph, add the new schema, and finally generate the initial dummy data used by the `dgraph-twitter-clone` app. This process will take a couple minutes and may appear to hang during the `db:generate` step, but the output should look something like the following.

    ```
    yarn run v1.13.0
    $ yarn global add gulp-cli yalc && yarn install && gulp install
    [1/4] Resolving packages...
    [2/4] Fetching packages...
    [3/4] Linking dependencies...
    [4/4] Building fresh packages...

    success Installed "gulp-cli@2.1.0" with binaries:
        - gulp
    success Installed "yalc@1.0.0-pre.27" with binaries:
        - yalc
    [1/4] Resolving packages...
    [2/4] Fetching packages...
    info fsevents@1.2.7: The platform "linux" is incompatible with this module.
    info "fsevents@1.2.7" is an optional dependency and failed compatibility check. Excluding it from installation.
    [3/4] Linking dependencies...
    [4/4] Building fresh packages...

    [16:54:29] Requiring external module @babel/register
    [16:54:30] Using gulpfile ~/projects/dgraph-twitter-clone/gulpfile.babel.js
    [16:33:13] Starting 'install'...
    [16:33:13] Starting 'api:yarn:install'...
    [16:33:19] Finished 'api:yarn:install' after 5.84 s
    [16:33:19] Starting 'client:yarn:install'...
    [16:33:29] Finished 'client:yarn:install' after 9.88 s
    [16:33:29] Starting 'packages:publish'...
    [16:33:29] Starting 'packages:remove:modules'...
    [16:33:29] Starting 'cleanupPackageDirectories'...
    [16:33:29] Finished 'cleanupPackageDirectories' after 5.92 ms
    [16:33:29] Finished 'packages:remove:modules' after 6.32 ms
    [16:33:29] Starting 'packages:install:modules'...
    [16:33:29] Starting 'installPackageModules'...
    [16:33:31] Finished 'installPackageModules' after 2.87 s
    [16:33:31] Finished 'packages:install:modules' after 2.87 s
    [16:33:31] Starting 'packages:build'...
    [16:33:31] Starting 'buildPackage'...
    [16:33:33] Finished 'buildPackage' after 1.76 s
    [16:33:33] Starting 'bumpVersion'...
    [16:33:33] Bumped 0.6.175 to 0.6.176 with type: patch
    [16:33:33] Finished 'bumpVersion' after 6.76 ms
    [16:33:33] Starting 'publishToYalc'...
    [16:33:33] Finished 'publishToYalc' after 251 ms
    [16:33:33] Finished 'packages:build' after 2.02 s
    [16:33:33] Starting 'packages:push'...
    [16:33:33] Starting 'pushPackagesToApi'...
    [16:33:34] Finished 'pushPackagesToApi' after 154 ms
    [16:33:34] Starting 'pushPackagesToClient'...
    [16:33:34] Finished 'pushPackagesToClient' after 192 ms
    [16:33:34] Finished 'packages:push' after 347 ms
    [16:33:34] Finished 'packages:publish' after 5.24 s
    [16:33:34] Starting 'api:transpile'...
    [16:33:38] Finished 'api:transpile' after 4.11 s
    [16:33:38] Starting 'db:regenerate'...
    [16:35:08] Finished 'db:regenerate' after 1.5 min
    [16:35:08] Finished 'install' after 1.92 min
    Done in 117.21s.
    ```

4.  With everything installed you can now run the **Client** and/or **API** apps with `yarn run start`.

    ```bash
    $ yarn run start
    yarn run v1.13.0
    $ gulp start
    [16:57:04] Requiring external module @babel/register
    [16:57:04] Using gulpfile ~/projects/dgraph-twitter-clone/gulpfile.babel.js
    [16:57:04] Starting 'start'...
    [16:57:04] Starting 'api:start'...
    [16:57:04] Starting 'client:start'...
    ```

    The React client should open in a new browser tab automatically. If not, manually browse to the client app at [`http://localhost:3000`](http://localhost:3000).

5.  You can now access the API at `localhost:5000`, or via and endpoint such as [`localhost:5000/api/tweets/10`](http://localhost:5000/api/tweets/10):

    ```json
    $ curl localhost:5000/api/tweets/10 | jq
    {
      "statusCode": 200,
      "success": true,
      "uri": "",
      "message": "tweets found.",
      "request": "query find($count: int) {\n      data(func: has (tweet.text), first: $count) {\n        uid\n        expand(_all_) {\n          uid\n          expand(_all_)\n        }\n      }\n     }",
      "response": [
        {
        "uid": "0x6b950",
        "tweet.createdAt": "2019-04-01T00:16:24.519Z",
        "tweet.favorited": false,
        "tweet.text": "@Mossie_Russel61 Realigned homogeneous structure #real-time #front-end",
        "tweet.hashtag": [
          {
            "uid": "0x6b94e",
            "hashtag.hashtag": "real",
            "hashtag.indices": [
              49,
              54
            ]
          },
          {
          "uid": "0x6b94f",
          "hashtag.hashtag": "front",
          "hashtag.indices": [
              60,
              66
            ]
          }
        ],
        "tweet.retweeted": false,
        "tweet.retweetCount": 400,
        "tweet.isQuoteStatus": true,
        "tweet.inReplyToStatusId": {
            "uid": "0x6bcfc",
            "tweet.favorited": true,
            "tweet.retweetCount": 263,
            "tweet.createdAt": "2019-04-01T00:16:54.001Z",
            "tweet.isQuoteStatus": true,
            "tweet.text": "@David21 Cross-platform user-facing array #collaborative #frictionless",
            "tweet.favoriteCount": 209,
            "tweet.retweeted": false
        },
        "tweet.user": {
            "uid": "0x6b946",
            "user.email": "Berniece_Klocko66@example.org",
            "user.friendsCount": 832,
            "user.name": "Selina Altenwerth",
            "user.url": "https://jamarcus.info",
            "user.createdAt": "2019-04-01T00:16:24.317Z",
            "user.followersCount": 238,
            "user.avatar": "https://s3.amazonaws.com/uifaces/faces/twitter/nickfratter/128.jpg",
            "user.listedCount": 735,
            "user.description": "Quis a et rem optio. Sunt deserunt quia. Et sit quis enim eum corrupti at velit dolorem. Voluptas maiores natus voluptas beatae delectus.",
            "user.location": "New Brionna, Bahrain",
            "user.screenName": "Ezekiel81",
            "user.favouritesCount": 215
        },
        "tweet.favoriteCount": 500
        },
      ]
    }
    ```

6.  You can also skip the API and access Dgraph directly. Running the following GraphQL+- query in Ratel (`http://localhost:8000`) will return the same results as the API endpoint above.

    ```js
    {
      data(func: has (tweet.text), first: 10) {
        uid
        expand(_all_) {
          uid
          expand(_all_)
        }
      }
    }
    ```

## Documentation

Auto-generated documentation is available at the following locations.

- [API](https://dgraph-twitter-clone.netlify.com/docs/api)
- [Client](https://dgraph-twitter-clone.netlify.com/docs/client)
- [DgraphQueryManager](https://dgraph-twitter-clone.netlify.com/docs/dgraph-query-manager)

### Gulp Commands

The following Gulp commands can be issued from the root `dgraph-twitter-clone` directory.

- `install` - Executes a full install of `api`, `client`, and `packages` by running `api:yarn:install`, `client:yarn:install`, `packages:publish`, `api:transpile`, and `db:regenerate`.
- `install:safe` - Same as `install` command, but **does not** drop Dgraph data. Only perform additive operations.
- `start` - Starts both `api` and `client` apps.
- `default` - Same as `packages:publish`.

#### Database

- `db:regenerate` - Drops Dgraph database and regenerates starting data.
- `db:schema:alter` - Updates Dgraph schema from `api/src/config.dgraph.schema`.
- `db:generate:data` - Generates Dgraph data.

#### Docs

- `api:docs` - Regenerate docs for `api` project.
- `client:docs` - Regenerate docs for `client` project.
- `package:docs` - Regenerate docs for `packages/dgraph-query-manager` project.
- `docs:all` - Regenerates all docs.

#### Packages

- `packages:remove:modules` - Cleans up `packages/dgraph-query-manager/node_modules` directory by removing all packages, `dist` directory, and `yarn.lock`.
- `packages:install:modules` - Installs node modules for `packages/dgraph-query-manager`.
- `packages:cleanup` - Executes both `packages:remove:modules` and `packages:install:modules`.
- `packages:build` - Rebuilds `packages/dgraph-query-manager` by transpiling TypeScript src, creating source maps, and definition files. Also bumps version in `package.json` and publishes to local `yalc` repo.
- `packages:push` - Pushes local package in `yalc` repo to `api` and `client` projects.
- `packages:publish` - Performs a full node package removal, reinstall, rebuild, and republish of `packages/dgraph-query-manager`.

#### API

- `api:yarn:install` - Executes the `yarn install` command for the `api` project.
- `api:transpile` - Transpiles `api` project.
- `api:start` - Runs the `api` application.

#### Client

- `client:yarn:install` - Executes the `yarn install` command for the `client` project.
- `client:start` - Runs the `client` application.

## API

The `dgraph-twitter-clone/api` app is an [Express-based](https://expressjs.com/) API that dynamically generates routes based on `Query` configurations found in the `dgraph-query-manager` package. As such, the API can accept requests to standard REST API endpoints (e.g. `/api/tweets/user/:id`), or JSON payloads to the `/api/json` endpoint for more complex API requests.

See [The API](https://dgraph-twitter-clone.netlify.com/part-2-api) for more details.

### Build

Generate executable code and TypeScript map/definition files by running the `default` Gulp task from the `/api` directory.

```bash
$ gulp default
```

### Test

Run `yarn test` or manually execute `jest` to execute the test suite.

### Running

Start the API server with `yarn start` or a manual node command.

```bash
$ node -r ts-node/register dist/app.js --inspect
```

OR

```bash
$ nodemon -r ts-node/register dist/app.js --inspect
```

### Gulp Commands

The following Gulp commands can be issued from the `dgraph-twitter-clone/api` directory.

- `db:drop` - Drop all Dgraph data and schema (i.e. a full reset).
- `db:schema:alter` - Set Dgraph schema to what's specified in `config.dgraph.schema` value.
- `db:reset` - Executes `db:drop` and `db:schema:alter`.
- `db:generate:data` - Generates a healthy set of pseudo-randomized Twitter-like data via the `Generator.generateInitialData()` method. Currently generates `25` `Users`, `500` `Tweets`, and randomly assigns various values to integrate the data together (i.e. user tweet authorship, tweet replies, favorite/retweet counts, faked field data, etc).
- `db:regenerate` - Refreshes entire database with new data by executing `db:drop`, `db:schema:alter`, and `db:generate:data`.
- `build:typescript` - Transpiles all `.ts` files in `/api` project, including source maps and definition files.
- `watch:typescript` - Watches `api/src` directory for changes, performing a transpile if needed.
- `default` - Executes `build:typescript`.

### Routes

Routes are dynamically generated from `Queries` specified in the `dgraph-query-manager` package. Requsts can be either direct REST endpoints (e.g. `api/tweet/:id`), or complex JSON payloads to the `api/json` endpoint.

See [Handling JSON API Payloads](https://dgraph-twitter-clone.netlify.com/part-2-api/#handling-json-api-payloads) and [Dynamically Generating Express Routes](https://dgraph-twitter-clone.netlify.com/part-2-api/#dynamically-generating-express-routes) for more info.

## Client

The `dgraph-twitter-clone/client` app is a [React-based](https://reactjs.org/) single page application that mimics the core features of Twitter using the Dgraph back end for all queries, mutations, and data management. It can be configured to execute directly with Dgraph, via the API through REST endpoints, or via the API using JSON payloads, all of which tie back to Dgraph.

See [The Client](https://dgraph-twitter-clone.netlify.com/part-3-client) for more details.

## DgraphQueryManager

The `dgraph-query-manager` package is not publicly published to NPM, so it is built and published locally for use in the `/client` and `/api` apps.

### Installation or Redeployment

1. Install any missing node packages via `yarn install`.
2. Make local changes.
3. Execute the default Gulp task from the root `dgraph-twitter-clone` directory to rebuild the `dgraph-query-manager` package and redistribute it to the `/client` and `/api` apps:

```bash
$ gulp default
[19:34:45] Requiring external module @babel/register
[19:34:45] Using gulpfile D:\work\dgraph\projects\dgraph-twitter-clone\gulpfile.babel.js
[19:34:45] Starting 'default'...
[19:34:45] Starting 'packages:remove:modules'...
[19:34:45] Starting 'cleanupPackageDirectories'...
[19:34:47] Finished 'cleanupPackageDirectories' after 1.18 s
[19:34:47] Finished 'packages:remove:modules' after 1.18 s
[19:34:47] Starting 'packages:install:modules'...
[19:34:47] Starting 'installPackageModules'...
[19:34:51] Finished 'installPackageModules' after 4.32 s
[19:34:51] Finished 'packages:install:modules' after 4.33 s
[19:34:51] Starting 'packages:build'...
[19:34:51] Starting 'buildPackage'...
[19:34:53] Finished 'buildPackage' after 1.89 s
[19:34:53] Starting 'bumpVersion'...
[19:34:53] Bumped 0.6.54 to 0.6.55 with type: patch
[19:34:53] Finished 'bumpVersion' after 9.52 ms
[19:34:53] Starting 'publishToYalc'...
[19:34:53] Finished 'publishToYalc' after 270 ms
[19:34:53] Finished 'packages:build' after 2.17 s
[19:34:53] Starting 'packages:push'...
[19:34:53] Starting 'pushPackagesToApi'...
[19:34:54] Finished 'pushPackagesToApi' after 850 ms
[19:34:54] Starting 'pushPackagesToClient'...
[19:34:55] Finished 'pushPackagesToClient' after 734 ms
[19:34:55] Finished 'packages:push' after 1.59 s
[19:34:55] Finished 'default' after 9.27 s
```

### Configuration

You may need to change the location to your running Dgraph installation in the `dgraph-query-manager/src/config` files.

1. Open `packages/dgraph-query-manager/src/config/development.ts` (or `production.ts` if applicable).
2. Set the `dgraph.adapter.address` to the Dgraph server endpoint.

   ```ts
   const development = {
     // ...
     dgraph: {
       adapter: {
         address: 'http://192.168.99.100:8080'
       }
     }
     // ...
   };
   ```

3. Save your changes and [redeploy](#installation-or-redeployment) the `dgraph-query-manager` package.

### Connection Types

Three types of integrations with Dgraph are supported, allowing the `dgraph-twitter-clone` app to perform data manipulation in whatever method is suitable to your needs.

- `DIRECT` - Passes serialized request objects (i.e. JSON) to the `dgraph-adapter-http` instance, which in turn generates Dgraph transactions via the `dgraph-js-http` package. This connection type completely bypasses the `/api` application and forms a **direct** connection to Dgraph (hence the `DIRECT` name). **This is the default connection type**.
- `API` - Posts the serialized request object to the API's [`/json` endpoint](https://github.com/GabeStah/dgraph-twitter-clone-api/blob/master/src/routes/Routes.ts#L18-L30). The request body is converted to an executable query, which is then passed along as a Dgraph transaction.
- `REST_API` - Uses an endpoint-based REST API from [auto-generated](https://github.com/GabeStah/dgraph-twitter-clone-api/blob/master/src/routes/Routes.ts#L36-L85) Express routes, which are based on the set of [`Queries`](https://github.com/GabeStah/dgraph-twitter-clone/tree/master/packages/dgraph-query-manager/src/classes/Queries) found in `dgraph-query-manager`.

#### Changing the Connection Type

The current connection [`DgraphConnectionTypes`](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/packages/dgraph-query-manager/src/classes/DgraphQueryExecutor.ts#L11-L15) enum value is specified in the DgraphQueryManager's [`config`](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/packages/dgraph-query-manager/src/config/development.ts) file. Simply change this value then run `gulp default` from the `dgraph-twitter-clone` root directory to redistribute the latest package, then start the API then Client apps.
