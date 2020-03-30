const fs = require('fs-extra');
const path = require('path');
const merge = require('webpack-merge')
const Config = require('webpack-chain');
const defaultsDeep = require('lodash.defaultsdeep')

const nativeType=process.env.CPM_NATIVE_TYPE || 'android';
const nativeDirector=process.env.CPM_NATIVE_DIRECTOR;
const contextDirector=process.env.CPM_DIRECTOR || process.cwd();
const mode = process.env.NODE_ENV || 'development' || 'production';

const webpackChainFunctions=[];
const webpackConfigFunctions=[];
let vueConfig={};
let webpackConfig={};

const utils={
	mergeVueConfig(vueConfig, config) {
    	if (config.chainWebpack) {
        	webpackChainFunctions.push(config.chainWebpack);
        	delete config.chainWebpack;
    	}
    	if (config.configureWebpack) {
        	webpackConfigFunctions.push(config.configureWebpack);
        	delete config.configureWebpack;
    	}

    	return defaultsDeep(vueConfig, config);
	},

	loadVueConfig() {
    	// defaultConfig
    	const defaultConfig = require('./vue.config.js');

    	// nativeConfig
    	let nativeConfig={};
    	if (nativeDirector) {
        	const nativeConfigPath = path.join(nativeDirector, 'vue.config.js');
        	if (fs.existsSync(nativeConfigPath)) {
				nativeConfig = require(nativeConfigPath);
			}
    	}

    	return utils.mergeVueConfig(defaultConfig, nativeConfig);
	},

	getAssetPath(filePath) {
		return vueConfig.assetsDir
    		? path.posix.join(vueConfig.assetsDir, filePath)
    		: filePath
	},

	genTranspileDepRegex (transpileDependencies) {
		const deps = transpileDependencies.map(dep => {
			if (typeof dep === 'string') {
				const depPath = path.join('node_modules', dep, '/')
				return path.sep==='\\'
					? depPath.replace(/\\/g, '\\\\') // double escape for windows style path
					: depPath
			} else if (dep instanceof RegExp) {
				return dep.source
			}
		})
		return deps.length ? new RegExp(deps.join('|')) : null
	}
}

