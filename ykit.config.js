var path = require('path');
var AssetsPlugin = require('assets-webpack-plugin');
var CompressionPlugin = require('compression-webpack-plugin');
var commonLib = require('./common/plugin.js');
var assetsPluginInstance = new AssetsPlugin({
  filename: 'static/prd/assets.js',
  processOutput: function(assets) {
    return 'window.WEBPACK_ASSETS = ' + JSON.stringify(assets);
  }
});
var fs = require('fs');
var package = require('./package.json');
var yapi = require('./server/yapi');
const serve = require('koa-static');
var isWin = require('os').platform() === 'win32'

var compressPlugin = new CompressionPlugin({
  asset: '[path].gz[query]',
  algorithm: 'gzip',
  test: /\.(js|css)$/,
  threshold: 10240,
  minRatio: 0.8
});

function createScript(plugin, pathAlias) {
  let options = plugin.options ? JSON.stringify(plugin.options) : null;
  if (pathAlias === 'node_modules') {
    return `"${plugin.name}" : {module: require('yapi-plugin-${
      plugin.name
    }/client.js'),options: ${options}}`;
  }
  return `"${plugin.name}" : {module: require('${pathAlias}/yapi-plugin-${
    plugin.name
  }/client.js'),options: ${options}}`;
}

function initPlugins(configPlugin) {
  configPlugin = require('./config.json').plugins;
  var systemConfigPlugin = require('./common/config.js').exts;

  var scripts = [];
  if (configPlugin && Array.isArray(configPlugin) && configPlugin.length) {
    configPlugin = commonLib.initPlugins(configPlugin, 'plugin');
    configPlugin.forEach(plugin => {
      if (plugin.client && plugin.enable) {
        scripts.push(createScript(plugin, 'node_modules'));
      }
    });
  }

  systemConfigPlugin = commonLib.initPlugins(systemConfigPlugin, 'ext');
  systemConfigPlugin.forEach(plugin => {
    if (plugin.client && plugin.enable) {
      scripts.push(createScript(plugin, 'exts'));
    }
  });

  scripts = 'module.exports = {' + scripts.join(',') + '}';
  fs.writeFileSync('client/plugin-module.js', scripts);
}

initPlugins();

module.exports = {
  plugins: [
    {
      name: 'antd',
      options: {
        modifyQuery: function(defaultQuery) {
          // 可查看和编辑 defaultQuery
          defaultQuery.plugins = [];
          defaultQuery.plugins.push([
            'transform-runtime',
            {
              polyfill: false,
              regenerator: true
            }
          ]);
          defaultQuery.plugins.push('transform-decorators-legacy');
          defaultQuery.plugins.push(['import', { libraryName: 'antd' }]);
          return defaultQuery;
        },
        exclude: isWin ? /(tui-editor|node_modules\\(?!_?(yapi-plugin|json-schema-editor-visual)))/ : /(tui-editor|node_modules\/(?!_?(yapi-plugin|json-schema-editor-visual)))/
      }
    }
  ],
  type: 'web', // 必须指定项目类型
  devtool: 'cheap-source-map',
  config: function(ykit) {
    return {
      exports: ['./index.js'],
      commonsChunk: {
        vendors: {
          lib: [
            // 'anujs',
            'react',
            'react-dom',
            'redux',
            'redux-promise',
            'react-router',
            'react-router-dom',
            'prop-types',
            'react-dnd-html5-backend',
            'react-dnd',
            'reactabular-table',
            'reactabular-dnd',
            'table-resolver'
          ],
          lib2: ['brace', 'json5', 'url', 'axios'],
          lib3: ['mockjs', 'moment', 'recharts']
        }
      },
      modifyWebpackConfig: function(baseConfig) {
        var ENV_PARAMS = {};
        switch (this.env) {
          case 'local':
            ENV_PARAMS = 'dev';
            break;
          case 'dev':
            ENV_PARAMS = 'dev';
            break;
          case 'prd':
            ENV_PARAMS = 'production';
            break;
          default:
        }

        baseConfig.plugins.push(
          new this.webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(ENV_PARAMS),
            'process.env.version': JSON.stringify(package.version),
            'process.env.versionNotify': yapi.WEBCONFIG.versionNotify
          })
        );

        //初始化配置
        baseConfig.devtool = 'cheap-module-eval-source-map';
        baseConfig.context = path.resolve(__dirname, './client');
        baseConfig.resolve.alias.client = '/client';
        baseConfig.resolve.alias.common = '/common';

        baseConfig.resolve.alias.exts = '/exts';

        // baseConfig.resolve.alias.react = 'anujs';
        // baseConfig.resolve.alias['react-dom'] = 'anujs';

        baseConfig.output.prd.path = 'static/prd';
        baseConfig.output.prd.publicPath = '';
        baseConfig.output.prd.filename = '[name]@[chunkhash][ext]';

        baseConfig.module.noParse = /node_modules\/jsondiffpatch\/public\/build\/.*js/;
        baseConfig.module.loaders.push({
          test: /\.less$/,
          loader: ykit.ExtractTextPlugin.extract(
            require.resolve('style-loader'),
            require.resolve('css-loader') +
              '?sourceMap!' +
              require.resolve('less-loader') +
              '?sourceMap'
          )
        });

        baseConfig.module.loaders.push({
          test: /.(gif|jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: ['[path][name].[ext]?[sha256#base64:8]']
          }
        });

        baseConfig.module.loaders.push({
          test: /\.(sass|scss)$/,
          loader: ykit.ExtractTextPlugin.extract(
            require.resolve('css-loader') +
              '?sourceMap!' +
              require.resolve('sass-loader') +
              '?sourceMap'
          )
        });
        baseConfig.module.preLoaders.push({
          test: /\.json$/,
          loader: 'json-loader',
          exclude: /config.json/,  //去除对config.json的重复编译
        });
        baseConfig.module.loaders.push({
          test: /\.(js|jsx)$/,
          loader:'babel-loader',
          
          //以下，babel的解析把node_modules文件下的依赖包都排除了
          // exclude: path.resolve(__dirname, 'node_modules'),
          // exclude: /node_modules/,
          
          //为了使某些模块能被正常使用,要把相应模块的文件的解析加进去，所以补充如下：
          include: [
            path.resolve(__dirname, 'node_modules/fs-extra'),
            path.resolve(__dirname, 'node_modules/universalify'),
            path.resolve(__dirname, 'node_modules/nodemailer'),
          ],
        });
        if (this.env == 'prd') {
          baseConfig.plugins.push(
            new this.webpack.optimize.UglifyJsPlugin({
              compress: {
                warnings: false
              }
            })
          );
          baseConfig.plugins.push(assetsPluginInstance);
          baseConfig.plugins.push(compressPlugin);
          baseConfig.plugins.push(
            new this.webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(zh-cn|en-gb)$/)
          );
        }
        // 添加以下配置
        baseConfig.node = {
          fs: 'empty',
          child_process: 'empty',
          net: 'empty',
          tls: 'empty',
          net: 'empty',
          dns: 'empty',
        };
        return baseConfig;
      }
    };
  },
  serve: {
    // true/false，默认 false，效果相当于 ykit server --hot
    hot: true,
    // true/false，默认 false，开启后可在当前打开的页面提示打包错误
    overlay: false,
    proxy: {
      // 配置API代理
      '/api': {
        target: 'http://localhost:3000/api',
        changeOrigin: true
      }
    }
  },
  hooks: {},
  commands: []
};
