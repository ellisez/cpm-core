#!/usr/bin/env node
const path=require('path');
const fs=require('fs');

const cwd=process.cwd();

const cpm_platform=path.basename(__filename, '.js');
process.env.CPM_NATIVE_TYPE=cpm_platform;

const nativePath=path.resolve(cwd, 'native', cpm_platform);
if (!fs.existsSync(nativePath)) {
  console.error(`${cpm_platform} are not installed!\ntry to add platform ${cpm_platform} to "package.json".\ntry to "cpm build".`);
  return;
}
process.env.CPM_NATIVE_DIRECTOR=nativePath;

// npm run (?<platform>) (build|serve)
const rawArgv = process.argv.slice(2)
const args = require('minimist')(rawArgv);
const command = args._[0]

require('../lib/command')(command, args);
