export declare enum DgraphConnectionType {
  API = 0,
  DIRECT = 1
}
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
