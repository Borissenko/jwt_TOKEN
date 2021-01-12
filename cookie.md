# cookie

- сохраняются в браузере. Если не прописан "expires=Tue, 19 Jan 2038 03:14:07 GMT", то удаляются при закрытии броузера.
- используются веб сервером для отслеживания посещений сайта, 
  регистрации на сайте и 
  сохранения сведений о заказах или покупках,
  аутентификация.

При входе на сайт сервер отсылает в ответ HTTP-заголовок Set-Cookie для того, чтобы 
установить куки со специальным уникальным идентификатором сессии («session identifier»).
Во время следующего запроса к этому же домену браузер посылает на сервер HTTP-заголовок Cookie.
Таким образом, сервер понимает, кто сделал запрос.

- Мы также можем получить куки непосредственно из браузера, используя свойство document.cookie
- формат "user=John;cookie2=value2"
- 4кб
- Общее количество куков на один домен ограничивается примерно 20+.
- У куки есть ряд настроек.
  "user=John; path=/admin; expires=Tue, 19 Jan 2038 03:14:07 GMT"



## path=/admin - кука будет доступна только для страниц /admin и /admin/something.
## domain=site.com -
По умолчанию куки доступно лишь тому домену, который его установил.
Если мы хотим дать поддоменам типа forum.site.com доступ к куки, это можно сделать, прописав
document.cookie = "user=John; domain=site.com"


## expires=Tue, 19 Jan 2038 03:14:07 GMT -
По умолчанию cookie удалятся при закрытии браузера. Такие куки называются сессионными («session cookies»).
Если мы установим в expires прошедшую дату, то куки будет удалено.

// +1 день от текущей даты
let date = new Date(Date.now() + 86400e3);
date = date.toUTCString();
document.cookie = "user=John; expires=" + date;


## max-age=3600
- срок жизни в миллисекундах.
  Если задан ноль или отрицательное значение, то куки будет удалено.


## "user=John; secure"
Куки будет передаваться только по HTTPS-протоколу.
По умолчанию куки, установленные сайтом http://site.com, также будут доступны на сайте https://site.com, и наоборот.

## samesite=strict
- для защиты от XSRF-атаки

## Запись cookie
Запись в document.cookie обновит только упомянутые в ней куки, но при этом не затронет все остальные(!).

>document.cookie = "user=John; max-age=3600"         // обновляем только куки с именем 'user'



## Если в тексте ключей или значений нужны пробелы или спец символы, то требуется предварительное кодирование:
let name = "my name";
let value = "John Smith"

// кодирует в my%20name=John%20Smith
document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value)



# Функции по работе с куками

## getCookie(name) - возвращает куки с указанным name

function getCookie(name) {
let matches = document.cookie.match(new RegExp(
"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
));
return matches ? decodeURIComponent(matches[1]) : undefined;    // значение куки кодируется, поэтому getCookie использует встроенную функцию decodeURIComponent для декодирования.
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




# Установка куков по инициативе сервера.
Куки обычно устанавливаются веб-сервером при помощи заголовка Set-Cookie. 
Затем браузер будет автоматически добавлять их в каждый запрос на тот же домен при помощи заголовка Cookie.












