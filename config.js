var path = require('path');
var util = require('./libs/util');

var wechat_file = path.join(__dirname, './config/wechat.txt');
var config = {
    wechat: {
        appID: 'wx8abde78001a42ced',
        appSecret: '7f809d6ac93cfb26f7456960f9e6cb28',
        token: 'YHL',
        getAccessToken: function() {
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken: function(data) {
            return util.writeFileAsync(wechat_file, data);
        },
    }
};

module.exports = config;