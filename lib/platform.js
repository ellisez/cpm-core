const fs = require('fs');
const path = require('path');
const merge = require('webpack-merge')
const Config = require('webpack-chain');
const defaultsDeep = require('lodash.defaultsdeep')

const nativeType=process.env.CPM_NATIVE_TYPE;
const nativeDirector=process.env.CPM_NATIVE_DIRECTOR;

const webpackChainFunctions=[];
const webpackConfigFunctions=[];
let vueConfig={};
let webpackConfig={};


// vueConfig mapping for webpackConfig
webpackChainFunctions.push((chainableConfig) => {
	const cwd=process.cwd();

	webpackConfig
		.mode(process.env.NODE_ENV)
		.context(cwd);

	Object.keys(vueConfig.pages).forEach(page => {
		webpackConfig.entry(page).add(vueConfig.pages[page].entry)
	})

	webpackConfig.output
		.path(path.resolve(cwd, options.outputDir))
		.filename('[name].[contenthash:8].js')
		.publicPath(options.publicPath)

	webpackConfig.resolve
		.extensions
		.merge(['.mjs', '.js', '.jsx', '.vue', '.json', '.wasm'])
		.end()
		//
		.modules
		.add(path.join(__dirname, 'node_modules'))
		.add(path.join(cwd, 'node_modules'))
		.add(path.join(nativeDirector, 'node_modules'))
		.end()
		//
		.alias
		.set('@', path.join(cwd, 'src'))
		.set('native', path.join(cwd, 'src'))

	webpackConfig.resolveLoader
		.modules
		.add(path.join(__dirname, 'node_modules'))
		.add(path.join(cwd, 'node_modules'))
		.add(path.join(nativeDirector, 'node_modules'))

	webpackConfig.module
		.rule('vue')
		.test(/\.vue$/)
		.use('core-loader')
		.loader(require.resolve('@cpm/core-loader'))

	webpackConfig
		.plugin('BundleType')
		.use(require('./plugin'))
})

function mergeVueConfig(vueConfig, config) {
	if (config.chainWebpack) {
		webpackChainFunctions.push(config.chainWebpack);
		delete config.chainWebpack;
	}
	if (config.configureWebpack) {
		webpackConfigFunctions.push(config.configureWebpack);
		delete config.configureWebpack;
	}

	return defaultsDeep(vueConfig, config);
}

function loadVueConfig() {
	// defaultConfig
	const defaultConfig = require('../vue.config.js');

	// nativeConfig
	const nativeConfigPath=path.join(nativeDirector, 'vue.config.js');
	const nativeConfig=require(nativeConfigPath);

	return mergeVueConfig(defaultConfig, nativeConfig);
}

// vueConfig
vueConfig=loadVueConfig();


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

module.exports=webpackConfig;