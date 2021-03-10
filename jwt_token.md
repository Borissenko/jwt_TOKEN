# ЦЕЛЬ ТОКЕНА
- обеспечить клиентские сеансы без сохранения состояния (на стороне сервера),
подтверждая токеном авторизацию при каждом запросе клиента.
Токен генерируется на сервере и храниться на клиенте.

https://gist.github.com/zmts/802dc9c3510d79fd40f9dc38a12bccfc
https://vc.ru/dev/106534-jwt-kak-bezopasnyy-sposob-autentifikacii-i-peredachi-dannyh - хор статья.

Архитектура авторизации -
//https://nodeguide.ru/doc/dailyjs-nodepad/node-tutorial-5/



# КОДИРОВАНИЕ ТОКЕНА - сериализация. (это не шифрование!).
- токен переводим в биты.

а)В несериализованном виде JWT - это строка JSON, которая состоит из заголовка и полезной нагрузки,
{
   "alg": "HS256"      //имя алгоритма шифрования. "HS256", ..., или "none".
}
{
  iss: "https://auth-provider.domain.com/"    – издатель токена, кто куку инициализирует;
  sub: "auth|some-hash-here"                  – описываемый объект;
  aud: "unique-client-id-hash"                – получатели, к какой группе пользователь приписывается;
  exp: 1529496683,                            – дата истечения действия;
  iat – время создания.
}


б)Сериализованные токены - переведены в биты и имеют форму
"[ Header ].[ Payload ].[ Signature ]"

это делаем с помощью base64url (это не шифрование!).

function encode(h, p) {
   const header = base64UrlEncode(JSON.stringify(h));
   const payload = base64UrlEncode(JSON.stringify(p));
   return `${header}.${payload}`;
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
-чтобы проверить, не были ли изменены данные. Без шифрования самого текста токена.

###А) HMAC-алгоритм подписи (самый распространенный)
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

const jwt = require('jsonwebtoken');  //сразу делает кодирование, добавление подписи + шифрование
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
- цель Refresh Token в том, чтобы получать новый короткоживущий базисный токен (access token) без новой Аутентифика́ции.

AccessToken - используется для АВТОРИЗАЦИИ запросов и хранения дополнительной ИНФОРМАЦИИ клиента (user_id и т.д. в payload'e токена).
- храним не в localStorage, как это обычно делают, а в ... (в хедере запросов(?), в памяти клиентского приложения(?), во Vuex frontend'a(?), в броузере(?)).
- короткоживущий (30 мин), но многоразовый.

RefreshToken - выдается сервером по результам успешной Аутентифика́ции и используется для получения новой пары access/refresh_токенов. 
-храним в любом персистентном хранилище (persistere — упорствовать). В броузере в форме его куков(?).
-он долгоживущий (60 дней), но одноразовый.
-он для обращения на сервер-Аутентифика́ции.

RefreshToken в момент рефреша сравнивает себя с тем RefreshToken'ом, который лежит в БД на сервере, и, 
в случае успеха, а также если у него не истек срок, сервер рефрешит пару access/refresh_токенов.



### АЛГОРИТМ AccessToken_+_RefreshToken'ов НА КЛИЕНТЕ
Пользователь логинится в приложении, передавая логин/пароль и fingerprint браузера (или некий иной уникальный идентификатор устройства - GUI, если это не браузер).
Сервер проверят подлинность логина/пароля,
В случае удачи создает и записывает сессию в БД { userId: uuid, refreshToken: uuid, expiresIn: int, fingerprint: string, ... }
Отправляет клиенту два токена AccessToken- и RefreshToken-uuid (взятый из выше созданной сессии)
"accessToken": "eyJhbGciOiJIUzI1NiIs...",
"refreshToken": "9f34dd3a-ff8d-43aa-b286-9f22555319f6"
Клиент сохраняет токены(access в памяти приложения, refresh персистентно), используя AccessToken для последующей авторизации запросов.

#### Перед каждым запросом 
клиент предварительно проверяет время жизни access token'а 
(берем expires_in прямо из JWT в клиентском приложении) и,
если оно истекло, использует refresh token что бы обновить ОБА токена и продолжает использовать новый access token. 
Для большей уверенности можем обновлять токены на несколько секунд раньше.


#### Перед каждым запросом еще раз.
Клиент(фронтенд) проверяет перед запросом не истекло ли время жизни access token'на
Если истекло клиент отправляет на auth/refresh-token { refreshToken: uuid, fingerprint: string }
Сервер получает запись сессии по UUID'у рефреш токена
Cохраняет текущую сессию в переменную и удаляет ее из таблицы
Проверяет текущую сессию:
- Не истекло ли время жизни
- На соответствие старого fingerprint'a полученного из текущей сессии с новым полученным из тела запроса
  В случае негативного результата бросает ошибку TOKEN_EXPIRED/INVALID_SESSION
  В случае успеха создает новую сессию и записывает ее в БД
  Создает новый access token
  Отправляет клиенту { accessToken, refreshToken }.



## Библиотека для хеширования: https://github.com/Valve/fingerprintjs2
Более подробно: https://player.vimeo.com/video/151208427
Пример ф-ции получения такого хеша: https://gist.github.com/zmts/b26ba9a61aa0b93126fc6979e7338ca3



# Пример имплементации.
## Front-end
https://github.com/zmts/beauty-vuejs-boilerplate/blob/master/src/services/http.init.js
https://github.com/zmts/beauty-vuejs-boilerplate/blob/master/src/services/auth.service.js

## Back-end
https://github.com/zmts/supra-api-nodejs/tree/master/actions/auth





