const express = require('express')
const router = express.Router();
//- Esto sirve para que se pueda guardar la auditoría de los cambios en la base de datos
//- const auditMiddleware = require("../middlewares/auditMiddleware.js");
const { authenticateToken } = require("../middlewares/authenticateToken.js");
const {
  login,
  logout,
  logOutOtherUser,
} = require("../controllers/autentificacion.js");

router.post("/ingreso", login);

router.get("/egreso", authenticateToken, logout);

router.post("/egresoOtroUsuario", authenticateToken, logOutOtherUser);

router.get('/verificarToken', authenticateToken, (req, res) => {
  res.status(200).json({ mensaje: 'Token válido' });
});

module.exports = router;
