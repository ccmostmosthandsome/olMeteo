
module.exports = {
    publicPath: '/ol-meteo', // 基本路径
    outputDir: 'dist', // 输出文件目录
    lintOnSave: false, // 生产环境禁用eslint-loader
    productionSourceMap: false, // 生产环境是否生成sourceMap文件
    // 启用并行化 默认的并发数os.cpus().length -1
    parallel: require('os').cpus().length > 1,
    runtimeCompiler: true,
    // css 配置相关
    css: {
        // 是否使用css分离插件 ExtractTextPlugin 生产环境下是true,开发环境下是false
        extract: true,
        // 是否开启 CSS source maps 方便开发人员的错误定位 true打包时间大大增加
        sourceMap: false,
        // 启用 CSS modules for all css / pre-processor files.
        requireModuleExtension: true
    }
}