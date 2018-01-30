 /*
 * 配置自定义菜单
 */
'use strict'

module.exports = {
	
 'button':[
 	{	
    'type':'click',
    'name':'最新',
    'key':'V1001_TODAY_LATEST',
    'sub_button':[]
  },
  {
    'name':'类别',
    'sub_button':[
    {	
     	'type':'click',
      'name':'科幻',
      'key':'V1001_TYPE_KEHUAN',
      'sub_button':[]
    },
    {
      'type':'click',
      'name':'悬疑',
      'key':'V1001_TYPE_XUANYI',
      'sub_button':[]
    },
    {
      'type':'click',
      'name':'爱情',
      'key':'V1001_TYPE_AIQING',
      'sub_button':[]
    },
    {
      'type':'click',
      'name':'动作',
      'key':'V1001_TYPE_WENYI',
      'sub_button':[]
    },{
      'type':'click',
      'name':'动漫',
      'key':'V1001_TYPE_DONGMAN',
      'sub_button':[]
    }]
      
     },	
     {
      'type':'view',
      'name':'进入飘花',
      'url':'https://movie.douban.com/'
    }
 	]
}
