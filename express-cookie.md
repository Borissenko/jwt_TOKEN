# Обработка cookie в express
npm install cookie-parser

# 
const cookieParser = require('cookie-parser')

app.use(cookieParser('secret key'))

app.get('/get-cookie', (req, res) => {
  console.log('Cookie: ', req.cookies)       //читаем куки.
  res.send('Get Cookie')
})

app.get('/set-cookie', (req, res) => {
  res.cookie('token', '12345ABCDE', {        //устанавливаем куку.
    maxAge: 3600 * 24,
    secure: true,
  })

  res.send('Set Cookie')
})

res.clearCookie() - удаляет по заданному ключу значение у клиента, если ключ не задан - удаляет все.