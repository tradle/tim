'use strict';

// https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95#.5hgptdzc0

var path = require('path');
var fs = require('fs')
var webpack = require('webpack');
// var HtmlPlugin = require('webpack-html-plugin');
var HtmlPlugin = require('html-webpack-plugin');
var HasteResolverPlugin = require('haste-resolver-webpack-plugin');
// var ManifestPlugin = require('webpack-manifest-plugin');
// var ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');
// var InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')
// var WebpackMd5Hash = require('webpack-md5-hash')
var validate = require('webpack-validator');
var merge = require('webpack-merge');
var SplitByPathPlugin = require('webpack-split-by-path')
var emptyObjPath = path.join(__dirname, './empty.js')

var NODE_ENV = process.env.NODE_ENV || 'development';
// var ROOT_PATH = path.resolve(__dirname, '');
var PROD = 'production';
var DEV = 'development';
var isProd = NODE_ENV === 'production';
var isHot = !isProd && process.env.HOT === '1'
var projectRoot = path.join(__dirname, '../')

// var paths = {
//   src: path.join(ROOT_PATH, '.'),
//   index: path.join(ROOT_PATH, 'index.web'),
// };

var common = {
  resolve: {
    alias: {
      'q': 'bluebird-q',
      'react-native': 'react-web/lib/index.js',
      // 'react-native': 'react-web/lib/react-web.js',
      'ReactART': 'react-art',
      'RCTNativeAppEventEmitter': emptyObjPath,
      'Keyboard': emptyObjPath
    },
    extensions: ['', '.js', '.jsx', '.web.js'],
  },
  module: {
    loaders: [
      {
        test: /\.(gif|jpe?g|png|svg)$/,
        loader: 'url-loader',
        query: { name: '[name].[ext]' }
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      {
        test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9-=&.]+)?$/,
        loader : 'file-loader'
      }
    ]
  },
  // externals: {
  //   // Use external version of React
  //   "react": "React",
  //   "react-dom": "ReactDOM"
  // },
  plugins: [
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor',
    //   minChunks: function(module) {
    //     return isExternal(module)
    //   }
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: "manifest"
    // }),
    new HasteResolverPlugin({
      platform: 'web',
      // blacklist: ['Libraries']
      // blacklist: ['Libraries']
      // nodeModules: ['react-web']
    }),
    // new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      __DEV__: isProd ? false : true
    }),
    new webpack.ProvidePlugin({
      React: 'react',
      ReactDOM: 'react-dom'
    }),
    new webpack.NoErrorsPlugin(),
    // new WebpackMd5Hash(),
    // new ManifestPlugin({
    //   fileName: 'build-manifest.json'
    // }),
    // new ChunkManifestPlugin({
    //   filename: 'chunk-manifest.json',
    //   manifestVariable: 'webpackManifest'
    // }),
    // new InlineManifestWebpackPlugin({
    //   name: 'webpackManifest'
    // }),
    // new webpack.optimize.OccurrenceOrderPlugin(true),
    function() {
      this.plugin('done', function(stats) {
        fs.writeFileSync(path.join(__dirname, `webpack-stats-${NODE_ENV}.json`), JSON.stringify(stats.toJson()))
      })
    }
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
}

if (!isHot) {
  common.plugins.push(
    new SplitByPathPlugin([
      {
        name: 'vendor',
        path: path.join(projectRoot, 'node_modules'),
        // ignore: [
        //   path.join(projectRoot, 'node_modules/react'),
        //   path.join(projectRoot, 'node_modules/react-dom')
        // ]
      }
    ])
  )
}

var config
if (NODE_ENV === 'development') {
  config = merge(common, {
    // debug: true,
    // devtool: 'cheap-module-eval-source-map',
    devtool: 'source-map',
    entry: getEntry(),
    output: {
      path: path.join(__dirname, 'build'),
      filename: '[name].[chunkhash].js',
      chunkFilename: '[chunkhash].js',
      publicPath: '/',
    },
    plugins: [
      // new webpack.optimize.DedupePlugin(),
      // new webpack.ProvidePlugin({
      //   React: "react"
      // }),
      new HtmlPlugin({
        title: 'Tradle',
        template: path.join(__dirname, 'index-template.html')
      })
      // new HtmlPlugin()
    ],
    module: {
      loaders: [
        getBabelLoader()
      ]
    }
  });

  if (isHot) {
    config.plugins.push(
      new webpack.HotModuleReplacementPlugin()
    )
  }
} else {
  config = merge(common, {
    // devtool: 'source-map',
    entry: getEntry(),
    output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].[chunkhash].js',
      chunkFilename: '[name].[chunkhash].js',
      publicPath: '/',
    },
    module: {
      loaders: [
        getBabelLoader()
      ]
    },
    plugins: [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        sourceMap: false,
        mangle: {
          keep_fnames: true
        },
        beautify: false,
        // comments: false
      }),
      // new webpack.optimize.AggressiveMergingPlugin(),
      new HtmlPlugin({
        template: path.join(__dirname, 'index-template.html'),
        filename: 'index.html',
        // hash: true,
        title: 'Tradle'
      })
    ]
  })
}

module.exports = validate(config)

function getEntry () {
  var entry = [
    'babel-polyfill',
    isHot && 'webpack/hot/dev-server',
    isHot && 'webpack-hot-middleware/client',
    path.join(projectRoot, 'index.web.js')
  ].filter(notNull)

  return entry
}

function getBabelLoader () {
  const loader = {
    test: /\.jsx?$/,
    loader: 'babel-loader',
    // test: function (modulePath) {
    //   if (!/\.jsx?$/.test(modulePath)) return false
    //   if (modulePath.indexOf('node_modules') === -1) return true
    //   if (modulePath.indexOf('react') === -1 && modulePath.indexOf('tcomb') === -1) return true

    //   return false
    // },
    exclude: [
      // exclude node_modules except tcomb and react ones
      // /node_modules\/(?!(.*)?(react|tcomb))/,
      /node_modules\/(?!react|tcomb)/,
      /errno/,
      /xtend/
    ],
    query: {
      cacheDirectory: true,
      presets: ['es2015', 'react', 'stage-1'],
      plugins: [
        'transform-object-rest-spread',
        'transform-class-properties',
        'transform-async-functions',
        'transform-flow-strip-types'
      ]
    }
  }

  if (!isProd) {
    var plugins = loader.query.plugins
    plugins.push([
      'react-transform',
      {
        transforms: [
          {
            // you can have many transforms, not just one
            "transform": "react-transform-catch-errors",
            "imports": ["react", "redbox-react"]
          }
        ]
      }
    ])

    if (isHot) {
      plugins[1].unshift({
        transform: 'react-transform-hmr',
        imports: ['react'],
        // this is important for Webpack HMR:
        locals: ['module']
      })
    }
  }

  return loader
}

function isExternal (module) {
  var userRequest = module.userRequest
  if (typeof userRequest !== 'string') {
    return false
  }

  return userRequest.indexOf('/node_modules/') !== -1
}

function notNull (a) {
  return !!a
}
