'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlPlugin = require('webpack-html-plugin');
var HasteResolverPlugin = require('haste-resolver-webpack-plugin');
var emptyObjPath = path.join(__dirname, './empty.js')

var IP = '0.0.0.0';
var PORT = 3000;
var NODE_ENV = process.env.NODE_ENV;
// var ROOT_PATH = path.resolve(__dirname, '../');
var PROD = 'production';
var DEV = 'development';
let isProd = NODE_ENV === 'production';

// var paths = {
//   src: path.join(ROOT_PATH, '.'),
//   index: path.join(ROOT_PATH, 'index.web'),
// };

var config = module.exports = {
  ip: IP,
  port: PORT,
  debug: true,
  // devtool: 'cheap-module-eval-source-map',
  devtool: 'source-map',
  entry: [
    'webpack-hot-middleware/client',
    'babel-polyfill',
    path.join(__dirname, '../../index.web.js')
  ],
  output: {
    path: path.join(__dirname, '../public'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    // alias: {
    //   'react-native': 'react-web/lib/react-web.js',
    // },
    alias: {
      // 'react-native': 'react-web',
      'react-native': 'react-web/lib/react-web.js',
      // 'react-native': 'react-web/Libraries/react-web.js',
      'RCTNativeAppEventEmitter': emptyObjPath,
      'Keyboard': emptyObjPath
    },
    extensions: ['', '.js', '.jsx'],
  },
  // entry: isProd? [
  //   paths.index
  // ]: [
  //   'webpack-dev-server/client?http://' + IP + ':' + PORT,
  //   // 'webpack/hot/only-dev-server',
  //   paths.index,
  // ],
  // output: {
  //   path: path.join(__dirname, 'output'),
  //   filename: 'bundle.js'
  // },
  plugins: [
    new HasteResolverPlugin({
      platform: 'web',
      nodeModules: ['react-web']
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(isProd? PROD: DEV),
      __DEV__: isProd ? false : true
    }),
    // isProd? new webpack.ProvidePlugin({
    //   React: "react"
    // }): new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      React: "react"
    }),
    new webpack.NoErrorsPlugin(),
    new HtmlPlugin(),
  ],
  // module: {
  //   loaders: [{
  //     test: /\.json$/,
  //     loader: 'json',
  //   },
  //   {
  //     test: /\.(png|gif|jpe?g|svg)$/,
  //     loader: 'url'
  //   },
  //   // {
  //   //   test: /\.jsx?$/,
  //   //   loader: 'react-hot',
  //   //   include: [paths.src],
  //   //   // exclude: [/node_modules\/.*node_modules/]
  //   //   // exclude: [/node_modules/]
  //   // },
  //   {
  //     test: /\.jsx?$/,
  //     loader: 'babel',
  //     query: {
  //       presets: ['es2015', 'react', 'stage-1']
  //     },
  //     include: [paths.src],
  //     // exclude: [/node_modules\/.*node_modules/]
  //     // exclude: [/node_modules/]
  //   }]
  // },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        // exclude node_modules below second level
        // exclude: /node_modules\/[^\/]+\/node_modules\/[^\/]+\/node_modules/,
        // exclude: /node_modules\/[^\/]+\/node_modules\/[^\/]+\/node_modules/,
        exclude: [
          /node_modules\/(?!react)/,
          // /node_modules\/(^react-)/,
          // /node_modules\/[^\/]+\/node_modules\//,
          /errno/,
          // /error/,
          /xtend/
        ],
        query: {
          cacheDirectory: true,
          presets: ['es2015', 'react', 'stage-1'],
          plugins: [
            'transform-object-rest-spread',
            'transform-class-properties',
            'transform-async-functions',
            'transform-flow-strip-types',
            [
              'react-transform',
              {
                transforms: [
                  {
                    transform: 'react-transform-hmr',
                    imports: ['react'],
                    // this is important for Webpack HMR:
                    locals: ['module']
                  },
                  {
                    // you can have many transforms, not just one
                    "transform": "react-transform-catch-errors",
                    "imports": ["react", "redbox-react"]
                  }
                ]
              }
            ]
          ]
        },
      },
      {
        test: /\.(gif|jpe?g|png|svg)$/,
        loader: 'url-loader',
        query: { name: '[name].[ext]' }
      },
      {test: /\.json$/, loaders: ['json']}
    ]
  },
  node: {
    // console: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    // global: true,
    // Buffer: true,
    // process: true
  }
};

if (isProd) {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    },
    mangle: false
  }))
} else {
  config.plugins.push(new webpack.HotModuleReplacementPlugin())
}
