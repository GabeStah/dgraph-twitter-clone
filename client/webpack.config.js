const path = require('path');

module.exports = {
  devtool: 'source-map',
  externals: {},
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, '../api/packages')
        ],
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  }
};
