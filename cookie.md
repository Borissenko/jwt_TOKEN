# Cookie
- генерируются в броузере по команде, прописанной в хедере ответа, Нр: 
  > Set-Cookie: connect.sid=s%3AviCsSvcvB19nA456X-Av; max-age=3600    //без кавычек где-либо.
- сохраняются в браузере, 
  продолжают быть и после закрытия броузера, если задано "expires=Tue, 19 Jan 2038 03:14:07 GMT", 
  иначе при закрытии броузера - удаляются.
- далее автоматически вставляются броузером в хедер каждого последующего запроса к серверу.
- используются веб сервером для отслеживания посещений сайта, 
  регистрации на сайте, 
  аутентификации.

- формат у Cookie - строка по типу "user=John;cookieName2=value2"
  "connect.sid=s%3A4FL6ne29YyPvnx_dwAC5k6iFlhuVVdRi.VoYBwevobEjMEuKjFjncnYuRgn9Gt%2BNj2FqEyU7F0Qk; refreshToken=7yhRM9SOvQB3ADkmxBnoFWq6TIs"

- 4кб
- Общее количество куков на один домен ограничивается примерно 20+.


# Параметры у Cookie:
Куки в хедере запросов:
"connect.sid=s%3A4FL6ne29YyPvnx_dwAC5k6iFlhuVVdRi.VoYBwevobEjMEuKjFjncnYuRgn9Gt%2BNj2FqEyU7F0Qk; refreshToken=7yhRM9SOvQB3ADkmxBnoFWq6TIs"
Общий вид при декларации куки: 
"user=John; path=/; expires=Tue, 19 Jan 2038 03:14:07 GMT"
Set-Cookie: refreshToken=c84f18a2-c6c7-4850-be15-93f9cbaef3b3; HttpOnly; SameSite=Strict; domain=site.com; ath=/api/auth/login, /api/auth/refresh-tokens, /api/auth/logout; expires=Tue, 19 Jan 2038 03:14:07 GMT;


## HttpOnly;
HttpOnly;             //Здесь - пишется с БОЛЬШОЙ буквы.
или
httpOnly: true,      //указываем при декларации в res.cookie( , , {}). Здесь - пишется с МАЛЕНЬКОЙ буквы.


## SameSite=Strict;
sameSite: 'Strict',


## domain=site.com
По умолчанию куки доступно лишь тому домену, который его установил.
Если мы хотим дать поддоменам типа forum.site.com доступ к куки, это можно сделать, прописав
document.cookie = "user=John; domain=site.com"
Для RefreshToken - это обязательное поле.


## path=/admin - кука будет доступна только для страниц /admin и /admin/something.
Нужно прописывать path=/
Для RefreshToken - это обязательное поле.


## expires=Tue, 19 Jan 2038 03:14:07 GMT
По умолчанию cookie удалятся при закрытии браузера. Такие куки называются сессионными («session cookies»).
Если мы установим в expires прошедшую дату, то куки будет удалено.

expires: new Date(Date.now() + 3600000 * 24)   // 2021-03-25T09:53:13.067Z - работает.

### new Date(Date.now() + 3600000 * 24)   
-  2021-03-25T09:53:13.067Z - работает.

### date.toUTCString()
let date = new Date(Date.now() + 86400e3)
date = date.toUTCString()     //to "Mon, 03 Jul 2006 21:44:38 GMT" - НЕ работает.

### задаем конкретную дату
var cookie_date = new Date( 2003, 01, 15 )
document.cookie = "username=Вася;expires=" + cookie_date.toGMTString()


## max-age=3600
- срок жизни в МИЛЛИсекундах.
Если задан ноль или отрицательное значение, то кука будет удалена.
  
maxAge: 3600000 * 24,   // 3600000ms * 24 = 24 часа



## user=John; 


## secure
или
secure: true

Куки будет передаваться только по HTTPS-протоколу.
По умолчанию куки, установленные сайтом http://site.com, также будут доступны на сайте https://site.com, и наоборот.


## samesite=strict
- для защиты от XSRF-атаки
Для RefreshToken - это обязательное поле.


## signed	
делает куки подписанной





# БРОУЗЕРНЫЕ нативные функции по работе с куками.
NB!
работает только с куками, у которых прописано "httpOnly: false"(!).

## Запись cookie
> document.cookie = "user=John; max-age=3600"         // обновляем ТОЛЬКО куки с именем 'user'
Запись в document.cookie запишет/обновит только упомянутые в ней куки, но при этом не затронет все остальные(!).


>browser.setCookie({
  name: "cookie-name-here",
  value: "cookie-value-here",
  path: "/",
  sessionId: browser.sessionId,
  httpOnly: false,    //из броузера читаться не будет
});



