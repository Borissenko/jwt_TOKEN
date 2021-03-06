# ЦЕЛЬ ТОКЕНА
- обеспечить клиентские сеансы без сохранения состояния (на стороне сервера),
подтверждая токеном авторизацию при каждом запросе клиента.
Токен генерируется на сервере и храниться на клиенте.

https://gist.github.com/zmts/802dc9c3510d79fd40f9dc38a12bccfc
https://vc.ru/dev/106534-jwt-kak-bezopasnyy-sposob-autentifikacii-i-peredachi-dannyh - хор статья.

Архитектура авторизации -
//https://nodeguide.ru/doc/dailyjs-nodepad/node-tutorial-5/   //так себе.



# Содержание AccessToken'a.
//https://xsltdev.ru/nodejs/tutorial/jwt/
## Пример
accessToken: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6Imp3dCJ9.eyJsb2dpbiI6Iig5OTkpIDk5OS05OS05OSIsImV4cCI6MTYyMzA2ODUwMzMwNn0=.b/faxcb+oV7161VbSIyMwVKKFaSpIanOR/oV7Gh64v4=',
refreshToken: '1628250703306^2L548KOf92pv3Mwp0BWgUWimY8',


##a) header
{
alg - алгоритм шифрования, используемый для подписи JWT, если токен не подписывается, то значением должно быть none (обязательный параметр);
typ - тип токена, необходимо указывать со значением "JWT", если могут использоваться токены другого типа (необязательный параметр);
ctp - тип данных, необходимо указывать со значением "JWT", если в payload присутствуют пользовательские ключи.
}

##b) payload
payload - это НЕ зашифрованная информация, поэтому в токене нельзя хранить какую либо sensitive_data (passwords, payment credentials, etc...)
{
user_id: 9128359853,  //добовляем для удобства
iss - приложение, создавшее токен;
sub - назначение JWT;
aud - массив получателей токена;
exp - дата и время, указанное в миллисекундах, прошедших с 01.01.1970, до наступления которого JWT будет валиден;
nbf - дата и время, указанное в миллисекундах, прошедших с 01.01.1970, до наступления которого JWT будет не валиден;
iat - дата и время создания JWT, указанное в миллисекундах, прошедших с 01.01.1970;
jti - уникальный идентификатор токена.
}

##c) подпись.






# КОДИРОВАНИЕ AccessToken'a - сериализация. (это не шифрование!).
- токен переводим в биты.

а)В несериализованном виде JWT - это строкИ JSON, которые состоят из заголовка и полезной нагрузки.
{
  alg: "HS256"      //имя алгоритма шифрования. "HS256", ..., или "none".
}
//
{
  iss: "https://auth-provider.domain.com/",    – издатель токена, кто куку инициализирует;
  sub: "auth|some-hash-here" ,                 – описываемый объект;
  aud: "unique-client-id-hash",                – получатели, к какой группе пользователь приписывается;
  exp: Date.now() + 30*60*1000,   //+30min     – дата истечения действия;
  iat – время создания
}
//
"подпись"


б)Сериализованные токены - это когда сегменты токена переведены в JSON, 
далее JSON переведен в БИТЫ, далее сегменты слиты в единую строку, в которой они разделены точкой.
"[ Header ].[ Payload ].[ Signature ]"

Кодирование проводим с помощью base64url (это не шифрование!).

function encode(h, pl) {
   const header = base64UrlEncode(JSON.stringify(h));
   const payload = base64UrlEncode(JSON.stringify(pl));
   return `Bearer ${header}.${payload}`;
}

function decode(jwt) {
   const [headerB64, payloadB64] = jwt.split('.');
   const headerStr = base64UrlDecode(headerB64);
   const payloadStr = base64UrlDecode(payloadB64);
   return {
       header: JSON.parse(headerStr),
       payload: JSON.parse(payloadStr)
   };
}



# БЕЗОПАСНОСТЬ

## ПОДПИСЬ - JSON Web Signature (JWS) 
-чтобы проверить, не были ли изменены данные. Без шифрования pl токена.

###А) HMAC-алгоритм подписи (самый распространенный)             //<<=
- разделение секрета, секрет известен обеим сторонам,
создатель и получатель могут генерировать новое подписанное сообщение.

