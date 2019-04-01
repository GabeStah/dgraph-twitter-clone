import * as express from 'express';
import {
  DgraphConnectionType,
  DgraphQueryExecutor,
  HttpMethods,
  Queries,
  Query
} from 'dgraph-query-manager';
import { asyncWrapper } from '../middlewares/async-wrapper';

export const Routes = express.Router();

/**
 * Api routes for JSON body requests.
 * Creates a new Query and DgraphQueryExecutor instance from passed body data, then executes a direct request
 * and returns the resulting Serialization.
 */
Routes.post(
  '/json',
  asyncWrapper(async (req, res) => {
    const query = Query.factory(req.body.query);
    if (req.body.query.tree) {
      query.tree = req.body.query.tree;
    }
    req.body.query = query;
    const executor = DgraphQueryExecutor.factory(req.body);
    const serialization = await executor.execute(DgraphConnectionType.DIRECT);
    res.status(serialization.statusCode).send(serialization);
  })
);

/**
 * Dynamically generates routes from Queries object and maps them to appropriate
 * Express HTTP methods and DgraphQueryExecutors.
 */
const createQueryRoutes = () => {
  for (const category in Queries) {
    if (Queries.hasOwnProperty(category)) {
      for (const key in Queries[category]) {
        if (Queries[category].hasOwnProperty(key)) {
          const query = Queries[category][key];
          const route = query.route;
          const wrapper = asyncWrapper(async (req, res) => {
            let params;
            if (query.paramTypes) {
              // Map passed req.params to new params object using paramTypes array.
              params = Object.assign(
                {},
                ...query.paramTypes.map(paramType => ({
                  [paramType.key]: req.params[paramType.key.replace('$', '')]
                }))
              );
            }
            const executor = new DgraphQueryExecutor(query, params);
            // Use direct connection type to avoid loop.
            const serialization = await executor.execute(
              DgraphConnectionType.DIRECT
            );
            res.status(serialization.statusCode).send(serialization);
          });

          switch (query.httpMethod) {
            case HttpMethods.DELETE: {
              Routes.delete(route, wrapper);
              break;
            }
            case HttpMethods.GET: {
              Routes.get(route, wrapper);
              break;
            }
            case HttpMethods.POST: {
              Routes.post(route, wrapper);
              break;
            }
            case HttpMethods.PUT: {
              Routes.put(route, wrapper);
              break;
            }
            default: {
              Routes.get(route, wrapper);
            }
          }
        }
      }
    }
  }
};

createQueryRoutes();
