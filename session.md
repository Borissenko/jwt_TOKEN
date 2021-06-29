
//https://www.webdraftt.com/tutorial/nodejs/sessions   // +redis(!).


Данные хранятся на сервере, а идентификатор сессии на стороне клиента в файле cookie.
Причем express-session по умолчанию использует 
>cookie-parser для разбора файлов cookie.


npm install express-session --save



const session = require('express-session');
const bodyParser = require('body-parser')   //Модуль body-parser необходим для корректной обработки передаваемых в теле данных.

app.use(session({
     cookie: {maxAge: 90000},
     secret: 'you secret key',
     saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



app.post('/ad', (req, res) => {
     req.session.showAd =  req.body.showAd;
     res.sendStatus(200);
});
//пользователь может указать, показывать ему на сайте рекламу или нет. 
//При выборе отправляется POST-запрос, который записывает в сессию результат, который потом доступен во всех маршрутах приложения.
    
    app.get('/', (req, res) => {
     console.log(req.session.showAd);
     res.sendStatus(200);
    });

    app.listen(port, host, function () {
     console.log(`Server listens http://${host}:${port}`);
    });

//Node js сессия считается пустой, если в конце обработки запроса в нее не было записано никаких данных.














