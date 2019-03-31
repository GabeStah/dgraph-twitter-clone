---
title: 'Building a Twitter Clone with Dgraph and React'
date: 2019-03-24T10:42:34-07:00
draft: true
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

### Reset Gulp Tasks

```js
// api/gulpfile.ts
gulp.task('db:drop', dbDrop);
gulp.task('db:reset:schema', dbResetSchema);
// Drop database and reset schema.
gulp.task('db:reset', gulp.series(dbDrop, dbResetSchema));
gulp.task('db:generate:data', dbGenerateData);
// Drop database, reset schema, and reload initial data.
gulp.task('db:regenerate', gulp.series(dbDrop, dbResetSchema, dbGenerateData));
```

```bash
$ cd api
$ gulp db:regenerate
[10:13:01] Requiring external module ts-node/register
[10:13:04] Using gulpfile D:\work\dgraph\projects\dgraph-twitter-clone\api\gulpfile.ts
[10:13:04] Starting 'db:regenerate'...
[10:13:04] Starting 'dbDrop'...
info: All Dgraph data dropped. {"service":"api","timestamp":"2019-03-31 10:13:05"}
[10:13:05] Finished 'dbDrop' after 306 ms
[10:13:05] Starting 'dbResetSchema'...
info: Dgraph schema altered:
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
 {"service":"api","timestamp":"2019-03-31 10:13:18"}
[10:13:18] Finished 'dbResetSchema' after 13 s
[10:13:18] Starting 'dbGenerateData'...
info: Starting random data generation. {"service":"api","timestamp":"2019-03-31 10:13:18"}
info: Random data generation complete. {"service":"api","timestamp":"2019-03-31 10:14:14"}
[10:14:14] Finished 'dbGenerateData' after 56 s
[10:14:14] Finished 'db:regenerate' after 1.15 min
```

### Manual Install

### Docker Image

{{% notice "warning" %}} TODO: Create base image (Ubuntu or Debian?) to host app. {{% /notice %}}

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
