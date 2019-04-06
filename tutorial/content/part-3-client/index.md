---
title: 'Building a Twitter Clone with Dgraph and React - Part 3: The Client'
date: 2019-03-24T10:42:34-07:00
draft: false
# url: 'building-twitter-clone-with-dgraph-react-part-3-client'
---

<script type="text/javascript">window.DGRAPH_ENDPOINT="http://127.0.0.1:8080/query?latency=true";</script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.6/languages/typescript.min.js"></script>

In **Part 1** of this series, [The Architecture]({{% ref "/" %}}), we examined the design and structure of the [`dgraph-twitter-clone`](https://github.com/GabeStah/dgraph-twitter-clone) app. In **Part 2**, [The API]({{% ref "/part-2-api" %}}), we looked at the API layer and how it allows our Twitter clone to either utilize -- or completely bypass -- the use of an API in favor of direct transactions with its Dgraph data layer.

In this final part we'll explore the React-based client of our `dgraph-twitter-clone` app. We'll see how a basic [React](https://reactjs.org/) app can be used in conjunction with new [React Hooks](https://reactjs.org/docs/hooks-intro.html) feature added to React in early 2019 to create a stateful and elegant single-page application powered by a Dgraph database for fast and efficient data management. Let's dive in!

## Installing the Client

It is highly recommended you install the `dgraph-twitter-clone/client` application in a local dev environment so you can test it out and see the code in action as we walk through it throughout this guide. If you haven't done so, feel free to check out the [installation]({{% ref "/#installation" %}}) instructions from **Part 1**. Alternatively, if you already installed the `dgraph-twitter-clone` repo and have Dgraph up and running, you can start the client app by executing the `npm start` or `yarn start` command from the `dgraph-twitter-clone/client` directory.

## React Overview

Let's start with a brief overview of React and its functionality, to give some context for why the client app is structured as it is. At its core, React is a library to help with the creation of interactive user interfaces. This is often in the form of single-page applications, but [React Native](https://facebook.github.io/react-native/) is also available to use much of the same code and techniques for creating mobile apps.

### Components

Nearly all React apps are designed around the concept of [**components.**](https://reactjs.org/docs/components-and-props.html) A component can best be thought of as a self-contained, reusable piece of the overall application. A component can contain any combination of HTML, CSS, or JavaScript, and a component is always rendered to the DOM. React apps typically use a special HTML + JavaScript hybrid syntax called [JSX](https://reactjs.org/docs/introducing-jsx.html). JSX allows your components to embed JavaScript and other mutable data inside traditional HTML markup.

For example, here's a `MySection` component defined in JSX that creates a `<section>` and assigns its `id` attribute to the value of the `sectionId` JavaScript constant. Code found inside curly braces (`{ }`) is considered JavaScript that should be evaluated.

```jsx
class MySection extends React.component {
  const sectionId = 'special-section';

  render() {
    return (
      <section id={sectionId}>
        <p>Hello World</p>
      </section>
    );
  }
}
```

{{% notice "note" %}} Just as with the `dgraph-query-manager` packaged and the `dgraph-twitter-clone/api` app, the client app uses TypeScript wherever possible. In the realm of React, this takes the form of `.tsx` files, which are just like `.jsx` except they provide the ability to use TypeScript in place of plain JavaScript. {{% /notice %}}

A React component is traditionally defined as a class component that extends `React.component`, as seen above. However, you can also create **function components,** which behave similarly to class components, except they are defined (and behave) exactly like plain JavaScript functions. It used to be the case that class components were necessary to gain some of the benefits of React (such as state management), but with the recent introduction of [React Hooks](https://reactjs.org/docs/hooks-intro.html) that is no longer the case -- function components can use hooks to gain all the benefits of class components, while remaining easier to create and test. For that reason, the `dgraph-twitter-clone/client` app solely uses function components and hooks.

The `MySection` component above could therefore be rewritten as a function component that looks like this.

```jsx
export const MySection = () => {
  const sectionId = 'special-section';

  return (
    <section id={sectionId}>
      <p>Hello World</p>
    </section>
  );
};
```

It doesn't look all that different for now, but things change rather dramatically when we start adding state and other hooks.

### Props

A component can receive a `props` argument object that typically contains properties relevant to that component, _or_ to child components further down the tree. `Props` are passed to components elements within JSX further up the chain (i.e. in the "parent" component). For example, here's a `MyApp` component that uses the `MySection` component in its render call.

```jsx
import { MySection } from './MySection';

const MyApp = () => {
  const sectionText = 'Hi Universe';

  return <MySection text={sectionText} />;
};
```

We're also passing a `props.text` value equal to `sectionText` to the `MySection` component. If we update the MySection component to accept the `props` object we can make use of that passed value.

```jsx
export const MySection = props => {
  const sectionId = 'special-section';

  return (
    <section id={sectionId}>
      <p>{props.text}</p>
    </section>
  );
};
```

The rendered HTML output of `MySection` now looks like this.

```html
<section id="special-section">
  <p>Hi Universe</p>
</section>
```

### State

The last major React concept to touch on is **state.** Generally, state refers to the current value(s) of an object at a given point in time. In React, state is typically thought of as _mutable_ data related to a component's lifecycle (i.e. from when it's initialized and rendered to de-rendered and destroyed). Component **props**, on the other hand, are generally _immutable_ from the component's perspective -- they're received and perhaps duplicated and used for internal logic, but the original props are not changed within the component. Component state, on the other hand, can be changed and that change should be "remembered" by the component throughout its lifecycle.

For class components state was usually handled through the `this.state` object, but for function components no such object exists (since it's just a function, after all). This is where the introduction of **hooks** comes in; specifically the [useState](https://reactjs.org/docs/hooks-state.html) hook. The `useState` function hook allows a function component to both retrieve the current state and update that state for the future.

For example, here we'll add a bit of state to handle the section `id` of our `MySection` function component.

```jsx
export const MySection = props => {
  const [sectionId, setSectionId] = useState('special-section');

  return (
    <section id={sectionId}>
      <p>{props.text}</p>
    </section>
  );
};
```

The call to `useState()` passes the _initial_ value, which is then assigned to the first returned argument which we've named `sectionId`. Thus, the first time we render the `MySection` component we see the section and its `id` attribute as `<section id="special-section">`.

That said, the second value returned by `setState()` is a function that can be called to, well, _set_ the current state of that object. Let's add a `<button>` with an `onClick` handler that calls `setSectionId()` and passes a new value.

```jsx
export const MySection = props => {
  const [sectionId, setSectionId] = useState('special-section');

  return (
    <section id={sectionId}>
      <p>{props.text}</p>
      <button onClick={() => setSectionId('not-so-special-section')}>
        Change Id
      </button>
    </section>
  );
};
```

React is named as it is because it is _reactive_. When it recognizes that some component state has changed it triggers a new render of that component. Therefore, clicking the button and triggering the new state for `sectionId` renders `MySection` and the updated HTML output now looks like the following.

```html
<section id="not-so-special-section">
  <p>Hi Universe</p>
  <button>
    Change Id
  </button>
</section>
```

{{% notice "tip" %}} React is a powerful library and can create some extremely complex architectures, so feel free to check out the [official documentation](https://reactjs.org/) to learn more about the concepts we've been briefly discussing here. {{% /notice %}}

{{% notice "warning" %}} The `dgraph-twitter-clone/client` was created by a programmer who is not so much of a designer, so this project is definitely function over form. To that end, the basic React app was bootstrapped using [create-react-app](https://facebook.github.io/create-react-app/), which creates a skeleton React app with most of the build tools added and handled out of the box. The look and styling is largely based on [Bootstrap](https://getbootstrap.com/), which only seems appropriate given this is a Twitter clone. Ultimately, as discussed in the introduction, the goal of the client app is to illustrate how easily a graph database like Dgraph can integrate into a modern Twitter-like application, and how much power its many features such as GraphQL+- queries bring to the table. {{% /notice %}}

## Instantiating the App

Let's start looking through the client code at the top where our app is initialized, and we'll work our way down from there. The `client/src/index.tsx` [file](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/client/src/index.tsx) invokes the React app and renders the primary `App` component, which is [found](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/client/src/App.tsx) in `client/src/App.tsx`.

```tsx
// File: client/src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

```tsx
// File: client/src/App.tsx
// Components
import Main from './components/Main/Main';
// Hooks
// Layout
import './App.css';
// Libs
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
// Local
import { Reducer } from './reducers';
import { InitialState, StateProvider } from './state';
// Fonts
import { library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

library.add(far);
library.add(fas);

const App = () => {
  return (
    <BrowserRouter>
      <StateProvider initialState={InitialState} reducer={Reducer}>
        <Main />
      </StateProvider>
    </BrowserRouter>
  );
};

export default App;
```

The `App` component wraps our entire application in the `BrowserRouter` component middleware, which comes from the [react-router-dom](https://reacttraining.com/react-router/web/guides/quick-start) package and allows us to perform routing by rendering certain components based on requested URLs and endpoints. We'll get into that more in a moment.

### Handling App State

The `StateProvider` component is a custom component based on [this post](https://medium.com/simply/state-management-with-react-hooks-and-context-api-at-10-lines-of-code-baf6be8302c) and code by Luke Hall.

```tsx
// File: client/src/state/StateProvider.tsx
/**
 * Author: Luke Hall
 * Source: https://medium.com/simply/state-management-with-react-hooks-and-context-api-at-10-lines-of-code-baf6be8302c
 */
import React, { createContext, useContext, useReducer } from 'react';
import { InitialState } from './State';

export const StateContext = createContext(InitialState);
export const StateProvider = ({ reducer, initialState, children }) => (
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </StateContext.Provider>
);
export const useStateContext = () => useContext(StateContext);
```

This component provides global state throughout the application by using using the [useContext](https://reactjs.org/docs/hooks-reference.html#usecontext) React hook. [**Context**](https://reactjs.org/docs/context.html) is how React handles global state (i.e. state that is available to all components, not just those who receive passed down props). As the [React Context.Provider](https://reactjs.org/docs/context.html#contextprovider) documentation shows, a context provider passes its value down to any child components that consume it.

In the `StateProvider` component above, we're passing down the provider value of the returned values from the [`useReducer`](https://reactjs.org/docs/hooks-reference.html#usereducer) React hook. `useReducer()` is similar to the `useState()` hook, except it works with the **reducer + action + dispatcher** pattern found in common React libraries like [Redux](https://redux.js.org). Why use **reducers** instead of directly modifying **state**? The primary advantage is a separation of concerns. Rather than allowing our state to be directly mutable, we can instead **dispatch** a series of **actions** that tell the **reducer** to change the state in some way.

### Actions and Reducers

To understand how actions and reducers work in conjunction to change our application state let's first look at how we're storing our state throughout most of our app. This is accomplished in the `client/src/state/State.ts` file.

```ts
// File: client/src/state/State.ts
import { Tweet, User } from 'dgraph-query-manager';

export const InitialState: any = {
  authUser: undefined,
  searchResults: undefined,
  user: undefined,
  tweets: [],
};

export interface StateInterface {
  authUser: User | undefined;
  searchResults: any;
  user: User | undefined;
  tweets: Tweet[];
}

export class State implements StateInterface {
  authUser: User | undefined;
  searchResults: undefined;
  user: User | undefined;
  tweets: Tweet[];
}
```

As you can see, we've defined a `StateInterface` with a handful of properties and we implement that `StateInterface` in the `State` class. We're also importing the `User` and `Tweet` models from `dgraph-query-manager`, since we want to use those model objects throughout the application. The properties of `State` don't mean a lot right now, but we'll mutate the values of this class in our reducer below based on changes within the app.

Next let's look at the potential actions our reducer can expect, which are found in the `client/src/reducers/base/Action.ts` [file](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/client/src/reducers/base/Action.ts).

```ts
// File: client/src/reducers/base/Action.ts
export enum ActionType {
  SET_AUTHENTICATED_USER,
  SET_SEARCH_RESULTS,
  SET_USER,
  SET_TWEETS,
  UPDATE_TWEET,
}

export interface ActionInterface {
  payload: any | undefined;
  type: ActionType;
}

export class Action implements ActionInterface {
  payload: any | undefined;
  type: ActionType;

  constructor(type: ActionType, payload?: any) {
    this.type = type;
    this.payload = payload;
  }
}
```

As mentioned above, the purpose of a reducer to change state is that it accepts an action and, based on what that action tells it, makes changes to the state. Thus, our simple `Action` class accepts an action type of `ActionType`, which is an enum of explicit options. It also accepts an optional payload, which will be used for additional parameters when necessary.

Now let's see how the reducer uses our `Action` and `State` class to mutate application state -- let's [check out](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/client/src/reducers/base/Reducer.ts) `client/src/reducers/base/Reducer.ts`.

```ts
// File: client/src/reducers/base/Reducer.ts
import { Action, ActionType } from './Action';
import { State } from '../../state/';

export const Reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.SET_AUTHENTICATED_USER: {
      return {
        ...state,
        authUser: action.payload,
      };
    }

    case ActionType.SET_SEARCH_RESULTS: {
      return {
        ...state,
        searchResults: action.payload,
      };
    }

    case ActionType.SET_USER: {
      return {
        ...state,
        user: action.payload,
      };
    }

    case ActionType.UPDATE_TWEET: {
      if (!state.tweets) return state;
      const index = state.tweets.findIndex(
        tweet => tweet.uid === action.payload.uid
      );
      const tempTweets = state.tweets;
      // Update passed Tweet.
      tempTweets[index] = action.payload;
      return {
        ...state,
        tweets: tempTweets,
      };
    }

    case ActionType.SET_TWEETS: {
      return {
        ...state,
        // Sort in descending order.
        tweets: Array.isArray(action.payload)
          ? action.payload.sort(
              (a, b) =>
                +new Date(b['tweet.createdAt']) -
                +new Date(a['tweet.createdAt'])
            )
          : action.payload,
      };
    }

    default: {
      return state;
    }
  }
};
```

The `Reducer` class accepts two arguments the current `State` and an `Action` instance. Based on the `ActionType` of the passed `Action` it modifies the state in some way and returns the **new state** object. Nothing too crazy going on here.

Now, if we look back at the `StateProvider` component, and specifically how it passes the returned values from `useReducer()` as the `StateProvider.Provider` `value`, you can start to see what's going on.

```tsx
// File: client/src/state/StateProvider.tsx
export const StateContext = createContext(InitialState);
export const StateProvider = ({ reducer, initialState, children }) => (
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </StateContext.Provider>
);
export const useStateContext = () => useContext(StateContext);
```

A call to the `useReducer()` hook returns two values: The current state and a `dispatch` function. The dispatch function is invoked whenever you need to call the reducer and pass it a new action to perform. We'll go over this component in more detail in the [TweetBox Component](#tweetbox-component) section, but here is a snippet from that component code that shows how we're retrieving `State` properties, then later calling the `dispatch` function and passing in a new `Action` instance to inform the reducer that receives that dispatch what to do -- in this case, to `SET_TWEETS` to the array passed as the `payload` argument.

```tsx
// File: client/src/components/Tweet/TweetBox.tsx
const [{ authUser, user, tweets }, dispatch] = useStateContext();
// ...
dispatch(
  new Action(ActionType.SET_TWEETS, [...tweets, serialization.response])
);
```

## Main Component

Diving into our actual component logic we'll start with the `Main` component, which we saw in [Instantiating the App](#instantiating-the-app) is a direct child of `StateProvider`, which itself a child of our base `App` component. Therefore, `Main` is where all our actual layout and logic begin. Here we see the `client/src/components/Main/Main.tsx` component.

```tsx
// File: client/src/components/Main/Main.tsx
// Components
import ProfileCard from '../Profile/ProfileCard';
import Search from '../Search/Search';
import TweetBox from '../Tweet/TweetBox';
import TweetList from '../Tweet/TweetList';
import NavigationBar from '../Navigation/NavigationBar';
// Layout
import { Col, Container, Row } from 'react-bootstrap';
// Libs
import React from 'react';
import { DgraphQueryExecutor, Queries } from 'dgraph-query-manager';
// Local
import { useDgraphGlobal } from '../../hooks/';
import { Route, Switch } from 'react-router-dom';
import { Action, ActionType } from '../../reducers/';
import config from '../../config';
import TweetModal from '../Tweet/TweetModal';

const Main = () => {
  // Default auth user
  const executor = new DgraphQueryExecutor(Queries.User.findFromEmail, {
    $email: config.user.defaultAuthEmail,
  });
  const [isLoading, response] = useDgraphGlobal({
    executor,
    action: new Action(ActionType.SET_AUTHENTICATED_USER),
    dependencies: [config.user.defaultAuthEmail],
  });

  return (
    <Container>
      <Route path={'/status/:tweetUid'} component={TweetModal} />
      <NavigationBar />
      <Container className="AppContainer">
        <Row>
          <Col sm={3}>
            <Switch>
              <Route path={'/'} exact component={ProfileCard} />
              <Route path={'/search'} exact component={Search} />
              <Route path={'/:screenName'} component={ProfileCard} />
            </Switch>
          </Col>
          <Col>
            <TweetBox />
            <Route
              path={['/', '/:screenName', '/search', '/status/:tweetUid']}
              component={TweetList}
            />
          </Col>
          <Col sm={3} />
        </Row>
      </Container>
    </Container>
  );
};

export default Main;
```

Anything that is to be rendered by a component must be included in its `return` value, so all business logic prior to rendering occurs above the return within a given function component. In this case we start by instantiating a new `DgraphQueryExecutor`, which you can learn more about in the [Simplifying Query Execution]({{% ref "/#simplifying-query-execution" %}}) section from **Part 1**. The `User.findFromEmail` `Query` lets us find a user by email, and we're passing a static value defined in `config.user.defaultAuthEmail`. Obviously, in a production application this would be obtained from the user during logic authentication, or perhaps from a session cookie. In this case, we don't bother adding user authentication logic to the app since it's unnecessary, so we're just hard-coding authentication for a single, specific user.

To accomplish this we're invoking a custom React hook called `useDgraphGlobal`, which can be found in the `client/src/hooks/dgraph/useDgraphGlobal.ts` [file](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/client/src/hooks/dgraph/useDgraphGlobal.ts).

```ts
// Helpers
import { logger } from '../../helpers';
// Local
import { useStateContext } from '../../state';
// Libs
import { useEffect, useState } from 'react';
import { DgraphQueryExecutor, Serialization } from 'dgraph-query-manager';
import config from '../../config';
import { Action } from '../../reducers/';

/**
 * Custom React hook that performs the heavy lifting of data retrieval from Dgraph and uses global state.
 * Accepts a DgraphQueryExecutor and Action.
 * The Executor is executed and the result is attached to an Action which is dispatched to global state reducer.
 *
 * @param parameters.executor Executor to be executed.
 * @param parameters.action Action to be dispatched to reducer based on executor response.
 * @param parameters.dependencies Values that will trigger a re-render upon change.
 * @param parameters.invalid Determines if this hook is invalid.
 * @param parameters.allowFailure Allows failed result to still be dispatched to state.
 */
export const useDgraphGlobal = (parameters: {
  executor: DgraphQueryExecutor;
  action: Action;
  dependencies: any;
  invalid?: boolean;
  allowFailure?: boolean;
}): [boolean, Serialization] => {
  const {
    executor,
    action,
    dependencies,
    invalid,
    allowFailure = false,
  } = parameters;
  const [isLoading, setIsLoading]: [boolean, Function] = useState(false);
  const [response, setResponse]: [any, Function] = useState(undefined);

  // STATE
  const [, dispatch]: [any, Function] = useStateContext();

  // Call useEffect unconditionally.
  useEffect(() => {
    // Confirm validity
    if (!invalid) {
      executor
        .execute()
        .then(serialization => {
          setIsLoading(false);

          if (config.debug) {
            logger.info(
              `Serialized Response - action: %o, serialization: %o`,
              action,
              serialization
            );
            console.log(serialization);
          }

          if (serialization.success || allowFailure) {
            action.payload = serialization.response;
            dispatch(action);
            setResponse(serialization.response);
          }
        })
        .catch(exception => {
          logger.error(exception);
          setIsLoading(false);
        });
    } else {
      setIsLoading(true);
      logger.info(`Loading...`);
    }
  }, dependencies);

  return [isLoading, response];
};
```

The function documentation somewhat explains what's going on here, but the basic idea is this hook is passed a `DgraphQueryExecutor` and an `Action`. The `executor` is executed and the result (which we've seen elsewhere throughout the app is a always a `Serialization` instance) is assigned as the `action.payload`. We then `dispatch()` that `action` to the global obtained from calling the `useStateContext()` function.

Something new here we haven't discussed yet is React's [`useEffect()`](https://reactjs.org/docs/hooks-effect.html) method. If you're familiar with React you may know that React class components rely upon built-in class methods to handle lifecycle events. These methods are `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`. Each of those methods are automatically triggered at the appropriate moment in the component's lifecycle. You can read more about the React component lifecycle in the [official documentation](https://reactjs.org/docs/react-component.html#componentdidmount), but for now just consider that those three methods are different moments in a component lifecycle, so handling component state within a class component often requires putting the correct logic within the correct `componentX` method.

**However**, with React hooks we can replace the need for all three of the above methods with the `useEffect()` hook. The purpose of `useEffect()` is to trigger _side effects_ after the component renders. Typically, such side effects are actions that should impact the component in some way, _but_ that are not necessary for initial rendering to take place. A good example is data retrieval, which is often a delayed process that requires an async/await contract to be fulfilled. You typically don't want to trigger such effects inside the rendering logic of your component, so adding those to the lifecycle event methods in the past (or inside `useEffect()`) is ideal -- those effects are free to run after rendering and only make further updates when a change is required.

Referring back to our `useDgraphGlobal()` hook above, we see the `useEffect()` call starts by checking for validity (a special argument that was needed elsewhere in the app). It then executes the passed `executor`. Upon successful execution the `serialization.response` property is assigned to the `action.payload` and then the action is dispatched to our main reducer class we looked at before. We also call a `useState()` hook to assign a `response` value _outside_ of the `useEffect()` method. This `response` object (which is the `serialization.response` we received inside the effect) is returned by `useDgraphGlobal`.

{{% notice "note" %}} Keen observers may notice the odd use of a `Promise.then().catch()` block here, where elsewhere in the app we've typically used `async/await`. The reason for this is that, unfortunately, `useEffect()` hooks cannot accept `async` functions -- that is, a Promise cannot be returned to a `useEffect()` call. Therefore, we use the next best thing which is calling an async function _within_ the `useEffect()` anon function logic. React developers are working on adding data fetching capabilities to a feature called **Suspense**, which will be the preferred way to handle such retrieval in the future, but unfortunately [Suspense for data fetching is not ready](https://github.com/facebook/react/issues/14326#issuecomment-466378700) at time of writing. {{% /notice %}}

### Hooking Into useDgraphGlobal

Back to our `Main` component we can re-examine how the custom `useDgraphGlobal()` hook is used here.

```tsx
// File: client/src/components/Main/Main.tsx
// ...
const Main = () => {
  // Default auth user
  const executor = new DgraphQueryExecutor(Queries.User.findFromEmail, {
    $email: config.user.defaultAuthEmail,
  });
  const [isLoading, response] = useDgraphGlobal({
    executor,
    action: new Action(ActionType.SET_AUTHENTICATED_USER),
    dependencies: [config.user.defaultAuthEmail],
  });

  // ...
};
```

The `DgraphQueryExecutor` we pass is configured to execute the `User.findFromEmail` for our explicit email. The `Action` argument of `new Action(ActionType.SET_AUTHENTICATED_USER)` tells the `Reducer` class how it should change our global `State` based on the result of the `executor`.

```ts
// File: client/src/reducers/base/Reducer.ts
// ...
export const Reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.SET_AUTHENTICATED_USER: {
      return {
        ...state,
        authUser: action.payload,
      };
    }
  }
  // ...
};
```

Here we see the `Reducer` merely creates a new shallow copy of the `State` object, by assigns the `authUser` property to the `action.payload` value, which itself was assigned to the executor's `Serialization.response` value. This logical structure makes it very simple to add new global state to our application in a few short steps:

1. Add a new property to the `State` class.
2. Add a new type to the `ActionType` enum.
3. Add a case to the `Reducer` logic for the new `ActionType`.

That's it! While all the state properties we're currently using are at the same "level", if we wanted to modify nested children of higher state properties we could start breaking out our `Reducer` into multiple sub-reducers and then combining the final state at the end.

### Routing with React Router DOM

The [react-router-dom](https://reacttraining.com/react-router/web/guides/quick-start) library handles routing similar to ExpressJS and other packages. Our `Main` component renders a handful of `Route` components that are passed a number of properties.

```tsx
// File: client/src/components/Main/Main.tsx
// ...
return (
  <Container>
    <Route path={'/status/:tweetUid'} component={TweetModal} />
    <NavigationBar />
    <Container className="AppContainer">
      <Row>
        <Col sm={3}>
          <Switch>
            <Route path={'/'} exact component={ProfileCard} />
            <Route path={'/search'} exact component={Search} />
            <Route path={'/:screenName'} component={ProfileCard} />
          </Switch>
        </Col>
        <Col>
          <TweetBox />
          <Route
            path={['/', '/:screenName', '/search', '/status/:tweetUid']}
            component={TweetList}
          />
        </Col>
        <Col sm={3} />
      </Row>
    </Container>
  </Container>
);
// ...
```

The `path` property matches any path that the [path-to-regexp](https://github.com/pillarjs/path-to-regexp/tree/v1.7.0) dependency package understands. If a match is detected then the `Route` acts upon that based on the additional properties it was provided. For example, `<Route path={'/'} exact component={ProfileCard} />` will _only match_ the root path (`/`) and, if a match is found, it will render the `ProfileCard` component. Typically, **every** matching `Route` will render. However, the `Switch` component that wraps a trio of `Routes` above will render only the _first_ matching `Route` in the set, ignoring any remaining `Routes` below it. In this case, we're first checking if the user is at the root path. We have to use the `exact` property here because otherwise any `Route` with a `path` that contains `/` will also match. If the user isn't at the root path then we check if they are at `/search`. If still no match, we finally assume the extra URI content following the root path `/` is a user `screenName` (just like Twitter URLs), so we match that and render the `ProfileCard` component.

## Navigation Components

Our navigation components consist of the `NavigationBar` and its single child component, `SearchBox`.

### Navigation Bar

The `NavigationBar` component is just a simple Bootstrap nav bar that serves little purpose _except_ as a home for our `SearchBox` component.

```tsx
// File: client/src/components/Navigation/NavigationBar.tsx
// Components
import { Nav, Navbar } from 'react-bootstrap';
// Libs
import React from 'react';
import SearchBox from './SearchBox';

const NavigationBar = () => {
  return (
    <Navbar bg="light" fixed="top">
      <Navbar.Brand href="#home">Dgraph + Twitter</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse key="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="#moments">Moments</Nav.Link>
          <Nav.Link href="#notifications">Notifications</Nav.Link>
          <Nav.Link href="#messages">Messages</Nav.Link>
        </Nav>
        <SearchBox />
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;
```

### Search Box

The `SearchBox` [component](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/client/src/components/Navigation/SearchBox.tsx) is primarily an input that uses local state and a feature of `react-router-dom` to redirect the user to our `/search` endpoint based on their search query.

```tsx
// File: client/src/components/Navigation/SearchBox.tsx
import React, { useState } from 'react';
import { Button, Form, FormControl } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

const SearchBox = ({ history }) => {
  const [currentText, setCurrentText] = useState('');

  const handleInputChange = event => {
    // Destructure textbox `value` field.
    const { value } = event.target;
    // Update params
    setCurrentText(value);
  };

  return (
    <>
      <Form
        inline
        onSubmit={async event => {
          event.preventDefault();
          if (!currentText || currentText.length === 0) {
            return;
          }

          // Redirect to search path.
          history.push(`/search?q=${currentText}`);
        }}
      >
        <FormControl
          id={'text'}
          className={'mr-sm-2'}
          placeholder={'Search Twitter'}
          type={'text'}
          value={currentText}
          onChange={handleInputChange}
        />
        <Button variant={'outline-success'} type={'submit'}>
          Search
        </Button>
      </Form>
    </>
  );
};

export default withRouter(SearchBox);
```

We start by creating a local `currentText` state that is initialized to an empty string. The form invokes `handleInputChange()` when the text value changes, which assigns the new value our `currentText` state. The `Form.onSubmit()` event starts by preventing the default behavior, which is critical to do at the beginning of every React component event. To perform a redirect we use the `history` prop that was provided to the `SearchBox` component props object because we wrapped the caller at the bottom in [`withRouter`](https://reacttraining.com/react-router/web/api/withRouter) from `react-router-dom`. This is a bit of a trick to perform a simple redirect by essentially adding a new entry to the history stack. In this case, we want to perform a search so we redirect to our `/search?q=` endpoint and include the `currentText` state value.

## Search Component

The `Search` [component](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/client/src/components/Search/Search.tsx) is where things start to get rather interesting. We get to combine a lot of functionality from every aspect of our app to perform an efficient yet powerful search using a Dgraph query.

```tsx
// File: client/src/components/Search/Search.tsx
import React from 'react';
import { DgraphQueryExecutor, Queries } from 'dgraph-query-manager';
import { useDgraphGlobal } from '../../hooks/dgraph';
import { Action, ActionType } from '../../reducers/base';
import { Card, Image } from 'react-bootstrap';
import { useStateContext } from '../../state';

const Search = ({ location }) => {
  const [{ tweets }] = useStateContext();

  const cleanupQueryString = (query: string | null) => {
    let result;
    if (query) {
      result = query.replace('%23', '').replace('#', '');
    }
    return result;
  };

  const queryString = cleanupQueryString(
    new URLSearchParams(location.search).get('q')
  );

  const executor = new DgraphQueryExecutor(Queries.Search.search, {
    $query: queryString,
  });

  useDgraphGlobal({
    executor,
    action: new Action(ActionType.SET_TWEETS),
    // Re-render if query changes.
    dependencies: [queryString],
    invalid: undefined,
    // Accept empty results.
    allowFailure: true,
  });

  return (
    <Card className="SearchCard">
      <Card.Body>
        <div>
          <p>
            Search for <b>{queryString}</b> found {tweets ? tweets.length : 0}{' '}
            results.
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Search;
```

Our component starts by calling the custom `useStateContext()` hook and destructuring the `tweets` property from it. This contains the global list of `Tweets` for our app, which is essentially used to render the main `TweetList` component we'll see a bit later. In this case, the `Search` component will be updating that state and we'll use the result to render a simple counter of how many tweets were returned from the search.

The `DgraphQueryExecutor` is using the `Search.search` `Query` which looks similar to the following.

```js
query find($query: string) {
  a as var(func: anyoftext(tweet.text, $query))
  var(func: anyoftext(hashtag.hashtag, $query)) {
    b as hashtags: ~tweet.hashtag
  }

  data(func: has(tweet.text)) @filter(uid(a) OR uid(b)) {
    uid
    expand(_all_) {
      uid
      expand(_all_)
    }
  }
}
```

The `Query` expects a `$query` parameter indicating what to search for, and looks in the `tweet.text` and `hashtag.hashtag` predicates for that text using the `anyoftext()` GraphQL+- function. We want a result consisting only of tweet nodes, but since the hashtag nodes referenced in the `tweet.hashtag` edge are separate nodes we need to combine the results of our pre-search before obtaining the final result set. We accomplish this by using GraphQL+- [var blocks](https://docs.dgraph.io/query-language/#var-blocks), which are blocks that begin with a `var` keyword and are not returned in the results. We combine that capability with [value variables](https://docs.dgraph.io/query-language/#value-variables) that are written in the form of `varName as ...` to obtain a temporary list of scalar values. In this case, Dgraph recognizes the results of our two `var` blocks are `uid` nodes. We assign those `uid` lists to temporary variables `a` and `b`, and then use those lists as part of the `@filter` for our final query results. The end result is that we return only the subset of tweet nodes that _either_ have a `tweet.text` or a `tweet.hashtag > hashtag.hashtag` predicate containing our search text.

To see this in action here we've got the above query looking for the search term `user`, which should return at least a handful of results.

<!-- prettier-ignore-start -->
{{< runnable >}}
{
  a as var(func: anyoftext(tweet.text, "user")) 
  var(func: anyoftext(hashtag.hashtag, "user")) {
    b as hashtags: ~tweet.hashtag
  }

  data(func: has(tweet.text)) @filter(uid(a) OR uid(b)) {
    uid
    expand(_all_) {
      uid
      expand(_all_)
    }
  }
}
{{</ runnable >}}
<!-- prettier-ignore-end -->

The search query above uses another GraphQL+- feature called [Reverse Edges](https://docs.dgraph.io/query-language/#reverse-edges). The tilde character preceding the `tweet.hashtag` predicate in the line `b as hashtags: ~tweet.hashtag` signifies that the we're querying the _reverse edge_ between `tweet.hashtag` and `hashtag.hashtag`. To better illustrate take a look at the modified query below in which we're only seeking tweets in which the `tweet.hashtag` shares an edge with a `hashtag.hashtag` node that contains the search term of `user`.

```bash
$ curl http://127.0.0.1:8080/query -XPOST -d '{
  var(func: anyoftext(hashtag.hashtag, "user")) {
    b as hashtags: ~tweet.hashtag
  }

  data(func: has(tweet.text)) @filter(uid(b)) {
    uid
    count(uid)
    tweet.text
    tweet.hashtag {
      hashtag.hashtag
    }
  }
}' | jq
```

Here's a sample of what that returns.

```json
{
  "uid": "0x106f",
  "tweet.text": "@Jarred_Schiller82 viral enable experiences #User-friendly #Persistent",
  "tweet.hashtag": [
    {
      "hashtag.hashtag": "User"
    },
    {
      "hashtag.hashtag": "Persistent"
    }
  ]
}
```

Notice that our schema is structured such that `hashtag.hashtag` is a child of `tweet.hashtag`. However, we are searching for "parent" tweet nodes that contain hashtags with `user` text, so we use a **reverse edge** (`~`) to look at the relationship in the opposite direction as normal. In our Dgraph [schema]({{% ref "/#schema" %}}) we added the `@reverse` directive to the `tweet.hashtag` predicate so Dgraph would automatically compute the reverse edge for us.

---

Back to the `Search` component logic, we saw how the client app uses the `useDgraphGlobal()` hook in the [Hooking Into useDgraphGlobal](#hooking-into-usedgraphglobal) section, but the call to that hook in the `Search` component has a few extra arguments to briefly discuss.

```ts
useDgraphGlobal({
  executor,
  action: new Action(ActionType.SET_TWEETS),
  // Re-render if query changes.
  dependencies: [queryString],
  invalid: undefined,
  // Accept empty results.
  allowFailure: true,
});
```

We know that the executor is executed and that the result is passed as a payload to the new `Action` which is a type of `SET_TWEETS`. The `dependencies` param is actually passed as the _second_ argument to the underlying `useEffect()` method. When React recognizes that the component in which `useEffect()` was called must be rendered again (due to a state change or what not), it will first check the list of dependency arguments for changes in their value(s). If none of the dependencies have changed since the previous render, React **does not** re-render the updating component. This is particularly useful when rendering a heavy component could have a negative performance impact, but it's also just good practice to prevent unnecessary renders.

So, in the case above our dependencies consist of just a single reference to our `queryString` value -- in other words, the actual text that is being searched for during this render. In our query example above, `queryString` would be equal to `user`. Thus, after the `Search` component renders initially and executes the underlying `useEffect()` hook that's part of our `useDgraphGlobal()` call, it will only trigger `useEffect()` again **if** the value of the `queryString` has changed. In other words, if a new search parameter is passed. Neato!

Setting `allowFailure` to `true` is useful when executing a query that _may_ not return any results. Since this is a user-generated search query, we have to account for this possibility, so setting `allowFailure` to true for this call still passes the `Serialization.response` to our `action.payload` and updates the `tweets` state accordingly.

The only other minor thing to mention is the destructured `location` property, which is [provided by](https://reacttraining.com/react-router/web/api/location) `react-router-dom`. The `location` object contains a bit of useful information such as the current path, query params, and so forth. We use it here to extract the `search` property params, since the `/search?q=user` path contains the actual text being searched for.

## Profile Components

Profile components provide basic user information for the currently authenticated **or** currently viewed user.

### Profile Card

Let's take a look at the `ProfileCard` component, which is the identification card along the left side of the app containing user-specific profile information.

```tsx
// File: client/src/components/Profile/ProfileCard.tsx
// Components
import ProfileCardStats from './ProfileCardStats';
// Helpers
// Hooks
// Layout
import { Card, Image } from 'react-bootstrap';
// Libs
import { DgraphQueryExecutor, Queries } from 'dgraph-query-manager';
import React from 'react';
// Local
import { useStateContext } from '../../state';
import { useDgraphGlobal } from '../../hooks/';
import { Action, ActionType } from '../../reducers/';
import config from '../../config';

const ProfileCard = ({ match }) => {
  const screenName =
    match && match.params && match.params.screenName
      ? match.params.screenName
      : config.user.defaultAuthScreenName;

  const executorScreenName = new DgraphQueryExecutor(
    Queries.User.findFromScreenName,
    {
      $screenName: screenName,
    }
  );
  const [isScreenNameLoading, responseScreenName] = useDgraphGlobal({
    executor: executorScreenName,
    action: new Action(ActionType.SET_USER),
    // Re-render if match changes.
    dependencies: [screenName],
    // Invalid if screenName doesn't exist.
    invalid: !screenName,
  });

  const [{ user }] = useStateContext();

  const executorTweets = new DgraphQueryExecutor(Queries.Tweet.getAllForUser, {
    $id: user && user.uid ? user.uid.toString() : undefined,
  });
  const [isLoading, response] = useDgraphGlobal({
    executor: executorTweets,
    action: new Action(ActionType.SET_TWEETS),
    // Re-render if user changes.
    dependencies: [user],
    // Invalid if user doesn't exist.
    invalid: !user,
  });

  let content = <h3>Loading Profile</h3>;

  if (user) {
    const name = user['user.name'];
    const screenName = user['user.screenName'];
    content = (
      <Card className="ProfileCard">
        <a className="ProfileCard-bg" href={`/${screenName}`} />
        <Card.Body>
          <a href={`/${screenName}`} title={name}>
            <Image
              src={
                user['user.avatar']
                  ? user['user.avatar']
                  : 'https://www.gravatar.com/avatar/00000000000000000000000000000000'
              }
            />
          </a>

          <div>
            <div>
              <a href={`/${screenName}`}>{name}</a>
            </div>
            <span>
              <a href={`/${screenName}`}>
                <span>
                  @<b>{screenName}</b>
                </span>
              </a>
            </span>
          </div>

          <ProfileCardStats />
        </Card.Body>
      </Card>
    );
  } else {
    content = (
      <>
        <h3>No User Profile found.</h3>
      </>
    );
  }

  return content;
};

export default ProfileCard;
```

As you may recall one of the `Routes` in our `Main` component uses a path with a `:screenName` parameter and renders the `ProfileCard` if it matches.

```tsx
<Route path={'/:screenName'} component={ProfileCard} />
```

Therefore, the `ProfileCard` component first destructures the `match` property [provided by](https://reacttraining.com/react-router/web/api/match) `react-router-dom` and checks to see if the `screenName` param exists. If not, it assumes we've matched the root path instead (`/`), which was also routed to render this component, and uses the static `config.user.defaultAuthScreenName` value instead. As we saw in the [Main Component](#main-component) section, this static value is just used for demonstration purposes, and would be retrieved from an authed user or session in a real-world app. The retrieved `screenName` value is then used in the `User.findFromScreenName` `Query` and that executor is passed to `useDgraphGlobal` to retrieve a matching `User` record with that particular `user.screenName`.

The `ActionType.SET_USER` causes our `Reducer` to update the `State.user` property with the retrieved value, so we also call the `useStateContext()` hook and destructure the `user` property to get whatever user is currently active. We then use another `Query` and executor to retrieve all `Tweets` for that user and dispatch it with the `ActionType.SET_TWEETS` action. It's worth noting that we used the same `ActionType` in the `Search` component, which illustrates the power of making our components self-contained. Regardless of where in the app we update the global list of tweets, we can use the same process and it will always have the same impact on the rest of the app.

The actual rendered HTML of `ProfileCard` creates some basic profile structure for the user, including their avatar if applicable, and also renders the `ProfileCardStats` component.

### Profile Card Stats

You may have noticed the `ProfileCard` component doesn't pass any props to the `ProfileCardStats` component. Therefore, as you'll see in the code, `ProfileCardStats` doesn't expect a props argument.

```tsx
// File: client/src/components/Profile/ProfileCardStats.tsx
// Components
// Hooks
// Layout
import { Col, Row } from 'react-bootstrap';
// Libs
import React from 'react';
import { useStateContext } from '../../state';

const ProfileCardStats = () => {
  const [{ user, tweets }] = useStateContext();

  let content = <h3>Loading Stats</h3>;
  let tweetCount = 0;
  if (tweets) {
    tweetCount = Array.isArray(tweets) ? tweets.length : 1;
  }

  if (user) {
    const screenName = user['user.screenName'];
    content = (
      <Row className="ProfileCardStat" noGutters={true}>
        <Col xs={3}>
          <a href={`/${screenName}`}>
            <span className="ProfileCardStat-title">Tweets</span>
            <span>{tweetCount}</span>
          </a>
        </Col>
        <Col xs={4}>
          <a href={`/${screenName}/following`}>
            <span className="ProfileCardStat-title">Following</span>
            <span>{user['user.favouritesCount']}</span>
          </a>
        </Col>
        <Col xs={5}>
          <a href={`/${screenName}/followers`}>
            <span className="ProfileCardStat-title">Followers</span>
            <span>{user['user.followersCount']}</span>
          </a>
        </Col>
      </Row>
    );
  }

  return content;
};

export default ProfileCardStats;
```

Instead of using passed props we explicitly use global state via the `useStateContext()` hook. But why not just pass props, since `ProfileCard` is just up one level in the component tree and could easily do so? The simple answer is the future-proofing this separation provides. If `ProfileCardStats` expects some props passed to it that contain `user` and `tweets` data, for example, what happens when we move this component to somewhere else in the app structure? We'd have to adjust the immediate parent component, at the very least, to pass the props, and in some cases the component tree gets extremely long, requiring a massive chain of passed props. It's this very reason that the React team added context (i.e. global state), so we're making use of it here as well.

Thankfully, by leaning on the work of other components to update our global state, the `ProfileCardStats` component doesn't have to trigger any post-rendering effects -- it just grabs the data it needs and renders its UI.

## Tweet Components

The last set of components to go over are those that handle tweets. It's generally a good idea to break functionality into smaller components whenever possible, so we have the `TweetList` component that contains a series of `TweetCard` components, which in turn contains a `Tweet` component. We also have the singular `TweetBox` component that the user uses to add new tweets. Finally, the `TweetModal` component which is used to simulate the singular modal view Twitter employs when viewing a specific tweet URL.

### Tweet Box

Let's start by looking at the `TweetBox` [component](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/client/src/components/Tweet/TweetBox.tsx), which is displayed at the top of the main content `Container` and allows the authenticated user to add new tweets.

```tsx
// File: client/src/components/Tweet/TweetBox.tsx
// Components
import { Button, Form } from 'react-bootstrap';
// Local
import { useStateContext } from '../../state';
// Libs
import React, { useState } from 'react';
import { Tweet } from 'dgraph-query-manager';
import { Action, ActionType } from '../../reducers/';

const TweetBox = () => {
  const [{ authUser, user, tweets }, dispatch] = useStateContext();

  const initialFormState = {
    'tweet.text': '',
    'tweet.user': authUser,
  };
  const [currentTweet, setCurrentTweet] = useState(initialFormState);

  const handleInputChange = event => {
    // Destructure textbox `id` and `value` fields.
    const { id, value } = event.target;
    // Update currentTweet params
    setCurrentTweet({ ...currentTweet, [id]: value });
  };

  const handleSubmit = async event => {
    event.preventDefault();
    // Checks for valid authUser and valid currentTweet text.
    if (
      !authUser ||
      !authUser.uid ||
      !currentTweet ||
      currentTweet['tweet.text'].length === 0
    ) {
      return;
    }

    const params = {
      'tweet.text': currentTweet['tweet.text'],
      'tweet.user': authUser,
    };

    const serialization = await Tweet.upsert(params as Partial<Tweet>);

    // Tweet created
    if (serialization.success) {
      setCurrentTweet(initialFormState);
      // Only update tweet list if authUser equals viewed user.
      if (user && user.uid.toString() === authUser.uid.toString()) {
        dispatch(
          new Action(ActionType.SET_TWEETS, [...tweets, serialization.response])
        );
      }
    }
  };

  return (
    <Form className={'TweetBox'} onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Control
          id={'tweet.text'}
          as={'textarea'}
          type={'textarea'}
          value={currentTweet['tweet.text']}
          placeholder={"What's happening?"}
          onKeyDown={async event => {
            // On enter
            if (event.keyCode === 13) await handleSubmit(event);
          }}
          onChange={handleInputChange}
        />
        <Button variant={'primary'} type={'submit'}>
          Tweet
        </Button>
      </Form.Group>
    </Form>
  );
};

export default TweetBox;
```

There's a lot going on in the `TweetBox` component so we'll break it down into chunks. We start by grabbing the `authUser`, `user`, and `tweets` global state values, along with the `dispatch` function for later use. We then set the `currentTweet` local state to an object containing empty `tweet.text` and setting the `tweet.user` property to the `authUser`. This local `currentTweet` state can then be used to track changes to the tweet box input.

Let's skip down to the `return` render which is basically just a simple form with a `textarea` element and a submit button. Critically, we must set the `value` property of the textarea to the `currentTweet['tweet.text']` state value, otherwise React won't allow us to modify the text in the text box. The `onChange` event is handled by `handleInputChange()`, which uses the `setCurrentTweet()` function to set the local `currentTweet` state.

Meanwhile, the `onKeyDown` event checks if the **Enter** key was pressed, in which case it triggers submission, similar to the actual `onSubmit` form event.

The `handleSubmit()` function checks for a valid `authUser` and `currentTweet`, creates an object that matches properties of a `Partial<Tweet>` object, then passes those to the `Tweet.upsert()` method from the `dgraph-query-manager` package. If upsert was successful the tweet box is returned to its initial state. Finally, if the current `user` state matches the `authUser`, that means the `TweetList` component is displaying the list of tweets for the authorized user. In this case we want to immediately update the `tweets` global state to reflect the new addition that was just upserted to the database, so we `dispatch()` the appropriate action and pass the new `tweets` list with the `serialization.response` (i.e. the created `Tweet` instance) added onto it.

{{% notice "warning" %}} It's worth pointing out that the logic of comparing the current `user` to the `authUser` should probably be refactored into a separate component or class, somewhere outside of `TweetBox`. It's kept here just because our simple app doesn't update that anywhere else, but a larger application would be wise to only allow the `TweetBox` to dispatch and action, while another section should actually determine what (if any) state data should be updated based on that. {{% /notice %}}

### Tweet List

Our `TweetList` [component](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/client/src/components/Tweet/TweetList.tsx) is short and sweet. It uses the `tweets` global state to render a list of `TweetCard` components.

```tsx
// File: client/src/components/Tweet/TweetList.tsx
// Components
import TweetCard from './TweetCard';
// Helpers
// Hooks
// Libs
import React from 'react';
import { useStateContext } from '../../state';

const TweetList = () => {
  const [{ tweets }] = useStateContext();
  let content;

  if (tweets && Array.isArray(tweets) && tweets.length > 0) {
    content = tweets.map(tweet => <TweetCard key={tweet.uid} tweet={tweet} />);
  } else if (tweets && !Array.isArray(tweets)) {
    content = <TweetCard key={tweets.uid} tweet={tweets} />;
  } else {
    content = <h3>No Tweets found.</h3>;
  }

  return content;
};

export default TweetList;
```

If the `tweets` state is defined then we pass every tweet in the collection to a new `TweetCard` component instance, along with setting the `key` property to a unique value and passing each `Tweet` as a prop.

### Tweet Card

The `TweetCard` [component](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/client/src/components/Tweet/TweetCard.tsx) provides most of the structure and layout to each tweet in the UI and contains logic for determining tweet-specific stats like the number of replies, retweets, favorites, and so forth.

```tsx
// File: client/src/components/Tweet/TweetCard.tsx
// Components
import Tweet from './Tweet';
// Layout
import './TweetCard.css';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
// Libs
import React, { useEffect, useState } from 'react';
import { logger, numeral } from '../../helpers';
import {
  DgraphQueryExecutor,
  Queries,
  Tweet as TweetModel,
} from 'dgraph-query-manager';
// Font
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRetweet } from '@fortawesome/free-solid-svg-icons';
import config from '../../config';
import { useStateContext } from '../../state';
import { Link } from 'react-router-dom';
import { Action, ActionType } from '../../reducers/';

const TweetCard = ({ tweet }) => {
  if (!tweet || !tweet.uid) return <></>;
  const [{ authUser }, dispatch] = useStateContext();
  const [replies, setReplies]: [any, Function] = useState(undefined);
  const [, setIsLoading]: [boolean, Function] = useState(true);

  /**
   * Set replies.
   */
  useEffect(() => {
    const params = {
      $id: tweet && tweet.uid ? tweet.uid.toString() : undefined,
    };
    const executor = new DgraphQueryExecutor(Queries.Tweet.getReplies, params);
    executor
      .execute()
      .then(serialization => {
        setIsLoading(false);
        if (serialization.success) {
          // Set replies to Array
          if (Array.isArray(serialization.response)) {
            setReplies(serialization.response);
          } else {
            setReplies(new Array(serialization.response));
          }
        }
      })
      .catch(exception => {
        logger.error(exception);
        setIsLoading(false);
      });
  }, [tweet]);

  // Debug output Tweet Uid
  let debugElement;
  if (config.debug) {
    debugElement = <p>Uid: {tweet.uid.toString()}</p>;
  }

  /**
   * Check if currently authed User has replied to Tweet.
   */
  const hasAuthUserReplied = (): boolean => {
    if (!authUser || !replies || !authUser.uid) {
      return false;
    }
    return replies.some(reply => {
      if (authUser.uid && reply) {
        return (
          reply['tweet.user'] &&
          reply['tweet.user'].uid &&
          reply['tweet.user'].uid.toString() === authUser.uid.toString()
        );
      }
    });
  };

  /**
   * Toggle boolean field of Tweet.
   * @param field
   * @param event
   */
  const toggleBooleanField = async (field, event) => {
    event.preventDefault();
    if (!tweet || !tweet.uid) return;

    const partial: Partial<TweetModel> = {};
    // Toggle current value.
    partial[field] = !tweet[field];
    // Update counter field.
    if (field === 'tweet.favorited') {
      partial['tweet.favoriteCount'] = partial[field]
        ? tweet['tweet.favoriteCount'] + 1
        : tweet['tweet.favoriteCount'] - 1;
    } else if (field === 'tweet.retweeted') {
      partial['tweet.retweetCount'] = partial[field]
        ? tweet['tweet.retweetCount'] + 1
        : tweet['tweet.retweetCount'] - 1;
    }
    const serialization = await TweetModel.upsert(tweet, partial);
    // Tweet created
    if (serialization.success) {
      // Dispatch state update to other components.
      dispatch(new Action(ActionType.UPDATE_TWEET, serialization.response));
    }
  };

  return (
    <Card className="TweetCard">
      <Card.Body>
        <Tweet tweet={tweet} />
        <ButtonGroup>
          <Button
            className={'reply'}
            variant={'link'}
            active={hasAuthUserReplied()}
          >
            <FontAwesomeIcon icon={['far', 'comment']} />{' '}
            {numeral(replies ? replies.length : 0).format('0a')}
          </Button>
          <Button
            className={'retweet'}
            variant={'link'}
            active={tweet['tweet.retweeted']}
            onClick={e => toggleBooleanField('tweet.retweeted', e)}
          >
            <FontAwesomeIcon icon={faRetweet} />{' '}
            {numeral(tweet['tweet.retweetCount']).format('0a')}
          </Button>
          <Button
            className={'favorite'}
            variant={'link'}
            active={tweet['tweet.favorited']}
            onClick={e => toggleBooleanField('tweet.favorited', e)}
          >
            <FontAwesomeIcon icon={['far', 'heart']} />{' '}
            {numeral(tweet['tweet.favoriteCount']).format('0a')}
          </Button>
          <Button className={'dm'} variant={'link'}>
            <FontAwesomeIcon icon={['far', 'envelope']} />
          </Button>
          <Link to={`/status/${tweet.uid.toString()}`}>
            <Button className={'details'} variant={'link'}>
              <FontAwesomeIcon icon={['far', 'arrow-alt-circle-right']} />{' '}
            </Button>
          </Link>
          {debugElement}
        </ButtonGroup>
      </Card.Body>
    </Card>
  );
};

export default TweetCard;
```

As we saw in the [Tweet List](#tweet-list) component the `TweetCard` component is one of the few components we are passing direct props to -- in this case, the `Tweet` instance to be displayed. The component logic starts with a few `useState()` hooks before the `useEffect()` hook that retrieves all replies to the current `Tweet`. This is a good example of how `useEffect()`, which occurs at least once after render, can be used for asynchronous data retrieval. Here we're using the `Tweet.getReplies` query which looks for tweet nodes in which `tweet.inReplyToStatusId` is set to the current `Tweet` `uid`. In other words, it finds all tweets that were replies to this one.

```js
query find($id: string) {
  data(func: has(tweet.text)) {
    tweets: @filter(uid_in(tweet.inReplyToStatusId, $id)) {
      uid
      expand(_all_) {
        uid
        expand(_all_)
      }
    }
  }
}
```

After executing the query we set the local `replies` state via the `setReplies` function.

The `hasAuthUserReplied()` function determines if the currently authorized user is among the set of users that replied to this tweet. Just like the actual Twitter, this value is used to change the highlighting on the `reply` `<Button>` element.

`toggleBooleanField()` is also a helper that makes it possible for the user to toggle certain tweet flags when interacting with the UI. In this case, if the user wants to _favorite_ a tweet he or she clicks on the `favorite` `<Button>`, which triggers the `toggleBooleanField` function for the corresponding `tweet.favorited` field. A new `Partial<TweetModel>` object is used to change the `tweet['favorited']` and `tweet['tweet.favoriteCount']` values, then the whole `Partial<T>` is upserted to the Dgraph database. Upon success the global state is updated via the `dispatch` function to update all components that contain a reference to the `Tweet`. The result is the `TweetCard` is immediately re-rendered with the updated values and `active` flags as soon as the user toggles them.

{{% notice "info" %}} We're referencing the `Tweet` model by the name `TweetModel` because otherwise the name clashes with the `Tweet` component that is also used in the `TweetCard` component. {{% /notice %}}

The rendered HTML for the `TweetCard` is fairly self-explanatory. We're using some [FontAwesome](https://fontawesome.com/) icons for the buttons, but most of the component logic occurs in the functions above and the `useEffect()` hook we already explored. The `Tweet` component is also rendered at the top of this card and the current `tweet` value is passed as a prop to it.

### Tweet

The `Tweet` [component](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/client/src/components/Tweet/Tweet.tsx) displays the actual tweet text, #hashtags, @mentions, the user info, and post timestamp.

```tsx
// File: client/src/components/Tweet/Tweet.tsx
// Layout
import './Tweet.css';
import { Image } from 'react-bootstrap';
// Libs
import moment from 'moment';
import React from 'react';
import * as twitter from 'twitter-text';
import ReactHtmlParser from 'react-html-parser';

const Tweet = props => {
  const tweet = props.tweet;
  const user = tweet['tweet.user'];
  const name = user['user.name'];
  const screenName = user['user.screenName'];

  const tweetLinks = twitter.autoLink(tweet['tweet.text'], {
    hashtagUrlBase: '/search?q=%23',
    listUrlBase: '/',
    usernameUrlBase: '/',
  });

  return (
    <>
      <div className={'tweet-header'}>
        <ul>
          <li>
            <a href={`/${screenName}`} title={name}>
              <Image
                className={'avatar'}
                src={user && user['user.avatar'] ? user['user.avatar'] : ''}
              />
            </a>
          </li>
          <li>
            <span>
              <a href={`/${screenName}`}>
                <b>{name}</b>
              </a>
            </span>
          </li>
          <li>
            <a href={`/${screenName}`}>
              <span>@{screenName}</span>
            </a>
          </li>
          <li>
            <span className={'createdAt'}>
              {moment(tweet['tweet.createdAt']).fromNow()}
            </span>
          </li>
        </ul>
      </div>
      <div className={'tweet'}>
        <p>{ReactHtmlParser(tweetLinks)}</p>
      </div>
    </>
  );
};

export default Tweet;
```

We're using the [Twitter Text](https://github.com/twitter/twitter-text/) library provided by Twitter to help with parsing our actual tweet text. In this case, the [`autoLink()`](https://github.com/twitter/twitter-text/blob/master/js/src/autoLink.js) function detects where entities like hashtags and mentions are within the tweet, and surrounds those elements with appropriate `<a>` tags. By passing some extra options to the function call we can override the defaults so our search URL is local, rather than linking to `twitter.com`.

### Tweet Modal

The final tweet component to look at is the `TweetModal` component. As the name suggests, this component creates a modal popup overlay that contains a single `Tweet`. As such, it illustrates the power of reusable components, since it renders the `TweetCard` (which itself renders the `Tweet` component).

```tsx
// File: client/src/components/Tweet/TweetModal.tsx
import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { DgraphQueryExecutor, Queries } from 'dgraph-query-manager';
import { useDgraphLocal } from '../../hooks/dgraph';
import TweetCard from './TweetCard';

const TweetModal = ({ match }) => {
  const [isShowing, setIsShowing] = useState(true);
  const [uid, setUid] = useState(undefined);
  const passedUid = match.params.tweetUid;

  // Update when passed Uid differs from state.
  if (uid !== passedUid) {
    setIsShowing(true);
    setUid(passedUid);
  }

  const onHide = () => {
    setIsShowing(false);
  };

  const executor = new DgraphQueryExecutor(Queries.Tweet.find, {
    $id: uid,
  });

  const [isLoading, response] = useDgraphLocal({
    executor,
    dependencies: [uid],
  });

  let content = <></>;

  if (!isLoading) {
    content = (
      <Modal show={isShowing} onHide={onHide}>
        <Modal.Header closeButton />
        <Modal.Body>
          <TweetCard tweet={response} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return content;
};

export default TweetModal;
```

As you may recall from the [Routing with React Router DOM](#routing-with-react-router-dom) section, the `Main` component contains a `Route` that references the `TweetModal` component.

```tsx
<Route path={'/status/:tweetUid'} component={TweetModal} />
```

This route path mimics the path that Twitter uses for singular tweet URLs, so the `TweetModal` component will only render when the user is looking at a single tweet.

The logic we're using here is to grab the `tweetUid` param from the `match` object provided by `react-router-dom` and set it to local `uid` state. From there a new `DgraphQueryExecutor` is passed that tweet `uid` and uses the `Tweet.find` `Query` to see if the `uid` exists in the Dgraph database. Here's what that query looks like.

```js
query find($id: string) {
  data(func: uid($id)) {
    uid
    expand(_all_) {
      uid
      expand(_all_)
    }
  }
}
```

In the event that a response is provided the modal is set to show and the retrieved `Tweet` instance is passed as a prop to the rendered `TweetCard` component, which behaves just as we saw above.

It's worth noting that we're using the `useDgraphLocal()` [custom hook](https://github.com/GabeStah/dgraph-twitter-clone/blob/master/client/src/hooks/dgraph/useDgraphLocal.ts) here, which is somewhat similar to the `useDgraphGlobal()` hook, with the major difference being it stores state locally, not globally.

```ts
// File: client/src/hooks/dgraph/useDgraphLocal.ts
// Helpers
import { logger } from '../../helpers';
// Libs
import { useEffect, useState } from 'react';
import { DgraphQueryExecutor } from 'dgraph-query-manager';

/**
 * Custom React hook that performs the heavy lifting of data retrieval
 * from Dgraph and uses local state.  Accepts a DgraphQueryExecutor that is
 * executed, the response of which is assigned to state.
 *
 * @param parameters.executor Executor to be executed.
 * @param parameters.dependencies Values that will trigger a re-render upon change.
 * @param parameters.allowFailure Allows failed result to still be dispatched to state.
 */
export const useDgraphLocal = (parameters: {
  executor: DgraphQueryExecutor;
  dependencies: any;
  allowFailure?: boolean;
}): [boolean, any] => {
  const { executor, dependencies, allowFailure = false } = parameters;
  const [isLoading, setIsLoading]: [boolean, Function] = useState(true);
  const [response, setResponse]: [any, Function] = useState(undefined);

  useEffect(() => {
    setIsLoading(true);
    executor
      .execute()
      .then(serialization => {
        setIsLoading(false);
        if (serialization.success || allowFailure) {
          setResponse(serialization.response);
        }
      })
      .catch(exception => {
        logger.error(exception);
        setIsLoading(false);
      });
  }, dependencies);

  return [isLoading, response];
};
```

Other than that, it behave much the same, allowing the `TweetModal` component to perform a post-render effect to asynchronously retrieve Dgraph data and use the response for further processing.

## Next Steps

Whew! That was quite a lot to cover throughout this guide, but hopefully this series helped to illustrate how any type of app -- from this relatively simple `dgraph-twitter-clone` to a large production-scale, distributed system -- can realize significant benefits by integrating with a graph database like Dgraph.

In [The Architecture - Schema]({{% ref "/#schema" %}}) we explored how Dgraph's schema specification makes it easy to design complex data structures _without_ the need to define (or even know about) explicit relationships. This flexibility allows your data layer to be dynamically expanded and mutate to the needs of the application over time. In fact, while not really a recommended practice, Dgraph has no problem accepting data with unknown predicates, and automatically adding them to the schema for future use. Check out the [Schema documentation](https://docs.dgraph.io/query-language/#schema) for more details.

In the [Search Component](#search-component) section we also explored how Dgraph's GraphQL+- makes it easy to execute performant joins and reverse joins across any shape of data. With features like [reverse edges](https://docs.dgraph.io/query-language/#reverse-edges), [powerful indexing](https://docs.dgraph.io/query-language/#indexing), [filter logic](https://docs.dgraph.io/query-language/#connecting-filters), [query](https://docs.dgraph.io/query-language/#query-variables) and [value](https://docs.dgraph.io/query-language/#value-variables) variables, [GroupBy](https://docs.dgraph.io/query-language/#groupby), and much more, Dgraph eliminates many of the potential headaches found when trying to perform complex joins across large datasets within traditional SQL-like databases. Head over to the [Query Language](https://docs.dgraph.io/query-language/) documentation to get tons more info on GraphQL+- and how it can streamline your data layer.

There's plenty more to learn about how Dgraph can benefit your team and your next project, so check out some of the [benefits](https://dgraph.io/), see how to [get started](https://docs.dgraph.io/get-started/), take our [interactive tour](https://tour.dgraph.io/), chat with us on our [discussion forums](https://discuss.dgraph.io/), or even throw us a [star on GitHub](https://github.com/dgraph-io/dgraph) if you're so inclined. If you're ready to get more direct support and see how our team can help you, check out our [Startup and Enterprise Support](https://dgraph.io/support) plans or [get in touch](mailto:contact@dgraph.io?subject=I%20would%20like%20to%20sign%20up%20for%20the%20Enterprise%20Package) directly.
