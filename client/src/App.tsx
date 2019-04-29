// Components
import Main from './components/Main/Main';
// Hooks
// Layout
import './App.css';
// Libs
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
// Local
import { Action, ActionType, Reducer } from "./reducers";
import { InitialState, StateProvider } from './state';
// Fonts
import { library } from '@fortawesome/fontawesome-svg-core';
// import { fab } from '@fortawesome/free-brands-svg-icons';
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
