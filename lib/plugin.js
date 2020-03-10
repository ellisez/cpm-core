const { RawSource } = require('webpack-sources');

module.exports = class CorePlugin {
    constructor(options) {
        this.options = options;
    }

    replaceAsset(compilationAssets, oldName, newName) {
        if (!newName || newName===oldName) {
            return oldName;
        }
        const asset=compilationAssets[oldName];
        if (asset) {
            compilationAssets[newName] = asset;
            delete compilationAssets[oldName];
            return newName;
        }
    }
    frameworkHeader(compilationAssets, assetName) {
        const bundleType = '// { "framework": "Vue" }\n';
        const oldSource=compilationAssets[assetName].source();
        let raw=bundleType+oldSource;
        compilationAssets[assetName]=new RawSource(raw);
    }
    apply(compiler) {
        compiler.hooks.emit.tap('CorePlugin', compilation => {
            const optionsPages=this.options.pages;
            if (!optionsPages) {
                return;
            }
            Object.keys(optionsPages).forEach(pageName => {
                const pageInfo=optionsPages[pageName];
                const chunk=compilation.namedChunks.get(pageName);
                const oldAssetName=chunk.files[0];
                let newAssetName;
                if (pageInfo.filename) {
                    const pageInfo = optionsPages[pageName];
                    const assetInfo = {};
                    newAssetName = compilation.mainTemplate.hooks.assetPath.call(pageInfo.filename, {
                        noChunkHash: false,
                        contentHashType: 'javascript',
                        chunk,
                        hash: compilation.hash
                    }, assetInfo);
                }

                const assetName=this.replaceAsset(compilation.assets, oldAssetName, newAssetName);

                const productionSourceMap=this.options.productionSourceMap;
                if (productionSourceMap) {
                    if (newAssetName) {
                        this.replaceAsset(compilation.assets, oldAssetName+'.map', newAssetName+'.map');
                    }
                }

                this.frameworkHeader(compilation.assets, assetName);
            })
        })
    }
}