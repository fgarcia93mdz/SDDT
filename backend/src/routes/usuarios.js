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
  registrarUsuario,
  reenviarPassword,
  getRoles,
  getSubRoles,
  changeFirstPassword,
  changePassword,
  editarUsuario,
  obtenerUsuarios,
  eliminarUsuario,
  obtenerUsuarioPorId,
  generarCodigoCambioClave,
  obtenerUsuariosEnLinea,
  obtenerUsuariosLogs,
  solicitarAyuda,
  logOutOtherUser,
  obtenerProcedimiento,
  subirArchivoProcedimiento,
  obtenerUsuariosLaboratorio,
  asignarUsuarioLaboratorioASala,
  obtenerUsuariosLaboratorioPorSala,
  obtenerTiposDeSalas,
  upload
} = require("../controllers/usuarios.js");

router.post("/registrarUsuario", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa", "Jefe", "Gerente"]), registrarUsuario);

router.put("/reenviarPassword", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa", "Jefe", "Gerente"]), reenviarPassword);

router.get("/roles", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa", "Jefe", "Gerente"]), getRoles);

router.get("/subRoles", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa", "Jefe", "Gerente"]), getSubRoles);

router.post("/changeFirstPassword", authenticateToken, changeFirstPassword);

router.post("/changePassword", authenticateToken, changePassword);

router.put("/editarUsuario", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa", "Jefe", "Gerente"]), editarUsuario);

router.get("/obtenerUsuarios", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa", "Jefe", "Gerente"]), obtenerUsuarios);

router.put("/eliminarUsuario", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa", "Jefe", "Gerente"]), eliminarUsuario);

router.get("/obtenerUsuarioPorId/:id", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa", "Jefe", "Gerente"]), obtenerUsuarioPorId);

router.post("/generarCodigoCambioClave", authenticateToken, generarCodigoCambioClave);

router.get("/obtenerUsuariosEnLinea", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa", "Jefe", "Gerente"]), obtenerUsuariosEnLinea);

router.get("/obtenerUsuariosLogs", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa", "Jefe", "Gerente"]), obtenerUsuariosLogs);

router.post("/solicitarAyuda", authenticateToken, solicitarAyuda);

router.post("/egresoOtroUsuario", authenticateToken, logOutOtherUser);

router.get("/procedimiento/guardarropas", authenticateToken, obtenerProcedimiento);

router.get("/obtenerUsuariosLaboratorio", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio", "Gerente"]), obtenerUsuariosLaboratorio);

router.post("/asignarUsuarioLaboratorioASala", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio", "Gerente"]), asignarUsuarioLaboratorioASala);

router.get("/obtenerUsuariosLaboratorioPorSala/:id", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio", "Gerente"]), obtenerUsuariosLaboratorioPorSala);

router.get("/obtenerTiposDeSalas", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio", "Gerente"]), obtenerTiposDeSalas);


router.post('/subirArchivoProcedimiento', authenticateToken, upload.single('file'), subirArchivoProcedimiento);


module.exports = router;