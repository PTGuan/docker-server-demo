/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
 *
 * @author wangxiao
 */

// 一些工具方法

'use strict';

var base = require('./base');
var mysql = require('./mysql');
var package_json = require('../package.json');


const hello = {};

hello.hello = (req, res) => {
    let ip = req.headers["x-real-ip"];
    if (!ip) {
        ip = req.ip;
        if (!ip) {
            ip = "";
        }
    }
    res.send({
        hello: 'It works.', ip: ip, project: package_json.name
    });
};

hello.test = function (req, res) {
    res.send({ res_code: 1, msg: 'ok' });
};

module.exports = hello;
