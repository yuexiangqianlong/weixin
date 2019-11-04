
'use strict'

var Koa = require('koa');
var generator= require('./wechat/generator');
var config = require('./config');
var weixin = require('./weixin');

var app = new Koa();
app.use(generator(config.wechat,weixin.reply))
app.use(weixin.setMenu);//自定义菜单
app.listen(9000);

console.log('Listening 9000')
