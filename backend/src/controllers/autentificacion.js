const jwt = require("jsonwebtoken");
const ejs = require("ejs");
const fs = require('fs');
const path = require('path');
const db = require("../database/models");
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();
const moment = require("moment");

const Usuario = db.Usuario;
const BlackListToken = db.BlackListToken;
const UsuariosLog = db.UsuariosLog;

// function generateAccessToken(usuario) {
//   return jwt.sign(usuario, process.env.TOKEN_SECRET, { expiresIn: '180m' });
// }

function generateAccessToken(usuario) {
  return jwt.sign(usuario, process.env.TOKEN_SECRET);
}

const login = async (req, res) => {
  const { io } = require('../app');
  const { legajo, clave } = req.body;
  if (!legajo || !clave) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  const usuario = await Usuario.findOne({
    where: { legajo }
  });
  if (!usuario) {
    return res.status(400).json({ message: "Verifica tus datos ingresados" });
  }

  const validPassword = bcryptjs.compareSync(clave, usuario.clave);
  if (!validPassword) {
    return res.status(400).json({ message: "Verifica tus datos ingresados" });
  }

  if (usuario.estado === 0) {
    return res.status(400).json({ message: "Contacta al supervisor por tu usuario", estado: 0 });
  }

  const sesionActiva = await UsuariosLog.findOne({
    where: {
      usuario_id: usuario.id,
      estado: 1,
      detalle: "ingreso",
      fecha_egreso: null
    }
  });

  if (sesionActiva) {
    const logOpen = await UsuariosLog.findOne({
      where: {
        usuario_id: sesionActiva.usuario_id,
        estado: 1,
        detalle: "ingreso",
        fecha_egreso: null
      }
    });

    if (!logOpen) {
      return res.status(400).json({ message: "No se encuentra una sesión abierta" });
    }

    logOpen.fecha_egreso = new Date();
    const diferenciaMs = logOpen.fecha_egreso - logOpen.fecha_ingreso;
    let tiempoSesion;
    let unidad;

    if (diferenciaMs < 60000) {
      tiempoSesion = Math.round(diferenciaMs / 1000);
      unidad = 'segundos';
    } else if (diferenciaMs < 3600000) {
      tiempoSesion = Math.round(diferenciaMs / 60000);
      unidad = 'minutos';
    } else {
      tiempoSesion = Math.round(diferenciaMs / 3600000);
      unidad = 'horas';
    }

    logOpen.tiempo_sesion = `${tiempoSesion} ${unidad}`;
    logOpen.detalle = 'cierre sesión forzado';
    logOpen.estado = 0;
    await logOpen.save();

    await BlackListToken.update({ estado: 0 }, { where: { estado: 1, usuario_id: sesionActiva.usuario_id } });

    await UsuariosLog.create({ usuario_id: usuario.id, fecha_ingreso: new Date(), detalle: "ingreso", estado: 1 });

    const accessToken = generateAccessToken({
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      legajo: usuario.legajo,
      rol_id: usuario.roles_id,
      sub_rol_id: usuario.sub_rol_id,
      estado_clave: usuario.estado_clave,
    });

    await BlackListToken.create({ jwt: accessToken, usuario_id: usuario.id, estado: 1 });

    const room = 'Guardarropa-TRL';
    io.to(room).emit('newConnection', {
      message: `¡${usuario.nombre} ha iniciado sesión!`,
      userId: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      legajo: usuario.legajo,
      rol_id: usuario.roles_id
    });
    io.emit('newLogin', { shouldUpdate: true });

    return res.json({ accessToken });
  } else {
    await UsuariosLog.create({ usuario_id: usuario.id, fecha_ingreso: new Date(), detalle: "ingreso", estado: 1 });

    const accessToken = generateAccessToken({
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      legajo: usuario.legajo,
      rol_id: usuario.roles_id,
      sub_rol_id: usuario.sub_rol_id,
      estado_clave: usuario.estado_clave,
    });

    await BlackListToken.create({ jwt: accessToken, usuario_id: usuario.id, estado: 1 });

    const room = 'Guardarropa-TRL';
    io.to(room).emit('newConnection', {
      message: `¡${usuario.nombre} ha iniciado sesión!`,
      userId: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      legajo: usuario.legajo,
      rol_id: usuario.roles_id
    });
    io.emit('newLogin', { shouldUpdate: true });

    return res.json({ accessToken });
  }
}

