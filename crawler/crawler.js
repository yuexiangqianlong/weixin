var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var cheerio = require('cheerio');
const http = require('http');
var URL = 'http://www.piaohua.com/';

function getftpLink(link){
	return new Promise(function(resolve,reject){
		request.get(link,function(err,res,body){
			if(!err && res.statusCode == 200){
				var $ = cheerio.load(body);
				var ftp = $('#showinfo').find('table tbody tr td a').html();
				resolve(ftp);
			}else{
			     resolve("sssss")
			}
		});
	});
}

function getTodayLatest(){
	return new Promise(function(resolve,reject){
		request.get(URL,function(err,res,body){
			if(err){
				console.log('failed to crawl the piaohu')
			}else{
				var $ = cheerio.load(body);
				var movieLists = [];
				var _movieList = $('#iml1').children("ul").first().find('li');
				_movieList.each(function(item){
					var time = $(this).find('span font').html() ? $(this).find('span font').html() : $(this).find('span').html();
					if((new Date() - new Date(time)) < 259200000){  // 3 days
						var dom = $(this).find('a').first();
						var link = URL + $(dom).attr('href');
						var img = $(dom).find('img').attr('src');
						var name = $(dom).find('img').attr('alt').substr(22).replace('</font>','');
                                              if(name){
						var movie = {
							name:name,
							img:img,
				        		link:link,
							time:time,
						}}
						movieLists.push(movie);		
					};
				});
			    	resolve(movieLists);
			}
		});
	});
}
function getPageByUrl(){
 return new Promise(function(resolve,regect){
     request.get(URL,function(err,res,body){
       if(err){
         console.log(err);
          regect(); 
       }else{
         var $=cheerio.load(body);
         var movieLists=[];
         var _movieList=$("#menu").children("ul").find("li").nextAll()
          _movieList.each(function(row){
          var link = URL+ unescape($(this).find("a").attr("href"));
          var name =$(this).text()
          var move={
           link:link,
           name:name
          }
          movieLists.push(move)
        })
        resolve(movieLists)
      } 
    })
  })
}
function getListByEventKey(eventKey){
	return new Promise(function(resolve,reject){
		getPageByUrl().then(function(movieList){
			for(var i=0;i<movieList.length;i++){
                                if(eventKey==="V1001_TYPE_KEHUAN"&&movieList[i].name==="科幻片"){    
                                   move(movieList[i]).then(function(ss){
                                      resolve(ss)
                                      })
                                 }else if(eventKey==="V1001_TYPE_XUANYI"&&movieList[i].name==="悬疑片"){
                                    move(movieList[i]).then(function(ss){
                                      resolve(ss)
                                      })
                                 }else if(eventKey==="V1001_TYPE_AIQING"&&movieList[i].name==="爱情片"){
                                    move(movieList[i]).then(function(ss){
                                      resolve(ss)
                                      })                
                                  }else if(eventKey==="V1001_TYPE_WENYI"&&movieList[i].name==="动作片"){
                                    move(movieList[i]).then(function(ss){
                                      resolve(ss)
                                      })
                                  
                                  }else if(eventKey==="V1001_TYPE_DONGMAN"&&movieList[i].name==="动漫"){
                                       move(movieList[i]).then(function(ss){
                                      resolve(ss) 
                                  })        
                                 }
			}
                        
		});
	});
}

 function move(movieList){
    return new Promise(function(resolve,reject){
        request.get(movieList.link,function(err,res,body){
             if(!err && res.statusCode == 200){
                  var $ = cheerio.load(body);
                  var movielist = $("#list").children("dl").find("dt")
                 var  movieLisat=[]
                    let i=0;
                    movielist.each(function(row){
                        if(i<7){
                       //var time = $(this).find('font').html() ? $(this).find('font').html() : $(this).find('span').html();
                         //  console.log(time)
  //                                if((new Date() - new Date(time)) < 259200000){  // 3 days
                                           var dom = $(this).find('a').first();
                                           var link = URL + $(dom).attr('href');
                                           var img = $(dom).find('img').attr('src');
                                           var name = $(dom).find('img').attr('alt').substr(25).replace('</font>','').replace("</b>","");
                                          let move={
                                           name:name,
                                           link:link,
                                           img:img, 
                                           }   
                                 movieLisat.push(move); 
                                       i++
                                  }    
 })          
                               resolve(movieLisat)
               //   var ftp = $('#showinfo').find('table tbody tr td a').html();
               
              //    movieList.ftp = unescape(ftp.replace(/;/g,'').replace(/&#x/g, "%u"));
             }else{
                  resolve('failed to get the ftp!');
                  }
          
             });
 })
}

exports.getCrawlMovieList = function* (eventKey){
	var movieList;

	if(eventKey === 'V1001_TODAY_LATEST'){
		movieList = yield getTodayLatest();
	}else{ 
		movieList = yield getListByEventKey(eventKey)
	}
	for(var i = 0; i < movieList.length; i ++){
		var ftp = yield getftpLink(movieList[i].link);
		movieList[i].ftp = unescape(ftp.replace(/;/g,'').replace(/&#x/g, "%u"));
	}
	return movieList;
}
