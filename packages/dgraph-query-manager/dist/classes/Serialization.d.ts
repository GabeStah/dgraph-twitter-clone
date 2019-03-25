export interface SerializationInterface {
  command?: string;
  data?: any;
  error?: Error;
  message?: string;
  request?: any;
  response?: any;
  statusCode?: number;
  success?: boolean;
  uid?: string | string[];
  uri: string;
}
export declare class Serialization implements SerializationInterface {
  command?: string;
  data?: any;
  error?: Error;
  message?: string;
  request?: any;
  response?: any;
  statusCode: number;
  success: boolean;
  uid?: string | string[];
  uri: string;
  constructor(params?: Partial<Serialization>);
}
