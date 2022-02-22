const webpack = require('webpack')
const path = require('path')
/** @type {import('webpack').Configuration} */
module.exports = {
    entry: './src/switch.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'webpack.bundle.js',
    },
    mode: 'development',
    plugins:[
        new webpack.DefinePlugin({
            __FEATURE_OPTIONS_API__: JSON.stringify(false)
        })
    ]
  };