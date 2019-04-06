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
