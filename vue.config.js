const platform=process.env.CPM_PLATFORM;
if (!platform) {
  console.error(`Not specified platform!`);
  return;
}

const nativePath=process.env.CPM_NATIVE_PATH;
const path=require('path');
const fs=require('fs');
const defaultsDeep = require('lodash.defaultsdeep')

const sourcePath=path.join(nativePath, '../../');

let entry=path.join(sourcePath, './src/main.js');
if (!fs.existsSync(entry)) {
  entry=path.join(sourcePath, './src/main.ts');
}

const outputDir=path.join(nativePath, './dist');

const template = path.join(nativePath, './public/index.html');

const defaultConfig = {
  outputDir,
  productionSourceMap: true,
  pages: {
    index: {
      entry,
      template,
    }
  },
  chainWebpack(config) {
    config.resolve.modules
      .add(path.join(nativePath, './node_modules'))
      //.add(path.join(sourcePath, './node_modules'))
      .add(path.join(sourcePath, './node_modules/@cpm/core/node_modules'))
      .add(path.join(sourcePath, './node_modules/@cpm/runtime/node_modules'))
    // config.resolve.extensions
    //   .add('.js').add('.vue').add('.json')
    config.resolve.alias
      //.set('vue$', 'vue/dist/vue.esm.js')
      .set('@', path.join(sourcePath, './src'))
      .set('#', path.join(nativePath, './src'))

    // copy static assets in public/
    const publicCopyIgnore = ['.DS_Store'];
    const nativePublic = path.join(nativePath, './public');
    if (template.startsWith(nativePublic)) {
      publicCopyIgnore.push(path.relative(nativePublic, template));
    }
    config
      .plugin('nativeCopy')
      .use(require('copy-webpack-plugin'), [[{
        from: nativePublic,
        to: outputDir,
        toType: 'dir',
        ignore: publicCopyIgnore
      }]])
  }
};

let nativeConfig;
const nativeConfigPath=path.join(nativePath, 'vue.config.js');
if (fs.existsSync(nativeConfigPath)) {
  nativeConfig=require(nativeConfigPath);
  nativeConfig=recureNativeConfig(nativeConfig);
}

let config=defaultConfig;
if (nativeConfig) {
  config=defaultsDeep(nativeConfig, defaultConfig);
}

function recureNativeConfig(object) {
  if (object instanceof Array) {
    for (let i=0; i<object.length; i++) {
      let item=object[i];
      object[i]=recureNativeConfig(item);
    }
  } else if (typeof(object)=='object'){
    for (let key in object) {
      let value=object[key];
      object[key]=recureNativeConfig(value);
    }
  } else if (typeof(object)=='string') {
    if (/^(\.\.|\.)/g.test(object)) {
      return path.join(nativePath, object);
    }
  }

  return object;
}

module.exports=config;
