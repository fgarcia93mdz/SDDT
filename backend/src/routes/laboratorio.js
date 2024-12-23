var express = require("express");
var router = express.Router();
const multer = require("multer");
const { authenticateToken } = require("../middlewares/authenticateToken.js");
//- Esto sirve para que se pueda guardar la auditoría de los cambios en la base de datos
//- const auditMiddleware = require("../middlewares/auditMiddleware.js");
const verifyRoles = require("../middlewares/verifyRoles.js");
const ROLES = require("../config/roles.js");
const path = require("path");

const {
  // Categorías de Insumos, Repuestos y Herramientas
  generarCategoria,
  editarCategoria,
  eliminarCategoria,
  obtenerCategorias,
  // Modelos de Insumos, Repuestos y Herramientas
  generarModelo,
  editarModelo,
  eliminarModelo,
  obtenerModelos,
  // Marcas de Insumos, Repuestos y Herramientas
  generarMarca,
  editarMarca,
  eliminarMarca,
  obtenerMarcas,
  // Herramientas de Laboratorio
  generarHerramientaPrestada,
  editarHerramientaPrestada,
  eliminarHerramientaPrestada,
  devolucionDeHerramienta,
  obtenerHerramientasPrestadas,
  obtenerHerramientasPrestadasPorUsuario,
  obtenerHerramientaRetiradasPorUsuario,
  obtenerHerramientasPorFecha,
  // Ubicaciones de Insumos, Repuestos y Herramientas
  generarUbicacion,
  editarUbicacion,
  eliminarUbicacion,
  obtenerUbicaciones,
  // Carga de Insumos
  cargarInsumo,
  retirarInsumo,
  editarInsumo,
  eliminarInsumo,
  obtenerInsumosCargados,
  obtenerInsumosRetirados,
  obtenerInsumosCargadosPorFecha,
  // Carga de Repuestos
  cargarRepuesto,
  retirarRepuesto,
  editarRepuesto,
  eliminarRepuesto,
  obtenerRepuestosCargados,
  obtenerRepuestosRetirados,
  obtenerRepuestosCargadosPorFecha,
} = require("../controllers/laboratorio.js");

// Categorías de Insumos, Repuestos y Herramientas
router.post("/generarCategoria", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), generarCategoria);
router.put("/editarCategoria", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), editarCategoria);
router.put("/eliminarCategoria", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), eliminarCategoria);
router.get("/obtenerCategorias", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), obtenerCategorias);

// Modelos de Insumos, Repuestos y Herramientas
router.post("/generarModelo", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), generarModelo);
router.put("/editarModelo", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), editarModelo);
router.put("/eliminarModelo", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), eliminarModelo);
router.get("/obtenerModelos", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), obtenerModelos);

// Marcas de Insumos, Repuestos y Herramientas
router.post("/generarMarca", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), generarMarca);
router.put("/editarMarca", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), editarMarca);
router.put("/eliminarMarca", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), eliminarMarca);
router.get("/obtenerMarcas", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), obtenerMarcas);

// Herramientas de Laboratorio
router.post("/generarHerramientaPrestada", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), generarHerramientaPrestada);
router.put("/editarHerramientaPrestada", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), editarHerramientaPrestada);
router.put("/eliminarHerramientaPrestada", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), eliminarHerramientaPrestada);
router.put("/devolucionDeHerramienta", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), devolucionDeHerramienta);
router.get("/obtenerHerramientasPrestadas", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), obtenerHerramientasPrestadas);
router.get("/obtenerHerramientasPrestadasPorUsuario", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), obtenerHerramientasPrestadasPorUsuario);
router.get("/obtenerHerramientaRetiradasPorUsuario", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), obtenerHerramientaRetiradasPorUsuario);
router.get("/obtenerHerramientasPorFecha", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), obtenerHerramientasPorFecha);

// Ubicaciones de Insumos, Repuestos y Herramientas
router.post("/generarUbicacion", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), generarUbicacion);
router.put("/editarUbicacion", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), editarUbicacion);
router.put("/eliminarUbicacion", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), eliminarUbicacion);
router.get("/obtenerUbicaciones", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), obtenerUbicaciones);

// Carga de Insumos
router.post("/cargarInsumo", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), cargarInsumo);

router.put("/retirarInsumo", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), retirarInsumo);

router.put("/editarInsumo", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), editarInsumo);

router.put("/eliminarInsumo", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), eliminarInsumo);

router.get("/obtenerInsumosCargados", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), obtenerInsumosCargados);

router.get("/obtenerInsumosRetirados", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), obtenerInsumosRetirados);

router.get("/obtenerInsumosCargadosPorFecha", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), obtenerInsumosCargadosPorFecha);

// Carga de Repuestos

router.post("/cargarRepuesto", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), cargarRepuesto);

router.put("/retirarRepuesto", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), retirarRepuesto);

router.put("/editarRepuesto", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), editarRepuesto);

router.put("/eliminarRepuesto", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), eliminarRepuesto);

router.get("/obtenerRepuestosCargados", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), obtenerRepuestosCargados);

router.get("/obtenerRepuestosRetirados", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), obtenerRepuestosRetirados);

router.get("/obtenerRepuestosCargadosPorFecha", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Laboratorio"]), obtenerRepuestosCargadosPorFecha);




module.exports = router;