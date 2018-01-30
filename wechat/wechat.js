var util = require('./util');
var fs = require('fs');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var menu =require("../menu");
 
var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
accessToken:prefix+'token?grant_type=client_credential',
	uploadTempMaterial:prefix+'media/upload?',  //access_token=ACCESS_TOKEN&type=TYPE  上传临时素材
	getTempMaterial:prefix+'media/get?',        //access_token=ACCESS_TOKEN&media_id=MEDIA_ID 获取临时素材，GET请求
	uploadPermNews:prefix+'material/add_news?',   //access_token=ACCESS_TOKEN  上传永久图文
	uploadPermPics:prefix+'media/uploadimg?',   //access_token=ACCESS_TOKEN  上传永久图片
	uploadPermOther:prefix+'material/add_material?',   //access_token=ACCESS_TOKEN  上传永久其他素材
	getPermMaterial:prefix+'material/get_material?',   //access_token=ACCESS_TOKEN 获取永久素材，POST请求
	delPermMaterial:prefix+'material/del_material?',   //access_token=ACCESS_TOKEN 删除永久素材，POST请求
user:{
		updateUserRemark:prefix+'user/info/updateremark?',  //access_token=ACCESS_TOKEN  修改用户备注名，POST请求
		getUserInfo:prefix+'user/info?', //access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN  获取用户基本信息，GET请求
		batchGetUserInfo:prefix+'user/info/batchget?',  //access_token=ACCESS_TOKEN，POST请求
		getUserOpenIds:prefix+'user/get?',  //access_token=ACCESS_TOKEN&next_openid=NEXT_OPENID，GET请求
	},
menu:{
		create:prefix+'menu/create?',  //access_token=ACCESS_TOKEN  创建菜单
		get:prefix+'menu/get?',        //access_token=ACCESS_TOKE  获取菜单,GET请求
		delete:prefix+'menu/delete?',  //access_token=ACCESS_TOKEN	删除菜单,GET请求
		getInfo:prefix+'get_current_selfmenu_info?'  //access_token=ACCESS_TOKEN  获取自定义菜单配置接口
	},
mass:{
		sendall:prefix+'message/mass/sendall?',  //access_token=ACCESS_TOKEN 群发消息
	}
}
function Wechat(opts){     //构造函数，用以生成实例，完成初始化工作，读写票据
    var that = this;
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
   this.fetchAccessToken();
    };

Wechat.prototype.fetchAccessToken = function(){
	var that = this;

	// 如果this上已经存在有效的access_token，直接返回this对象
	if(this.access_token && this.expires_in){
		if(this.isvalidAccessToken(this)){
			return Promise.resolve(this);
		}
	}

	this.getAccessToken().then(function(data){
		try{
			data = JSON.parse(data);
		}catch(e){
			return that.updateAccessToken();
		}
       if(that.isvalidAccessToken(data)){
			return Promise.resolve(data);
		}else{
			return that.updateAccessToken();
		}
        }).then(function(data){
		that.access_token = data.access_token;
		that.expires_in = data.expires_in;
		that.saveAccessToken(JSON.stringify(data));
		return Promise.resolve(data);
	});
}


Wechat.prototype.isvalidAccessToken = function(data){
	if(!data || !data.access_token || !data.expires_in) return false;
	var access_token = data.access_token;
	var expires_in = data.expires_in;
	var now = new Date().getTime();
	return (now < expires_in) ? true : false;
}


Wechat.prototype.updateAccessToken = function(){
	var appID = this.appID;
	var appSecret = this.appSecret;
	var url = api.accessToken + '&appid='+ appID +'&secret='+ appSecret;

	return new Promise(function(resolve,reject){
		request({url:url,json:true}).then(function(response){
			var data = response.body;
			var now = new Date().getTime();
			var expires_in = now + (data.expires_in - 20) * 1000;   //考虑到网络延迟、服务器计算时间,故提前20秒发起请求
			data.expires_in = expires_in;
			resolve(data);
		});
	});
}


Wechat.prototype.massSendMsg = function(type,message,groupid){
	var that = this;
	var msg = {
		filter:{},
		msgtype:type
	}
	if(!groupid){
		msg.filter.is_to_all = true
	}else{
		msg.filter.is_to_all = false;
		msg.filter.group_id = groupid;
	}
	msg[type] = message;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){
			var url = api.mass.sendall + 'access_token=' + data.access_token;
			request({method:'POST',url:url,body:msg,json:true}).then(function(response){
				var _data = response.body;
				if(_data.errcode === 0){
					resolve(_data);
				}else{
					throw new Error('send mass message failed: ' + _data.errmsg);
				}
			}).catch(function(err){
				reject(err);
			});
		});
	});
}

Wechat.prototype.uploadTempMaterial = function(type,filepath){
	var that = this;
	var form = {  //构造表单
		media:fs.createReadStream(filepath)
	}
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){
			var url = api.uploadTempMaterial + 'access_token=' + data.access_token + '&type=' + type;
			request({url:url,method:'POST',formData:form,json:true}).then(function(response){
				var _data = response.body;
				if(_data){
					resolve(_data)
				}else{
					throw new Error('upload temporary material failed!');
				}
			}).catch(function(err){
				reject(err);
			});
		});
	});
}

// 发送消息
Wechat.prototype.replay = function(){
	var content = this.body;
	var message = this.weixin;
	var xml = util.tpl(content,message);

	this.status = 200;
	this.type = 'application/xml';
	this.body = xml;
}
//创建菜单
Wechat.prototype.createMenu = function(menu){
	var that = this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){
			var url = api.menu.create + 'access_token=' + data.access_token;
			request({url:url,method:'POST',body:menu,json:true}).then(function(response){
				var _data = response.body;
                                 console.log(_data)
				if(_data.errcode === 0){
					resolve(_data.errmsg);
				}else{
					throw new Error('create menu failed!');
				}
			}).catch(function(err){
				reject(err);
			});
		});
	});
}

//获取菜单
Wechat.prototype.getMenu = function(){
	var that = this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){
			var url = api.menu.get + 'access_token=' + data.access_token;
			request({url:url,json:true}).then(function(response){
				var _data = response.body;
                                console.log(response.body)
				if(_data.menu){
					resolve(_data.menu);
				}else{    
                                        resolve("s")
				}
			}).catch(function(err){
				reject(err);
			});
		});
	});
}

//删除菜单
Wechat.prototype.deleteMenu = function(){
	var that = this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){
			var url = api.menu.delete + 'access_token=' + data.access_token;
			request({url:url,json:true}).then(function(response){
				var _data = response.body;
				if(_data.errcode === 0){
					resolve(_data.errmsg);
				}else{
					throw new Error('delete menu failed!');
				}
			}).catch(function(err){
				reject(err);
			});
		});
	});
}

// 群发
Wechat.prototype.massSendMsg = function(type,message,groupid){
	var that = this;
	var msg = {
		filter:{},
		msgtype:type
	}
	if(!groupid){
		msg.filter.is_to_all = true
	}else{
		msg.filter.is_to_all = false;
		msg.filter.group_id = groupid;
	}
	msg[type] = message;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){
			var url = api.mass.sendall + 'access_token=' + data.access_token;
			request({method:'POST',url:url,body:msg,json:true}).then(function(response){
				var _data = response.body;
				if(_data.errcode === 0){
					resolve(_data);
				}else{
					throw new Error('send mass message failed: ' + _data.errmsg);
				}
			}).catch(function(err){
				reject(err);
			});
		});
	});
}
module.exports = Wechat;