// vueConfig mapping for webpackConfig
webpackChainFunctions.push((chainableConfig) => {
	const isProduction = mode === 'production';

    chainableConfig
        .mode(mode)
		.devtool(vueConfig.productionSourceMap ? 'source-map' : false)
        .context(contextDirector)
        .when(vueConfig.pages, chainableConfig => {
            Object.keys(vueConfig.pages).forEach(page => {
            	const entryPoint=path.resolve(contextDirector, vueConfig.pages[page].entry);
                chainableConfig.entry(page).add(entryPoint);
            })
        })

	const jsFilename=`[name]${vueConfig.filenameHashing===false?'':'.[contenthash:8]'}.js`;
    const ouputPath = nativeDirector?
		path.resolve(nativeDirector, vueConfig.outputDir)
		: path.resolve(contextDirector, vueConfig.outputDir);
    chainableConfig.output
        .path(ouputPath)
        .filename(utils.getAssetPath(jsFilename))
        .publicPath(vueConfig.publicPath)

	if (nativeType) {
		const nativeConfigChain=require(`./lib/native/${nativeType}`);
		nativeConfigChain(chainableConfig, vueConfig, utils);
	}

    chainableConfig.resolve
		// import file with ignored extensions
        .extensions
        	.merge(['.mjs', '.js', '.jsx', '.vue', '.json', '.wasm'])
        	.end()
        // import path from
        .modules
        	.add(path.join(__dirname, 'node_modules'))
        	.add(path.join(contextDirector, 'node_modules'))
        	.when(nativeDirector, (mod) => {
            	mod.add(path.join(nativeDirector, 'node_modules'))
        	})

        .end()
        // import alias
        .alias
        	.set('@', path.join(contextDirector, 'src'))
			.when(nativeDirector, alia=>{
				alia.set('native', path.join(nativeDirector, 'src'))
			})
	// loader path from
    chainableConfig.resolveLoader
        .modules
        .add(path.join(__dirname, 'node_modules'))
        .add(path.join(contextDirector, 'node_modules'))
        .when(nativeDirector, (mod) => {
            mod.add(path.join(nativeDirector, 'node_modules'))
        })

	// vue-loader
	const coreLoader=path.join(__dirname, './lib/loader');
    chainableConfig.module
		.noParse(/^(vue|vue-router|vuex|vuex-router-sync)$/)
        .rule('vue')
			.test(/\.vue$/)
			.use('core-loader')
				.loader(coreLoader)

	// js-loader
	const transpileDepRegex = utils.genTranspileDepRegex(vueConfig.transpileDependencies);
	const babelPlugin=require('./lib/babel');
    chainableConfig.module
		.rule('js')
		.test(/\.m?jsx?$/)
		.exclude
			.add(filepath => {
				// check if this is something the user explicitly wants to transpile
				if (transpileDepRegex && transpileDepRegex.test(filepath)) {
					return false
				}
				// Don't transpile node_modules
				return /node_modules/.test(filepath)
			})
			.end()
		.use('babel-loader')
			.loader('babel-loader')
			.options({
				plugins: [babelPlugin]
			})
			.end()

		.when(process.env.NODE_ENV === 'production' &&
			!!vueConfig.parallel, rule=>{
			rule.use('thread-loader')
				.loader('thread-loader')
				.when(typeof vueConfig.parallel === 'number', loader=> {
					loader.options({ workers: vueConfig.parallel })
				})
		})

	// style-loader
	const styleLoader=path.join(__dirname, './lib/style-loader');

	// less-loader
	const cssOptions = vueConfig.css.loaderOptions || {};
	const requireModuleExtension = vueConfig.css.requireModuleExtension || true;
	const cssSourceMap = vueConfig.css.sourceMap || false;
	const cssLoaderOptions = cssOptions.css || { sourceMap:cssSourceMap, requireModuleExtension};
	const lessLoaderOptions = cssOptions.less || {cssSourceMap};
	chainableConfig.module
		.rule('less-loader')
		.test(/\.less$/)
		.use('style-loader')
			.loader(styleLoader)
			.end()
		.use('css-loader')
			.loader('css-loader')
			.options(cssLoaderOptions)
			.end()
		.use('less-loader')
			.loader('less-loader')
			.options(lessLoaderOptions)
			.end()


	// eslint-loader
	const lintOnSave = vueConfig.lintOnSave || true;
	const allWarnings = lintOnSave === true || lintOnSave === 'warning';
	const allErrors = lintOnSave === 'error';
	chainableConfig.module
		.rule('eslint')
		.pre()
		.include
			.add(path.join(contextDirector, 'src'))
			.when(nativeDirector, include=>{
				include.add(path.join(nativeDirector, 'src'))
			})
			.end()
		.exclude
			.add(/node_modules/)
			//.add(path.dirname(require.resolve('@vue/cli-service')))
			.end()
		.test(/\.(vue|(j|t)sx?)$/)
		.use('eslint-loader')
			.loader(require.resolve('eslint-loader'))
			.options({
				extensions: ['.js', '.jsx', '.vue'],
				//cache: true,
				//cacheIdentifier,
				emitWarning: allWarnings,
				// only emit errors in production mode.
				emitError: allErrors,
				formatter: require('eslint-friendly-formatter')
			})

	// cpm-loader: 继承，依赖关系，探针扫描
	chainableConfig.module
		.rule('cpm-loader')
		.test(/\.(vue|js|css|less)$/)
		.use('cpm-loader')
			.loader('@cpm/loader')

	// cpm-plugin
	// chainableConfig
	// 	.plugin('CpmPlugin')
	// 	.use(require('@cpm/loader/lib/plugin'), [vueConfig])

	// core-plugin
    chainableConfig
        .plugin('CorePlugin')
        .use(require('./lib/plugin'), [vueConfig])
})

// vueConfig
vueConfig=utils.loadVueConfig();


// vueConfig.chainWebpack
const chainableConfig = new Config();
webpackChainFunctions.forEach(fn => fn(chainableConfig));
webpackConfig=chainableConfig.toConfig();

// vueConfig.configureWebpack
webpackConfigFunctions.forEach(fn => {
    if (typeof fn === 'function') {
        // function with optional return value
        const res = fn(webpackConfig)
        if (res) webpackConfig = merge(webpackConfig, res)
    } else if (fn) {
        // merge literal values
        webpackConfig = merge(webpackConfig, fn)
    }
});

// clean output
fs.removeSync(webpackConfig.output.path);

module.exports=webpackConfig;