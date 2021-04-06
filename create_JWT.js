//https://xsltdev.ru/nodejs/tutorial/jwt/
const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  crypto = require('crypto'),
  users = require('./users')

const host = '127.0.0.1'
const port = 7000

const tokenKey = '1a2b-3c4d-5e6f-7g8h'

app.use(bodyParser.json())

app.use((req, res, next) => {
  if (req.headers.authorization) {
    let tokenParts = req.headers.authorization
    .split(' ')[1]
    .split('.')
    
    let signature = crypto
    .createHmac('SHA256', tokenKey)
    .update(`${tokenParts[0]}.${tokenParts[1]}`)
    .digest('base64')
    
    if (signature === tokenParts[2])
      req.user = JSON.parse(
        Buffer.from(tokenParts[1], 'base64').toString(
          'utf8'
        )
      )
    
    next()
  }
  
  next()
})

app.post('/api/auth', (req, res) => {
  for (let user of users) {
    if ( req.body.login === user.login && req.body.password === user.password) {
      
      //Генерируем AccessToken
      let head = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'jwt' })).toString('base64')
      let body = Buffer.from(JSON.stringify(user)).toString('base64')
      
      let signature = crypto
      .createHmac('SHA256', tokenKey)
      .update(`${head}.${body}`)
      .digest('base64')
      
      return res.status(200).json({
        id: user.id,
        login: user.login,
        token: `${head}.${body}.${signature}`,
      })
    }
  }
  
  return res.status(404).json({ message: 'User not found' })
})

app.get('/user', (req, res) => {
  if (req.user) return res.status(200).json(req.user)
  else
    return res
    .status(401)
    .json({ message: 'Not authorized' })
})

app.listen(port, host, () =>
  console.log(`Server listens http://${host}:${port}`)
)


const users = [
  {
    "id": 1,
    "login": "user1",
    "password": "password1"
  },
  {
    "id": 2,
    "login": "user2",
    "password": "password2"
  },
  {
    "id": 3,
    "login": "user3",
    "password": "password3"
  }
]


