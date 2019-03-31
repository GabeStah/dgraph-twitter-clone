import { DgraphConnectionType } from 'dgraph-query-manager';

const production = {
  connectionType: DgraphConnectionType.DIRECT,
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

export default production;
