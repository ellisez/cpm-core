#!/usr/bin/env node
const path=require('path');
const fs=require('fs');
const platform=require('../lib/command');

const cwd=process.cwd();

const nativeType=path.basename(__filename, '.js');
process.env.CPM_NATIVE_TYPE=nativeType;

const nativeDirector=path.resolve(cwd, 'native', nativeType);
if (!fs.existsSync(nativePath)) {
  console.error(`${nativeType} are not installed!\ntry to add platform ${nativeType} to "package.json".\ntry to "cpm build".`);
  return;
}
process.env.CPM_NATIVE_DIRECTOR=nativeDirector;

// npm run (?<platform>) (build|serve)
const commandArgs=process.argv.slice(2);

platform(commandArgs);
