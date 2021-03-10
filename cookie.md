# Cookie
- генерируются в броузере по команде, прописанной в хедере ответа, Нр: 
  > Set-Cookie: "connect.sid=s%3AviCsSvcvB19nA456X-Av".
- сохраняются в браузере, 
  продолжают быть и после закрытия броузера, если задано "expires=Tue, 19 Jan 2038 03:14:07 GMT", 
  иначе при закрытии броузера - удаляются.
- далее автоматически вставляются броузером в хедер каждого последующего запроса к серверу.
- используются веб сервером для отслеживания посещений сайта, 
  регистрации на сайте, 
  сохранения сведений о заказах или покупках,
  аутентификации.

- формат у Cookie - строка по типу "user=John;cookieName2=value2"
- 4кб
- Общее количество куков на один домен ограничивается примерно 20+.


# Параметры у Cookie:
  "user=John; path=/; expires=Tue, 19 Jan 2038 03:14:07 GMT"

## "path=/admin" - кука будет доступна только для страниц /admin и /admin/something.
Нужно прописывать path=/

## "domain=site.com"
По умолчанию куки доступно лишь тому домену, который его установил.
Если мы хотим дать поддоменам типа forum.site.com доступ к куки, это можно сделать, прописав
document.cookie = "user=John; domain=site.com"


## "expires=Tue, 19 Jan 2038 03:14:07 GMT"
По умолчанию cookie удалятся при закрытии браузера. Такие куки называются сессионными («session cookies»).
Если мы установим в expires прошедшую дату, то куки будет удалено.

// +1 день от текущей даты
let date = new Date(Date.now() + 86400e3);
date = date.toUTCString();
document.cookie = "user=John; expires=" + date;


## "max-age=3600"
- срок жизни в миллисекундах.
  Если задан ноль или отрицательное значение, то куки будет удалено.


## "user=John; secure"
Куки будет передаваться только по HTTPS-протоколу.
По умолчанию куки, установленные сайтом http://site.com, также будут доступны на сайте https://site.com, и наоборот.

## "samesite=strict"
- для защиты от XSRF-атаки

## "signed"	
делает куки подписанной





# БРОУЗЕРНЫЕ нативные функции по работе с куками.
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



## Удаление куки
>browser.deleteCookie()



# В Node.js cookie управляются двумя методами объекта ответа:
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





#  Обработка куков на frontend'e (на основе броузерных нативных функций).

## brownies - библиотека для работы с куками, LocalStorage, SessionStorage
- поддерживает подписку на них.
https://github.com/franciscop/brownies




## getCookie(name) - возвращает куки с указанным name
function getCookie(name) {           // via encodeURIComponent(value)
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
function deleteCookie(name) {
  setCookie(name, "", {
    'max-age': -1
  })
}














