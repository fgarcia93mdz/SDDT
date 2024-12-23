require("dotenv").config();
const ejs = require("ejs");
const fs = require('fs');
const path = require('path');
const jwt = require("jsonwebtoken");
const db = require("../database/models");
const { Op, fn, col, literal } = require("sequelize");
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const moment = require("moment");
const { error } = require("console");
const Sequelize = require("sequelize");
const multer = require("multer");

const Usuario = db.Usuario;
const Rol = db.Rol;
const SubRol = db.SubRol;
const UsuariosLog = db.UsuariosLog;
const BlackListToken = db.BlackListToken;
const UsuarioLaboratorioSala = db.UsuarioLaboratorioSala;
const TipoSala = db.TipoSala;

const generateVerificationCode = (length) => {
  const code = crypto.randomBytes(Math.ceil(length / 2)).toString("hex");
  return code.slice(0, length);
};

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, legajo, roles_id, email, sub_rol_id } = req.body;
    if (!nombre || !apellido || !legajo || !roles_id || !email || !sub_rol_id) {
      return res.status(400).json({ message: "Faltan datos" });
    };
    const usuarioExistente = await Usuario.findOne({ where: { legajo } });
    if (usuarioExistente) {
      return res.status(400).json({ message: "El usuario ya existe" });
    };
    const password = generateVerificationCode(8);
    const salt = bcryptjs.genSaltSync(10);
    const hash = bcryptjs.hashSync(password, salt);
    const usuario = await Usuario.create({
      nombre,
      apellido,
      legajo,
      email,
      clave: hash,
      roles_id,
      sub_rol_id: sub_rol_id,
    });
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        // secure: false,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASS,
        },
      });

      const mailOptions = {
        from: {
          name: process.env.MAILER_ALIAS,
          address: process.env.MAILER_USER
        },
        to: usuario.email,
        subject: "Registro de usuario",
        html: await ejs.renderFile(path.join(__dirname, "../views/users/new_user.ejs"), { usuario, password }),
        bcc: "",
      };
      const info = await transporter.sendMail(mailOptions);
      console.log("Email enviado");
    } catch (error) {
      console.log(error, "error al enviar email");
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ message: "Usuario registrado con éxito" });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }

}

const reenviarPassword = async (req, res) => {
  try {
    const { legajo } = req.body;
    const usuario = await Usuario.findOne({ where: { legajo } });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const password = generateVerificationCode(8);
    const salt = bcryptjs.genSaltSync(10);
    const hash = bcryptjs.hashSync(password, salt);
    await Usuario.update({
      clave: hash,
      estado_clave: 0,
    }, { where: { legajo } });
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        // secure: false,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASS,
        },
      });
      const mailOptions = {
        from: {
          name: process.env.MAILER_ALIAS,
          address: process.env.MAILER_USER
        },
        to: usuario.email,
        subject: "Reenvío de contraseña",
        html: await ejs.renderFile(path.join(__dirname, "../views/users/new_password.ejs"), { usuario, password }),
        bcc: "",
      };
      const info = await transporter.sendMail(mailOptions);
      console.log("Email enviado");
    } catch (error) {
      console.log(error, "error al enviar email");
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ message: "Usuario registrado con éxito" });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }

}

const editarUsuario = async (req, res) => {
  try {
    const { id, nombre, apellido, legajo, roles_id, email, sub_rol_id } = req.body;
    const usuarioEdita = req.usuario.rol_id;

    if (!id) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const usuarioExistente = await Usuario.findOne({ where: { id } });
    if (!usuarioExistente) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (legajo && legajo !== usuarioExistente.legajo) {
      const legajoExistente = await Usuario.findOne({ where: { legajo } });
      if (legajoExistente) {
        return res.status(400).json({ message: "El usuario ya existe con ese legajo" });
      }
    }

    const datosActualizados = {
      nombre: nombre || usuarioExistente.nombre,
      apellido: apellido || usuarioExistente.apellido,
      legajo: legajo || usuarioExistente.legajo,
      email: email || usuarioExistente.email,
      roles_id: roles_id || usuarioExistente.roles_id,
      sub_rol_id: sub_rol_id || usuarioExistente.sub_rol_id,
    };

    if (![1, 2, 3].includes(usuarioEdita)) {
      return res.status(403).json({ message: "No tiene permisos para editar usuarios" });
    }

    await Usuario.update(datosActualizados, {
      where: {
        id,
      },
    });

    return res.status(200).json({ message: "Usuario editado con éxito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al editar usuario" });
  }
}

