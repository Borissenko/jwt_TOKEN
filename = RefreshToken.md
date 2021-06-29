# RefreshToken
- это рандомная строка,
может быть вообще без какой-либо смысловой нагрузки.

# Способы генерации RefreshToken
#a) Строка со смыслом.
- Первые 6 знаков - это дата валидности RefreshToken'a.
- Случайная строка из 12 знаков,
- Из AccessToken берем последние 6 знаков - для привязки RefreshToken к AccessToken'у.
  (Позже при рефреше проводим проверку содружественности токенов.)

Склеиваем.
Шифруем.
###PIN — (обычно 4 или 6 значное число) — используется для шифрования/дешифрования RefreshToken.




# Обработка RefreshToken'а.
Сохраняем на клиенте в виде куки.
Для куки прописываем параметры:
  {
  HttpOnly;
  SameSite=Strict;
  domain: '.super.com',
  path: '/api/auth/login, /api/auth/refresh-tokens, /api/auth/logout',    // адреса эндпоинтов аутентификации (/api/auth/login, /api/auth/refresh-tokens, /api/auth/logout), которые должны располагаться в доменном пространстве сайта.
  max-age=3600
  }

На сервере храним в данных юзера.
Проверяем
- что это непросроченный RefreshToken,
- что это ПОСЛЕДНИЙ из выданных.



# 
RefreshToken - просто рамдомная строка, в ней НЕ обозначен срок жизни,
срок жизни обозначаем:
- в сроке жизни куки, в состав которой входит RefreshToken,
- в refreshSession, который храниться на сервере.
{
    "id" SERIAL PRIMARY KEY,
    "userId" uuid REFERENCES users(id) ON DELETE CASCADE,   <<<<
    "refreshToken" uuid NOT NULL,  <<<<
    "ua" character varying(200) NOT NULL, /* user-agent */
    "fingerprint" character varying(200) NOT NULL,
    "ip" character varying(15) NOT NULL,
    "expiresIn" bigint NOT NULL,   <<< равен maxAge у куки
    "createdAt" timestamp with time zone NOT NULL DEFAULT now()
}













