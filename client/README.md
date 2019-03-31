# Dgraph Twitter Clone - Client

An React-based client application to mimic Twitter's functionality with Dgraph integration.  Can perform Dgraph transactions directly, or through the [Dgraph Twitter Clone - API](https://github.com/GabeStah/dgraph-twitter-clone-api).

*Note*: This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Prerequisites

The Dgraph 'trio' should be up and running.  All development was performed using a locally-installed Dgraph via the documentation's [Docker Compose](https://docs.dgraph.io/get-started/#docker-compose) file.

## Install

Install with Yarn or NPM.

```bash
$ yarn install
```

### Packages Installation

Shared packages are locally stored in the [Dgraph Twitter Clone - API](https://github.com/GabeStah/dgraph-twitter-clone-api)'s `/packages` directory.  See that [`README.md`](https://github.com/GabeStah/dgraph-twitter-clone-api/blob/master/README.md#packages-installation) for more information.

## Configuration

You may need to change the location to your running Dgraph installation in the `dgraph-adapter` or `dgraph-adapter-http` config files (`dgraph-adapter-http` is the default).

1. Open `dgraph-adapter-http/config/development.ts` (or `production.ts` if applicable).
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

## Running

Start server with `npm start` to execute the create react scripts.

## Design

Since React is so popular I decided to build this app in React.  Additionally, [React 16.8](https://reactjs.org/blog/2019/02/06/react-v16.8.0.html) just came out a few months ago and included the new `React Hooks` feature, so it seemed like as good opportunity to illustrate how an app can use Hooks and Effects for stateful logic and data manipulation.

I initially began this project by creating the REST API, so I decided to embrace that and allow the `Dgraph Twitter Clone - Client` to hook into and use either the API or direct calls to the Dgraph server to perform transactions and queries.  More information can be found [here](https://github.com/GabeStah/dgraph-twitter-clone-api/blob/master/README.md#models-and-packages).

Outside of normal React component hierarchies and `tsx` files, most of the logic for the client's data retrieval occurs in the `useDgraph` custom hook found in [`src/hooks/dgraph.ts`](https://github.com/GabeStah/dgraph-twitter-clone-client/blob/master/src/hooks/dgraph.ts).  As discussed in the [API](https://github.com/GabeStah/dgraph-twitter-clone-api#models-and-packages) readme, the `Serialization` class is used here to handle both incoming requests and outgoing responses.  Depending on the user's configuration, the `DgraphConnectionType` determines whether the transaction is executed directly on the Dgraph server via `dgraph-js-http`, or indirectly via the RESTful `dgraph-twitter-clone-api`.

The `useEffect` call handles what would normally be `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` methods in a class-based React Component.  In this case, the effect function is executed after the calling component is rendered.  Additionally, if the passed `dependencies` value changes, React will recognize this diff and execute the `useEffect` function again on the next render update.  However, if `dependencies` don't change, the effect is not called a second time.  A successful response from either source is set to the `serializedResponse` state value via the `setSerialization` function call.

The [`App`](https://github.com/GabeStah/dgraph-twitter-clone-client/blob/master/src/App.tsx) component shows an example of using the `useDgraph` hook.  It (currently) passes a static email value to the `DgraphQueryExecutor` instance with the `User.findFromEmail` query.  The generated `Serialization` is passed into the `useDgraph` hook and it returns a `Serialization` response object that contains the retrieved User, if applicable.