const {execSync}=require('child_process');
const fs = require('fs');
const path = require('path');
const build = require('./build');
const { appName } = require('../../utils/pkg');
const { error, warn } = require('../../utils/console');

module.exports=function (args) {
    build(args);

    const nativeDirector=process.env.CPM_NATIVE_DIRECTOR;
    try {
        execSync('./gradlew :app:installDebug', {
            cwd: nativeDirector,
            env: process.env,
            stdio: 'inherit'
        })
    } catch (error) {
        error(`"ANDROID_HOME" is not found!`);
        warn(`* try to set "ANDROID_HOME" environment variable or create "local.properties" file`)
        warn(`* if android sdk is not installed, see https://developer.android.google.cn/studio#downloads`);
        process.exit(error.status);
    }

    let adb;
    let androidHome;
    let localProperties=path.join(nativeDirector, 'local.properties');
    if (fs.existsSync(localProperties)) {
        const string=fs.readFileSync(localProperties).toString();
        const result=/(^|\n)sdk\.dir\s*\=\s*(?<androidHome>[^\n]+)(\n|$)/g.exec(string);
        if (result) {
            androidHome=result.groups.androidHome;
        }
    }
    if (!androidHome) {
        if (process.env.ANDROID_HOME) {
            androidHome = process.env.ANDROID_HOME;
        }
    }
    if (androidHome) {
        adb=path.join(androidHome, 'platform-tools/adb');
    } else {
        adb = 'adb';
    }
    try {
        execSync(
            `${adb} shell am  start cn.org.yxj.cpm.android.${appName()}/.MainActivity`, {
                cwd: nativeDirector,
                env: process.env,
                stdio: 'inherit'
            })
    } catch (error) {
        error(`"adb" is not found!`);
        warn(`* try to set "ANDROID_HOME" environment variable or create "local.properties" file`)
        warn(`* if android sdk is not installed, see https://developer.android.google.cn/studio#downloads`);
        process.exit(error.status);
    }
}