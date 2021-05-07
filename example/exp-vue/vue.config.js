const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');

// const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  configureWebpack: {
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, '../../dist/index.es.js'),
            to: path.resolve(__dirname, 'src/bp.es.js'),
          },
        ],
      }),
    ],
  },
};
