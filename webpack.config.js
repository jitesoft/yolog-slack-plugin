const Path = require('path');

module.exports = {
  mode: process.env.NODE_ENV,
  entry: [
    Path.join(__dirname, 'src', 'index.js')
  ],
  externals: {
    '@jitesoft/yolog': {
      root: '@jitesoft/yolog',
      commonjs2: '@jitesoft/yolog',
      commonjs: '@jitesoft/yolog'
    },
    'node-fetch': {
      root: 'node-fetch',
      commonjs2: 'node-fetch',
      commonjs: 'node-fetch'
    }
  },
  target: 'node',
  output: {
    filename: 'index.js',
    globalObject: 'this',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        include: Path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        test: /\.js$/,
        loader: 'babel-loader'
      }
    ]
  }
};