const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.usuario.id;

    if (!id || !userId) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const usuarioSolicitante = await Usuario.findOne({
      where: {
        id: userId,
      },
    });

    if (!usuarioSolicitante) {
      return res.status(404).json({ message: "Usuario solicitante no encontrado" });
    }

    if (![1, 2, 3].includes(usuarioSolicitante.roles_id)) {
      return res.status(403).json({ message: "No tiene permisos para eliminar usuarios" });
    }

    await Usuario.update({
      estado: 0,
    }, {
      where: {
        id,
      },
    });

    return res.status(200).json({ message: "Usuario eliminado con éxito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
}

const getRoles = async (req, res) => {
  try {
    const userRoleNivel = req.usuario.rol_id;

    if (!userRoleNivel) {
      return res.status(400).json({ message: "Nivel de rol del usuario no proporcionado" });
    }

    const userRoleNivelNumber = parseInt(userRoleNivel, 10);

    const roles = await Rol.findAll({
      where: {
        id: {
          [Op.gte]: userRoleNivelNumber
        }
      }
    });

    res.status(200).json(roles);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener roles" });
  }
}

const getSubRoles = async (req, res) => {
  try {
    const subRole = await SubRol.findAll();
    res.status(200).json(subRole);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener sub roles" });
  }
};

const changeFirstPassword = async (req, res) => {
  try {
    const { passwordOne, passwordTwo } = req.body;
    const userToLogin = await Usuario.findOne({
      where: {
        id: req.usuario.id,
        legajo: req.usuario.legajo,
      },
    });
    if (userToLogin === null) {
      return res.status(400).json({ mensaje: "Usuario incorrecto o no encontrado" });
    }
    if (passwordOne !== passwordTwo) {
      return res.status(400).json({ mensaje: "Las contraseñas no coinciden" });
    }
    await Usuario.update(
      {
        clave: bcryptjs.hashSync(passwordOne, 10),
        estado_clave: 1,
      },
      {
        where: {
          legajo: userToLogin.legajo,
          id: userToLogin.id,
        },
      }
    );
    return res.status(200).json({ data: "Contraseña actualizada" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { passwordOne, passwordTwo, verificationCode } = req.body;
    const userToLogin = await Usuario.findOne({
      where: {
        id: req.usuario.id,
        legajo: req.usuario.legajo,
        codigo_verificacion: verificationCode,
      },
    });
    if (userToLogin === null) {
      return res.status(400).json({ mensaje: "Usuario incorrecto o no encontrado" });
    }
    if (passwordOne !== passwordTwo) {
      return res.status(400).json({ mensaje: "Las contraseñas no coinciden" });
    }
    await Usuario.update(
      {
        clave: bcryptjs.hashSync(passwordOne, 10),
        estado_clave: 1,
      },
      {
        where: {
          legajo: userToLogin.legajo,
          id: userToLogin.id,
          codigo_verificacion: verificationCode,
        },
      }
    );
    return res.status(200).json({ data: "Contraseña actualizada" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'apellido', 'legajo', 'email', 'estado', 'roles_id', 'sub_rol_id', "estado_clave", "codigo_verificacion"],
      include: [
        {
          model: Rol,
          as: "roles",
        },
        {
          model: SubRol,
          as: "sub_roles",
        },
      ],
      where: {
        roles_id: {
          [Op.in]: [2, 3, 4]
        },
        estado: 1
      },
      order: [
        ['legajo', 'ASC']
      ]
    });
    res.status(200).json(usuarios);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findOne({
      include: [
        {
          model: Rol,
          as: "roles",
        },
        {
          model: SubRol,
          as: "sub_roles",
        },
      ],
      where: {
        id,
        estado: 1
      },
    });
    res.status(200).json(usuario);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener usuario" });
  }
};

const generarCodigoCambioClave = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({
      where: {
        legajo: req.usuario.legajo,
        id: req.usuario.id,
      },
    });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const codigo = generateVerificationCode(6);

    await Usuario.update({ codigo_verificacion: codigo }, {
      where: {
        id: usuario.id,
      },
    });

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        // secure: false,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASS,
        },
      });

      const mailOptions = {
        from: {
          name: process.env.MAILER_ALIAS,
          address: process.env.MAILER_USER
        },
        to: usuario.email,
        subject: `Código de cambio de clave`,
        html: await ejs.renderFile(path.join(__dirname, "../views/users/reset_password.ejs"), { usuario, codigo }),
        bcc: "",
      };
      const info = await transporter.sendMail(mailOptions);
      console.log("Email enviado");

      setTimeout(async () => {
        await Usuario.update({ codigo_verificacion: null }, {
          where: {
            id: usuario.id,
          },
        });
      }, 60000);

    } catch (error) {
      console.log(error, "error al enviar email");
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ message: "Enlace para cambio de contraseña enviado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al generar enlace de cambio de contraseña" });
  }
}

