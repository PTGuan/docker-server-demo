'use strict';

let jwt = require('jwt-simple');
let crypto = require('crypto');
let moment = require('moment');

let mysql = require('./mysql');

let base = {};

//生成随机数
base.getRandomCode = function (min, max) {
    let code = Math.floor(Math.random() * (max - min + 1) + min);
    return code.toString();
};

//md5密码加密
base.md5Pwd = function (password) {
    return crypto.createHash('md5').update(password).digest('hex');
};

//生成token
base.createToken = function (user_id, type, db) {
    let expires = moment().add(1, 'months').valueOf();
    let token = jwt.encode({
        user_id: user_id,
        exp: expires,
        type: type,
        db
    }, 'alien');
    return token;
};


//检查token
base.checkToken = function (token, type) {
    return new Promise(function (resolve, reject) {
        if (!token) {
            resolve({ res_code: -997, msg: "token为空" });
            return;
        }

        try {
            var decoded = jwt.decode(token, 'alien');
            if (!decoded.user_id) {
                resolve({ res_code: -996, msg: "token错误" });
                return;
            }
            //过期
            if (decoded.exp <= Date.now()) {
                resolve({ res_code: -998, msg: "token已过期" });
                return;
            }
            if (decoded.type != type) {
                resolve({ res_code: -994, msg: "token错误" });
                return;
            }


            var sql = "SELECT token FROM " + decoded.db + " WHERE id=?";
            mysql.query(sql, [decoded.user_id]).then(function (results) {
                if (results.length === 0) {
                    resolve({ res_code: -993, msg: "token错误" });
                    return;
                }

                if (results[0].token == token) {
                    resolve({ res_code: 1, msg: decoded });
                } else {
                    resolve({ res_code: -995, msg: "token错误" });
                }
            });
        } catch (err) {
            console.log(err);
            resolve({ res_code: -999, msg: "token错误" });
        }
    });
};

//获取token
base.get_token = function (req) {
    var token = req.body.token;
    return token;
};


base.errors = {
    "no_data": { res_code: 0, msg: "未找到数据" },
    "params_null": { res_code: -1, msg: "参数为空" },
    "not_found_user": { res_code: -2, msg: "没找到用户" },
    "user_exists": { res_code: -3, msg: "用户已存在" },
    "user_error": { res_code: -4, msg: "手机号或密码错误" },
    "access_denined": { res_code: -5, msg: "无登录权限，请联系管理员" },
    "permission_denined": { res_code: -5, msg: "无操作权限，请联系管理员" },
};

//过滤html标签
//base.filter_html = function (content) {
//    //img标签替换成[图片]
//    var result = content.replace(/<img/g, "[图片]<img");
//    //过滤html标签
//    result = result.replace(/<\/?[^>]*>/g, "");
//    //过滤空格
//    result = result.replace(/&nbsp;/ig, '');
//    return result;
//};

//html编码
//base.html_encode = function (html) {
//    if (html.length == 0) return "";
//    html = html.replace(/&/g, "&amp;");
//    html = html.replace(/</g, "&lt;");
//    html = html.replace(/>/g, "&gt;");
//    html = html.replace(/ /g, "&nbsp;");
//    html = html.replace(/\'/g, "&#39;");
//    html = html.replace(/\"/g, "&quot;");
//    html = html.replace(/\n/g, "<br/>");
//    return html;
//};

