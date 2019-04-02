---
title: 'Building a Twitter Clone with Dgraph and React'
date: 2019-03-24T10:42:34-07:00
draft: false
---

<script type="text/javascript">window.DGRAPH_ENDPOINT = "http://127.0.0.1:8080/query?latency=true";</script>

## Prerequisites

This tutorial aims to provide a step-by-step process of creating a Twitter clone application by using the power of Dgraph to handle the data. We'll also use React to create the front-end client application. However, before you begin, there are a handful of prerequisites to install, or simply to be aware of.

### Install Dgraph

You'll need the Dgraph cluster installed, either locally or via an accessible Docker container. This entire tutorial was created while running Dgraph on Docker, which can be installed using the [Docker Compose](https://docs.dgraph.io/get-started/#docker-compose) file [found here](https://docs.dgraph.io/get-started/#docker-compose). Alternatively, feel free to install Dgraph in whatever manner best suits your needs. Check out the [official documentation](https://docs.dgraph.io/get-started/#step-1-install-dgraph) for more details.

### Install Node

The Dgraph Twitter Clone app relies heavily on Node.js, so you'll also need Node locally installed. Visit the [official site](https://nodejs.org/en/) to download the correct version for your OS.

### TypeScript

All the code throughout the Dgraph Twitter Clone project is written with [TypeScript](https://www.typescriptlang.org/), which is a superset of plain JavaScript that provides typing and other quality of life features for creating cleaner code. While you won't need to be particularly familiar with TypeScript to follow along with this tutorial, be aware that some of the code syntax used throughout the tutorial is TypeScript-specific. Ultimately, all TypeScript code is converted into normal JavaScript prior to execution, so there's nothing in this tutorial that couldn't have been created in plain JavaScript at the outset.

### IDE

You'll also want a text editor or integrated development environment (IDE). Anything will do, but some popular choices are [VS Code](https://code.visualstudio.com/), [WebStorm](https://www.jetbrains.com/webstorm/), [Atom](https://atom.io/), [Brackets](http://brackets.io/), and [Sublime Text](https://www.sublimetext.com/).

## Planning Our Application Architecture

Before we start coding let's take a moment to define what the goal of our application is and roughly how it'll be structured to accomplish that goal. This tutorial aims to illustrate how Dgraph -- the world's most advanced graph database -- can simplify the structure and lower the development time of a real-world application. While this application is just a proof of concept and far from production-ready software, the overall goal of the `dgraph-twitter-clone` is to create a solid foundation for a Twitter-like front-end application that is powered by Dgraph.

Furthermore, since graph databases are not as well-known as relational databases, the secondary goal of our app is to provide some familiarity for those readers coming from a relational database background. The app should illustrate how a "traditional" relational database might handle the app data, while then taking it a step further and showing how that data can be more easily queried and manipulated with a graph database like Dgraph. The following are a few key components we'll need to accomplish those goals and create a functional Twitter clone application.

### Models

As you're undoubtedly aware, Twitter's functionality largely revolves around just two simple pieces of data, and their relationship to one another: **Tweets** and **Users.** A user has something to say, so he or she creates a tweet, publishing it for other users to consume. While they are secondary to their parent tweet, **Hashtags** are also a popular piece of data Twitter data.

Therefore, at a minimum our application will need a model to represent those three critical pieces of information.

### Dgraph Adapter

We need to manipulate data on our Dgraph server and Dgraph's official [dgraph-js-http](https://github.com/dgraph-io/dgraph-js-http) package provides a useful API for creating [grpc-based](https://grpc.io/) transactions and mutations. Our application will use `dgraph-js-http`, but we'll need to create a simple adapter that can help us transform our model data into a format Dgraph understands.

### Queries

Dgraph's [GraphQL+- query language](https://docs.dgraph.io/query-language/) was developed to bring much of the power of Facebook's popular [GraphQL](https://facebook.github.io/graphql/) to graph databases, while adjusting the feature set to suit the needs of graph databases. A fundamental component of GraphQL+- is the **query**. [Queries for Dgraph](https://docs.dgraph.io/design-concepts/#queries) are used to retrieve and manipulate data, just like queries in relational databases.

For example, the following query uses the `eq` function to find all nodes with a `user.screenName` equal to `GabeStah`.

<!-- prettier-ignore -->
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

Since our query specifies exactly the data we want to return, we only retrieve the unique identifier, screen name, friends count, and description of the user. The output will look something like the following.

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

Our app also needs a front-end site that loosely emulates Twitter. For this tutorial we'll be using the [React](https://reactjs.org) JavaScript library to create our Twitter clone single-page application. You don't need any prior React experience to follow along with this tutorial, but we'll also be taking advantage of the new [React Hooks](https://reactjs.org/docs/hooks-intro.html) feature introduced to React in early 2019.

Since our Twitter clone app is primarily focused on how Dgraph and graph databases can be used for a Twitter-esque application, the front-end portion will be limited in scope -- we just need enough there to lay the groundwork and show how it all integrates together.

### Back-end Express API

To help illustrate how a relational database would typically handle Twitter-like data we'll also be adding a simple API to our application. In fact, by designing it properly, we'll make an app that can transition between using REST API endpoints and GraphQL+- queries with the flip of a configuration flag.

We'll even take it one step further and allow our API to act as a middleware between the front-end client and Dgraph. This will help illustrate how a real-world application might gain a tremendous benefit from exposing simple endpoints to users or other applications, while simultaneously querying and manipulating the underlying data within a graph database like Dgraph.

---

With all the basic components planned out let's get right into creating our `dgraph-twitter-clone` application!

## Create a New Project

Let's get started by creating a root directory for our project, `dgraph-twitter-clone`, and establishing a new Node project in it.

```bash
$ mkdir dgraph-twitter-clone && cd dgraph-twitter-clone
$ yarn init -y
```

Let's also initialize a new Git repository, just to get started off right.

```bash
$ git init
```

## Create Schema

The next step is to alter our Dgraph schema so it's configured for the models we'll use throughout the application. As discussed, we want to add tweets, users, and hashtags, so the following is the full schema we'll be using.

<!-- prettier-ignore -->
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

Posting this schema to the `/alter` endpoint of Dgraph should return a `{ "code": "Success", "message": "Done" }` object to indicate the schema was altered. The Dgraph schema defines valid types for a given predicate using a `predicate: type [@directives]` format. For example, let's break down the `tweet.text` predicate specification in the schema above.

```
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

The [`@index`](https://docs.dgraph.io/query-language/#indexing) directive tells Dgraph to index the predicate based on the passed `tokenizer(s)`. In this case, our data type of `string` allows us to perform a full text search, which will be useful later so users can easily search through Tweets. The `@count` directive tells Dgraph to index the _number_ of edges with this predicate, so we can query the quantity of tweets, perhaps based on filters like the user that authored those tweets. The [`@upsert` directive](https://docs.dgraph.io/query-language/#upsert-directive) enables conflict checking when committing a transaction. While this still requires business logic on our part, it can be useful to help prevent duplicate entries under certain circumstances.

The schema specification is quite in-depth, so check out the [official schema documentation](https://docs.dgraph.io/query-language/#schema) for more details.

{{% notice "tip" %}} While most of the query samples we'll be using throughout this guide can be executed directly in the browser, your Dgraph installation likely also included the Ratel UI, which provides a beautiful interface for performing queries and mutations on your Dgraph server. Feel free to manually copy any of the queries throughout this tutorial and execute them directly within Ratel, which is typically located at [localhost:8000](http://localhost:8000). {{% /notice %}}

## Creating the DgraphQueryManager Package

Since this project is split into multiple parts, it will soon become obvious that we'll need to share a lot of code between various parts of the app. Therefore, we'll alleviate some of this headache by keeping all such code in a new Node package project called `dgraph-query-manager`. This package will house the majority of the back-end logic, models, and various helper methods. Essentially, anything that both the client and API may rely upon should be in this shared package.

1.  Start by creating a `packages/dgraph-query-manager` directory and initialize a new project.

    ```bash
    $ mkdir -p packages/dgraph-query-manager && cd packages/dgraph-query-manager && yarn init -y
    ```

2.  Open the `package.json` and add the following dependencies.

    ```json
    "dependencies": {
      "axios": "^0.18.0",
      "dgraph-js-http": "^1.0.0-rc1",
      "faker": "^4.1.0",
      "prettier": "^1.16.4",
      "twitter-text": "^3.0.0",
      "winston": "^3.2.1"
    },
    "devDependencies": {
      "@types/node": "^11.11.4",
      "ts-loader": "^5.3.3",
      "typescript": "^3.3.3333"
    }
    ```

3.  Install all the missing dependencies.

    ```bash
    $ yarn
    ```

4.  Finally, we'll be storing all our source code in the traditional `src` directory, so let's create that and a handful of other directories to guide how this package will be structured.

    ```bash
    $ mkdir src && cd src
    $ mkdir adapters classes config helpers logger models
    ```

## Serialization, the Backbone of Our App

As with most modern JavaScript apps, the majority of data that is transferred will be in a JSON-like format. Additionally, a great deal of that data is transmitted after sending or receiving `Promise`-like objects, including requests and results. Therefore, it'll be useful throughout our application to create a fundamental transaction object that cam be used throughout our app. It should indicate when a request is created, what data the request holds, what response was provided, any errors that were generated, and so forth.

Create a new `classes/Serialization.ts` file and add the following code.

```ts
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

While it doesn't look like much, this `Serialization` class will be used throughout our application. Since JavaScript class instances are effectively just plain JavaScript objects during execution, the `Serialization` class just provides some beauty and structure to a basic object that can have useful properties like `data`, `request`, `error`, `success`, and so forth. The [`Partial<T>`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html) construct is extremely useful and will be used throughout the app to accept an unknown set of properties of a given instance type, and use those properties in a useful fashion. In this case, a `Serialization` instance can be created with a partial representation of a `Serialization`.

## Handling Unique Identifiers

Dgraph identifies every node in the database with a unique id called the `uid`. This value is represented in the system as a base-16 / [hexadecimal](https://en.wikipedia.org/wiki/Hexadecimal) string, so it's critical that our app accounts for this type of identifier. For this reason the first new class we should add is a `Uid`.

Within the `dgraph-query-manager` package create a new `src/models/Uid.ts` file and add the following code to it.

```ts
import * as crypto from 'crypto';
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

We start by defining the `UidInterface` that the `Uid` class will implement. We only really need to store a few properties, the primary of which is the actual `uid: string` value. The `Uid.constructor()` method accepts a passed argument of any of the types specified in `UidParamsType`, which allows this class to handle just about any uid format we can throw at it. The `Uid.generateString()` method creates a new random uid string in the event that a new `Uid` instance is created without passing an initial value. Otherwise, `getUidAsHex()` converts a passed value into a hex format.

{{% notice "note" %}} Throughout this guide there will be too much code to go through it all line-by-line without being overwhelming and verbose. Instead, we'll typically go through the main features and functionality of a given snippet, and then redirect your attention to the [public repository](https://github.com/GabeStah/dgraph-twitter-clone) to look at the full project to get more details on how everything works together. {{% /notice %}}

## Creating the Models

We already got a sneak peak at the models we'll be creating when we defined our schema, so now we'll take things quite a bit further by defining our `BaseModel` class, which will be the parent type off which we'll base our specific model classes like `Tweet` and `User`.

1.  Create a new `models/BaseModel.ts` file and add the following code to it.

    ```ts
    import logger from '../logger';
    import {
      DgraphAdapterHttp as DgraphAdapter,
      MutationTypes,
    } from '../adapters';
    import { DgraphQueryExecutor, Queries, Serialization } from '../classes';
    import { Hashtag, Tweet, Uid, UidParamsType, User } from '../models';

    export type BaseModelNodeableTypes = Hashtag | Tweet | User;

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

    Ignore the many additional imports that are invalid for the time being (those will come later), as we're starting with tbe basics here. Our `BaseModelInterface` is kept as simple as possible, so our child classes that inherit `BaseModel` can define properties unique to them. We're using a generic type in the `BaseModel<T>` definition so we can reference the inheriting class type and instance throughout various `BaseModel` methods. We'll see this in action shortly, but this makes it easier to, for example, differentiate between when a `Tweet` class instance is being used, versus a `User` or `Hashtag` instance.

2.  The overall purpose of `BaseModel` is to allow for the creation and manipulation of inheriting instances, such as `Tweet` and `User` (which we'll define shortly). Therefore, we'll next add the `create()` method, along with a few helper methods that accompany it.

    ```ts
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
      return new Promise((resolve, reject) => {
        this.load(params)
          .then(processed => {
            serialization.response = new this(processed);
            serialization.success = true;
            resolve(serialization);
          })
          .catch(error => {
            logger.info(
              `${className}.create.load.then failed, error: %o', error`
            );
            serialization.error = error;
            serialization.message = `${className} creation failed.`;
            serialization.success = false;
            resolve(serialization);
          });
      });
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

    It's worth noting that the `create()` method, like many of the `BaseModel` methods, are intentionally `static` as opposed to instance methods. This is because we often need to create a new child instance from scratch, so a factory method pattern is ideal.

    Working backwards here the `injectDefaults()` method does just what the name implies and combines whatever default properties the child `T` instance might include with the passed properties that will override those defaults. The `load()` method is a generic method we'll expand on in child classes like `Tweet`, but it will effectively performs the entire creation process of a new `BaseModel<T>` instance.

    Finally, the `create()` method accepts some partial parameters, creates a new `Serialization` instance, then invokes the asynchronous `load()` method of the inheriting `T` type instance. Upon a successful promise the `serialization.response` property is set to a `new` instance of the child instance. This illustrates the importance of defining `BaseModel` as a generic `BaseModel<T>` type, so we can retrieve information about generic instance types that inherit from `BaseModel<T>`, but without knowing anything more about them. As we'll soon see, when we invoke the `Tweet.create()` method, the `BaseModel<T>.create()` method recognizes it is a type `Tweet` and populates fields like `className`.

{{% notice "note" %}} {{% /notice %}}

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
    {{< runnable endpoint="http://128.0.0.1:8080/query" >}}
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

    {{% notice "tip" %}} This tutorial will feature many Dgraph query snippet examples like the above. If your Dgraph Alpha server is running at the default location (`localhost:8080`) and you [installed](#installation) the schema for the `dgraph-twitter-clone` you can execute these runnable queries in the browser and receive output from your own Dgraph installation. {{% /notice %}}

### Reset Gulp Tasks

### Manual Install

### Docker Image

{{% notice "warning" %}} ED-NOTE-TODO: Create base image (Ubuntu or Debian?) to host app. {{% /notice %}}

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

<!-- prettier-ignore -->
{{< runnable uri="alter">}}
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

<!-- prettier-ignore -->
{{< runnable host="localhost">}}
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

<!-- prettier-ignore -->
{{< runnable port="8090">}}
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

<!-- prettier-ignore -->
{{< runnable protocol="http" host="ping-pub.com">}}
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

<!-- prettier-ignore -->
{{< runnable endpoint="http://127.0.0.1:8080/alter">}}
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
