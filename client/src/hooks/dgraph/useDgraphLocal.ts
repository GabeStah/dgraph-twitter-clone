// Helpers
import { logger } from '../../helpers';
// Libs
import { useEffect, useState } from 'react';
import { DgraphQueryExecutor, Serialization } from 'dgraph-query-manager';

/**
 * Custom React hook that performs the heavy lifting of data retrieval
 * from Dgraph and uses local state.  Accepts a DgraphQueryExecutor that is
 * executed, the response of which is assigned to state.
 *
 * @param executor - Executor to be executed.
 * @param dependencies - Values that will trigger a re-render upon change.
 */
export const useDgraphLocal = (
  executor: DgraphQueryExecutor,
  dependencies: any
): [boolean, Serialization] => {
  const [isLoading, setIsLoading]: [boolean, Function] = useState(true);
  const [response, setResponse]: [Serialization | any, Function] = useState(
    executor
  );

  // Call useEffect unconditionally.
  useEffect(() => {
    setIsLoading(true);
    executor
      .execute()
      .then(serialization => {
        setIsLoading(false);
        setResponse(serialization.response);
      })
      .catch(exception => {
        logger.error(exception);
        setIsLoading(false);
      });
  }, dependencies);

  return [isLoading, response];
};