//发送推送通知
// base.send_jpush = function (user_ids, msg, json) {
//     var count = user_ids.length;
//     if (count == 0) {
//         return;
//     }
//
//     var for_count = Math.ceil(count / 1000);
//     var page_index = 0;
//     var page_size = 1000;
//
//     for (var j = 0; j < for_count; j++) {
//         var sql = "SELECT registration_id FROM txj_user_jpush WHERE user_id in(";
//         for (var i = 0; i < user_ids.length; i++) {
//             sql += user_ids[i];
//             if (i < user_ids.length - 1) {
//                 sql += ",";
//             }
//         }
//         sql += ") LIMIT " + page_index + "," + page_size;
//         mysql.query(sql, []).then(function (results) {
//             if (results.length == 0) {
//                 return;
//             }
//             var ids = [];
//             for (var k = 0; k < results.length; k++) {
//                 if (ids.indexOf(results[k].registration_id) < 0) {
//                     ids.push(results[k].registration_id);
//                 }
//             }
//             jpush_client.push()
//                 .setPlatform(JPush.ALL)
//                 .setAudience(JPush.registration_id(ids))
//                 .setNotification("透析界", JPush.ios(msg, "1", 1, false, json), JPush.android(msg, '', 1, json))
//                 .setOptions(null, null, null, true, null)
//                 .send(function (err, res) {
//                     if (err) {
//                         //console.log(err);
//                         return false;
//                     } else {
//                         return true;
//                     }
//                 });
//         });
//         page_index += 1000;
//     }
// };

//对象数组排序
//示例 var arr=[{a:1},{a:2}];
//arr.sort(base.array_compare("a"));
base.array_compare = function (property, type) {
    return function (obj1, obj2) {
        var value1 = obj1[property];
        var value2 = obj2[property];
        if (type == "asc") return value1 - value2;     // 升序
        if (type == "desc") return value2 - value1;     // 降序
    }
};

//时间对象数组排序
//示例 var arr=[{a:1},{a:2}];
//arr.sort(base.array_compare("a"));
base.array_compare_by_datetime = function (property, type) {
    return function (obj1, obj2) {
        var value1 = new Date(obj1[property]);
        var value2 = new Date(obj2[property]);
        if (type == "asc") return value1 - value2;     // 升序
        if (type == "desc") return value2 - value1;     // 降序
    }
};

//过滤script标签
base.replaceScript = function (value) {
    if (!value) {
        return value;
    }

    value = value.replace(/<script[\s\S]*?<\/script>/g, "");
    value = value.replace(/<script[\s\S]*?\/>/g, "");
    value = value.replace(/<iframe[\s\S]*?<\/iframe>/g, "");
    value = value.replace(/<iframe[\s\S]*?\/>/g, "");
    return value;
};

base.getHiddenNum = (num) => {
    return num.substr(0, 4) + "****" + num.substr(num.length - 4);
};

base.arrayRemove = (arr, func) => {
    let index = -1;
    for (let i = 0; i < arr.length; i++) {
        if (func(arr[i], i)) {
            index = i;
            break;
        }
    }
    if (index != -1) {
        arr.splice(index, 1);
        return true;
    } else {
        return false;
    }
}

/**
 * 检查参数通用方法
 * 如果有特殊字段需要传空字符串或0则不需要在keys中传入，应该单独判断
 * @param {*} data req.body
 * @param {*} keys 需要判断非空的参数名数组
 * @return 如果有参数未传则返回true，否则返回false
 */
base.checkParam = (data, keys) => {
    for (let key of keys) {
        if (!data[key] || data[key] == '' || data[key] == 0) {
            return true;
        }
    }
    return false;
}

base.TOKEN_TYPE = {
    "TOOLS": "tools",
    "USER": "user"
}

base.POST_TYPE = {
    "1": "delicacy",
    "2": "car",
    "3": "travel",
    "4": "community",
    "5": "flea",
    "6": "house",
    // "7": "advertise",
}

/**
 * 检查当前登录用户是否有权限查看/操作数据
 * @param {*} user_id 用户id
 * @param {*} permission 要查看/操作的模块
 */
base.checkPermissions = async (user_id, permission) => {
    var sql = "SELECT permissions FROM nl_tools_user WHERE id=?";
    var results = await mysql.query(sql, [user_id]);
    if (results.length == 0) {
        return -1;
    }
    let permissions = JSON.parse(results[0].permissions);
    return permissions.indexOf(permission);
}

module.exports = base;