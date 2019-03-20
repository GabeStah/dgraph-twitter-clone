import { DgraphQueryExecutor } from 'dgraph-query-executor';

export interface SerializationInterface {
  command?: string;
  data?: any;
  error?: Error;
  executor?: DgraphQueryExecutor;
  message?: string;
  request?: any;
  response?: any;
  statusCode?: number;
  success?: boolean;
  uid?: string | string[];
  uri: string;
}

export class Serialization implements SerializationInterface {
  command?: string;
  data?: any;
  error?: Error;
  executor?: DgraphQueryExecutor;
  message?: string;
  request?: any;
  response?: any;
  statusCode = 200;
  success = false;
  uid?: string | string[];
  uri = '';

  constructor(params: Partial<Serialization> = {}) {
    Object.assign(this, params);
  }
}
