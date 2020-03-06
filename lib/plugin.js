const { RawSource } = require('webpack-sources');

module.exports = class BundleTypePlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        compiler.hooks.emit.tap('BundleTypePlugin', compilation => {
            for (let filename in compilation.assets) {
                if (filename.endsWith('.js')) {
                    const bundleType = '// { "framework": "Vue" }\n';
                    const oldSource=compilation.assets[filename].source();
                    let raw=bundleType+oldSource;

                    compilation.assets[filename]=new RawSource(raw);
                }
            }
        })
    }
}