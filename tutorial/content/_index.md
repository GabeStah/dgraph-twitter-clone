---
title: 'Building a Twitter Clone with Dgraph and React - Part 1: The Architecture'
date: 2019-03-24T10:42:34-07:00
draft: false
# url: 'building-twitter-clone-with-dgraph-react-part-1-architecture'
---

<script type="text/javascript">window.DGRAPH_ENDPOINT = "http://127.0.0.1:8080/query?latency=true";</script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.6/languages/typescript.min.js"></script>

Graph databases like Dgraph provide fast and efficient data querying, even across complex, hierarchical data. This capability offers significant advantages over more traditional relational databases, as data creation is not enforced by a rigid schema, and data retrieval is as dynamic and fluid as your application requires. Dgraph expands on these capabilities by providing out-of-the-box horizontally-distributed scaling via sharded storage and query processing, combining the flexibility of the graph databases with unprecedented speed.

While having that much power at your disposal is all well and good, it can be difficult to grasp how many modern applications might integrate with and use a graph database like Dgraph. In this series, we'll explore a real-world Twitter clone application that was created entirely around its integration with Dgraph. Throughout this guide, you'll see how the [`dgraph-twitter-clone`](https://github.com/GabeStah/dgraph-twitter-clone) is designed and structured to work with Dgraph and produce an end product that mimics Twitter while having access to the powerful data manipulation capabilities provided by Dgraph. Whether performing queries and transactions directly with the Dgraph server or performing tasks indirectly through an API middleware, the `dgraph-twitter-clone` app illustrates how a modern JavaScript app can take full advantage of Dgraph and the GraphQL+- query language.

You're encouraged to install the repo and play with the application code yourself or feel free to just read and follow along with the guide as we walk through the major features and structure of this app and how it utilizes Dgraph to create a Twitter-like single page application.   Below is a short animation showing the client application we've created.  Let's get into it!

![Dgraph Twitter Client](/images/dgraph-twitter-client.gif)

## Prerequisites

This guide provides a step-by-step walkthrough of a Twitter clone application created using the power of a Dgraph data layer. It uses [React](https://reactjs.org/) for the front-end client application. However, before we begin, there are a handful of prerequisites to install, or simply to be aware of.

### Install Dgraph

You'll need the Dgraph cluster installed, either locally or via an accessible Docker container. This entire application was created while running Dgraph on Docker, which can be installed using the [Docker Compose](https://docs.dgraph.io/get-started/#docker-compose) file [found here](https://docs.dgraph.io/get-started/#docker-compose). Alternatively, feel free to install Dgraph in whatever manner best suits your needs. Check out the [official documentation](https://docs.dgraph.io/get-started/#step-1-install-dgraph) for more details.

### Install Node

The Dgraph Twitter Clone app relies heavily on Node.js, so you'll also need Node locally installed. Visit the [official site](https://nodejs.org/en/) to download the correct version for your OS.

### TypeScript

All the code throughout the `dgraph-twitter-clone` project is written with [TypeScript](https://www.typescriptlang.org/), which is a superset of plain JavaScript that provides typing and other quality of life features for creating cleaner code. While you won't need to be particularly familiar with TypeScript to follow along with this tutorial, be aware that some of the code syntax used throughout the series is TypeScript-specific. Ultimately, all TypeScript code is converted into normal JavaScript prior to execution, so there's nothing in this guide that couldn't have been created in plain JavaScript at the outset.

## Application Architecture

Before we dig into the code let's take a moment to define what the goal of our application is and roughly how it's structured to accomplish that goal. This application aims to illustrate how Dgraph can simplify the structure and lower the development time of a real-world application. While this application is just a proof of concept and far from production-ready software, the overall goal of the `dgraph-twitter-clone` is to create a solid foundation for a Twitter-like front-end application that is powered by Dgraph.

Furthermore, since graph databases are not as well-known as relational databases, the secondary goal of our app is to provide some keystone familiarity for those readers coming from a relational database background. The app illustrates how a "traditional" relational database might handle the app data, while then taking it a step further and showing how that data can be more easily queried and manipulated with a graph database like Dgraph. The following are a few key components we've used to accomplish those goals and to build a functional Twitter clone application.

### Models

As you're undoubtedly aware, Twitter's functionality largely revolves around just two simple pieces of data: **Tweets** and **Users.** A user has something to say, so they create a tweet, publishing it for other users to consume. Additionally, **Hashtags** are also a fundamental piece of Twitter data, even though they are considered secondary citizens to the parent tweet element. Therefore, this application has a model to represent those three critical pieces of information.

### Dgraph Adapter

We need to manipulate data on our Dgraph server. Dgraph's official [dgraph-js-http](https://github.com/dgraph-io/dgraph-js-http) package provides a useful API for HTTP-based transactions and mutations. Our application uses `dgraph-js-http`, but we've also added a simple adapter that helps to transform our model data into a format Dgraph understands.

### GraphQL+-

Dgraph's [GraphQL+- query language](https://docs.dgraph.io/query-language/) was developed to bring much of the power of Facebook's popular [GraphQL](https://graphql.github.io/) to graph databases, while simultaneously adding features that better suit the specific needs of graph databases. A fundamental component of GraphQL+- is the **query**. [Queries for Dgraph](https://docs.dgraph.io/design-concepts/#queries) are used to retrieve and manipulate data, just like queries in relational databases.

For example, the following query uses the `eq` function to find all nodes with a `user.screenName` equal to `GabeStah`.

<!-- prettier-ignore-start -->
{{< runnable >}}
{
  user(func: eq(user.screenName, "GabeStah"))
  {
    uid
    user.screenName
    user.friendsCount
    user.description
  }
}
{{</ runnable >}}
<!-- prettier-ignore-end -->

Since our query specifies exactly the data we want to return, we only retrieve the unique identifier, screen name, friends count, and description of the user. The returned data should look something like the following.

```json
{
  "data": {
    "user": [
      {
        "uid": "0x19",
        "user.screenName": "GabeStah",
        "user.friendsCount": 160,
        "user.description": "At consequatur eos dolores adipisci omnis. Molestiae facere delectus quaerat ratione velit temporibus. Enim eligendi tempora provident accusamus laboriosam. Dolores saepe natus est qui velit sapiente non odit cupiditate. Soluta sint quos minima voluptatem voluptas odio rerum rerum. Blanditiis dicta placeat vitae aut doloribus."
      }
    ]
  }
}
```

{{% notice "tip" %}} This tutorial will barely scratch the surface of what GraphQL+- is capable of. Head over to the [official documentation](https://docs.dgraph.io/query-language/) to learn more about its features and syntax! {{% /notice %}}

### Front-end React Client

Our app also has a front-end site that loosely emulates Twitter. For this project, we've used the [React](https://reactjs.org) JavaScript library to create our Twitter clone single-page application. You don't need any prior React experience to follow along with this tutorial, but we've also taken advantage of the new [React Hooks](https://reactjs.org/docs/hooks-intro.html) feature introduced to React in early 2019, so you'll be able to learn a bit about how those work.

Since our Twitter clone app is primarily focused on how Dgraph and graph databases can be used for a Twitter-esque application, the front-end portion is rather limited in scope -- we have just enough there to lay the groundwork and show how it all integrates together.

### Back-end Express API

To help illustrate how a relational database typically handles Twitter-like data we've also added a simple API to our application. In fact, as you'll soon see, we've created an app that can transition between using REST API endpoints and GraphQL+- queries with the flip of a configuration flag.

We've taken it one step further and allowed our API to act as a middleware between the front-end client and Dgraph. This will help illustrate how a real-world application might gain a tremendous benefit from exposing simple endpoints to users or other applications, while simultaneously querying and manipulating the underlying data within a graph database like Dgraph.

---

With all the basic components planned out let's just right into the code for our `dgraph-twitter-clone` application!

## Installation

The [`dgraph-twitter-clone`](https://github.com/GabeStah/dgraph-twitter-clone) application can be installed and configured in just a few steps. This will allow you to see the app in action and start tinkering with the code yourself so you'll get an idea of how easy it is to power modern applications with Dgraph.

1.  Starting by cloning the [`dgraph-twitter-clone`](https://github.com/GabeStah/dgraph-twitter-clone) Git repository to a local directory.

    ```bash
    $ git clone https://github.com/GabeStah/dgraph-twitter-clone.git
    $ cd dgraph-twitter-clone
    ```

2.  Make sure Dgraph Alpha is installed and running (see the [Prerequisites](#prerequisites)). By default the Dgraph Alpha server is available at `localhost:8080`, but if you changed this endpoint during your installation, you'll need to update the configuration to match your setup. To do so open the `packages/dgraph-query-manager/src/config/development.ts` file and change the `dgraph.adapter.address` to your Dgraph Alpha server endpoint.

    ```ts
    // File: packages/dgraph-query-manager/src/config/development.ts
    const development = {
      dgraph: {
        adapter: {
          address: 'http://localhost:8080',
        },
      },
    };
    ```

3.  Now to perform a full build simply run the `yarn run build` command from the `dgraph-twitter-clone` root directory.

    {{% notice "warning" %}} The `yarn run build` command will **drop all existing data** from your Dgraph database. If you prefer to keep your existing Dgraph data, please run the `yarn run build:safe` command instead, which _will not_ drop data, and will only add additional schema and data. {{% /notice %}}

    ```bash
    $ yarn run build
    ```

    This command will install a few global Node packages (`gulp-cli` and `yalc`), install all required local Node packages for the API and Client apps, transpile TypeScript source files into executable CommonJS, connect to Dgraph, add the new schema, and finally generate the initial dummy data used by the `dgraph-twitter-clone` app. This process will take a couple of minutes and may appear to hang during the `db:generate` step, but the output should look something like the following.

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

    {{< figure src="/images/client-index.png" link="/images/client-index.png" alt="Client Home Page" >}}

    {{% notice "tip" %}} Throughout this tutorial the packaging tool [`yarn`](https://yarnpkg.com/en/) will be referenced and used. This is just my personal preference, so you are free to substitute `npm` commands in place of `yarn` commands and everything will function the same. {{% /notice %}}

5.  The API should also be running at `localhost:5000`. You can access it via an endpoint such as [`localhost:5000/api/tweets/10`](http://localhost:5000/api/tweets/10):

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

    {{% notice "tip" %}} This tutorial will feature many executable Dgraph query snippets similar to the above. If your Dgraph Alpha server is running at the default location (`localhost:8080`) and you [installed](#installation) the schema for the `dgraph-twitter-clone` you can execute these runnable queries in the browser and receive output from your own Dgraph installation. If your installation is running elsewhere, feel free to manually adjust the endpoint field in the runnable dialog box to send the query to that location. {{% /notice %}}

## Schema

Before we dive into the code let's briefly look at the schema our Twitter app is using. As discussed, we're working with tweets, users, and hashtags, so we cover all three primary elements in the full schema found below.

<!-- prettier-ignore-start -->
{{< runnable uri="alter" >}}
hashtag.indices: [int] .
hashtag.hashtag: string @index(exact, fulltext) @count .
hashtag.tweet: uid @count .
tweet.createdAt: dateTime @index(hour) .
tweet.favoriteCount: int @index(int) .
tweet.favorited: bool .
tweet.hashtag: uid @count @reverse .
tweet.inReplyToStatusId: uid @count .
tweet.inReplyToUserId: uid @count .
tweet.isQuoteStatus: bool .
tweet.quotedStatus: uid @count .
tweet.retweetCount: int @index(int) .
tweet.retweeted: bool .
tweet.text: string @index(fulltext) @count @upsert .
tweet.user: uid @count @reverse .
user.avatar: string .
user.createdAt: dateTime @index(hour) .
user.description: string @index(fulltext) @count .
user.email: string @index(exact) @upsert .
user.favouritesCount: int @index(int) .
user.followersCount: int @index(int) .
user.friendsCount: int @index(int) .
user.listedCount: int @index(int) .
user.location: string @index(term) @count .
user.name: string @index(hash) @count .
user.screenName: string @index(term) @count .
user.url: string @index(exact, fulltext) @count .
{{< /runnable >}}
<!-- prettier-ignore-end -->

Posting this schema to the `/alter` endpoint of Dgraph should return a `{ "code": "Success", "message": "Done" }` object to indicate the schema was altered. The Dgraph schema defines the data **types** for each given **predicate** using a `predicate: type [@directive(s)]` format. For example, here's a break down of the `tweet.text` predicate specification in the schema above.

```text
tweet.text: string @index(fulltext) @count @upsert .
^           ^      ^      ^         ^      ^       ^
|           |      |      |         |      |       end-of-line
|           |      |      |         |      directive
|           |      |      |         directive
|           |      |      tokenizer
|           |      directive
|           type
predicate
```

- The `tweet.text` predicate is essentially the data field that we're defining. In this case, anytime we want to perform a query or mutation that interacts with the _text_ of a Tweet we'll be using this `tweet.text` predicate.
- The [`@index`](https://docs.dgraph.io/query-language/#indexing) directive tells Dgraph to index the predicate based on the passed `tokenizer(s)`. In this case, our data type of `string` allows us to perform a full-text search, which will be useful later so users can easily search through Tweets.
- The `@count` directive tells Dgraph to index the _number_ of edges with this predicate, so we can query the number of tweets, perhaps based on filters like the user that authored those tweets.
- The [`@upsert` directive](https://docs.dgraph.io/query-language/#upsert-directive) enables conflict checking when committing a transaction. While this still requires business logic on our part, it can be useful to help prevent duplicate entries under certain circumstances.

The schema specification is quite in-depth, so check out the [official schema documentation](https://docs.dgraph.io/query-language/#schema) for more details.

{{% notice "tip" %}} While most of the query samples we'll be using throughout this guide can be executed directly in the browser, your Dgraph installation likely also included the Ratel UI, which provides a beautiful interface for performing queries and mutations on your Dgraph server. Feel free to manually copy any of the queries throughout this tutorial and execute them directly within Ratel, which is typically located at [http://localhost:8000](http://localhost:8000). {{% /notice %}}

## DgraphQueryManager Package

Since this project is split into multiple parts, we need to share a lot of code between various parts of the app. Therefore, we're alleviating some of this headache by keeping all such code in a separate Node package called `dgraph-query-manager`. This package houses the majority of the back-end logic, models, and various helper methods. Essentially, anything that both the client and API may rely upon ends up in this shared package.

### Working with Serialization

As with most modern JavaScript apps, most transferred data is in a JSON-like format. Additionally, a great deal of that data is transmitted after sending or receiving `Promises`, including requests and results. Therefore, it's useful for our app to have a core "transaction object" that can be used throughout our app. This object indicates when a request is created, what data the request holds, what response was provided, any errors that were generated, and so forth.

Take a look at the `dgraph-query-manager/src/classes/Serialization.ts` [file](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/packages/dgraph-query-manager/src/classes/Serialization.ts).

```ts
// File: packages/dgraph-query-manager/src/classes/Serialization.ts
export interface SerializationInterface {
  command?: string;
  data?: any;
  error?: Error;
  message?: string;
  request?: any;
  response?: any;
  statusCode?: number;
  success?: boolean;
  uid?: string | string[];
  uri: string;
}

export class Serialization implements SerializationInterface {
  command?: string;
  data?: any;
  error?: Error;
  message?: string;
  request?: any;
  response?: any;
  statusCode = 200;
  success = false;
  uid?: string | string[];
  uri = '';

  constructor(params: Partial<Serialization> = {}) {
    Object.assign(this, params);
  }
}
```

While it doesn't look like much, this `Serialization` class is used throughout our application. Since JavaScript class instances are effectively just plain JavaScript objects during execution, the `Serialization` class provides some elegance and structure to an otherwise basic object that can now have useful properties like `request`, `response`, `data`, `error`, `success`, and so forth. The [`Partial<T>`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#mapped-types) construct is quite beneficial and is used throughout the app to accept an unknown set of parameters of a given instance type and to use those parameters in a useful fashion. In this case, a `Serialization` instance can be created with a partial representation of a `Serialization`.

### Handling Unique Identifiers

Dgraph identifies every node in the database with a unique id called the `uid`. This value is represented in the system as a [hexadecimal](https://en.wikipedia.org/wiki/Hexadecimal) string, so it's critical that our app accounts for this type of identifier. Therefore, we've created a `Uid` class that can help transform between all the possible types of `uid` data.

Let's go through the `dgraph-query-manager/src/models/Uid.ts` [file](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/packages/dgraph-query-manager/src/models/Uid.ts).

```ts
// File: packages/dgraph-query-manager/src/models/Uid.ts
import * as crypto from 'crypto';
import { BaseModel } from './BaseModel';
import { Serialization } from '../classes';

enum UidTypes {
  Base16,
  Base64,
}

interface UidInterface {
  type: UidTypes;
  uid: string;
}

export type UidParamsType =
  | BaseModel<any>
  | Uid
  | UidTypes
  | Serialization
  | string
  | string[]
  | number;

/**
 * Uid type to handle custom UIDs necessary for Dgraph integration.
 */
export class Uid implements UidInterface {
  type: UidTypes.Base64;
  uid: string;

  constructor(value?: UidParamsType) {
    if (typeof value === undefined) {
      this.uid = Uid.generateString(this.type);
    } else if (value instanceof Uid) {
      Object.assign(this, value);
    } else if (value instanceof Serialization) {
      if (value.uid) {
        this.uid = this.getUidAsHex(value.uid);
      }
    } else if (value instanceof BaseModel) {
      if (value.uid) {
        this.uid = this.getUidAsHex(value.uid);
      }
    } else if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'object'
    ) {
      this.uid = this.getUidAsHex(value);
    } else {
      this.uid = Uid.generateString(value);
    }
  }

  toString(): string {
    return this.uid;
  }

  /**
   * Generates a new random Uid string.
   * @param {UidTypes} type
   * @param {number} byteCount
   * @returns {string}
   */
  static generateString(
    type: UidTypes = UidTypes.Base64,
    byteCount = 12
  ): string {
    const base64 = crypto
      .randomBytes(byteCount)
      .toString('base64')
      .toLowerCase();
    switch (type) {
      case UidTypes.Base64:
        return base64;
      case UidTypes.Base16:
        return crypto
          .randomBytes(byteCount)
          .toString('hex')
          .toLowerCase();
      default:
        return base64;
    }
  }

  /**
   * Convert Uid value to hex representation.
   * @param {number | string | object} value
   * @returns {string}
   */
  private getUidAsHex(value: number | string | object | any): string {
    if (typeof value === 'string') {
      if (value.slice(0, 2) === '0x') {
        return value;
      } else {
        return `0x${parseInt(value).toString(16)}`;
      }
    } else if (typeof value === 'number') {
      return `0x${parseInt(value.toString()).toString(16)}`;
    } else if (typeof value === 'object' && Array.isArray(value)) {
      // Assume first value is Uid.
      return this.getUidAsHex(value[0]);
    } else if (typeof value === 'object' && value.hasOwnProperty('uid')) {
      return this.getUidAsHex(value.uid);
    }
    return Uid.generateString(this.type);
  }
}
```

We start by defining the `UidInterface` that the `Uid` class will implement. We only really need to store a few properties, the primary of which is the actual `uid: string` value. The `constructor()` accepts a passed argument of any of the types specified in `UidParamsType`, which allows this class to handle just about any uid format we can throw at it. The `generateString()` method creates a new random uid string in the event that a new `Uid` instance are created without passing an initial value. Otherwise, the `getUidAsHex()` method converts a passed value into a hex format.

{{% notice "note" %}} Throughout this guide there will be too much code to go through it all line-by-line without being overwhelming and verbose. Instead, we'll typically go through the main features and functionality of a given snippet or file, and then redirect your attention to the actual files found in the [public repo](https://github.com/GabeStah/dgraph-twitter-clone) which can provide more details and let you see how everything works together. {{% /notice %}}

### Managing Our Models

We already got a sneak peek at the models we're using when we defined our schema, but now let's [take a look](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/packages/dgraph-query-manager/src/models/BaseModel.ts) at the `dgraph-query-manager/src/models/BaseModel.ts` class, which is the driving logic behind our specific model classes like `Tweet`, `User`, and `Hashtag`.

```ts
// File: packages/dgraph-query-manager/src/models/BaseModel.ts
export interface BaseModelInterface {
  uid?: Uid;
}

export class BaseModel<T> implements BaseModelInterface {
  uid?: Uid;

  /**
   * Constructs an instance of inheriting class using an (optional) partial parameters object.
   * @param {Partial<BaseModel<T>>} params
   * @param uid
   */
  constructor(params: Partial<BaseModel<T>> = {}, uid?: UidParamsType) {
    Object.assign(this, params);
    if (this.uid) {
      this.uid = new Uid(this.uid);
    }
  }
}
```

The `BaseModelInterface` is kept as simple as possible, so our child classes that inherit `BaseModel` can define those properties that are unique to them. We're using a generic type in the `BaseModel<T>` definition so we can reference the inheriting class instances/types throughout the various `BaseModel` methods. We'll see this in action shortly, but this makes it easier to, for example, differentiate between when a `Tweet` class instance is being used, versus a `User` or `Hashtag` instance.

The overall purpose of `BaseModel` is to allow for the creation and manipulation of inheriting instances, such as `Tweet` and `User`. Therefore, let's take a look at the `create()` method, along with a few helper methods that accompany it.

```ts
// File: packages/dgraph-query-manager/src/models/BaseModel.ts
/**
 * Factory that creates BaseModel instances from Partial<BaseModel<T>> paramTypes.
 * @param {Partial<BaseModel<T>>} params
 * @returns {Promise<BaseModel<T>>}
 */
static async create<T extends typeof BaseModel>(
  params: Partial<BaseModel<T>>
): Promise<Serialization> {
  const className = this.name;
  const serialization = new Serialization({
    message: `${className} successfully created.`,
    data: params,
    request: params
  });

  try {
    const processed = await this.load(params);
    serialization.response = new this(processed);
    serialization.success = true;
  } catch (error) {
    logger.info(`${className}.create.load.then failed, error: %o', error`);
    serialization.error = error;
    serialization.message = `${className} creation failed.`;
    serialization.success = false;
  }
  return serialization;
}

/**
 * Generates temporary instance of T and returns object containing combined default properties with passes paramTypes.
 * @param {Partial<T>} params
 * @returns {InstanceType<T>}
 */
static injectDefaults<T extends typeof BaseModel>(
  this: T,
  params: Partial<T> = {}
): InstanceType<T> {
  const temp = new this() as InstanceType<T>;
  return { ...temp, ...params };
}

/**
 * Invokes async BaseModel<T> creation process.
 * @param {Partial<BaseModel<T>>} params
 * @returns {Promise<Partial<BaseModel<T>>>}
 */
static async load<T>(
  params: Partial<BaseModel<T>> = {}
): Promise<Partial<BaseModel<T>>> {
  // Combine paramTypes with default properties.
  params = this.injectDefaults(params);
  return params;
}
```

It's worth noting that the `create()` method, as many of the `BaseModel` methods, are intentionally `static` as opposed to instance methods. This is because we often need to create a new child instance from scratch, so a factory method pattern is ideal.

Working backward here the `injectDefaults()` method does just what the name implies and combines all default properties of the child `T` instance with optional passed properties that will override those defaults. The `load()` method is a generic method that is further expanded upon in child classes like `Tweet`, but `load()` effectively performs the entire creation process of each new `BaseModel<T>` instance.

Finally, the `create()` method accepts some partial parameters, creates a new `Serialization` instance, then invokes the `load()` method of the inheriting `T` type instance. Upon a successful promise the `serialization.response` property is set to a `new` instance of the child instance.

```ts
const processed = await this.load(params);
serialization.response = new this(processed);
```

This illustrates the importance of defining `BaseModel<T>` as a generic type, so we can retrieve information about generic instance types that inherit from `BaseModel<T>`, but without knowing anything more about them. As we'll soon see, when we invoke the `Tweet.create()` method, the `BaseModel<T>.create()` method recognizes it is a type `Tweet` and populates fields like `className`.

We're also using a common pattern you'll see throughout the app, in which we create a `Serialization` instance and return a `Promise<Serialization>` so that other logic throughout the app can evaluate the different properties of the returned `Serialization` and perform further actions.

You may also notice the `BaseModel.upsert<T>()` method looks _suspiciously_ similar to the `BaseModel.create<T>()` method.

```ts
// File: packages/dgraph-query-manager/src/models/BaseModel.ts
/**
 * Create database node of instance if matching Uid doesn't exist.
 * If Uid exists, update node instead.
 * @param {Partial<T>} params
 * @param {Partial<T> | object} params2
 * @returns {Promise<Serialization>}
 */
static async upsert<T>(
  params: Partial<T> = {},
  params2?: Partial<T> | object
): Promise<Serialization> {
  Object.assign(params, params2);
  const className = this.name;
  const serialization = new Serialization({
    message: `${className} upserted.`,
    data: params,
    request: params
  });

  try {
    const payload = await this.load(params);
    serialization.response = new this(payload);
    serialization.success = true;
  } catch (error) {
    serialization.error = error;
    serialization.statusCode = 500;
    serialization.success = false;
    serialization.message = `${className} upsert failed.`;
  }

  return serialization;
}
```

That's because the pattern we're using when invoking `this.load(params)` on an inherited `BaseModel<T>` instance effectively handles both creation and update logic simultaneously (i.e. `upsert`) through Dgraph. To get a better understanding let's dive into one such inheriting model, the `Tweet` class.

### Tweet Model

As discussed, while it'd be possible to handle tweets purely as plain JavaScript objects, it's important that we have additional logic behind our models so we can better manipulate instances in the app and serialize/deserialize transactions between the app and Dgraph. Let's take a look at `dgraph-query-manager/src/models/Tweet.ts` [file](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/packages/dgraph-query-manager/src/models/Tweet.ts).

```ts
// File: packages/dgraph-query-manager/src/models/Tweet.ts
export interface TweetInterface extends BaseModelInterface {
  'tweet.createdAt': Date | string;
  'tweet.favoriteCount'?: number;
  'tweet.favorited': boolean;
  'tweet.hashtag'?: Hashtag[];
  'tweet.inReplyToStatusId'?: Uid;
  'tweet.inReplyToUserId'?: Uid;
  'tweet.isQuoteStatus': boolean;
  'tweet.quotedStatus'?: Tweet;
  'tweet.retweetCount'?: number;
  'tweet.retweeted': boolean;
  'tweet.text': string;
  'tweet.user': User;
}

export class Tweet extends BaseModel<Tweet> implements TweetInterface {
  constructor(params: Partial<Tweet> = {}) {
    super(params);
    // Override defaults
    Object.assign(this, Tweet.deserialize(params));
  }

  /**
   * Deserialize Dgraph form of Tweet object.
   * @param {Partial<any | Tweet>} params
   * @returns {Promise<Partial<Tweet>>}
   */
  static deserialize<Tweet>(params: Partial<Tweet | any> = {}): Partial<Tweet> {
    // Dates
    if (params['tweet.createdAt'])
      params['tweet.createdAt'] = new Date(params['tweet.createdAt']);
    // User
    if (params['tweet.user']) {
      params['tweet.user'] = new User(params['tweet.user']);
    }
    // Hashtags
    if (params['tweet.hashtag']) {
      if (Array.isArray(params['tweet.hashtag'])) {
        params['tweet.hashtag'] = params['tweet.hashtag'].map(
          hashtag => new Hashtag(hashtag)
        );
      } else {
        params['tweet.hashtag'] = [new Hashtag(params['tweet.hashtag'])];
      }
    }
    // Uids
    if (params['tweet.inReplyToStatusId'])
      params['tweet.inReplyToStatusId'] = new Uid(
        params['tweet.inReplyToStatusId']
      );
    if (params['tweet.inReplyToUserId'])
      params['tweet.inReplyToUserId'] = new Uid(
        params['tweet.inReplyToUserId']
      );

    params = super.deserialize(params);
    return params;
  }
}
```

As expected, the `TweetInterface` adds all the properties we defined in our schema. The `Tweet.deserialize<Tweet>()` method that is invoked within the constructor is where we start to see that common logic for serializing and deserializing data throughout the app. As we saw before, `Tweet.deserialize<Tweet>()` accepts a `Partial<Tweet>` argument and then processes those potential params by ensuring values like `tweet.user` are **deserialized** and converted into their representative model forms. Fields that are `uid` values are similarly returned back to `Uid` instances, and so forth. The final step before returning the newly-deserialized parameters is to invoke `super.deserialize()`, which calls `BaseModel<Tweet>.deserialize<Tweet>()` in this case.

```ts
// File: packages/dgraph-query-manager/src/models/BaseModel.ts
export class BaseModel<T> implements BaseModelInterface {
  /**
   * Deserialize Dgraph object.
   * @param {Partial<any | T>} params
   * @returns {Promise<Partial<T>>}
   */
  static deserialize<T>(params: Partial<T | any> = {}): Partial<T> {
    // Update Uid
    if (params.uid) {
      if (Array.isArray(params.uid)) {
        // Assume first Uid is applicable
        params.uid = new Uid(params.uid[0]);
      } else {
        params.uid = new Uid(params.uid);
      }
    }
    return params;
  }
}
```

The `BaseModel` deserialization only performs a small bit of logic, converting any extraneous `uids` into `Uid` instances once again.

That's great and all, but how does this deserialization help? Let's look at the result of the following query which retrieves the first node that contains `tweet.text` (i.e. a "Tweet") Tweet node, along with all nodes of its immediate edges.

<!-- prettier-ignore-start -->
{{< runnable >}}
{
  user(func: has(tweet.text), first: 1)
  {
    uid
    expand(_all_) {
      uid
      expand(_all_)
    }
  }
}
{{</ runnable >}}
<!-- prettier-ignore-end -->

Since initial data is pseudo-randomly generated your result will differ slightly, but it should look something like the following.

```json
{
  "data": {
    "user": [
      {
        "uid": "0xbf8",
        "tweet.user": [
          {
            "uid": "0xbf4",
            "user.listedCount": 605,
            "user.email": "Reese_McLaughlin@example.org",
            "user.friendsCount": 535,
            "user.location": "Eunaport, Uzbekistan",
            "user.createdAt": "2019-04-03T17:41:48.765Z",
            "user.followersCount": 690,
            "user.avatar": "https://s3.amazonaws.com/uifaces/faces/twitter/thehacker/128.jpg",
            "user.screenName": "Cecelia53",
            "user.favouritesCount": 775,
            "user.name": "Fiona Becker",
            "user.url": "https://joey.name",
            "user.description": "Assumenda molestiae saepe ipsum sapiente. Excepturi possimus nemo et sunt et. Ea numquam laboriosam ratione necessitatibus iste officiis voluptatibus et. Repellendus eius ut autem atque. Eius sit ut et. Consequuntur ut accusantium."
          }
        ],
        "tweet.text": "@GabeStah Totam et quo rem et quisquam eligendi quod enim. #efficient #ducimus",
        "tweet.favoriteCount": 432,
        "tweet.hashtag": [
          {
            "uid": "0xbf6",
            "hashtag.hashtag": "efficient",
            "hashtag.indices": [59, 69]
          },
          {
            "uid": "0xbf7",
            "hashtag.hashtag": "ducimus",
            "hashtag.indices": [70, 78]
          }
        ],
        "tweet.createdAt": "2019-04-03T17:41:48.844Z",
        "tweet.isQuoteStatus": true,
        "tweet.favorited": false,
        "tweet.retweetCount": 15,
        "tweet.inReplyToStatusId": [
          {
            "uid": "0x10a3",
            "tweet.retweetCount": 395,
            "tweet.createdAt": "2019-04-03T17:42:32.056Z",
            "tweet.isQuoteStatus": true,
            "tweet.favoriteCount": 126,
            "tweet.favorited": false,
            "tweet.text": "@Keara_Walter33 Open-architected multi-state utilisation #clicks-and-mortar #out-of-the-box",
            "tweet.retweeted": true
          }
        ],
        "tweet.retweeted": true
      }
    ]
  }
}
```

As you may recall from our schema, predicates like `tweet.user`, `tweet.hashtag`, and `tweet.inReplyToStatusId` are `uid`, `[uid]`, `uid` types, respectively. Dgraph knows to retrieve the nodes and relevant data for predicates of such data types when we request them, because of the "edge" the two nodes share. This provides a tremendous amount of power since we can easily retrieve nodes and their relationships without requiring any complex SQL-like queries. Consider the `tweet.inReplyToStatusId` predicate in particular. Our base tweet node has a `uid` of `0xbf8` and its own edge values like `"tweet.text": "@GabeStah Totam et quo rem et quisquam eligendi quod enim. #efficient #ducimus"`. However, `tweet.inReplyTostatusId` references a _different_ tweet node with a `uid` of `0x10a3`, and its entire set of related edges is returned in the query above, including its own `tweet.text` of `"@Keara_Walter33 Open-architected multi-state utilisation #clicks-and-mortar #out-of-the-box"`. Pretty cool!

So, when we query Dgraph and get a result like the one above how do we convert that JSON into our model-like formats? We **deserialize** it! With the logic we explored above in `Tweet.ts` and `BaseModel.ts`, our constructor can accept a _partial_ `Tweet` object retrieved from Dgraph and go through the process of deserializing it to convert fields like `tweet.inReplyToStatusId` into a `Tweet` model instance.

{{% notice "note" %}} You may be wondering why we opted for this predicate naming convention -- prefixing predicates with the "object" type they refer to, such as `tweet.inReplyToStatusId`. Dgraph and GraphQL+- do not have any such requirements, so the first reason is just to better illustrate the separation of concerns between where we expect data to be stored. The second reason is since this is a Twitter clone app, we're using many of the same field names that the official [Twitter API](https://developer.twitter.com/en/docs/tweets/post-and-engage/api-reference/get-statuses-show-id) uses. That said, feel free to name your predicates however you see fit.{{% /notice %}}

#### Creating Tweets

To see how we create a new `Tweet` first recall that the `BaseModel<T>.create()` method invokes the `this.load()` method and uses that result to generate a new instance of `this`.

```ts
// File: packages/dgraph-query-manager/src/models/BaseModel.ts
static async create<T extends typeof BaseModel>(
  params: Partial<BaseModel<T>>
): Promise<Serialization> {
  const className = this.name;
  const serialization = new Serialization({
    message: `${className} successfully created.`,
    data: params,
    request: params
  });

  try {
    const processed = await this.load(params);
    serialization.response = new this(processed);
    serialization.success = true;
  } catch (error) {
    logger.info(`${className}.create.load.then failed, error: %o', error`);
    serialization.error = error;
    serialization.message = `${className} creation failed.`;
    serialization.success = false;
  }
  return serialization;
}
```

The `Tweet.load()` method contains all the logic for serializing itself into a format Dgraph understands, performing the actual insertion (i.e. mutation), and then deserializing and returning the result.

```ts
// File: packages/dgraph-query-manager/src/models/Tweet.ts
export class Tweet extends BaseModel<Tweet> implements TweetInterface {
  /**
   * Performs all steps of async Tweet creation.
   * @param {Partial<Tweet>} params
   * @returns {Promise<Partial<Tweet>>}
   */
  static async load(params: Partial<Tweet> = {}): Promise<Partial<Tweet>> {
    // Combine paramTypes with default properties.
    params = this.injectDefaults(params);
    // Load child elements (e.g. User.load(['tweet.user']) )
    params = await this.loadChildren(params);
    // Serialize (e.g. convert fields to payload-compatible object)
    params = await this.serialize(params);
    // Perform mutation (e.g. upsert)
    const serialization = await this.insert(params);
    if (!params.uid) {
      params.uid = new Uid(serialization);
    }
    // Deserialize (e.g. convert payload back to Models)
    params = this.deserialize(params);
    return params;
  }

  /**
   * Preprocessor that parses text, Hashtags, and User.  Invokes .create methods for each to ensure children exist.
   * @param {Partial<Tweet>} params
   * @returns {Promise<Partial<Tweet>>}
   */
  static async loadChildren(
    params: Partial<Tweet> = {}
  ): Promise<Partial<Tweet>> {
    // Only create Hashtags if no Hashtags exist
    if (!params['tweet.hashtag'] || params['tweet.hashtag'].length === 0) {
      // Parse hashtags
      params = this.extractHashtags(params);
      // Create Hashtags
      const hashtags = params['tweet.hashtag'];
      if (hashtags && Array.isArray(hashtags) && hashtags.length > 0) {
        params['tweet.hashtag'] = (await Hashtag.createMany(
          hashtags
        )) as Hashtag[];
      }
    }
    // Create User
    const user = params['tweet.user'];
    if (user && Object.keys(user).length > 0) {
      params['tweet.user'] = (await User.create(user)).response as User;
    }
    return params;
  }
}
```

Stepping through the logic of `Tweet.load()` we already saw how `injectDefaults()` works, but after default values are loaded we then need to ensure any children are also loaded **before** the parent `Tweet` object is created. This prevents invalid data from being inserted into the database and also ensures the data we _do_ add is as complete as possible since we don't want to perform unnecessary mutations or queries.

In this case, `Tweet.loadChildren()` determines if the existing params contain `Hashtags`, and if not, it then extracts potential hashtags from the `tweet.text` value via the `this.extractHashtags()` method. If any hashtags are extracted it creates a new `Hashtag[]` array by calling `Hashtag.createMany()` with the passed parameters. Here we see the importance of our `BaseModel<T>` using generic types, since the `Hashtag` class doesn't actually have a `createMany()` method -- we're just invoking the `BaseModel<Hashtag>.createMany()` method instead.

A similar process occurs for the `tweet.user` parameter by creating a new `User` instance if the params indicate that one exists.

{{% notice "tip" %}} Since the `Tweet.loadChildren()` method invokes `Hashtag.createMany()` and `User.create()` as necessary, this provides the proper order of operations discussed above. Calling `.create()` within the `User` and `Hashtag` classes invokes their own `.load()` procedures, respectively, which ensures the result of `Tweet.loadChildren()` contains all the newly created child instances that are needed for the `Tweet` to be created. Since the load process of any individual model actually connects to Dgraph and performs a new transaction as needed, the resulting model instances will even contain their newly-generated `uid` values. {{% /notice %}}

After children are loaded we need to invoke the `BaseModel<T>.serialize()` method, which does just as it sounds and converts our model instance into a serialized format that Dgraph can work with.

```ts
// File: packages/dgraph-query-manager/src/models/BaseModel.ts
export class BaseModel<T> implements BaseModelInterface {
  /**
   * Serialize object into Dgraph acceptable format for JSON transaction.
   * @param {Partial<any | T>} params
   * @returns {Promise<Partial<T>>}
   */
  static async serialize<T>(
    params: Partial<T | any> = {}
  ): Promise<Partial<T>> {
    const serialization: any = {};
    // Update Uid
    if (params.uid) {
      if (Array.isArray(params.uid)) {
        // Assume first Uid is applicable
        params.uid = new Uid(params.uid[0]);
      } else {
        params.uid = new Uid(params.uid);
      }
    }
    for await (const key of Object.keys(params)) {
      // Check if Uid
      if (params[key] instanceof Uid && key === 'uid') {
        // Convert Uid to string values
        serialization[key] = params[key].toString();
      } else if (params[key] instanceof BaseModel) {
        // For BaseModel instances recursively serialize
        serialization[key] = await this.serialize(params[key]);
      } else if (
        Array.isArray(params[key]) &&
        params[key].filter(instance => instance instanceof BaseModel).length > 0
      ) {
        const instances: any[] = [];
        for await (const instance of params[key]) {
          instances.push(await this.serialize(instance));
        }
        serialization[key] = instances;
      } else {
        serialization[key] = params[key];
      }
    }
    return serialization;
  }
}
```

The majority of the serialization process is converting `Uid` instances into string representations since Dgraph can't handle a scalar value (i.e. a JavaScript object) where it expects a `uid` type.

The last major step for creating a new `Tweet` is to perform the actual mutation in Dgraph, then deserialize and return the result. Thus, the `.load()` method invokes the `BaseModel<T>.insert()` method, which can be seen below.

```ts
// File: packages/dgraph-query-manager/src/models/BaseModel.ts
export class BaseModel<T> implements BaseModelInterface {
  /**
   * Directly insert object into database.
   * @param {Partial<T>} params
   * @param {Partial<T> | object} params2
   * @returns {Promise<Serialization>}
   */
  static async insert<T>(
    params: Partial<T> = {},
    params2?: Partial<T> | object
  ): Promise<Serialization> {
    Object.assign(params, params2);
    const adapter = new DgraphAdapter();
    const className = this.name;
    let serialization = new Serialization({
      message: `${className} created.`,
      request: params,
      data: params,
    });

    try {
      serialization = await adapter.mutate(serialization);
      serialization.success = true;
    } catch (error) {
      serialization.statusCode = 500;
      serialization.success = false;
      serialization.error = error;
      serialization.message = `${className} creation failed.`;
    }

    return serialization;
  }
}
```

Similar to the `BaseModel<T>.create()` method, `BaseModel<T>.insert()` returns a `Serialization` instance based on the result of the mutation. The critical line here is `serialization = await adapter.mutate(serialization);` in which we connect to Dgraph and perform the actual mutation. The result (which is also a `Serialization`) is then returned by `BaseModel<T>.insert()` and tells us whether we succeeded or not. Thus, this is a great time to take a look at how we perform mutations, which is done in the `DgraphAdapterHttp` class.

### Using Our Dgraph Adapter

We're working with the [dgraph-js-http](https://github.com/dgraph-io/dgraph-js-http) library to execute queries and mutations on our Dgraph server, but we need an adapter that bridges our model data to transactional data Dgraph understands and can work with. Therefore, let's [take a look](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/packages/dgraph-query-manager/src/adapters/DgraphAdapterHttp.ts) at `dgraph-query-manager/src/adapters/DgraphAdapterHttp.ts`.

```ts
// File: packages/dgraph-query-manager/src/adapters/DgraphAdapterHttp.ts
export class DgraphAdapterHttp {
  /**
   * Endpoint address of Dgraph server.
   */
  address = config.dgraph.adapter.address;

  /**
   * Dgraph client.
   */
  protected client: NonNullable<DgraphClient>;

  /**
   * Dgraph client stub.
   */
  protected clientStub: NonNullable<DgraphClientStub>;

  constructor(address?: string) {
    if (address) this.address = address;
    this.clientStub = new DgraphClientStub(this.address);
    this.client = new DgraphClient(this.clientStub);
  }

  /**
   * Alter the database schema.
   * @param {string} schema
   * @returns {Promise<boolean>}
   */
  async alterSchema(schema: string): Promise<boolean> {
    try {
      await this.client.alter({ schema });
      logger.info(`Dgraph schema altered: %s`, schema);
      return true;
    } catch (error) {
      logger.error(`Dgraph schema alteration failed, error: %s`, error);
      return false;
    }
  }

  /**
   * Drop all database data.
   * @returns {Promise<boolean>}
   */
  async dropAll(): Promise<boolean> {
    try {
      await await this.client.alter({ dropAll: true });
      logger.info(`All Dgraph data dropped.`);
      return true;
    } catch (error) {
      logger.error(`Dgraph data drop failed, error: %s`, error);
      return false;
    }
  }

  /**
   * Recursively flattens arrays within passed object.
   * Sets object key value pointing to a single-element array to value of that only element.
   * @param {object} obj
   * @returns {any}
   */
  static flattenArrays(obj: any) {
    let copy: any = obj;
    if (Array.isArray(obj) && obj.length === 1) {
      copy = DgraphAdapterHttp.flattenArrays(copy[0]);
    } else if (Array.isArray(obj)) {
      obj.forEach((value, key) => {
        copy[key] = DgraphAdapterHttp.flattenArrays(value);
      });
    } else {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (Array.isArray(obj[key]) && obj[key].length === 1) {
            // Set keyvalue to first (and only) array value.
            copy[key] = DgraphAdapterHttp.flattenArrays(obj[key][0]);
          }
        }
      }
    }

    return copy;
  }

  /**
   * Execute a database mutation using passed payload object or BaseModel<T> instance.
   * @param {Serialization} serialization
   * @param {MutationTypes} mutationType
   * @param {boolean} commitNow
   * @returns {Promise<Partial<T>>}
   */
  async mutate<T>(
    serialization: Serialization,
    mutationType: MutationTypes = MutationTypes.SetJson,
    commitNow = false
  ): Promise<Serialization> {
    if (serialization.request === undefined) {
      throw Error(
        `DgraphAdapterHttp.mutate error, payload undefined for data: ${
          serialization.data
        }`
      );
    }
    const transaction = this.client.newTxn();
    const uids: string[] = [];
    logger.debug('DgraphAdapterHttp.mutate, payload: %o', serialization);
    try {
      const payload: any = {};
      payload.commitNow = commitNow;
      switch (mutationType) {
        case MutationTypes.SetJson:
          payload.setJson = serialization.request;
          break;
        case MutationTypes.DeleteJson:
          payload.deleteJson = serialization.request;
          break;
      }
      const assigned = await transaction.mutate(payload);
      if (!commitNow) await transaction.commit();
      Object.entries(assigned.data.uids).forEach(([key, uid]) =>
        uids.push(uid)
      );
    } catch (e) {
      logger.error(
        'DgraphAdapterHttp.mutate, payload: %o, mutationType: %o, error: %o',
        serialization,
        mutationType,
        e
      );
    } finally {
      await transaction.discard();
    }
    // Assign generated uids
    if (uids.length > 0) serialization.uid = uids;
    return serialization;
  }

  /**
   * Execute a database query.
   * @param {string} serialization
   * @returns {Promise<string>}
   */
  async query<T>(serialization: Serialization): Promise<Serialization> {
    const transaction = this.client.newTxn();
    try {
      const res = await transaction.query(serialization.request);
      serialization.response = DgraphAdapterHttp.flattenArrays(res.data);
    } catch (e) {
      logger.error('DgraphAdapterHttp.query, error: %o', e);
    } finally {
      await transaction.discard();
    }
    return serialization;
  }

  /**
   * Execute a database query with paramTypes.
   * @param {string} serialization
   * @param vars
   * @returns {Promise<any>}
   */
  async queryWithVars(
    serialization: Serialization,
    vars?: any
  ): Promise<Serialization> {
    const transaction = this.client.newTxn();
    try {
      const res = await transaction.queryWithVars(serialization.request, vars);
      serialization.response = DgraphAdapterHttp.flattenArrays(res.data);
    } catch (e) {
      logger.error(
        'DgraphAdapterHttp.queryWithVars, query: %s, paramTypes: %o, error: %o',
        serialization,
        vars,
        e
      );
    } finally {
      await transaction.discard();
    }
    return serialization;
  }
}
```

Logically, the `DgraphAdapterHttp` class mimics much of the [client](https://github.com/dgraph-io/dgraph-js-http/blob/master/src/clientStub.ts) and [transaction](https://github.com/dgraph-io/dgraph-js-http/blob/master/src/txn.ts) logic found in the [dgraph-js-http](https://github.com/dgraph-io/dgraph-js-http) package. The `DgraphAdapterHttp` exposes helper methods for _adapting_ our custom business logic and models to the underlying transaction methods of `dgraph-js-http`. To that end, the constructor creates a new Dgraph client and client stub used to connect to our Dgraph server. As you'll recall, the `BaseModel<T>.insert()` method that performs the actual creation of data in our app invokes the `DgraphAdapterHttp.mutate<T>()` method, so let's examine what's going on in there.

As we've seen before, the main argument passed to the `DgraphAdapterHttp.mutate<T>()` is a `Serialization` instance which has a `.request` property. We create a new transaction using the Dgraph client, then create a temporary `payload` object into which we'll assign the appropriate properties that Dgraph expects, depending on the mutation we want to perform. For example, the `setJson` property is used when we want to set data in JSON format. This comes directly from the [`DgraphClientStub`](https://github.com/dgraph-io/dgraph-js-http/blob/master/src/clientStub.ts#L60) class in `dgraph-js-http`. We assign the `payload.setJson` property to our `serialization.request` value, then invoke the `transaction.mutate()` method from `dgraph-js-http`, which passes the payload and returns the result. If applicable, we also grab the node `uid(s)` that were generated as a result of this transaction and assign them to our returned serialization object. As you can see, the other `DgraphAdapterHttp` methods such as `.query()` and `.queryWithVars()` function much the same way, so we won't go into detail on how those work.

{{% notice "tip" %}} If your application is Node-based and doesn't need to integrate with a client-side application, the [`DgraphAdapter`](https://github.com/GabeStah/dgraph-twitter-clone/tree/master/packages/dgraph-adapter) package is also included in the `dgraph-query-manager/packages` directory. It functions similarly to the `DgraphAdapterHttp` class that is covered in this guide section, but it uses the [`dgraph-js`](https://github.com/dgraph-io/dgraph-js) library for Node-based grpc transactions. {{% /notice %}}

### Organizing Queries

Another major component of the `DgraphQueryManager` package is the `Query` class. The `Query` class simplifies the process of creating and managing GraphQL+- queries so the `dgraph-twitter-clone` app can invoke them in whatever manner is needed, whether directly, indirectly, or via the API. To explore the `Query` class let's first quickly look at an example of how a new `Query` instance is generated in the `Queries/TweetQueries.ts` [file](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/packages/dgraph-query-manager/src/classes/Queries/TweetQueries.ts#L42).

```ts
// File: packages/dgraph-query-manager/src/classes/Queries/TweetQueries.ts
export const TweetQueries = {
  /**
   * Get first N Tweets.
   */
  getAllPaginated: new Query(
    `query find($count: int = 10) {
      data(func: has (tweet.text), first: $count) {
        uid
        expand(_all_) {
          uid
          expand(_all_)
        }
      }
    }`,
    '/tweets/:count',
    [new ParamType('$count', TypeOf(String))]
  ),
};
```

The actual GraphQL+- query text passed as the first argument above should look pretty familiar to you -- it's close to what we executed at the start of this tutorial.

<!-- prettier-ignore-start -->
{{< runnable >}}
query find($count: int = 10) {
  data(func: has (tweet.text), first: $count) {
    uid
    expand(_all_) {
      uid
      expand(_all_)
    }
  }
}
{{</ runnable >}}
<!-- prettier-ignore-end -->

In this case we're passing a [GraphQL-style variable](https://docs.dgraph.io/query-language/#graphql-variables) called `$count`. This allows queries to receive arguments at runtime in the form of passed parameters. You may recall above we mentioned the `DgraphAdapterHttp.queryWithVars()` method -- the vars passed there is an object containing the key/value pairs that the query string expects. So, we could call the above query and pass the following `params` object as vars to retrieve the first `50` tweets, rather than the default of only `10`.

```js
const params = {
  $count: 50,
};
```

Back to the `Query` class, which is [found at](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/packages/dgraph-query-manager/src/classes/Query.ts) `dgraph-query-manager/src/classes/Query.ts`.

```ts
// File: packages/dgraph-query-manager/src/classes/Query.ts
export enum HttpMethods {
  DELETE,
  GET,
  POST,
  PUT,
}

export interface QueryInterface {
  httpMethod: HttpMethods;
  objectType: string;
  params: object;
  paramTypes?: ParamType<any>[];
  query: string;
  route: string;
  tree: string[][];
}

/**
 * Helper class for creating queries to be executed by Dgraph via dgraph-adapter.
 */
export class Query implements QueryInterface {
  private _objectType: string;
  get objectType(): string {
    // Set initial value if not specified.
    if (!this._objectType) this.objectType = this.getObjectTypeFromRoute();
    return this._objectType;
  }

  set objectType(value: string) {
    this._objectType = value;
  }

  params: object;
  httpMethod: HttpMethods = HttpMethods.GET;
  paramTypes?: ParamType<any>[];
  query: string;
  route: string;
  tree: string[][] = [];

  /**
   * @param query - Query string.
   * @param route - REST_API route.
   * @param paramTypes? - Collection of valid parameter types.
   * @param tree? - Results tree definition.
   * @param httpMethod
   * @param params
   */
  constructor(
    query: string,
    route: string,
    paramTypes?: ParamType<any>[],
    tree?: string | string[],
    httpMethod: HttpMethods = HttpMethods.GET,
    params?: object
  ) {
    this.paramTypes = paramTypes;
    this.parseTree(tree);
    this.query = query;
    this.route = route;
    this.httpMethod = httpMethod;
    if (params) this.params = params;
  }

  /**
   * Parses the route string and obtains assumed retrieved object type.
   * e.g. '/tweets/:uid' returns 'tweets'
   */
  private getObjectTypeFromRoute(): string {
    const value = this.route.split('/')[1];
    return value ? value : 'Unknown';
  }

  /**
   * Validates passed params with specified paramTypes, if applicable.
   */
  validateParams() {
    const paramTypes = this.paramTypes;
    if (!this.params) {
      if (paramTypes) {
        logger.error(`No params found for query: ${this.query}`);
        return false;
      }
    } else {
      if (paramTypes) {
        paramTypes.forEach(paramType => {
          // Check that params contain this paramType key.
          if (this.params.hasOwnProperty(paramType.key)) {
            // Skip undefined or null
            if (this.params[paramType.key]) {
              // Checks that constructor type of parameter matches paramType.
              if (
                this.params[paramType.key].constructor.name !==
                paramType.type.constructor.name
              ) {
                logger.error(
                  `Param for key of (${
                    paramType.key
                  }) must match constructor paramType of (${
                    paramType.type.constructor.name
                  }).`
                );
                return false;
              }
            }
          } else {
            logger.error(
              `Params must contain paramType key of (${paramType.key}).`
            );
            return false;
          }
        });
      }
    }
    return true;
  }
}
```

I've cut out of a few extra helper methods above to focus on the main logic. As seen in the `TweetQueries.getAllPaginated` query instantiation above we've passed a number of arguments to the `Query` constructor. The first is our GraphQL+- query string. The second is a `route` string, which will be used by [ExpressJS](https://expressjs.com/) in the event we want to perform a query with the API (more on that later). The third parameter is an array of custom `ParamType` objects, which are custom types that help determine if passed runtime parameters are valid. We'll see how these are validated in the next section.

### Simplifying Query Execution

The final major component of the `DgraphQueryManager` package is the `DgraphQueryExecutor`, which is [found](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/packages/dgraph-query-manager/src/classes/DgraphQueryExecutor.ts) in the `dgraph-query-manager/src/classes/DgraphQueryExecutor.ts` file. As we saw in the [Models](#models) section our `BaseModel<T>` and subsequent inheriting models all have the ability to manipulate their data explicitly and invoke Dgraph queries/transactions themselves. However, as discussed at the outset of this guide one overall goal of this project is to allow the `dgraph-twitter-clone` client app to perform Dgraph transactions in a variety of ways, including directly with GraphQL+- queries, with JSON-like object data, or indirectly via the API app. We absolutely _could_ bypass the use of the `Query` class and just manually pass query strings (with optional params) to our `DgraphAdapterHttp` instance to perform Dgraph queries. On the other hand, there are some use cases where an intermediary middleware is necessary for the application to function properly. Whether that's an API or simply just additional logic is based on the app, so the `dgraph-twitter-clone` app provides the means to do _all_ those types of interactions with Dgraph. We'll look at the differences in functionality when we explore the client app, but the three methods can be swapped between by changing the `config.connectionType` property in [dgraph-query-manager/src/config/development.ts](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/packages/dgraph-query-manager/src/config/development.ts#L4).

So, what does the `DgraphQueryExecutor` actually _do_? Let's dig into the code a bit.

```ts
// File: packages/dgraph-query-manager/src/classes/DgraphQueryExecutor.ts
export enum DgraphConnectionType {
  API,
  REST_API,
  DIRECT,
}

export interface DgraphQueryExecutorInterface {
  isMutation: boolean;
  query: Query;
  request?: Serialization;
}

export enum DgraphQueryExecutorModes {
  Query,
  QueryWithVars,
  Json,
  DeleteJson,
}

export class DgraphQueryExecutor implements DgraphQueryExecutorInterface {
  isMutation = false;
  query: Query;
  request?: Serialization;

  constructor(
    query: Query,
    params?: object,
    isMutation = false,
    request?: Serialization
  ) {
    this.isMutation = isMutation;
    this.query = query;
    this.request = request;
    if (params) this.query.params = params;
    if (query.validateParams()) {
      query.injectCustomParams();
    }
  }

  /**
   * Execute Dgraph query based on instance properties and configuration.
   */
  async execute(
    connectionType: DgraphConnectionType = config.connectionType
  ): Promise<Serialization> {
    let serialization;
    if (connectionType === DgraphConnectionType.REST_API) {
      serialization = await this.executeRestApiRequest();
    } else if (connectionType === DgraphConnectionType.API) {
      serialization = await this.executeJsonApiRequest();
    } else {
      // Default to direct.
      serialization = await this.executeDirectRequest(this.request);
    }

    // Assume singular array of 'data' if not included.
    const tree =
      this.query.tree && this.query.tree.length > 0
        ? this.query.tree
        : new Array(['data']);

    if (serialization.response) {
      let combinedResponse: any[] = [];
      for (const branch of tree) {
        let branchResponse = serialization.response;
        for (const stick of branch) {
          if (branchResponse[stick]) {
            branchResponse = branchResponse[stick];
          }
        }
        // Combines all previous arrays with new response array to generate full result set.
        combinedResponse = combinedResponse.concat(branchResponse);
      }
      serialization.message = `No ${this.query.objectType} found.`;

      // Flatten arrays
      serialization.response = DgraphAdapter.flattenArrays(
        combinedResponse ? combinedResponse : serialization.response
      );
      if (
        !Array.isArray(serialization.response) ||
        (Array.isArray(serialization.response) &&
          serialization.response.length > 0)
      ) {
        serialization.message = `${this.query.objectType} found.`;
        serialization.success = true;
      }
    }

    return serialization;
  }

  /**
   * Makes a REST API query request via explicit `/api/route/endpoints`.
   */
  async executeRestApiRequest(): Promise<Serialization> {
    const uri = this.query.uri(this.query.params);
    const response = new Serialization({
      message: `Failed to retrieve ${
        this.query.objectType
      } via REST API request.`,
      request: this.query.query,
      uri,
    });

    // Get URL
    const url = `${config.dgraph.api.protocol}://${config.dgraph.api.host}:${
      config.dgraph.api.port
    }/api/${uri}`;

    try {
      const axiosResponse = await axios.get(url);
      logger.info(
        `DgraphQueryExecutor.executeRestApiRequest response %o`,
        axiosResponse.data
      );
      response.response = axiosResponse.data.response;
      response.success = true;
    } catch (error) {
      logger.error(error);
      response.error = error;
    }

    return response;
  }

  /**
   * Makes an API query request via JSON payload.
   */
  async executeJsonApiRequest(): Promise<Serialization> {
    const response = new Serialization({
      message: `Failed to retrieve ${
        this.query.objectType
      } via JSON API request.`,
      request: this.query.query,
    });

    // Get URL
    const url = `${config.dgraph.api.protocol}://${config.dgraph.api.host}:${
      config.dgraph.api.port
    }/api/json`;

    try {
      const axiosResponse = await axios.post(url, this);
      logger.info(
        `DgraphQueryExecutor.executeJsonApiRequest response %o`,
        axiosResponse.data
      );
      response.response = axiosResponse.data.response;
      response.success = true;
    } catch (error) {
      logger.error(error);
      response.error = error;
    }

    return response;
  }

  /**
   * Makes a direct request via GraphQL+-.
   * @param request
   */
  async executeDirectRequest(request?: Serialization): Promise<Serialization> {
    const adapter = new DgraphAdapter();
    let response = new Serialization({
      message: `Failed to retrieve ${
        this.query.objectType
      } via direct GraphQL+ request.`,
      request: this.query.query,
    });

    // Allow request to be optionally passed.
    request = request ? request : response;

    if (this.isMutation) {
      response = await adapter.mutate(request);
    } else {
      if (this.query.paramTypes) {
        response = await adapter.queryWithVars(request, this.query.params);
      } else {
        response = await adapter.query(request);
      }
    }
    return response;
  }
}
```

As the name implies, all `DgraphQueryExecutor` really does is provides a logical wrapper for executing `Query` instances in the appropriate manner. The constructor accepts a `Query` argument, along with a few optional arguments. As mentioned, we want to allow Dgraph transactions to occur in a variety of ways, so the `DgraphQueryExecutor.execute()` method accepts an optional `connectionType` argument and executes a request based on that type of transaction. There's also a bit of logic to clean up the `Serialization` response by removing extraneous data, flattening singular arrays, and so forth. However, the real meat and potatoes are in the `executeX` methods.

For example, `DgraphQueryExecutor.executeDirectRequest()` takes the `this.query` property and creates a valid `Serialization` request object out of it, which is then passed along to the appropriate `DgraphAdapterHttp` method that performs the actual Dgraph transaction. While this fancies things up, invoking the `executeDirectRequest()` method is no different than directly calling our Dgraph adapter and passing the appropriate query string and optional params.

The `DgraphQueryExecutor.executeRestApiRequest()` method starts by generating a valid `uri` using the `Query` instance `uri` property and the query params.

```ts
// File: packages/dgraph-query-manager/src/classes/Query.ts
export class Query implements QueryInterface {
  /**
   * Generates the proper URI from route and passed params.
   * @param params
   */
  uri(params?: object): string | undefined {
    let newUri = this.route;
    if (params) {
      // replace $ in params with :
      Object.entries(params).forEach(([key, value]) => {
        newUri = newUri.replace(key.replace('$', ':'), value);
      });
    }
    return newUri;
  }
}
```

The `Query.uri()` method can be seen above and essentially just replaces passed `params` values into the `route` property string where they go. This changes a REST endpoint of something like `/tweets/user/:id` into `/tweets/user/0x12f42`.

The `DgraphQueryExecutor.executeRestApiRequest()` method uses the [Axios](https://github.com/axios/axios) HTTP client to perform a request to the generated URL endpoint and assigns the response to the `response` `Serialization` instance that is returned.

{{% notice "warning" %}} The endpoints created for the `dgraph-twitter-clone` example app merely return data based on their simple parameters. A fully-fledged app would obviously expand on the endpoint system and even accept custom data at those endpoints, but merely calling `axois.get(url)` to illustrate the point works fine here. {{% /notice %}}

Lastly, the `DgraphQueryExecutor.executeJsonApiRequest()` method is similar to `executeRestApiRequest()`, but what's critically different is the call to `axios.post(url, this)`. First, you'll notice the generated url endpoint is a static `/api/json`. Second, we're actually passing the entire `DgraphQueryExecutor` instance (`this`) to our API endpoint. What does this accomplish? It effectively allows us to perform **direct** JSON-like transactions on Dgraph, but by first passing through our API. We'll see how the API handles this in that section of the guide, but this method of performing a Dgraph transaction is a nice middle ground between direct calls and pure REST API -- we can still use complex objects and instances along with the power of Dgraph's GraphQL+- query language, while also invoking our own "middleware" API for pre-transaction processing. Cool!

## Next Steps

We've gone over the architecture of our `dgraph-twitter-clone` app and examined how we'll use the `dgraph-query-manager` package to enable both our API and client apps to communicate with one another -- or directly with Dgraph -- with a stable groundwork for expanding on these apps or taking these concepts into your own projects. Take a look at [Part 2 - The API]({{% ref "/part-2-api" %}}) where we'll dig into the API side of our application, which is built using the popular [ExpressJS](https://expressjs.com/) library. You'll see how a few smart design decisions give us tremendous flexibility to connect with and utilize Dgraph in whatever manner best suits our team or application needs.

From there, head over to [Part 3 - The Client]({{% ref "/part-3-client" %}}), which explores our [React](https://reactjs.org/) client application. You'll see how its use of [React Hooks](https://reactjs.org/docs/hooks-intro.html), effective state management, and actions + reducers allow us to create a simple, but effective Twitter-like application backed by Dgraph and its powerful GraphQL+- syntax.
