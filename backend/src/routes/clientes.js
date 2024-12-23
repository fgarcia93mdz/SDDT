var express = require("express");
var router = express.Router();
const multer = require("multer");
const { authenticateToken } = require("../middlewares/authenticateToken.js");
//- Esto sirve para que se pueda guardar la auditoría de los cambios en la base de datos
//- const auditMiddleware = require("../middlewares/auditMiddleware.js");
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES = require("../config/roles");
const path = require("path");

const {
  registrarCliente,
  obtenerClientes,
  obtenerCliente,
  actualizarCliente,
  registrarExpulsado,
  obtenerEstadoCliente,
  obtenerDetallesDeClienteId,
  obtenerDniClientes,
  eliminarCliente,
  obtenerCategoriasHit,
} = require("../controllers/clientes.js");

router.post("/registrar", authenticateToken, registrarCliente);

router.get("/obtenerClientes", authenticateToken, obtenerClientes);

router.get("/obtenerCliente", authenticateToken, obtenerCliente);

router.put("/actualizarCliente", authenticateToken, actualizarCliente);

router.post("/registrarExpulsado", authenticateToken, registrarExpulsado);

router.get("/obtenerEstadoCliente", authenticateToken, obtenerEstadoCliente);

router.get("/obtenerDetallesDeClienteId", authenticateToken, obtenerDetallesDeClienteId);

router.get("/obtenerDniClientes", authenticateToken, obtenerDniClientes);

router.put("/eliminarCliente", authenticateToken, eliminarCliente);

router.get("/obtenerCategoriasHit", authenticateToken, obtenerCategoriasHit);


module.exports = router;