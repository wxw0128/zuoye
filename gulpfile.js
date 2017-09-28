var gulp = require('gulp');

var connect = require('gulp-connect');

var webserver = require('gulp-webserver');

var urlTool = require('url')

var qs = require('qs');
var dataBase = {
    users:[
        {
            name:'zhangsan',
            password:123456
        },
        {
            name:'lisi',
            password:123456
        },
    ],
   
    goodslist:[
        {
            name:'page1',
            data:[
                {
                    name:'商品1',
                    price:.1
                },
                {
                    name:'商品2',
                    price:.2
                }                
            ]
        },
        {
            name:'page2',
            data:[
                {
                    name:'商品3',
                    price:.3
                },
                {
                    name:'商品4',
                    price:.4
                }                
            ]
        }
    ],
    home:'<html><meta charset="utf-8"; /> <style> div{background:red}</style> <div>这是首页</div></html>'
};

function login(userName,password){
    
    var exist = false;

    var success = false;
    
    var users = dataBase['users'];

    for(var i = 0,length = users.length ;i < length ; i++){

        if(userName ==  users[i].name){
            exist = true;
            if(users[i].password == password){
                success = true;
            }
            break;
        }

    }

    return exist ? {success:success} : exist;
}
gulp.task('mockServer',function(){
    gulp.src('.')
        .pipe(webserver({
            port:3333,
            middleware:function(req,res,next){

                res.setHeader('Access-Control-Allow-Origin','*')//跨域
                //1.获取请求方式 以便分析
                var method = req.method;
                //2.获取pathname
                var url = req.url;
                var urlObj = urlTool.parse(url);
                var pathname = urlObj.pathname;                
                //3. 获取url?以后的参数
                var getParamsStr = urlObj.query;               
                var getParams = qs.parse(getParamsStr); // 'userName=zangshan&password=123456' => {}                
                // console.log(getParams)
                if(method ==='GET'){//1.分析请求方式
                    //2分析pathname
                    switch(pathname){
                        case '/goodslist':
                            if(getParamsStr){
                                var goodsListArray = dataBase['goodslist']
                                var page = goodsListArray[getParams.page];                            
                                var stringJson = JSON.stringify(page)
                                //4.告诉前端 你要要返回什么数据类型
                                res.setHeader('content-type','application/json;charset=utf-8');
                                //5.写数据
                                res.write(stringJson);
                                //6.结束
                                res.end();
                            }else {
                                var goodsListArray = dataBase['goodslist']
                                var stringJson = JSON.stringify(goodsListArray);
                                res.setHeader('content-type','application/json;charset=utf-8');
                                res.write(stringJson);
                                res.end();
                            }
                        break;
                        case '/home':
                        res.setHeader('content-type','text/html;charset=utf-8');
                        res.write(dataBase['home']);
                        res.end();
                        break;
                        default:
                        res.end();
                    }
                }else if(method === 'POST'){//                   
                    var postDataStr = '';
                    req.on('data',function(chunk){
                        postDataStr += chunk;                       
                    })
                    req.on('end',function(){                        
                        var postData = qs.parse(postDataStr);
                        switch(pathname){ 
                            case '/login' :                             
                                res.setHeader('content-type','application/json;charset=utf-8')
                                var exist = login(postData.name,postData.password)
                                if(exist){
                                    if(exist.success){
                                        var data={
                                            message:'登陆成功'
                                        }                                       
                                        res.write(JSON.stringify(data))
                                    }else{  
                                        var error={
                                            message:'密码错误'
                                        }                                       
                                        res.write(JSON.stringify(error))
                                    }
                                }else{
                                    res.write('账号不存在')
                                }                              
                                res.end()
                            break;
                            case '/register':
        
                            break;
                            default:
                                res.end()
                        }
                    })                    
                }else if(method == 'OPTIONS'){
                    res.writeHead(200,{
                        "Content-Type":"application/json",
                        'Access-Control-Allow-Origin':'*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT,DELETE',
                        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
                    });
                    res.end();                    
                }                
                return;
            }
        }))
})
gulp.task('httpServer',function(){
    connect.server({
        port:8080,
        livereload:true
    })
})
gulp.task('default',['mockServer','httpServer'])