## Чтение куки
в консоле броузера вводим
> document.cookie


## Удаление куки
### Методом deleteCookie()
>browser.deleteCookie()


### Переопределяем у текущей куки время ее жизни
- ставим 
  expires=Mon, 05 Jul 1982 16:37:55 GMT; с прошедшей датой 
или 
  max-age = -5 (отрицательное значение)
  

## Выделениезначения определенной куки из всего списка куков на клиенте
   function getCookie (name: String): String {
     let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
     return matches ? decodeURIComponent(matches[1]) : ''
   }
   console.log('getCookie ====', getCookie('connect.sid'))





# Обработка cookie в express
npm install cookie-parser

const cookieParser = require('cookie-parser')
app.use(cookieParser('secret key'))

app.get('/set-cookie', (req, res) => {
  res.cookie('token', '12345ABCDE', {        //из сервера устанавливаем куку.
    maxAge: 3600 * 24,
    secure: true,
    httpOnly: true,
    sameSite: 'Strict',
  })

  res.send('Set Cookie')
})

app.get('/get-cookie', (req, res) => {
  console.log('Cookie: ', req.cookies)       //читаем куки на сервере.
  res.send('Get Cookie')
})



## На клиенте из броузерных кук вытаскиваем 'connect.sid'-куку,
далее шлем ее в pl запроса а сервер,
далее шлем ее в pl запроса а сервер,
далее на сервере вытаскиваем ее из тела запроса и ДЕШИФРУЕМ.
а) На клиенте из броузерных кук вытаскиваем 'connect.sid'-куку

function getCookie (name: String): String {
  let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
  return matches ? decodeURIComponent(matches[1]) : ''
}

б)далее шлем ее в pl запроса а сервер
axios.post('auth/authentication', {login, password, connectSidCookie: getCookie('connect.sid')})

в)далее на сервере вытаскиваем ее из тела запроса и ДЕШИФРУЕМ
const cookieParser = require('cookie-parser')
sessionID = cookieParser.signedCookie(req.body.connectSidCookie, 'Nick')  //  secret: 'Nick', когда генерировали сессионную куку на сервере



## дополнительные методы
res.clearCookie() - удаляет по заданному ключу значение у клиента, если ключ не задан - удаляет все.
req.signedCookies  - доступ к ПОДПИСАННЫМ кукам.





# Обработка cookie на клиенте.
- управляются двумя методами объекта ответа:
cookie() - устанавливает значение по ключу;
clearCookie() - удаляет по заданному ключу значение у клиента, если ключ не задан - удаляет все. 


## Чтение куков
> let aa = document.cookie    //<==
> let aa = browser.getCookie("cookie-name-here").value


## Если в тексте ключей или значений нужны пробел или двоеточие, то требуется предварительное кодирование:
let name = "my name";
let value = "John Smith"


document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value)  // кодируем в my%20name=John%20Smith
или
document.cookie = 'name' + '=' + escape(value)    //escape - свободная функция JS, =>"John%20Smith"
unescape(value)   // декодирование обратно






# Готовые функции по бработке куков на frontend'e.
- на основе броузерных нативных функций.

## brownies - библиотека для работы с куками, LocalStorage, SessionStorage
- поддерживает подписку на них.
https://github.com/franciscop/brownies




## getCookie(name) - возвращает куки с указанным name
function getCookie(name) {           // via encodeURIComponent(value). РАБОТАЕТ.
  let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
  return matches ? decodeURIComponent(matches[1]) : undefined;    // значение куки кодируется, поэтому getCookie использует встроенную функцию decodeURIComponent для декодирования.
}

function get_cookie ( cookie_name ) {     // via unescape(value)
  var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );

  if ( results )
    return ( unescape ( results[2] ) );
  else
    return null;
}


## setCookie(name, value, options)
function setCookie(name, value, options = {}) {
options = {
  path: '/',
  // при необходимости добавьте другие значения по умолчанию
  ...options
};

if (options.expires instanceof Date) {
  options.expires = options.expires.toUTCString();
}

let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

for (let optionKey in options) {
  updatedCookie += "; " + optionKey;
  let optionValue = options[optionKey];
  if (optionValue !== true) {
    updatedCookie += "=" + optionValue;
  }
}

document.cookie = updatedCookie;
}

// Пример использования:
setCookie('user', 'John', {secure: true, 'max-age': 3600});



## deleteCookie(name)
- работает только с куками, у которых прописано "httpOnly: false"(!).

function deleteCookie(name) {
  setCookie(name, "", {maxAge: -1})
}

//или
document.cookie = "refreshToken=5;max-age=-1;path=путь;domain=домен;secure"




# axios- запросы, что бы куки отправлялись.
axios.get('url', {withCredentials: true})










