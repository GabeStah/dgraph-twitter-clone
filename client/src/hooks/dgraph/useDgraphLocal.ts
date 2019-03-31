// Helpers
import { logger } from '../../helpers';
// Libs
import { useEffect, useState } from 'react';
import { DgraphQueryExecutor, Serialization } from 'dgraph-query-manager';

/**
 * Custom React hook that performs the heavy lifting of data retrieval from Dgraph.
 * Accepts a Serialization instance with an associated DgraphQueryExecutor.  Execution is either performed directly
 * or passed along to the backend REST_API via generated URL.
 *
 * @param request
 * @param dependencies
 */
export const useDgraphLocal = (
  request: DgraphQueryExecutor,
  dependencies: any
): [boolean, Serialization] => {
  const [isLoading, setIsLoading]: [boolean, Function] = useState(true);
  const [response, setResponse]: [Serialization | any, Function] = useState(
    request
  );

  // Call useEffect unconditionally.
  useEffect(() => {
    setIsLoading(true);
    request
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
