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
  aperturaTurno,
  agregarNovedadAlTurnoApertura,
  updateAperturaTardeUno,
  agregarNovedadAlTurnoTardeUno,
  updateAperturaTardeDos,
  agregarNovedadAlTurnoTardeDos,
  updateAperturaTurnoNocheUno,
  agregarNovedadAlTurnoNocheUno,
  cierreTurno,
  obtenerTurnoAbierto,
  obtenerTodosLosTurnosPorFecha,
  // Premios
  nuevoPremio,
  editarPremio,
  borrarPremio,
  obtenerPremiosDelTurnoAbierto,
  obtenerPremiosPorCliente,
  obtenerPremiosMensuales,
  obtenerPremiosMensualesAnuales,
  obtenerPremiosDiariosDeLaSemana,
  obtenerPremiosDeSlotPorFecha,
  obtenerPremiosSlotsPorFecha,
  // Registros de clientes
  registroDeIngresoDeCliente,
  modificarRegistroDeIngresoDeCliente,
  registroDeEgresoDeCliente,
  modificarRegistroDeEgresoDeCliente,
  eliminarRegistroDeCliente,
  agregarObservacionACliente,
  obtenerRegistrosDeClientesTurnoAbierto,
  obtenerRegistrosDeClientesPorFecha,
  modificarClienteUObservacionEnRegistro,
  // Canjes de productos
  canjeDeProducto,
  modificarCanjeDeProducto,
  borrarCanjeDeProducto,
  obtenerCanjesDeProductos,
  obtenerCanjesDeProductosDelTunoAbierto,
  obtenerCanjesDeProductosPorFecha,
  // Venta de tickets
  ventaDeTicket,
  modificarVentaDeTicket,
  borrarVentaDeTicket,
  obtenerVentasDeTickets,
  obtenerVentasDeTicketsDelTurnoAbierto,
  obtenerVentasDeTicketsPorFecha,
  // Clientes VIP
  obtenerClientesVip,
  obtenerClientesVipParaIngreso,
  obtenerListaDeClientesVip,
  editarDetallesDeCliente,
  // Gastronomía
  crearTipoDePlato,
  modificarTipoDePlato,
  borrarTipoDePlato,
  crearTipoDeComida,
  modificarTipoDeComida,
  borrarTipoDeComida,
  obtenerTipoDePlatos,
  obtenerTipoComidas,
  crearMenuVip,
  modificarMenuVip,
  borrarMenuVip,
  menuItemDisponibleEditar,
  obtenerMenusVip,
  crearRegistroGastronomiaVip,
  modificarRegistroGastronomiaVip,
  borrarRegistroGastronomiaVip,
  obtenerRegistrosGastronomiaVipTurnoAbierto,
  marcarEntregaDePlato,
  obtenerRegistroGastronomiaVipPorFecha

} = require("../controllers/gestionVip.js");

router.post("/aperturaTurno", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), aperturaTurno);

router.post("/agregarNovedadAlTurnoApertura", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), agregarNovedadAlTurnoApertura);

router.post("/actualizarAperturaTardeUno", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), updateAperturaTardeUno);

router.post("/agregarNovedadAlTurnoTardeUno", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), agregarNovedadAlTurnoTardeUno);

router.post("/actualizarAperturaTardeDos", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), updateAperturaTardeDos);

router.post("/agregarNovedadAlTurnoTardeDos", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), agregarNovedadAlTurnoTardeDos);

router.post("/actualizarAperturaTurnoNocheUno", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), updateAperturaTurnoNocheUno);

router.post("/agregarNovedadAlTurnoNocheUno", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), agregarNovedadAlTurnoNocheUno);

router.post("/cierreTurno", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), cierreTurno);

router.get("/obtenerTurnoAbierto", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerTurnoAbierto);

router.get("/obtenerTodosLosTurnosPorFecha", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerTodosLosTurnosPorFecha);

// PREMIOS 

router.post("/nuevoPremio", authenticateToken, verifyRoles("*",["VIP", "Jefe", "Gerente"]),  nuevoPremio);

router.put("/editarPremio", authenticateToken, verifyRoles("*",["VIP", "Jefe", "Gerente"]), editarPremio);

router.put("/borrarPremio", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), borrarPremio);

router.get("/obtenerPremiosDelTurnoAbierto", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerPremiosDelTurnoAbierto);

router.get("/obtenerPremiosPorCliente", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerPremiosPorCliente);

router.get("/obtenerPremiosMensuales", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerPremiosMensuales);

router.get("/obtenerPremiosMensualesAnuales", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerPremiosMensualesAnuales);

router.get("/obtenerPremiosDiariosDeLaSemana", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerPremiosDiariosDeLaSemana);

