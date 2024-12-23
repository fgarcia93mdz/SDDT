const jwt = require('jsonwebtoken');
const db = require("../database/models");
const BlackListToken = db.BlackListToken;

require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ mensaje: "falta token" });

  BlackListToken.findOne({ where: { jwt: token, estado: 0 } })
    .then(blacklistedToken => {
      if (blacklistedToken) {
        return res.status(403).json({ error: 'Por favor token expirado por cierre de sesión' });
      }
      jwt.verify(token, process.env.TOKEN_SECRET, (err, usuario) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            return res.status(403).json({ error: 'El token ha expirado, por favor inicie sesión de nuevo' });
          }
          return res.status(403).json({ err });
        }
        if (usuario.exp === 0) {
          return res.status(403).json({ error: 'El token ha expirado, por favor inicie sesión de nuevo' });
        }
        req.usuario = usuario;
        next();
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Error al verificar el token' });
    });
};

module.exports = { authenticateToken };