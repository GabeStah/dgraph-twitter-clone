import { DgraphConnectionType } from '../classes';

const development = {
  connectionType: DgraphConnectionType.DIRECT,
  dgraph: {
    adapter: {
      address: 'http://192.168.99.100:8080'
    },
    api: {
      protocol: 'http',
      host: 'localhost',
      port: 5000
    }
  },
  faker: {
    seed: 1234567890
  }
};

export default development;