const obtenerUsuariosLogs = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    let fechaInicioFiltro;
    let fechaFinFiltro;

    if (fechaInicio && fechaFin) {
      fechaInicioFiltro = moment.tz(fechaInicio, 'America/Argentina/Buenos_Aires').startOf('day').toDate();
      fechaFinFiltro = moment.tz(fechaFin, 'America/Argentina/Buenos_Aires').endOf('day').toDate();
    } else {
      fechaInicioFiltro = moment.tz('America/Argentina/Buenos_Aires').subtract(1, 'day').startOf('day').format();
      fechaFinFiltro = moment.tz('America/Argentina/Buenos_Aires').endOf('day').format();
    }

    const usuariosLog = await UsuariosLog.findAll({
      include: [
        {
          model: Usuario,
          as: "usuario",
        },
      ],
      where: {
        [Op.or]: [
          {
            fecha_ingreso: {
              [Op.between]: [fechaInicioFiltro, fechaFinFiltro]
            }
          },
          {
            fecha_egreso: {
              [Op.between]: [fechaInicioFiltro, fechaFinFiltro]
            }
          }
        ]
      },
      order: [
        ['fecha_ingreso', 'DESC']
      ]
    });

    const usuariosLogFormatted = usuariosLog.map(log => {
      const fechaIngreso = moment(log.fecha_ingreso).tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY HH:mm:ss');
      const fechaEgreso = log.fecha_egreso ? moment(log.fecha_egreso).tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY HH:mm:ss') : null;

      return {
        ...log.toJSON(),
        fecha_ingreso: fechaIngreso,
        fecha_egreso: fechaEgreso
      };
    });

    res.status(200).json(usuariosLogFormatted);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener usuarios log" });
  }
}

const obtenerUsuariosLogPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioLog = await UsuariosLog.findOne({
      include: [
        {
          model: Usuario,
          as: "usuarios",
        },
      ],
      where: {
        id,
      },
    });

    if (usuarioLog) {
      const usuarioLogFormatted = {
        ...usuarioLog.toJSON(),
        fecha_ingreso: moment(usuarioLog.fecha_ingreso).format('DD/MM/YYYY HH:mm:ss'),
        fecha_egreso: usuarioLog.fecha_egreso ? moment(usuarioLog.fecha_egreso).format('DD/MM/YYYY HH:mm:ss') : null
      };
      res.status(200).json(usuarioLogFormatted);
    } else {
      res.status(404).json({ message: "Usuario log no encontrado" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener usuario log" });
  }
};

const obtenerUsuariosEnLinea = async (req, res) => {
  try {
    const usuariosLog = await UsuariosLog.findAll({
      attributes: ['id', 'estado', 'fecha_ingreso'],
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ['legajo', 'id', 'nombre', 'apellido'],
        },
      ],
      where: {
        fecha_egreso: null,
        estado: 1,
        detalle: "ingreso"
      },
      order: [
        ['fecha_ingreso', 'DESC']
      ]
    });

    const activos = usuariosLog.length;

    res.status(200).json({
      usuariosLog,
      activos
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener usuarios en línea" });
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
  logOpen.detalle = `cierre sesión por otro usuario / ${usuario.legajo} ${usuario.nombre} ${usuario.apellido}`;
  logOpen.estado = 0;
  await logOpen.save();

  const token = req.headers['authorization'].split(' ')[1];

  await BlackListToken.update({ estado: 0 }, { where: { estado: 1, usuario_id: usuarioId } });

  res.json({ message: "Egreso exitoso" });
}

const solicitarAyuda = async (req, res) => {
  try {
    let problema = req.body.problema;
    if (problema === undefined) {
      problema = 'SinProblema';
    } else {
      problema = req.body.problema;
    }
    const usuarioSolicitante = await Usuario.findOne({
      where: {
        id: req.usuario.id,
      },
    });
    if (problema == 'SinProblema') {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASS,
        },
      });

      const contenidoCorreoCentroMonitoreo = await ejs.renderFile(path.join(__dirname, "../views/users/solicitud_de_ayuda.ejs"), {
        usuarioSolicitante,
        problema,
      });

      const destinatarios = {
        to: ["SupervisoresMarketingSala.TG@boldt.com.ar", "monitoreo@trileniumcasino.com.ar", "atencioncliente.tg@boldt.com.ar"],
        cc: ["jorge.sanabria@trileniumcasino.com.ar"],
        bcc: ["franco.garcia@trileniumcasino.com.ar", "frangarcia93@icloud.com"]
      };

      const mailOptionsBase = {
        from: {
          name: process.env.MAILER_ALIAS,
          address: process.env.MAILER_USER
        },
        subject: "Solicitud de asistencia Guardarropa",
        html: contenidoCorreoCentroMonitoreo
      };

      for (const tipo in destinatarios) {
        for (const email of destinatarios[tipo]) {
          try {
            await transporter.sendMail({ ...mailOptionsBase, [tipo]: email });
            console.log(`Email enviado a: ${email}`);
          } catch (error) {
            console.log(`Error al enviar email a: ${email}`, error);
          }
        }
      }
      res.status(200).json({ message: "Solicitud de asistencia enviada" });
    } else {
      res.status(400).json({ message: "Solicitud no envida" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al solicitar ayuda" });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let destinationPath = path.join(__dirname, '../../public/pdf/guardarropa/procedimiento');

    if (file.originalname.includes('guardarropa')) {
      destinationPath = path.join(__dirname, '../../public/pdf/guardarropa/procedimiento/');
    } else if (file.originalname.includes('supervisor')) {
      destinationPath = path.join(__dirname, '../../public/pdf/guardarropa/procedimiento/');
    } else if (file.originalname.includes('vip')) {
      destinationPath = path.join(__dirname, '../../public/pdf/vip/procedimiento/');
    }

    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    let filename = 'procedimiento.pdf';

    if (file.originalname.includes('guardarropa')) {
      filename = 'procedimiento_guardarropa.pdf';
    } else if (file.originalname.includes('supervisor')) {
      filename = 'procedimiento_supervisor.pdf';
    } else if (file.originalname.includes('vip')) {
      filename = 'procedimiento_vip.pdf';
    }
    console.log("🚀 ~ filename:", filename)

    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

const subirArchivoProcedimiento = async (req, res) => {
  try {
    res.status(200).json({ message: "Archivo subido exitosamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al subir el archivo" });
  }
};

const obtenerProcedimiento = async (req, res) => {
  const usuarioSubRolId = req.usuario.sub_rol_id;

  try {
    if (usuarioSubRolId === 5) {
      res.sendFile(path.join(__dirname, '../../public/pdf/guardarropa/procedimiento/procedimiento_guardarropa.pdf'));
    }
    if (usuarioSubRolId === 2) {
      res.sendFile(path.join(__dirname, '../../public/pdf/vip/procedimiento/procedimiento_vip.pdf'));
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener procedimiento" });
  }
};

const obtenerUsuariosLaboratorio = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'apellido', 'legajo', 'email', 'estado', 'roles_id', 'sub_rol_id', "estado_clave", "codigo_verificacion"],
      include: [
        {
          model: Rol,
          as: "roles",
        },
        {
          model: SubRol,
          as: "sub_roles",
        },
      ],
      where: {
        sub_rol_id: 6,
        estado: 1
      },
      order: [
        ['legajo', 'ASC']
      ]
    });
    res.status(200).json(usuarios);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

const asignarUsuarioLaboratorioASala = async (req, res) => {
  try {
    const { usuario_id, sala_id } = req.body;
    const usuario = await Usuario.findOne({ where: { id: usuario_id, estado: 1, sub_rol_id: 6 } });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const usuarioSala = await UsuarioLaboratorioSala.create({
      usuario_id,
      sala_id,
    });
    return res.status(200).json({ message: "Usuario asignado a sala" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al asignar usuario a sala" });
  }
};

const obtenerUsuariosLaboratorioPorSala = async (req, res) => {
  try {
    const { sala_id } = req.query;
    const usuarios = await UsuarioLaboratorioSala.findAll({
      include: [
        {
          model: Usuario,
          as: "usuario",
        },
      ],
      where: {
        sala_id,
      },
    });
    res.status(200).json(usuarios);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener usuarios por sala" });
  }
}

const obtenerTiposDeSalas = async (req, res) => {
  try {
    const tiposSala = await TipoSala.findAll();
    res.status(200).json(tiposSala);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener tipos de salas" });
  }
};


module.exports = {
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
  upload,
  obtenerProcedimiento,
  subirArchivoProcedimiento,
  obtenerUsuariosLaboratorio,
  asignarUsuarioLaboratorioASala,
  obtenerUsuariosLaboratorioPorSala,
  obtenerTiposDeSalas,
};
