---
title: 'Building a Twitter Clone with Dgraph and React - Part 2: The API'
date: 2019-03-24T10:42:34-07:00
draft: false
weight: 2
url: 'building-twitter-clone-with-dgraph-react-part-2-api'
---

<script type="text/javascript">window.DGRAPH_ENDPOINT = "http://127.0.0.1:8080/query?latency=true";</script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.6/languages/typescript.min.js"></script>

In [part 1]({{% relref "../part-1" %}}) of this series we explored the overall architecture of the [`dgraph-twitter-clone`](https://github.com/GabeStah/dgraph-twitter-clone) application and the how the [`dgraph-query-manager`](https://github.com/GabeStah/dgraph-twitter-clone/tree/master/packages/dgraph-query-manager) package provides the majority of the business logic that both the API and client apps use to create a basic Twitter clone powered by a Dgraph data layer.

In this second installment we'll dig into the simple `dgraph-twitter-clone` API, which allows for either REST API endpoint requests or JSON-like payload requests, depending on the needs of the requester. The API relies heavily on routing and other functionality provided by the [ExpressJS](https://expressjs.com/) framework, so check out their [official documentation](https://expressjs.com/en/4x/api.html) for more info on Express. With that, let's get into it!

## Initializing the API App

Like most ExpressJS apps we define the API app in the root `api/src/app.ts` [file](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/api/src/app.ts), as seen below.

```ts
// File: api/src/app.ts
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import { Routes } from './routes';
import logger from './helpers/logger';

// Set up the express app
const app = express();

// Prevent CORS errors
app.use(cors());

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api/', [Routes]);

const port = 5000;
app.listen(port, () => {
  logger.info(`API service is listening on port ${port}.`);
});
```

After initializing a new `express()` instance we call `app.use()` to add a handful of middlewares such as allowing cross-origin resource sharing and parsing incoming JSON requests. All API routes are prefixed with the `/api/` endpoint and the majority of the app logic is found in the `api/src/routes/Routes.ts` [file](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/api/src/routes/Routes.ts).

## Handling JSON API Payloads

```ts
// File: api/src/routes/Routes.ts
export const Routes = express.Router();

/**
 * Api routes for JSON body requests.
 * Creates a new Query and DgraphQueryExecutor instance from passed body data, then executes a direct request
 * and returns the resulting Serialization.
 */
Routes.post(
  '/json',
  asyncWrapper(async (req, res) => {
    const query = Query.factory(req.body.query);
    if (req.body.query.tree) {
      query.tree = req.body.query.tree;
    }
    req.body.query = query;
    const executor = DgraphQueryExecutor.factory(req.body);
    const serialization = await executor.execute(DgraphConnectionType.DIRECT);
    res.status(serialization.statusCode).send(serialization);
  })
);
```

As you may recall from the [Simplifying Query Execution]({{< ref "/#simplifying-query-execution" >}}) section in **Part 1** the `DgraphQueryExecutor.executeJsonApiRequest()` method passes the current `DgraphQueryExecutor` instance in JSON format to the `/api/json` API endpoint before handling the response.

```ts
// File: packages/dgraph-query-manager/src/classes/DgraphQueryExecutor.ts
export class DgraphQueryExecutor implements DgraphQueryExecutorInterface {
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
}
```

The first `Routes.post('/json', ...)` method invocation in the `Routes.ts` file is where that request is handled. It does so in a fairly straight-forward fashion. It first creates a new `Query` instance by calling the `Query.factory()` method and passing in `Partial<Query>` parameters. It then uses that `Query` instance to modify the `req.body` -- which is itself `DgraphQueryExecutor` instance transmitted in JSON -- so the `DgraphQueryExecutor` instance has an associated `Query` it can execute. After creating a valid instance using the `DgraphQueryExecutor.factor()` method it then it just calls the `executor.execute()` method and explicitly requires a `DgraphConnectionType.DIRECT` connection type, which forces the executor to perform its query execution **directly** with Dgraph, rather than going through any API. Simple, but effective.

While a production application would dramatically cleanup the JSON payload that is sent to this `/api/json` endpoint, as opposed to sending the majority of a `DgraphQueryExecutor` instance, it functions rather elegantly here and provides a nice way to reuse our existing `Query` instances with our API. This should illustrate how easy it would be to expand on this "middleware"-style API to act as a go-between for your primary client/app and the Dgraph back-end that's handling actual data transactions and retrieval.

## Dynamically Generating Express Routes

The second part of the `Routes.ts` file is the `createQueryRoutes()` function, which dynamically generates all the ExpressJS routes our application needs, as defined in the `packages/dgraph-query-manager/src/classes/Queries` [directory](https://github.com/GabeStah/dgraph-twitter-clone/tree/master/packages/dgraph-query-manager/src/classes/Queries).

```ts
// File: api/src/routes/Routes.ts
/**
 * Dynamically generates routes from Queries object and maps them to appropriate
 * Express HTTP methods and DgraphQueryExecutors.
 */
const createQueryRoutes = () => {
  for (const category in Queries) {
    if (Queries.hasOwnProperty(category)) {
      for (const key in Queries[category]) {
        if (Queries[category].hasOwnProperty(key)) {
          const query = Queries[category][key];
          const route = query.route;
          const wrapper = asyncWrapper(async (req, res) => {
            let params;
            if (query.paramTypes) {
              // Map passed req.params to new params object using paramTypes array.
              params = Object.assign(
                {},
                ...query.paramTypes.map(paramType => ({
                  [paramType.key]: req.params[paramType.key.replace('$', '')],
                }))
              );
            }
            const executor = new DgraphQueryExecutor(query, params);
            // Use direct connection type to avoid loop.
            const serialization = await executor.execute(
              DgraphConnectionType.DIRECT
            );
            res.status(serialization.statusCode).send(serialization);
          });

          switch (query.httpMethod) {
            case HttpMethods.DELETE: {
              Routes.delete(route, wrapper);
              break;
            }
            case HttpMethods.GET: {
              Routes.get(route, wrapper);
              break;
            }
            case HttpMethods.POST: {
              Routes.post(route, wrapper);
              break;
            }
            case HttpMethods.PUT: {
              Routes.put(route, wrapper);
              break;
            }
            default: {
              Routes.get(route, wrapper);
            }
          }
        }
      }
    }
  }
};

createQueryRoutes();
```

To understand this code let's briefly look at how one of our queries is instantiated. The `Queries.Search.searchBy` `Query` is a dynamic query that performs a lookup of the passed `$query` value in the passed `$predicate` using the passed `$function` type.

```ts
// File: packages/dgraph-query-manager/src/classes/Queries/SearchQueries.ts
export const SearchQueries = {
  /**
   * Dynamic search based on passed function, predicate, and query.
   */
  searchBy: new Query(
    `query find($query: string) {
        data(func: $function($predicate, $query))
        {
            uid
            expand(_all_) 
            {
              uid
              expand(_all_)
            }
        }
     }`,
    '/search/by/:function/:predicate/:query',
    [
      new ParamType('$function', TypeOf(String), true),
      new ParamType('$predicate', TypeOf(String), true),
      new ParamType('$query', TypeOf(String)),
    ]
  ),
};
```

As mentioned in the [Organizing Queries]({{< ref "/#organizing-queries" >}}) section in **Part 1** one advantage to creating the `Query` class is to provide some additional helper functionality. In the case of the `searchBy` `Query`, the first two `ParamTypes` passed to it have a third argument of `true`, which tells the constructor that these parameters are _substitute_ values. That is, before sending the query string to Dgraph the `$function` and `$predicate` placeholder values within the query string are replaced with the parameter values passed to the `DgraphQueryExecutor` that is invoking this `Query`. This allows us to create some powerful, dynamic queries at runtime with very little overhead.

For example, let's create a new `DgraphQueryExecutor` instance and give it the `Queries.Search.searchBy` `Query` and the following parameters.

```ts
const executor = new DgraphQueryExecutor(Queries.Search.searchBy, {
  $function: 'anyoftext',
  $predicate: 'tweet.text',
  $query: 'solid',
});
const serialization = await executor.execute();
```

The actual query that Dgraph receives would be as follows.

```ts
query find($query: string) {
  data(func: anyoftext(tweet.text, $query))
  {
      uid
      expand(_all_)
      {
        uid
        expand(_all_)
      }
  }
}
```

The reason we don't need to substitute the `$query` parameter in our business logic is because it's a comparison value which GraphQL+- can accept and substitute itself at runtime as a [GraphQL Variable](https://docs.dgraph.io/query-language/#graphql-variables). However, since it cannot dynamically substitute things like function names or predicates, we're able to use the above technique to accomplish that as well.

The final result is the query seen below.

<!-- prettier-ignore-start -->
{{< runnable >}}
query find($query: string) {
  data(func: anyoftext(tweet.text, "solid"))
  {
      uid
      expand(_all_)
      {
        uid
        expand(_all_)
      }
  }
}
{{</ runnable >}}
<!-- prettier-ignore-end -->

Back to the `createQueryRoutes()` function above. It loops through every `Query` in the `Queries` object found in `packages/dgraph-query-manager/src/classes/Queries/index.ts`, which itself assigns sub-categories to search, tweet, and user queries. For each `Query` entry it finds it creates an asynchronous wrapper callback that will be invoked when the matching `Query.route` REST endpoint is hit according to ExpressJS.

Within this async wrapper it generates the params object based on the passed params extracted from the API endpoint query params. For example, ExpressJS likes params in a `/:param` format, so the wrapper function extrapolates based on the known `Query.paramTypes` what to extract from the API endpoint URL. With the params in hand the last step is just to create a new `DgraphQueryExecutor` instance into which the query and the newly-generated params are passed. Finally, it executes the `DgraphQueryExecutor` with a `DgraphConnectionType.DIRECT` connection, which will result in a call to the `DgraphQueryExecutor.executeDirectRequest()` method. As we saw in the [Simplifying Query Execution]({{< ref "/#simplifying-query-execution" >}}) section this method invokes a direct Dgraph transaction through the `dgraph-js-http` library and returns a `Serialization` result.

---

Believe it or not that's all there is to our entire API app! While much of the logic is handled elsewhere, such as the `dgraph-query-manager` package, it's still relatively simple to create an Express-based API that can serve multiple types of data and calls, including JSON payloads and RESTful endpoints.

Check out [Part 3]({{% relref "../part-3" %}}) where we'll explore the client application created with the popular React library. We'll make heavy use of the new [React Hooks](https://reactjs.org/docs/hooks-intro.html) feature added in February of this year, which will help us manage both local and global state across our Twitter clone app, so we can query Dgraph directly or via our API.
