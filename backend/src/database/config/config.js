require('dotenv').config();
const crypto = require('crypto');

const algorithm = 'aes-256-ctr';

const decrypt = (hash, secretKeyHex) => {
  const secretKey = Buffer.from(secretKeyHex, 'hex');
  const [iv, encryptedText] = hash.split(':');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedText, 'hex')), decipher.final()]);
  return decrypted.toString();
};

const decryptedPasswordProd = decrypt(process.env.PASSWORD_PROD, process.env.SECRET_KEY_PROD);


module.exports = {
  development: {
    username: process.env.USER_NAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: process.env.DIALECT,
  },
  production: {
    username: process.env.USER_NAME_PROD,
    password: decryptedPasswordProd,
    database: process.env.DATABASE_PROD,
    host: process.env.HOST_PROD,
    dialect: process.env.DIALECT_PROD,
  }
};