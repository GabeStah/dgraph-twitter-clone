import { DgraphConnectionType } from '../classes';
declare const development: {
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
export default development;
