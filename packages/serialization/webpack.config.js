const path = require('path');

module.exports = {
  mode: "development", // "production" | "development" | "none"
  // Chosen mode tells webpack to use its built-in optimizations accordingly.
  entry: {
    a: "./src/index.ts",
  }, // string | object | array
  // defaults to ./src
  // Here the application starts executing
  // and webpack starts bundling
  devtool: 'inline-source-map',
  output: {
    // options related to how webpack emits results
    path: path.resolve(__dirname, "dist"), // string
    // the target directory for all output files
    // must be an absolute path (use the Node.js path module)
    filename: "serialization.js", // string
    // the filename template for entry chunks
    // publicPath: "/assets/", // string
    // // the url to the output directory resolved relative to the HTML page
    // library: "MyLibrary", // string,
    // // the name of the exported library
    // libraryTarget: "umd", // universal module definition
    // the type of the exported library
    sourceMapFilename: "sourcemaps/serialization.map",
    /* Advanced output configuration (click to show) */
    /* Expert output configuration (on own risk) */
  },
  resolve: {
      alias: {
        'dgraph-adapter': path.resolve(__dirname, '../dgraph-adapter'),
        'dgraph-adapter-http': path.resolve(__dirname, '../dgraph-adapter-http'),
        'dgraph-query-executor': path.resolve(__dirname, '../dgraph-query-executor'),
        'serialization': path.resolve(__dirname, '../serialization'),
      },
  },
  module: {
    // configuration regarding modules
    rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        },
      // rules for modules (configure loaders, parser options, etc.)
    ],
    /* Advanced module configuration (click to show) */
  },
}