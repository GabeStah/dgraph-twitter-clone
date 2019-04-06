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
    allowFailure = false
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
