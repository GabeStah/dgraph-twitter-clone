import { DgraphConnectionType } from './development';
declare const production: {
  connectionType: DgraphConnectionType;
  dgraph: {
    adapter: {
      address: string;
    };
    api: {
      protocol: string;
      host: string;
      port: number;
    };
  };
  faker: {
    seed: number;
  };
};
export default production;
