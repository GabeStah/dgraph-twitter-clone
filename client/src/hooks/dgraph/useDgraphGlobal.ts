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
 * Custom React hook that performs the heavy lifting of data retrieval from Dgraph.
 * Accepts a Serialization instance with an associated DgraphQueryExecutor.  Execution is either performed directly
 * or passed along to the backend REST_API via generated URL.
 *
 * @param executor
 * @param action
 * @param dependencies
 * @param invalid
 * @param allowFailre - Allows failed result to still be dispatched to state.
 */
export const useDgraphGlobal = (
  executor: DgraphQueryExecutor,
  action: Action,
  dependencies: any,
  invalid?: boolean,
  allowFailure = false
): [boolean, Serialization] => {
  const [isLoading, setIsLoading]: [boolean, Function] = useState(false);
  const [response, setResponse]: [any, Function] = useState(undefined);

  // STATE
  const [, dispatch]: [any, Function] = useStateContext();

  // DEPRECATED
  // Unless passed empty array, assign mutable values to dependencies.
  // if (!Array.isArray(dependencies) || dependencies.length > 0) {
  //   dependencies = [dispatch, field, invalid, executor, type, ...dependencies];
  // }

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