const logOutOtherUser = async (req, res) => {
  const usuario = req.usuario;
  const { usuarioId } = req.body;

  if (!usuarioId) {
    return res.status(400).json({ message: "El usuarioId es requerido" });
  }

  const logOpen = await UsuariosLog.findOne({
    where: {
      usuario_id: usuarioId,
      estado: 1,
      detalle: "ingreso",
      fecha_egreso: null
    }
  });

  if (!logOpen) {
    return res.status(400).json({ message: "No se encuentra una sesión abierta" });
  }

  logOpen.fecha_egreso = new Date();
  const diferenciaMs = logOpen.fecha_egreso - logOpen.fecha_ingreso;
  let tiempoSesion;
  let unidad;

  if (diferenciaMs < 60000) {
    tiempoSesion = Math.round(diferenciaMs / 1000);
    unidad = 'segundos';
  } else if (diferenciaMs < 3600000) {
    tiempoSesion = Math.round(diferenciaMs / 60000);
    unidad = 'minutos';
  } else {
    tiempoSesion = Math.round(diferenciaMs / 3600000);
    unidad = 'horas';
  }

  logOpen.tiempo_sesion = `${tiempoSesion} ${unidad}`;
  logOpen.detalle = `cierre sesión forzado / ${usuario.legajo} ${usuario.nombre} ${usuario.apellido}`;
  logOpen.estado = 0;
  await logOpen.save();

  const token = req.headers['authorization'].split(' ')[1];

  await BlackListToken.update({ estado: 0 }, { where: { estado: 1, usuario_id: usuarioId } });

  res.json({ message: "Egreso exitoso" });
}

const logout = async (req, res) => {
  const { io } = require('../app');
  const usuario = req.usuario;

  const logOpen = await UsuariosLog.findOne({
    where: {
      usuario_id: usuario.id,
      estado: 1,
      detalle: "ingreso",
      fecha_egreso: null
    }
  });

  if (!logOpen) {
    return res.status(400).json({ message: "No se encuentra una sesión abierta" });
  }

  logOpen.fecha_egreso = new Date();
  const diferenciaMs = logOpen.fecha_egreso - logOpen.fecha_ingreso;

  let tiempoSesion;
  let unidad;

  if (diferenciaMs < 60000) {
    tiempoSesion = Math.round(diferenciaMs / 1000);
    unidad = 'segundos';
  } else if (diferenciaMs < 3600000) {
    tiempoSesion = Math.round(diferenciaMs / 60000);
    unidad = 'minutos';
  } else {
    tiempoSesion = Math.round(diferenciaMs / 3600000);
    unidad = 'horas';
  }

  logOpen.tiempo_sesion = `${tiempoSesion} ${unidad}`;
  logOpen.detalle = "ingreso / egreso";
  logOpen.estado = 0;
  await logOpen.save();

  const token = req.headers['authorization'].split(' ')[1];

  await BlackListToken.update({ estado: 0 }, { where: { jwt: token, estado: 1, usuario_id: usuario.id } });

  const socketId = io.sockets.sockets.get(usuario.id);
  if (socketId) {
    const socket = io.sockets.sockets.get(socketId);
    socket.leave('Guardarropa-TRL');
    socket.disconnect();
  }

  res.json({ message: "Egreso exitoso" });
}

module.exports = {
  login,
  logout,
  logOutOtherUser
};