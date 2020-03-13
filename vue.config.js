function hasMultipleCores () {
  try {
    return require('os').cpus().length > 1
  } catch (e) {
    return false
  }
}

module.exports={
  publicPath: '/',
  outputDir: 'dist',
  pages: {
    app: {
      entry: './src/main.js',
      //filename: '[name].js'
    }
  },
  // 所有的asset emit前加上此路径，参见utils.getAssetPath()
  assetsDir: '',

  // 启用该设置所有asset输出都带有[contenthash:8]
  filenameHashing: true,

  // exclude不解析的js，默认node_module
  transpileDependencies: [
    /* string or regex */
  ],

  // devtool的sourceMap for production build?
  productionSourceMap: true,

  // use thread-loader for babel & TS in production build
  // enabled by default if the machine has more than 1 cores
  parallel: hasMultipleCores(),

  css: {
    // 暂不支持mini-extract-css-plugin
    // extract: true,
    // modules: false,
    // sourceMap: false,
    // loaderOptions: {}
  },

  // whether to use eslint-loader
  lintOnSave: 'default',

  // 暂不支持devServer
  devServer: {
    /*
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 8080,
    https: false,
    hotOnly: false,
    proxy: null, // string | Object
    before: app => {}
  */
  }
}
