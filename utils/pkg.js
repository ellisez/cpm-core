const path=require('path');
const fs=require('fs');

const contextDirector=process.env.CPM_DIRECTOR || process.cwd();

let pkg;
function readPkg() {
    if (!pkg) {
        pkg = JSON.parse(
            fs.readFileSync(
                contextDirector + '/package.json'));
    }
    return pkg;
}
function writePkg(json) {
    fs.writeFileSync(
        contextDirector+'/package.json',
        JSON.stringify(json, null, '\t'));
}

function pkgName() {
    return readPkg().name;
}

function appName() {
    return pkgName().replace(/^@cpm\//g, '');
}

module.exports={
    readPkg,
    writePkg,
    pkgName,
    appName
}