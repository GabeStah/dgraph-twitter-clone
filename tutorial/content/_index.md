---
title: 'Building a Twitter Clone with Dgraph and React'
date: 2019-03-24T10:42:34-07:00
draft: false
---

## Prerequisites

This tutorial aims to provide a step-by-step process for creating a Twitter clone application using the power of Dgraph for data management and manipulation. We'll also use React to create the front-end client application. However, before you begin, there are a handful of prerequisites to install, or simply to be aware of.

### Dgraph

You'll need the Dgraph cluster installed, either locally or via an accessible Docker container. This entire tutorial was created while running Dgraph on Docker, which can be installed using the [Docker Compose](https://docs.dgraph.io/get-started/#docker-compose) file [found here](https://docs.dgraph.io/get-started/#docker-compose). Alternatively, feel free to install Dgraph in whatever manner best suits your needs. Check out the [official documentation](https://docs.dgraph.io/get-started/#step-1-install-dgraph) for more details.

### Node

The Dgraph Twitter Clone app relies heavily on Node.js, so you'll also need Node locally installed. Visit the [official site](https://nodejs.org/en/) to download the correct version for your OS.

### TypeScript

All the code throughout the Dgraph Twitter Clone project is written with [TypeScript](https://www.typescriptlang.org/), which is a superset of plain JavaScript that provides typing and other quality of life features for creating cleaner code. While you won't need to be particularly familiar with TypeScript to follow along with this tutorial, be aware that some of the code syntax used throughout the tutorial is TypeScript-specific. Ultimately, all TypeScript code is converted into normal JavaScript prior to execution, so there's nothing in this tutorial that couldn't have been created in plain JavaScript at the outset.

### IDE

You'll also want a text editor or integrated development environment (IDE). Anything will do, but some popular choices are [VS Code](https://code.visualstudio.com/), [WebStorm](https://www.jetbrains.com/webstorm/), [Atom](https://atom.io/), [Brackets](http://brackets.io/), and [Sublime Text](https://www.sublimetext.com/).

## Installation

The `dgraph-twitter-clone` application can be installed and configured in just a few steps. This will allow you to see the app in action and start tinkering with the code yourself so you can see how easy it is to power modern applications with Dgraph.

1.  Starting by cloning the `GabeStah/dgraph-twitter-clone` Git repository to a local directory.

    ```bash
    $ git clone https://github.com/GabeStah/dgraph-twitter-clone.git
    $ cd dgraph-twitter-clone
    ```

2.  Make sure Dgraph Alpha is installed and running (see the [Prerequisites](#prerequisites)). By default the Dgraph Alpha server is available at `localhost:8080`, but if you changed this address and/or port during your installation, you'll need to update the configuration to match your installation. To do so open the `packages/dgraph-query-manager/src/config/development.ts` file and change the `dgraph.adapter.address` to your Dgraph Alpha server endpoint.

    ```ts
    const development = {
      dgraph: {
        adapter: {
          address: 'localhost:8080',
        },
      },
    };
    ```

3.  The last step is to perform a full build by running the `yarn run build` command from the `dgraph-twitter-clone` root directory.

    {{% notice "warning" %}} The following `yarn run build` command will **drop all existing data** from your Dgraph database. If you prefer to keep your existing Dgraph data, please run the `yarn run build:safe` command instead, which _will not_ drop data, but will instead just add additional schema and data. {{% /notice %}}

    ```bash
    $ yarn run build
    ```

    This command will install a few global Node packages (`gulp-cli` and `yalc`), install all required local Node packages for the API and Client apps, transpile TypeScript source files into executable CommonJS, connect to Dgraph, add the new schema, and finally generate the initial somewhat-randomized data used by the `dgraph-twitter-clone` app. This process will take a couple minutes and may appear to hang during the `db:generate` step in particular, but the output should look something like the following.

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

    The React client should open in a new browser tab automatically. If not, manually browse to the client app at `http://localhost:3000`.

    {{% notice "warning" %}} ED-NOTE-TODO: Add Client app screenshot. {{% /notice %}}

    {{% notice "tip" %}} Throughout this tutorial the packaging tool [`yarn`](https://yarnpkg.com/en/) will be referenced and used. This is just my personal preference, so you are free to substitute `npm` commands in place of `yarn` commands and everything will function the same. {{% /notice %}}

5.  The API should also be running at `localhost:5000`. You can access it via an endpoint such as `localhost:5000/api/tweets/10`:

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

6.  Better yet, you can skip the API and access Dgraph directly. Running the following query will return the same results as the API endpoint above.

    {{% notice "warning" %}} ED-NOTE-TODO: Fix `runnable` code indentation bug. {{% /notice %}}

    <!-- prettier-ignore -->
    {{< runnable >}}
    {
      data(func: has (tweet.text), first: 10) {
        uid
        expand(_all_) {
          uid
          expand(_all_)
        }
      }
    }
    {{< /runnable >}}

### Reset Gulp Tasks

### Manual Install

### Docker Image

{{% notice "warning" %}} ED-NOTE-TODO: Create base image (Ubuntu or Debian?) to host app. {{% /notice %}}

## DgraphQueryManager

### Configuration

### Models

### Query

### Serialization

### DgraphAdapterHttp

## Client

### React

## API

### Express

### Routes

### API Types

### Testing

## Code Samples

<!-- prettier-ignore -->
{{< runnable >}}
{
  data(func: has (tweet.text), first: 10) {
    uid
    expand(_all_) {
      uid
      expand(_all_)
    }
  }
}
{{< /runnable >}}
