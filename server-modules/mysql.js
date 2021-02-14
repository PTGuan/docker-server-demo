/**
 * Created by suyubo on 15/12/14.
 */

'use strict';

var mysql = require('mysql');
var moment = require('moment');

var sql = {};

//定义pool池
var pool = mysql.createPool({
    host: '',
    user: '',
    password: '',
    database: '',
    port: '3306',
    charset: 'utf8mb4'
});

sql.query = function (sql, params) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.error(moment().format() + " sql.query:" + err + "----sql:" + sql);
                reject(err);
            }

            connection.query(sql, params, function (err, result) {
                if (err) {
                    console.error(moment().format() + "\n #### sql.query:" + err + "\n----sql:" + sql + "\n----param:" + params);
                    reject(err);
                }

                //console.log(result);
                resolve(result);
            });
            //回收pool
            connection.release();
        });
    });
};

sql.format = function (sql, params) {
    return new Promise(function (resolve, reject) {
        resolve(mysql.format(sql, params));
    });
};

sql.escape = function (params) {
    return new Promise(function (resolve, reject) {
        var arr = [];
        for (var p of params) {
            arr.push(mysql.escape(p));
        }
        resolve(arr);
    });
};

module.exports = sql;