\\1. кодирование header+payload_токена (это не шифрование).
const unsignedToken = base64urlEncode(header) + '.' + base64urlEncode(payload)   

\\2. шифрование. Создание подписи из header+payload_токена.
const SECRET_KEY = 'cAtwa1kkEy'                                  .
const signature = HMAC-SHA256(unsignedToken, SECRET_KEY)

\\3. присоединение подписи к header+payload, кодируя каждый сегмент по-отдельности.
const token = encodeBase64Url(header) + '.' + encodeBase64Url(payload) + '.' + encodeBase64Url(signature)





###B) RSASSA-алгоритм подписи (менее распостранен). 
- позволяет принимающей стороне только проверять подлинность сообщения, но не генерировать его.  
Это удобно, где есть только один создатель сообщения и много получателей.

Алгоритм основан на схеме открытого и закрытого ключей. 
Закрытый ключ - для создания подписи и для проверки. 
Открытый ключ - только для для проверки.




## ШИФРОВАНИЕ JWT - JSON Web Encryption (JWE).
Это сериализованный(JSON-строка переведена в биты) токен, который включает в себя:
- зашифрованный заголовок,
- зашифрованная полезная нагрузка,
- зашифрованная подпись,   //если используется схема разделенного секрета.
- зашифрованный ключ, 
- вектор инициализации, 
- тег аутентификации.

Шифрование мб по двум криптографическим схемам:
###А. Схема разделенного секрета.
- аналогична механизму подписки. Все стороны знают секрет и могут шифровать и дешифровать токен.
Токен здесь - 3 секционный.

const jwt = require('jsonwebtoken');      //сразу делает кодирование, добавление подписи + шифрование
const secret = 'shhhhh';

const token = jwt.sign({ foo: 'bar' }, secret); // шифрование
const decoded = jwt.verify(token, secret);      // проверка и расшифровка
console.log(decoded.foo)                        // bar


//Второй вариант расшифровки токена на клиенте.3
  import jwtdecode from 'jwt-decode'
  const tokenData = jwtdecode(token) || {}    //тоже самое, что и decoded
  console.log('tokenData = ', tokenData)




###B. Схема закрытого и открытого ключей.
- эта схема иная, чем используется для подписи.
открытый ключ - шифровать только, 
закрытый ключ - расшифровка только. 
Получается, что в этом случает JWE не может гарантировать подлинность токена. Чтобы иметь гарантию подлинности, следует использовать совмещать его с JWS.




## AccessToken, RefreshToken
- цель RefreshToken в том, чтобы получать новый короткоживущий базисный токен (access token) без новой Аутентифика́ции.

