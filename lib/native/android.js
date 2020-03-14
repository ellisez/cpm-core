const path = require('path');
const { readPkg, appName }=require('../../utils/pkg');

module.exports=function (chainableConfig, vueConfig, utils) {
    const pkg=readPkg();
    if (!pkg.properties) {
        return;
    }
    const nativeDirector=process.env.CPM_NATIVE_DIRECTOR || process.cwd();
    if (pkg.properties.type==='project') {
        chainableConfig.output
            .path(path.resolve(nativeDirector, 'app/src/main/assets/bundle'))
            .filename(utils.getAssetPath('app.js'))
    } else {
        let jsFilename = appName() + '.js';
        chainableConfig.output
            .path(path.resolve(nativeDirector, 'src/main/assets/bundle'))
            .filename(utils.getAssetPath(jsFilename))
    }
}