var menu = require('./menu');
var Wechat = require('./wechat/wechat');
var config = require('./config');
var crawler = require('./crawler/crawler')

var wechatApi = new Wechat(config.wechat);

exports.reply = function*(next) {
    var message = this.weixin;
    if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
            if (message.EventKey) {
                console.log('扫描二维码关注：' + message.EventKey + ' ' + message.ticket);
            }
            this.body = '终于等到你，还好我没放弃';
        } else if (message.Event === 'unsubscribe') {
            this.body = '';
            console.log(message.FromUserName + ' 悄悄地走了...');
        } else if (message.Event === 'LOCATION') {
            this.body = '您上报的地理位置是：' + message.Latitude + ',' + message.Longitude;
        } // }else if(message.Event === 'CLICK'){
        // 	//点击自定义菜单
        //                if(message.EventKey==="V1001_AREA_DALU"){
        //
        //                }else{
        // 	var movieList = yield crawler.getCrawlMovieList(message.EventKey);//获取点击事件
        // 	var messages = []
        //                if(movieList instanceof Array){
        // 	movieList.forEach(function(item){
        // 		var msg = {
        // 			title:item.name,
        // 			description:item.ftp,
        // 			picUrl:item.img,
        // 			url:item.link
        // 		}
        // 		messages.push(msg);
        //
        // 	});
        //
        //                  }
        // 	this.body = messages;
        // }
        // }
        else if (message.Event === 'SCAN') {
            this.body = '关注后扫描二维码：' + message.Ticket;
        }
    } else if (message.MsgType === 'text') {
        var content = message.Content;
        var reply = '你说的话：“' + content + '”，我听不懂呀';
        if (content === '1') {
            reply = '金刚:骷髅岛';
        } else if (content === '2') {
            var data = yield wechatApi.uploadTempMaterial('image', __dirname + '/public/king.jpg');
            console.log(data)
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
            //mediaId是一长串字符：ZnQUQks2KrDL8sTxh6tnkFHl-XEOTK-tFmDEo_g0NmCKt1XKlphpLkvcDsNuUC4l
        } else if (content === '3') {
            var data = yield wechatApi.uploadTempMaterial('voice', __dirname + '/public/aiyou.mp3');
            reply = {
                type: 'voice',
                mediaId: data.media_id
            }
        } else if (content === '4') {
            reply = [{
                title: '哪吒之魔童降世',
                description: 'magnet:?xt=urn:btih:be809309536ca24c87596dd7e7714ca2fdce1fe5&dn=哪吒之魔童降世HD国语中字[飘花www.piaohua.com].mkv',
                picUrl: 'https://imgs.kabc688.com/0701pic/19/19/4-19101120524R61.jpg',
                url: 'http://www.piaohua.com//html/xiju/2019/1011/42708.html'
            }];
        } //else if (content === '5') {
        //     var groups = yield wechatApi.getGroups();
        //     console.log('获取到如下分组：\n' + JSON.stringify(groups));
        // } else if (content === '6') {
        //     var msg = yield wechatApi.moveUsersToGroup(message.FromUserName, 114);
        //     var groups = yield wechatApi.getGroups();
        //     console.log('获取到如下分组：\n' + JSON.stringify(groups));
        // } else if (content === '7') {
        //     var remark = yield wechatApi.updateUserRemark(message.FromUserName, '芒果屋里的猫');
        //     reply = "您的备注名已经被设置为：" + remark;
        // } else if (content === '8') {
        //     var data1 = yield wechatApi.fetchUserInfo(message.FromUserName);
        //     console.log(JSON.stringify(data1));
        //     var data2 = yield wechatApi.fetchUserInfo([message.FromUserName]);
        //     console.log(JSON.stringify(data2))
        // } else if (content === '9') {
        //     var data1 = yield wechatApi.getUserOpenIds();
        //     console.log(JSON.stringify(data1));
        //     var data2 = yield wechatApi.getUserOpenIds(message.FromUserName);
        //     console.log(JSON.stringify(data2));
        // } else if (content === '10') {
        //     var data = yield wechatApi.getMenu();
        //     console.log(JSON.stringify(data));
        //}
        else if (content === '11') {
            var text = {
                content: '这是群发消息测试唔~'
            };
            var msg = yield wechatApi.massSendMsg('text', text, 114);
        } else if (content === '最新') {
            var movieList = yield crawler.getCrawlMovieList('V1001_TODAY_LATEST'); //获取点击事件
            var messages = []
            if (movieList instanceof Array) {
                movieList.forEach(function(item) {
                    var msg = {
                        title: item.name,
                        description: item.ftp,
                        picUrl: item.img,
                        url: item.link
                    }
                    messages.push(msg);
                });

            }
            this.body = messages;
            return
        }
        /*
        	注意：
        	如果是被动回复视频消息，不建议在用户发送数字后上传资源再回复用户，
        	上传视频需要时间，如果未能在5秒内回复用户的消息，微信会提示系统服务不可用，
        	所以视频必须是提前先上传好的，只需要获取其media_id，再回复用户就可以。
        */
        /*
        else if(content === '12'){
        	var data = yield wechatApi.uploadTempMaterial('video', __dirname + '/public/vuejs.mp4');
        	console.log(data);
        	reply = {
        		type: 'video',
        		title: 'vuejs',
        		description: 'vuejs入门介绍',
        		mediaId: data.media_id
        	}
        	console.log(reply);
        }
        */
        // ... 其他回复类型
        this.body = reply;
    }
    yield next;
}

function isObjectValueEqual(a, b) {
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        if (a[propName] instanceof Object) {
            if (!isObjectValueEqual(a[propName], b[propName])) return false;
        } else if (a[propName] != b[propName]) {
            return false;
        }
    }
    return true;
}


exports.setMenu = function*(next) {
    if (menuData == "s") {
        wechatApi.createMenu(menu);
    } else {
        var menuData = yield wechatApi.getMenu();
    }
    if (!isObjectValueEqual(menuData, menu)) {
        wechatApi.deleteMenu().then(function() {
            return wechatApi.createMenu(menu);
        }).then(function(msg) {
            console.log('createMenu:' + msg);
        });
    }
}