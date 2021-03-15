//https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
//https://codengineering.ru/q/secure-random-token-in-node-js-23077

//1a. If you're able to do this server-side, just use the crypto module -
var crypto = require("crypto");
var id = crypto.randomBytes(20).toString('hex');    //'hex'- это вид кодировки.
var id = crypto.randomBytes(20).toString('base64').replace(/\W/g, '')


//1b. Асинхронный вариант.
//https://codengineering.ru/q/secure-random-token-in-node-js-23077
const crypto = require('crypto');

function generateToken({ stringBase = 'base64', byteLength = 48 } = {}) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(byteLength, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString(stringBase));
      }
    });
  });
}

async function handler(req, res) {
  // default token length
  const newToken = await generateToken();
  console.log('newToken', newToken);
  
  // pass in parameters - adjust byte length
  const shortToken = await generateToken({byteLength: 20});
  console.log('newToken', shortToken);
}



//2. If you have to do this client-side, perhaps try the uuid module -
var uuid = require("uuid");
var id = uuid.v4();




//3. If you have to do this client-side and you don't have to support old browsers, you can do it without dependencies -

// dec2hex :: Integer -> String
// i.e. 0-255 -> '00'-'ff'
function dec2hex (dec) {
  console.log('=======dec', dec)
  return dec.toString(16).padStart(2, "0")
}

// generateId :: Integer -> String
function generateId (len) {
  var arr = new Uint8Array((len || 40) / 2)
  window.crypto.getRandomValues(arr)
  return Array.from(arr, dec2hex).join('')
}

console.log(generateId())
// "82defcf324571e70b0521d79cce2bf3fffccd69"

console.log(generateId(20))
// "c1a050a4cd1556948d41"

// For IE11 support you can use -
(window.crypto || window.msCrypto).getRandomValues(arr)




//4. npm install randomstring
// https://www.npmjs.com/package/randomstring





