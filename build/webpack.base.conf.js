var path = require('path')
var config = require('../config/index')
var utils = require('./utils')
var projectRoot = path.resolve(__dirname, '../')

var env = process.env.NODE_ENV
// check env & config/index.js to decide whether to enable CSS source maps for the
// various preprocessor loaders added to vue-loader at the end of this file
var cssSourceMapDev = (env === 'development' && config.dev.cssSourceMap)
var cssSourceMapProd = (env === 'production' && config.build.productionSourceMap)
var useCssSourceMap = cssSourceMapDev || cssSourceMapProd

module.exports = {
    entry: {
        app: './src/main.js'
    },
    output: {
        path: config.build.assetsRoot,
        publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath,
        filename: '[name].js'
    },
    resolve: {
        extensions: ['', '.js', '.vue', '.json'],
        fallback: [path.join(__dirname, '../node_modules')],
        alias: {
            'vue$': 'vue/dist/vue.common.js',
            'src': path.resolve(__dirname, '../src'),
            'common': path.resolve(__dirname, '../common'),
            'assets': path.resolve(__dirname, '../src/assets'),
            'components': path.resolve(__dirname, '../src/components'),
            'mixins': path.resolve(__dirname, '../src/mixins'),
            'config': path.resolve(__dirname, '../config'),
            'io': path.resolve(__dirname, '../src/io'),
            'eventHub': path.resolve(__dirname, '../src/eventHub'),
            'settings': path.resolve(__dirname, '../src/settings'),
            'store': path.resolve(__dirname, '../src/store'),
            'port': path.resolve(__dirname, '../port'),
        },
        modules: [
            path.resolve('../src'),
            path.resolve('./node_modules'),
            path.resolve('../')
        ],
    },
    resolveLoader: {
        fallback: [path.join(__dirname, '../node_modules')]
    },
    module: {
        //        noParse: /socketio\.js/,
        rules: [{
            test: /\.less$/,
            use: [
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        // importLoaders: 1
                    }
                }, {
                    loader: "less-loader",
                    options: {
                        paths: [
                            // path.resolve(__dirname, "node_modules")
                        ]
                    }
                }
            ]
        }, {
            test: /\.vue$/,
            //                loader: 'eslint',
            enforce: 'pre',
            use: [{
                loader: 'eslint-loader',
                options: {
                    fix: true
                },
            }],
            include: [
                path.join(projectRoot, 'src'), path.join(projectRoot, 'common')
            ],
            exclude: /node_modules/,
        }],

        preLoaders: [
            //            {
            //                test: /\.vue$/,
            //                loader: 'eslint',
            //                include: [
            //          path.join(projectRoot, 'src')
            //        ],
            //                exclude: /node_modules/,
            //                fix: true,
            //                query: {
            //                    fix: true
            //                }
            //      },

            {
                test: /\.js$/,
                loader: 'eslint',
                include: [
                    path.join(projectRoot, 'src'), path.join(projectRoot, 'common')
                ],
                exclude: /node_modules/
            }
        ],
        loaders: [{
            test: /\.vue$/,
            loader: 'vue'
        },
        {
            test: /\.js$/,
            loader: 'babel',
            include: [
                path.join(projectRoot, 'src'), path.join(projectRoot, 'common'), path.join(projectRoot, 'port'),
            ],
            exclude: /node_modules/
        },
        {
            test: /\.json$/,
            loader: 'json'
        },
        {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url',
            query: {
                limit: 10000,
                //          name: utils.assetsPath('img/[name].[ext]')
                name: utils.assetsPath('img/[name].[ext]')
            }
        },
        {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: 'url',
            query: {
                limit: 10000,
                name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
            }
        }
        ]
    },
    eslint: {
        formatter: require('eslint-friendly-formatter')
    },
    vue: {
        loaders: utils.cssLoaders({
            sourceMap: useCssSourceMap
        }),
        postcss: [
            require('autoprefixer')({
                browsers: ['last 2 versions']
            })
        ]
    }
}
