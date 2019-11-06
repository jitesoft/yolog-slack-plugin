const Path = require('path');

module.exports = {
  mode: process.env.NODE_ENV,
  entry: [
    Path.join(__dirname, 'src', 'index.js')
  ],
  externals: {
    '@jitesoft/yolog': '@jitesoft/yolog',
    'node-fetch': 'node-fetch',
    '@jitesoft/sprintf': '@jitesoft/sprintf'
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