router.get("/obtenerPremiosDeSlotPorFecha", authenticateToken, verifyRoles("*", "*"), obtenerPremiosDeSlotPorFecha);

router.get("/obtenerPremiosSlotsPorFecha", authenticateToken, verifyRoles("*", "*"), obtenerPremiosSlotsPorFecha);

// REGISTROS DE CLIENTES

router.post("/registroDeIngresoDeCliente", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), registroDeIngresoDeCliente);

router.put("/modificarRegistroDeIngresoDeCliente", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), modificarRegistroDeIngresoDeCliente);

router.put("/registroDeEgresoDeCliente", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), registroDeEgresoDeCliente);

router.put("/modificarRegistroDeEgresoDeCliente", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), modificarRegistroDeEgresoDeCliente);

router.put("/eliminarRegistroDeCliente", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), eliminarRegistroDeCliente);

router.put("/agregarObservacionACliente", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), agregarObservacionACliente);

router.get("/obtenerRegistrosDeClientesTurnoAbierto", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerRegistrosDeClientesTurnoAbierto);

router.get("/obtenerRegistrosDeClientesPorFecha", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerRegistrosDeClientesPorFecha);

router.put("/modificarClienteUObservacionEnRegistro", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), modificarClienteUObservacionEnRegistro);

// CANJES DE PRODUCTOS

router.post("/canjeDeProducto", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), canjeDeProducto);

router.put("/modificarCanjeDeProducto", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), modificarCanjeDeProducto);

router.put("/borrarCanjeDeProducto", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), borrarCanjeDeProducto);

router.get("/obtenerCanjesDeProductos", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerCanjesDeProductos);

router.get("/obtenerCanjesDeProductosDelTunoAbierto", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerCanjesDeProductosDelTunoAbierto);

router.get("/obtenerCanjesDeProductosPorFecha", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerCanjesDeProductosPorFecha);

// VENTA DE TICKETS

router.post("/ventaDeTicket", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), ventaDeTicket);

router.put("/modificarVentaDeTicket", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), modificarVentaDeTicket);

router.put("/borrarVentaDeTicket", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), borrarVentaDeTicket);

router.get("/obtenerVentasDeTickets", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerVentasDeTickets);

router.get("/obtenerVentasDeTicketsDelTurnoAbierto", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerVentasDeTicketsDelTurnoAbierto);

router.get("/obtenerVentasDeTicketsPorFecha", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerVentasDeTicketsPorFecha);

// CLIENTES VIP

router.get("/obtenerClientesVip", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerClientesVip);

router.get("/obtenerClientesVipParaIngreso", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerClientesVipParaIngreso);

router.get("/obtenerListaDeClientesVip", authenticateToken, verifyRoles(["supervisor", "jefatura", "asistente"], ["VIP", "Jefe", "Gerente"]), obtenerListaDeClientesVip);

router.put("/editarDetallesDeCliente", authenticateToken, verifyRoles(["supervisor", "jefatura"], ["VIP", "Jefe", "Gerente"]), editarDetallesDeCliente);

// GASTRONOMÍA

router.post("/crearTipoDePlato", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), crearTipoDePlato);

router.put("/modificarTipoDePlato", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), modificarTipoDePlato);

router.put("/borrarTipoDePlato", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), borrarTipoDePlato);

router.post("/crearTipoDeComida", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), crearTipoDeComida);

router.put("/modificarTipoDeComida", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), modificarTipoDeComida);

router.put("/borrarTipoDeComida", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), borrarTipoDeComida);

router.get("/obtenerTipoDePlatos", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerTipoDePlatos);

router.get("/obtenerTipoComidas", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerTipoComidas);

router.post("/crearMenuVip", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), crearMenuVip);

router.put("/modificarMenuVip", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), modificarMenuVip);

router.put("/borrarMenuVip", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), borrarMenuVip);

router.put("/menuItemDisponibleEditar", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), menuItemDisponibleEditar);

router.get("/obtenerMenusVip", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerMenusVip);

router.post("/crearRegistroGastronomiaVip", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), crearRegistroGastronomiaVip);

router.put("/modificarRegistroGastronomiaVip", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), modificarRegistroGastronomiaVip);

router.put("/borrarRegistroGastronomiaVip", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), borrarRegistroGastronomiaVip);

router.get("/obtenerRegistrosGastronomiaVipTurnoAbierto", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerRegistrosGastronomiaVipTurnoAbierto);

router.put("/marcarEntregaDePlato", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), marcarEntregaDePlato);

router.get("/obtenerRegistroGastronomiaVipPorFecha", authenticateToken, verifyRoles("*", ["VIP", "Jefe", "Gerente"]), obtenerRegistroGastronomiaVipPorFecha);

module.exports = router;