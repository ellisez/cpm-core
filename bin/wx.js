#!/usr/bin/env node
const path=require('path');
const fs=require('fs');
const platform=require('../lib/command');

const cwd=process.cwd();

const cpm_platform=path.basename(__filename, '.js');
process.env.CPM_PLATFORM=cpm_platform;

const nativePath=path.resolve(cwd, 'native', cpm_platform);
if (!fs.existsSync(nativePath)) {
  console.error(`${cpm_platform} are not installed!\ntry to add platform ${cpm_platform} to "package.json".\ntry to "cpm build".`);
  return;
}
process.env.CPM_NATIVE_PATH=nativePath;

process.env.VUE_CLI_SERVICE_CONFIG_PATH=path.join(__dirname, '../vue.config.js');

// npm run (?<platform>) (build|serve)
const commandArgs=process.argv.slice(2);

platform(commandArgs);
