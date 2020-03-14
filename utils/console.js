const chalk = require('chalk');

function error(text) {
    const withColor=chalk.bold.red;
    console.error(withColor(text));
}
function warn(text) {
    const withColor=chalk.keyword('orange');
    console.warn(withColor(text));
}
function info(text) {
    const withColor=chalk.keyword('green');
    console.info(withColor(text));
}
function log(text) {
    const withColor=chalk.keyword('white');
    console.log(withColor(text));
}
function debug(text) {
    const withColor=chalk.keyword('grey');
    console.debug(withColor(text));
}

module.exports={
    error,
    warn,
    info,
    log,
    debug
}