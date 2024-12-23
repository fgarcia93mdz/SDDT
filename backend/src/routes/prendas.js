var express = require("express");
var router = express.Router();
const multer = require("multer");
const { authenticateToken } = require("../middlewares/authenticateToken.js");
//- Esto sirve para que se pueda guardar la auditoría de los cambios en la base de datos
//- const auditMiddleware = require("../middlewares/auditMiddleware.js");
const verifyRoles = require("../middlewares/verifyRoles");
const ROLES = require("../config/roles");
const SUBROLES = require("../config/subroles");
const path = require("path");

const {
  registrarPrenda,
  retirarPrenda,
  agregarMasPrendas,
  obtenerPrenda,
  entregaParcialPrenda,
  detalleRetirarPrenda,
  obtenerPrendasEnResguardo,
  obtenerPrendasEntregadas,
  obtenerPrendasOlvidadas,
  obtenerClientesFrecuentes,
  aperturaTurno,
  cierreTurnoParcial,
  cierreTurno,
  modificarUltimaUbicacion,
  tipoDePrenda,
  promedioOcupacionGuardarropa,
  ultimoTurno,
  ultimaUbicacion,
  tiempoDeCargaPrenda,
  obtenerTiempoDeCargaPrenda,
  obtenerTiempoDeCargaAnual,
  obtenerDatosParaGraficos,
  eliminarTipoDePrenda,
  editarTipoDePrenda,
  crearTipoDePrenda,
  obtenerPrendasPorFechasYTipo,
  obtenerTurnoAbierto,
  obtenerTodosLosTurnos,
  obtenerEstadisticasPrendasPorDiaDeLaSemana,
  obtenerEstadisticasPrendasPorAno,
  obtenerEstadisticasPrendasPorHoraMensual,
  reenviarAlertaDeOlvido,
  borrarPrenda,
  borrarPrendaEntregada,
  editarPrendaDetalle,
  borrarPrendaDetalle,
  obtenerDNIMasUtilizadosPorHora,
  pasarPrendaAOlvidada,
  pasarPrendaOlvidadaADonada,
  obtenerPrendasOlvidadasYDonadas,
  obtenerPrendasPorTipoYEstado,
  obtenerPromedioTiempoPermanencia,
  obtenerEstadisticasPrendasPorMes
} = require("../controllers/prendas.js");

// Rutas para la gestión de prendas
router.post("/registrarPrenda", authenticateToken, registrarPrenda);
router.post("/retirarPrenda", authenticateToken, retirarPrenda);
router.post("/agregarMasPrendas", authenticateToken, agregarMasPrendas);
router.post("/entregaParcialPrenda", authenticateToken, entregaParcialPrenda);
router.get("/obtenerPrenda", authenticateToken, obtenerPrenda);
router.get("/detalleRetirarPrenda", authenticateToken, detalleRetirarPrenda);
router.get("/obtenerPrendasResguardo", authenticateToken, obtenerPrendasEnResguardo);
router.get("/obtenerPrendasEntregadas", authenticateToken, obtenerPrendasEntregadas);
router.get("/obtenerPrendasOlvidadas", authenticateToken, obtenerPrendasOlvidadas);
router.get("/obtenerPrendasPorFechasYTipo", authenticateToken, obtenerPrendasPorFechasYTipo);
router.get("/obtenerClientesFrecuentes", authenticateToken, obtenerClientesFrecuentes);
router.put("/borrarPrenda", authenticateToken, borrarPrenda);
router.put("/borrarPrendaEntregada", authenticateToken, borrarPrendaEntregada);
router.put("/reenviarAlertaDeOlvido", authenticateToken, reenviarAlertaDeOlvido);
router.put("/editarPrendaDetalle", authenticateToken, editarPrendaDetalle);
router.put("/borrarPrendaDetalle", authenticateToken, borrarPrendaDetalle);
router.put("/pasarPrendaAOlvidada", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa"]), pasarPrendaAOlvidada);
router.post("/pasarPrendaOlvidadaADonada", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa"]), pasarPrendaOlvidadaADonada);

// Rutas para la gestión de turnos
router.post("/aperturaTurno", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa"]), aperturaTurno);
router.post("/cierreTurnoParcial", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa"]), cierreTurnoParcial);
router.post("/cierreTurno", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa"]), cierreTurno);
router.get("/obtenerTurnoAbierto", authenticateToken, obtenerTurnoAbierto);
router.get("/obtenerTodosLosTurnos", authenticateToken, obtenerTodosLosTurnos);
router.get("/ultimoTurnoAbierto", authenticateToken, ultimoTurno);

// Rutas para la gestión de tipos de prenda
router.get("/tipoDePrenda", authenticateToken, tipoDePrenda);
router.put("/eliminarTipoDePrenda", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa"]), eliminarTipoDePrenda);
router.put("/editarTipoDePrenda", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa"]), editarTipoDePrenda);
router.post("/crearTipoDePrenda", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["Guardarropa"]), crearTipoDePrenda);
router.get("/obtenerPrendasOlvidadasYDonadas", authenticateToken, obtenerPrendasOlvidadasYDonadas);
router.get("/obtenerPrendasPorTipoYEstado", authenticateToken, obtenerPrendasPorTipoYEstado);


// Rutas para estadísticas y datos
router.get("/promedioOcupacionGuardarropa", authenticateToken, promedioOcupacionGuardarropa);
router.post("/tiempoDeCargaPrenda", authenticateToken, tiempoDeCargaPrenda);
router.get("/obtenerTiempoDeCargaPrenda", authenticateToken, obtenerTiempoDeCargaPrenda);
router.get("/obtenerTiempoDeCargaAnual", authenticateToken, obtenerTiempoDeCargaAnual);
router.get("/obtenerDatosParaGraficos", authenticateToken, obtenerDatosParaGraficos);
router.get("/obtenerEstadisticasPrendasPorDiaDeLaSemana", authenticateToken, obtenerEstadisticasPrendasPorDiaDeLaSemana);
router.get("/obtenerEstadisticasPrendasPorAno", authenticateToken, obtenerEstadisticasPrendasPorAno);
router.get("/obtenerEstadisticasPrendasPorHoraMensual", authenticateToken, obtenerEstadisticasPrendasPorHoraMensual);
router.get("/obtenerDNIMasUtilizadosPorHora", authenticateToken, obtenerDNIMasUtilizadosPorHora);
router.get("/obtenerPromedioTiempoPermanencia", authenticateToken, obtenerPromedioTiempoPermanencia);
router.get("/obtenerEstadisticasPrendasPorMes", authenticateToken, obtenerEstadisticasPrendasPorMes);


// Ubicación
router.put("/modificarUltimaUbicacion", authenticateToken, modificarUltimaUbicacion);
router.get("/ultimaUbicacion", authenticateToken, ultimaUbicacion);


module.exports = router;