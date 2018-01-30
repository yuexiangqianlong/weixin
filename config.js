var path = require('path');
var util = require('./libs/util');

var wechat_file = path.join(__dirname,'./config/wechat.txt');
var config = {
	wechat:{
		appID:'wx8bcf610f475d2789',
		appSecret:'57202f02c67517ed6a65720bf8f1c4fe',
		token:'yuhailong',
		getAccessToken:function(){
			return util.readFileAsync(wechat_file);
		},
		saveAccessToken:function(data){
			return util.writeFileAsync(wechat_file,data);
		},
	}
};

module.exports = config;
