const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const secretKeyHex = crypto.randomBytes(32).toString('hex');
const secretKey = Buffer.from(secretKeyHex, 'hex'); 
console.log('Generated secretKey:', secretKeyHex);
const iv = crypto.randomBytes(16);

const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

const password = '2615995585Fgg$';
const encryptedPassword = encrypt(password);
console.log('Encrypted:', encryptedPassword);
