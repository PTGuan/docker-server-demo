/**
 * @author suyubo
 */

'use strict';

require('dotenv').config();

if (process.env.cur_env == 'dev') {
    process.env.host = process.env.dev_host;
    process.env.privateKeyPath = process.env.dev_privateKeyPath;
    process.env.publicKeyPath = process.env.dev_publicKeyPath;
    process.env.sysid = process.env.dev_sysid;
} else {
    process.env.host = process.env.pro_host;
    process.env.privateKeyPath = process.env.pro_privateKeyPath;
    process.env.publicKeyPath = process.env.pro_publicKeyPath;
    process.env.sysid = process.env.pro_sysid;
}


var app = require('./server-modules/app');
var package_json = require('./package.json');

var PORT = parseInt(package_json.config.port);
app.listen(PORT, function () {
    console.log('Node app is running, port:', PORT, '\n');
});
