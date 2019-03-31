import { DgraphConnectionType } from 'dgraph-query-manager';

const development = {
  connectionType: DgraphConnectionType.DIRECT,
  debug: false,
  dgraph: {
    api: {
      protocol: 'http',
      host: 'localhost',
      port: 5000
    }
  },
  faker: {
    seed: 1234567890
  },
  user: {
    defaultAuthScreenName: 'GabeStah',
    defaultAuthEmail: 'gabe@gabewyatt.com'
  }
};

export default development;
