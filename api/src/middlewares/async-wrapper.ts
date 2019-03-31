import { Promise } from 'es6-promise';

/**
 * Wraps async function calls to handle error catching.
 * @param fn
 * @returns {(req, res, next) => void}
 */
export function asyncWrapper(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
