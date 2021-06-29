# Обработка cookie в express
npm install cookie-parser

# 
const cookieParser = require('cookie-parser')

app.use(cookieParser('secret key'))

app.get('/get-cookie', (req, res) => {
  console.log('Cookie: ', req.cookies)       //читаем куки на сервере.
  res.send('Get Cookie')
})

app.get('/set-cookie', (req, res) => {
  res.cookie('token', '12345ABCDE', {        //устанавливаем куку из сервера.
    //maxAge: 3600 * 24,
    expires: new Date(Date.now() + 900000)
    secure: true,
  })

  res.send('Set Cookie')
})

res.clearCookie('token') - удаляет по заданному ключу значение у клиента, если ключ не задан - удаляет все.
