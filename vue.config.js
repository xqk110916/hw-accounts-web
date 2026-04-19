'use strict';
const path = require('path');
const setupModule = require('./setupModule.js');
const CompressionWebpackPlugin = require('compression-webpack-plugin'); //引入打包压缩插件

function resolve(dir) {
  return path.join(__dirname, dir);
}

const name = process.env.VUE_APP_TITLE || ''; // 网页标题
const port = process.env.VUE_WEBPACK_PORT || process.env.npm_config_port || 8080; // 开发环境本地访问端口

// 官方vue.config.js 具体配置参考文档 https://cli.vuejs.org/zh/config/#css-loaderoptions
module.exports = {
  // 部署生产环境和开发环境下的URL。
  // 默认情况下，Vue CLI 会假设你的应用是被部署在一个域名的根路径上
  // 例如 https://www.Theseus-Web.vip/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.Theseus-Web.vip/admin/，则设置 baseUrl 为 /admin/，一般nginx会转发至只指定目录，为 '/' 。
  publicPath: process.env.NODE_ENV === 'production' ? '/admin/' : '/',

  // 在npm run build 或 yarn build 时 ，生成文件的目录名称（要和baseUrl的生产环境路径一致）（默认dist）
  outputDir: 'dist',

  // 用于放置生成的静态资源 (js、css、img、fonts) 的；（项目打包之后，静态资源会放在这个文件夹下）
  assetsDir: 'static',

  // 是否开启eslint保存检测，有效值：ture | false | 'error'
  lintOnSave: false,

  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,

  // webpack-dev-server 相关配置
  devServer: {
    // host: 'localhost',
    port: port,
    hot: true,
    compress: true,
    client: {
      overlay: false,
    },
    host: '0.0.0.0',
    open: true,
    proxy: {
      '/lowcodeui': {
        changeOrigin: true,
        target: process.env.VUE_APP_lowcodeUI,
        pathRewrite: {
          ['^' + '/lowcodeui']: '',
        },
      },
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      // [process.env.VUE_APP_BASE_API]: {
      //   target: `http://localhost:8080`,
      //   changeOrigin: true,
      //   pathRewrite: {
      //     ['^' + process.env.VUE_APP_BASE_API]: '',
      //   },
      // },
      '/api': {
        target: process.env.VUE_APP_BASE_API,
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          ['^/api']: '',
        },
      },
    },
  },
  configureWebpack: {
    name: name,
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.common.js',
        '@': resolve('src'),
        static: resolve('static'),
      },
    },
    module: {
      rules: [
        {
          test: /bootstrap\.js$/,
          loader: 'bundle-loader',
          options: {
            lazy: true,
          },
        },
      ],
    },
  },
  chainWebpack(config) {
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
    config.optimization.delete('splitChunks');
    config.module.rule('svg').exclude.add(resolve('src/assets/icons')).end();
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/assets/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })
      .end();
    config.plugin('node-polyfill-webpack-plugin').use('node-polyfill-webpack-plugin');
    config.plugin('module-federation-plugin').use(require('webpack').container.ModuleFederationPlugin, [{ ...setupModule }]);
    // 开发环境产生runtimeChunk
    if (process.env.ENV !== 'development') {
      config.optimization.minimizer('terser').tap(args => {
        args[0].terserOptions.compress.drop_console = true;
        return args;
      });
      config
        .plugin('ScriptExtHtmlWebpackPlugin')
        .after('html')
        .use('script-ext-html-webpack-plugin', [
          {
            inline: /runtime\..*\.js$/,
          },
        ])
        .end();
      config.optimization.splitChunks({
        chunks: 'all',
        minSize: 30000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 5,
        cacheGroups: {
          commons: {
            name: 'chunk-ops-commons',
            test: resolve('src/components'), // can customize your rules
            minChunks: 3, //  minimum common number
            priority: 5,
            reuseExistingChunk: true,
          },
          // zcui: {
          //   name: 'chunk-ops-zcUI',
          //   test: /[\\/]node_modules[\\/]zc-framework-ui[\\/]/,
          //   priority: 50,
          // },
          elementUI: {
            name: 'chunk-elementUI', // split elementUI into a single package
            priority: 25, // the weight needs to be larger than libs and app or it will be packaged into libs or app
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/, // in order to adapt to cnpm
          },
          views: {
            name: 'chunk-ops-views',
            test: resolve('src/views'), // can customize your rules
            minChunks: 3, //  minimum common number
            priority: 5,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      });

      config.plugin('compressionPlugin').use(
        new CompressionWebpackPlugin({
          algorithm: 'gzip',
          test: /\.(js|scss|json|html|svg)(\?.*)?$/i,
          threshold: 10240, // 对超过10k的数据压缩
          deleteOriginalAssets: false, // 删除源文件?
          minRatio: 0.8, // 压缩比
        }),
      );
      config.devtool(false),
      {
        from: path.resolve(__dirname, './public/robots.txt'), //防爬虫文件
        to: './', //到根目录下
      };
    } else {
      config.entry('app').clear().add(path.resolve(__dirname, './src/main.js'));
    }
  },
  css: {
    loaderOptions: {
      scss: {
        implementation: require('sass'),
        sassOptions: {
          outputStyle: 'expanded',
        },
        additionalData: (content, loaderContext) => {
          const { resourcePath } = loaderContext;
          if (resourcePath.endsWith('variables.module.scss')) return content;
          return `@import "./src/assets/styles/variables.module.scss";
          ${content}`;
        },
      },
    },
  },
};
