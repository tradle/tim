'use strict';

// https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95#.5hgptdzc0

var path = require('path');
var fs = require('fs')
var webpack = require('webpack');
// var HtmlPlugin = require('webpack-html-plugin');
var HtmlPlugin = require('html-webpack-plugin');
var HasteResolverPlugin = require('haste-resolver-webpack-plugin');
// var Visualizer = require('webpack-visualizer-plugin');
// var OptimizeJsPlugin = require('optimize-js-plugin')
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
var screwIE = !process.env.IE
const { PROVIDERS } = process.env
const envFile = PROVIDERS
  ? path.join(__dirname, '../env', process.env.PROVIDERS + '.json')
  : path.join(__dirname, '../environment.json')

let templateFile = (function () {
  let special = path.join(__dirname, `index-template-${PROVIDERS}.html`)
  if (fs.existsSync(special)) {
    return special
  }

  return path.join(__dirname, 'index-template.html')
}())

// var paths = {
//   src: path.join(ROOT_PATH, '.'),
//   index: path.join(ROOT_PATH, 'index.web'),
// };

var common = {
  resolve: {
    alias: {
      'q': 'bluebird-q',
      'react-native': 'react-web',
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
        loader : 'file'
      },
      // react-infinite-calendar@1 depends on moment + moment-range
      // whose AMD build is broken
      {
        test: /node_modules\/moment-range\/(dist|lib)\/moment-range(\.min)?\.js$/,
        loader: 'imports?define=>false'
      },
      {
        test: /postMock.html$/,
        loader: 'file-loader',
        // options: {
        //   name: '[name].[ext]',
        // }
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
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
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      __DEV__: isProd ? false : true
    }),
    new webpack.ProvidePlugin({
      React: 'react',
      ReactDOM: 'react-dom'
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.NormalModuleReplacementPlugin(
      /environment.json$/,
      require.resolve(envFile)
    ),
    // new Visualizer({
    //   filename: path.join('stats.html')
    // })
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
    // function() {
    //   this.plugin('done', function(stats) {
    //     fs.writeFileSync(path.join(__dirname, `webpack-stats-${NODE_ENV}.json`), JSON.stringify(stats.toJson()))
    //   })
    // }
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
        name: 'tradle',
        path: /node_modules\/\@tradle/
      },
      {
        name: 'react',
        path: /node_modules\/(react|react-dom)\// //|react-native-[a-zA-Z-_]+)\//
      },
      {
        name: 'react-web',
        path: /node_modules\/(react-web|immutable|animated)\//,
      },
      {
        name: 'crypto',
        path: /node_modules\/.*?(bitcoin|crypto|bn\.js|elliptic|nkey[-a-zA-Z0-9]*|secp256k1|forward-secrecy)\//
      },
      {
        name: 'utils',
        path: /node_modules\/(async|levelup|localstorage-down|level-js|bluebird|q|readable-stream|moment|babel-polyfill|lodash)\//
      },
      // the rest
      {
        name: 'vendor',
        path: /node_modules/ //\/(?!react|react-dom|react-web|react\-native|\@tradle)\//
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
      path: path.join(__dirname, 'dist'),
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
        template: templateFile
      })
      // new HtmlPlugin()
    ],
    module: {
      preLoaders: [
        {
          test: /\.js$/,
          loader: 'source-map-loader'
        }
      ],
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
  const genSourceMap = true
  config = merge(common, {
    devtool: genSourceMap && 'source-map',
    entry: getEntry(),
    output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].[chunkhash].js',
      chunkFilename: '[name].[chunkhash].js',
      // publicPath: '/',
    },
    module: {
      preLoaders: [
        {
          test: /\.js$/,
          loader: 'source-map-loader'
        }
      ],
      loaders: [
        getBabelLoader()
      ].concat(getMaybeLoaders())
    },
    plugins: [
      // new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        sourceMap: genSourceMap,
        mangle: {
          keep_fnames: false,
          screw_ie8: true
        },
        beautify: false,
        // comments: false
      }),
      // new OptimizeJsPlugin({
      //   sourceMap: true
      // }),
      // new webpack.optimize.AggressiveMergingPlugin(),
      new HtmlPlugin({
        template: templateFile,
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
      /errno/,
      /xtend/,
      /react-dropzone/,
    ],
    query: {
      compact: false,
      cacheDirectory: true,
      // presets: ['es2015', 'react', 'stage-1'],
      plugins: [
        // 'transform-object-rest-spread',
        // 'transform-class-properties',
        // 'transform-async-functions',
        // 'transform-flow-strip-types'
      ]
    }
  }

  if (!isProd && screwIE) {
    // when uglifying (production), or for IE compat, we need to compile all es6 to es5
    //
    // exclude node_modules, include react & tcomb
    // /node_modules\/(?!(.*)?(react|tcomb))/,
    loader.exclude.push(
      /node_modules\/(?!react|tcomb|rn-markdown|\@tradle\/aws-client|\@tradle\/ethereum-adapter-etherscan|\@tradle\/promise-utils|\@tradle\/embed)/
    )
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

function getMaybeLoaders () {
  const loaders = [{
    test: /data\/formDefaults\.json$/,
    loader: 'null-loader'
  }]

  if (['a2', 'a2-local', 'ae', 'ae2'].indexOf(PROVIDERS) === -1) {
    loaders.push({
      test: /aviva.*\.(html|jpe?g|png)$/i,
      loader: 'null-loader'
    })
  }

  return loaders
}
