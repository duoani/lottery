'use strict'
// Template version: 1.2.6

const path = require('path')
const getApiServer = require('./getApiServer')
const MOCK_SERVER_PORT = 9500
const apiServer = getApiServer()

const entries = [
  {
    key: 'app',
    template: path.resolve(__dirname, '../src/index.html'),
    devFilename: 'index.html',
    prodFilename: path.resolve(__dirname, '../docs/index.html'),
    main: path.resolve(__dirname, '../src/app.js')
  }
]

module.exports = {
  entries,
  dev: {
    // Entries
    entries: entries.reduce((config, entry) => {
      config[entry.key] = {
        template: entry.template,
        filename: entry.devFilename
      }
      return config
    }, {}),
    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      '/api': {
        target: apiServer || `http://localhost:${MOCK_SERVER_PORT}`,
        changeOrigin: true,
        pathRewrite: {
          // Overwrite URL: from [Dev Server]/api/xxx to [Mock Server]/xxx
          '^/api': ''
        }
      }
    },

    // Various Dev Server settings

    // can be overwritten by process.env.HOST
    // if you want dev by ip, please set host: '0.0.0.0'
    host: 'localhost',
    port: 9527, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: true, // https://webpack.js.org/configuration/dev-server/#devserveropen
    errorOverlay: true,
    notifyOnErrors: false,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

    // Mock Server settings
    enableMock: !apiServer, // 如果使用 API 服务器，则无需启动 Mock
    mockPort: MOCK_SERVER_PORT, // Mock Server Port

    // Use Eslint Loader?
    // If true, your code will be linted during bundling and
    // linting errors and warnings will be shown in the console.
    useEslint: true,
    // If true, eslint errors and warnings will also be shown in the error overlay
    // in the browser.
    showEslintErrorsInOverlay: true,

    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-source-map',

    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  },

  build: {
    entries: entries.reduce((config, entry) => {
      config[entry.key] = {
        template: entry.template,
        filename: entry.prodFilename
      }
      return config
    }, {}),

    // Paths
    assetsRoot: path.resolve(__dirname, '../docs'),
    assetsSubDirectory: 'static',
    staticAssetsDirectory: path.resolve(__dirname, '../docs/static'),
    /**
     * You can set by youself according to actual condition
     * You will need to set this if you plan to deploy your site under a sub path,
     * for example GitHub pages. If you plan to deploy your site to https://foo.github.io/bar/,
     * then assetsPublicPath should be set to "/bar/".
     * In most cases please use '/' !!!
     */
    assetsPublicPath: '',

    /**
     * Source Maps
     */
    productionSourceMap: false,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: 'source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build:prod --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report || false,

    // `npm run build:prod --generate_report`
    generateAnalyzerReport: process.env.npm_config_generate_report || false
  }
}
