/**
 * Author: Luke Hall
 * Source: https://medium.com/simply/state-management-with-react-hooks-and-context-api-at-10-lines-of-code-baf6be8302c
 */
import React, { createContext, useContext, useReducer } from 'react';
import { InitialState, State } from './State';

// const initialState: any = new State();

export const StateContext = createContext(InitialState);
export const StateProvider = ({ reducer, initialState, children }) => (
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </StateContext.Provider>
);
export const useStateContext = () => useContext(StateContext);