### AccessToken 
- используется для АВТОРИЗАЦИИ запросов и хранения дополнительной ИНФОРМАЦИИ клиента (user_id и т.д. в payload'e токена).
= храним НЕ в localStorage(как это часто делают), а в в памяти клиентского приложения.
  он дб недоступен из JS фронтенда.
= хранится только в оперативной памяти, не в долговременной памяти. В ЗАМЫКАНИИ в Store.
- короткоживущий (30 мин), но многоразовый.

### RefreshToken 
-выдается сервером по результам успешной Аутентифика́ции и используется для получения новой пары access/refresh_токенов. 
-храним в любом персистентном хранилище (persistere — упорствовать).
=Храним исключительно в httpOnly куке.  
=хранится только в зашифрованном виде в долговременной памяти.

-долгоживущий (60 дней), но одноразовый.
-для обращения на сервер-Аутентифика́ции.
-не сработает без предоставления AccessToken'a (пусть и просроченного).

RefreshToken в момент рефреша сравнивает себя с тем RefreshToken'ом, который лежит в БД на сервере, и, 
в случае успеха, а также если у него не истек срок, сервер рефрешит пару access/refresh_токенов.


При повторной Аутентификации оба токена обновляются, даже если их срок не истек.


### PIN 
— (обычно 4 или 6 значное число) — используется для шифрования/дешифрования RefreshToken.
+ никогда и нигде не хранится на устройстве и должен быть немедленно очищен из оперативной памяти после использования
+ никогда не покидает пределы приложения, т.е. никуда не передается
+ используется только для шифрования/дешифрования RefreshToken


## OTP 
— одноразовый код для 2FA.
    + OTP никогда не хранится на устройстве и должен быть немедленно очищен из оперативной памяти после отправки в API
    + не передаются методом GET в query параметрах HTTP запроса, вместо этого используются POST запросы
    + кэш клавиатуры отключен для текстовых полей обрабатывающих OTP
    + буфер обмена деактивирован у текстовых полей, которые содержат OTP
    + OTP не попадает в скриншоты
    + приложение удаляет OTP с экрана, когда уходит в бэкграунд


## Валидация RefreshToken'a.
Единственным валидатором должно быть API. 
Т.е. валидация не должна проходить локально на клиенте.   ?


## АЛГОРИТМ AccessToken_+_RefreshToken'ов НА КЛИЕНТЕ
Пользователь логинится, передавая логин/пароль и fingerprint браузера /npm i fingerprintjs2/ (или некий иной уникальный идентификатор устройства - GUI, если это не браузер).
Сервер проверят подлинность логина/пароля,
В случае удачи:
- создает сессию и записывает ее в БД { userId: uuid, refreshToken: uuid, expiresIn: int, fingerprint: string, ... }
- отправляет клиенту два токена AccessToken- и RefreshToken-uuid (взятый из выше созданной сессии)
"accessToken": "eyJhbGciOiJIUzI1NiIs...",
"refreshToken": "9f34dd3a-ff8d-43aa-b286-9f22555319f6".
  
Клиент сохраняет токены(access в памяти/в замыкании/ приложения, refresh персистентно/в куках броузера/), 
далее клиент использует AccessToken для последующей авторизации запросов.


### Алгоритм действий при каждом запросе
1. клиент предварительно проверяет время жизни accessToken'а 
(берем expires_in прямо из JWT в клиентском приложении) 

2. Помещеет accessToken в header запроса -
options.headers.Authorization = `Bearer ${token}`;

3. Если время валидности accessToken'a истекло, то используем refresh token что бы обновить ОБА токена -
отправляем на auth/refresh-token { refreshToken: uuid, fingerprint: string }
Далее продолжает использовать уже новый access_token.

Для большей уверенности можем обновлять токены на несколько секунд раньше.
Cохраняем текущую сессию в переменную и удаляем ее из таблицы  (?),

Проверяем текущую токен-сессию:
- Не истекло ли время жизни
- На соответствие старого fingerprint'a полученного из текущей сессии с новым полученным из тела запроса
  
В случае негативного результата бросает ошибку TOKEN_EXPIRED/INVALID_SESSION
В случае успеха 
  - создает новую сессию и записывает ее в БД,
  - создает новый access token,
  - отправляет клиенту { accessToken, refreshToken }.




## Библиотека для хеширования: https://github.com/Valve/fingerprintjs2
Более подробно: https://player.vimeo.com/video/151208427
Пример ф-ции получения такого хеша: https://gist.github.com/zmts/b26ba9a61aa0b93126fc6979e7338ca3



# Где и КАК храним AccessToken на клиенте
Храним во Vue-проекте, к Store, в ЗАМЫКАНИИ(!)


state: {
  isAuthorization: false,           //для интерфейса Vue-проекта
  accessTokenClosure: null,         //для авторизации. Замыкание, в котором сохраняется accessToken.
},
mutations: {
  SET_AUTH: (state, data) => {                                    //for LOGIN, LOGOUT & create_account concurrently
    state.userLogin = data.accessToken ? data.userLogin : ''
    state.isAuthorization = data.accessToken !== ''              // false/true

    function closure(token: string) {     //сохраняем accessToken в замыкании
      return function() {
        return token
      }
    }

    state.accessTokenClosure = data.accessToken ? closure(data.accessToken) : null
  }
}

## Изымание AccessToken'a из замыкания
GET_ACCESS_TOKEN: state => {
  if(state.accessTokenClosure != null)
    return state.accessTokenClosure()       //возвращаем accessToken из замыкания.
  return null
 }







# Пример имплементации.
## Front-end
https://github.com/zmts/beauty-vuejs-boilerplate/blob/master/src/services/http.init.js
https://github.com/zmts/beauty-vuejs-boilerplate/blob/master/src/services/auth.service.js

## Back-end
https://github.com/zmts/supra-api-nodejs/tree/master/actions/auth

https://github.com/zmts/supra-api-nodejs




