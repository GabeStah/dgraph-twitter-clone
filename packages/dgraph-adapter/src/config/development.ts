const development = {
  dgraph: {
    adapter: {
      address: '192.168.99.100:9080'
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
