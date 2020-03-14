const {execSync}=require('child_process');
const path = require('path');

module.exports=function (args) {
    try {
        execSync('npm run build', {
            cwd: path.resolve(__dirname, '../../'),
            env: {
                ...process.env,
                CPM_DIRECTOR: process.cwd()
            },
            stdio: 'inherit'
        });
    } catch(error) {
        process.exit(error.status);
    }
}