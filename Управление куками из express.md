# = Управление куками из express.

# Установка куков по инициативе сервера.
Куки обычно устанавливаются веб-сервером при помощи заголовка Set-Cookie.
Затем браузер будет автоматически добавлять их в каждый запрос на тот же домен при помощи заголовка Cookie.

## Отправки cookie с сервера на клиентское приложение (браузер), simple.

HTTP/1.1 200 OK
Date: Sun, 07 Oct 2018 13:31:17 GMT
Server: Apache/2.4.34 (Win64) mod_fcgid/2.3.9
X-Powered-By: PHP/7.1.10
Expires: Thu, 19 Nov 1981 08:52:00 GMT
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Set-Cookie: PHPSESSID=m2iut9i59p73ld1c5q9j49c6t0; path=/
Set-Cookie: visitor=0d3749f09d222bea3b8f163937eb9bf1; Max-Age=31536000; path=/
Set-Cookie: lastvisit=1538919655; path=/
Vary: Accept-Encoding
Content-Encoding: gzip
Keep-Alive: timeout=5, max=100
Connection: Keep-Alive
Transfer-Encoding: chunked
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
// Здесь идет html-станица сайта.




## как установить куки из express.
> res.cookie('username', 'John', { domain: '.exmaple.com', path: '/admin', secure: true })   //генерация
### 1
app.use('/', function(req, res, next){
 res.cookie('userid', 'John', { expires: new Date(Date.now() + 900000), httpOnly: true });
 res.send('Set Cookie')
});

### 2
app.use('/', authclients(req, res) );

function authclients(req, res) {
 res.cookie('userid', 'John', { expires: new Date(Date.now() + 900000), httpOnly: true });
 res.send('Set Cookie')
}


### 3
 res.cookie('userid', 'true').send()


### Удаление ранее установленной куки.
 res.clearCookie("cookie-name")




# axios- запросы, что бы куки отправлялись.
axios.get('url', {withCredentials: true})





# Получение от клиента хранящейся у него куки.
## Непосредственно из хедера
- мы получаем все куки, относящиеся к данному URL-сайта, в каждом хедере запросов frontend'a на сервер.
Но у многих не срабатывает.  
  req.headers
  req.cookies

  req.cookies["request-example"]




# cookie-parser 
- анализирует заголовок Cookie и заполняет req.cookies объектом, обозначенным именами cookie.
>npm install --save cookie-parser

var cookieParser = require("cookie-parser");
>var express = require('express');

var app = express();
>app.use(cookieParser());



## Заброс куки при получении get-запроса
app.get('/', function(req, res){
  res.cookie('name', 'kola', {expire: 360000 + Date.now()}).send('cookie set'); //Sets "name=kola"
});


## Проверка куки в последующих запросах
app.get('/cookie-test', function(req, res){
   let existingCookie = req.cookies["request-example"];

    if (existingCookie) {
        // to send a cookie in the response
        res.cookie('already-had-cookie', 'true').send();
    } else {
        res.cookie('already-had-cookie', 'false').send();
    }
});



## Команды.
res.cookie("persistent-example", "value", { maxAge: 604800000 });
res.clearCookie("cookie-name");





