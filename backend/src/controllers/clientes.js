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

const Prenda = db.Prenda;
const PrendaDetalle = db.PrendaDetalle;
const Cliente = db.Cliente;
const ClienteDetalle = db.ClienteDetalle;
const ClasePrenda = db.ClasePrenda;
const Usuario = db.Usuario;
const EstadoCliente = db.EstadoCliente;
const Expulsado = db.Expulsado;
const CategoriaCliente = db.CategoriaCliente;
const Dni = db.Dni;



const registrarCliente = async (req, res) => {
  const { io } = require("../app");
  try {
    const { nombre, apellido, dni, telefono, email, estado_clientes_id, categoria_cliente_id } = req.body;

    const buscarCliente = await Cliente.findOne({ where: { dni, borrado: 1 } });
    if (buscarCliente) {
      const camposRequeridos = ['nombre', 'apellido', 'telefono', 'email', 'estado_clientes_id'];
      const camposFaltantes = camposRequeridos.filter(campo => !buscarCliente[campo]);

      if (camposFaltantes.length > 0) {
        return res.status(400).json({
          message: "El cliente ya se encuentra registrado pero faltan completar algunos datos.",
          camposFaltantes
        });
      } else {
        return res.status(400).json({ message: "El cliente ya se encuentra registrado" });
      }
    }

    const datosCliente = {};
    if (nombre) datosCliente.nombre = nombre.toUpperCase();
    if (apellido) datosCliente.apellido = apellido.toUpperCase();
    if (dni) datosCliente.dni = dni;
    if (telefono) datosCliente.telefono = telefono;
    if (email) datosCliente.email = email;
    if (estado_clientes_id) datosCliente.estado_clientes_id = estado_clientes_id;
    if (categoria_cliente_id) datosCliente.categoria_cliente_id = categoria_cliente_id;

    const cliente = await Cliente.create(datosCliente);

    io.emit('clienteRegistrado', { shouldUpdateClient: true });
    res.status(200).json({ message: "Cliente registrado con éxito", cliente });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar el cliente" });
  }
};

const obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      include: {
        model: EstadoCliente,
        as: "estadoCliente",
        attributes: ["id", "tipo"],
      },
      where: {
        borrado: 1
      },
      order: [['dni', 'ASC']]
    });
    res.status(200).json({ clientes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los clientes" });
  }
};

const obtenerCliente = async (req, res) => {
  try {
    const { dni } = req.query;

    const observado = alertaObservado(dni)

    const cliente = await Cliente.findOne({
      include: {
        model: EstadoCliente,
        as: "estadoCliente",
        attributes: ["id", "tipo"],
      },
      where: {
        dni,
        borrado: 1
      }
    });

    if (!cliente) {
      return res.status(200).json({ message: "Cliente no encontrado", cliente: null });
    }

    const prendasOlvido = await Prenda.findAll({
      where: {
        clientes_id: cliente.id,
        estado_prendas_id: 3,
        borrado: 1
      },
      attributes: ['id', 'fecha_de_ingreso', 'usuario_ingreso_id'],
      include: [
        {
          model: Usuario,
          as: 'usuario_ingreso',
        },
        {
          model: PrendaDetalle,
          as: 'detalles',
          attributes: ['id', 'clase_prenda_id', 'ubicacion', 'detalle', 'prenda_id'],
          include: [
            {
              model: ClasePrenda,
              as: 'clase_prenda',
              attributes: ['id', 'tipo']
            }
          ]
        }
      ]
    });

    const cantidadPrendas = prendasOlvido.length;

    if (cantidadPrendas > 0) {
      return res.status(200).json({
        cliente,
        message: true,
        prendasOlvido,
        cantidadPrendas
      });
    }

    res.status(200).json({ cliente, cantidadPrendas: 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el cliente" });
  }
};

const actualizarCliente = async (req, res) => {
  const { io } = require("../app");
  try {
    const { nombre, apellido, dni, telefono, email, estado_cliente_id, dni_original, categoria_cliente_id } = req.body;

    const cliente = await Cliente.findOne({ where: { dni: dni_original, borrado: 1 } });

    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    } else if (cliente.dni !== dni && dni) {
      const clienteExistente = await Cliente.findOne({ where: { dni, borrado: 1 } });
      if (clienteExistente) {
        return res.status(400).json({
          message: "El DNI, ya se encuentra registrado",
          cliente: clienteExistente
        });
      }
    }

    await cliente.update({
      nombre: nombre ? nombre.toUpperCase() : cliente.nombre,
      apellido: apellido ? apellido.toUpperCase() : cliente.apellido,
      dni: dni || cliente.dni,
      telefono: telefono || cliente.telefono,
      email: email || cliente.email,
      estado_clientes_id: estado_cliente_id || cliente.estado_clientes_id,
      categoria_cliente_id: categoria_cliente_id || cliente.categoria_cliente_id
    });

    io.emit('clienteActualizado', { shouldUpdateClient: true });
    res.status(200).json({ message: "Cliente actualizado con éxito", cliente });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el cliente" });
  }
};

const adherirClienteExpulsado = async (req, res) => {
  try {
    const { dni } = req.body;
    const cliente = await Cliente.findOne({ where: { dni, borrado: 1 } });

    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    };

    await cliente.update({
      estado_clientes_id: 4,
    });

    res.status(200).json({ message: "Cliente adherido con éxito", cliente });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al adherir el cliente" });
  }
};

const registrarExpulsado = async (req, res) => {
  try {
    const { dni, nombre, apellido, email, telefono, motivo, fecha_expulsion } = req.body;
    let cliente = await Cliente.findOne({ where: { dni, borrado: 1 } });
    if (!cliente) {
      cliente = await Cliente.create({
        nombre,
        apellido,
        dni,
        telefono: telefono ? telefono : '01010101',
        email: email ? email : "sinRegistroDeMail@sinRegistroDeMail",
        estado_clientes_id: 5,
      });
    } else {
      await Cliente.update({
        nombre,
        apellido,
        telefono: telefono ? telefono : '01010101',
        email: email ? email : "sinRegistroDeMail@sinRegistroDeMail",
        estado_clientes_id: 5,
      }, {
        where: { dni }
      });
    }
    const fechaExpulsionFormateada = fecha_expulsion && moment(fecha_expulsion).isValid()
      ? moment(fecha_expulsion).format('YYYY-MM-DD HH:mm:ss')
      : moment().format('YYYY-MM-DD HH:mm:ss');

    const expulsado = await Expulsado.create({
      clientes_id: cliente.id,
      motivo,
      fecha_expulsion: fecha_expulsion ? fechaExpulsionFormateada : moment().format('YYYY-MM-DD HH:mm:ss'),
    });

  /*

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
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
        // to: "mails de monitoreo",
        subject: "Cliente Expulsado",
        html: await ejs.renderFile(path.join(__dirname, "../views/clientes/nuevoClienteExpulsado.ejs"), {
          cliente,
          expulsado,
          fecha_expulsion: fechaExpulsionFormateada
        }),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("🚀 ~ registrarCliente ~ info:", info);
      console.log("Email enviado", info.messageId);
      res.status(200).json({ message: "Cliente expulsado registrado con éxito" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al enviar el email" });
    }
    
  */
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const obtenerClientesExpulsados = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      where: {
        estado_clientes_id: 4,
        borrado: 1
      },
      include: {
        model: EstadoCliente,
        as: "estadoCliente",
        attributes: ["id", "tipo"],
      },
    });
    res.status(200).json({ clientes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los clientes expulsados" });
  }
};

const obtenerClienteExpulsado = async (req, res) => {
  try {
    const { dni } = req.body;
    const cliente = await Cliente.findOne({
      where: {
        dni,
        estado_clientes_id: 4,
        borrado: 1
      },
      include: {
        model: EstadoCliente,
        as: "estadoCliente",
        attributes: ["id", "tipo"],
      },
    });

    /*
    if (cliente) {
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
          //to: "monitoreo@trileniumcasino.com.ar, supervisoresSeguridad.TG@boldt.com.ar",
          //cc: "claudio.molina@boldt.com.ar",
          subject: "Cliente Expulsado",
          html: await ejs.renderFile(path.join(__dirname, "../views/clientes/clienteExpulsado.ejs"), {
            cliente
          }),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("🚀 ~ registrarCliente ~ info:", info)
        console.log("Email enviado", info.messageId);
        res.status(200).json({ cliente });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al enviar el email" });
      }
    }
    */

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el cliente expulsado" });
  };
};

const alertaObservado = async (dni) => {
  try {
    const cliente = await Cliente.findOne({
      where: {
        dni,
        estado_clientes_id: 4,
        borrado: 1
      },
      include: {
        model: EstadoCliente,
        as: "estadoCliente",
        attributes: ["id", "tipo"],
      },
    });


    if (!cliente) {
      console.log("Cliente no encontrado o no está expulsado.");
      return false;
    }
  
    /*
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
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
        // to: "monitoreo@trileniumcasino.com.ar, supervisoresSeguridad.TG@boldt.com.ar",
        // cc: "claudio.molina@boldt.com.ar",
        subject: "Cliente Observado",
        html: await ejs.renderFile(path.join(__dirname, "../views/clientes/clienteObservado.ejs"), {
          cliente
        }),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email enviado", info.messageId);
      return true;
    } catch (error) {
      console.error(error);
    }
    */
    
  } catch (error) {
    console.error(error);
  }
};

const alertaExpulsado = async (dni) => {
  try {
    const cliente = await Cliente.findOne({
      where: {
        dni,
        estado_clientes_id: 5,
        borrado: 1
      },
      include: {
        model: EstadoCliente,
        as: "estadoCliente",
        attributes: ["id", "tipo"],
      },
    });


    if (!cliente) {
      console.log("Cliente no encontrado o no está expulsado.");
      return false;
    }

    const expulsado = await Expulsado.findOne({
      where: {
        clientes_id: cliente.id,
      }
    });


    if (!expulsado) {
      console.log("No se encontró registro de expulsión para el cliente.");
      return false;
    }

    const fecha_expulsion = moment(expulsado.fecha_expulsion).format("DD/MM/YYYY HH:mm:ss");

  /*
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
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
        // to: "mails de monitoreo",
        subject: "Cliente Expulsado",
        html: await ejs.renderFile(path.join(__dirname, "../views/clientes/clienteExpulsado.ejs"), {
          cliente, expulsado, fecha_expulsion
        }),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email enviado", info.messageId);
      return true;
    } catch (error) {
      console.error(error);
    }
  */
    
  } catch (error) {
    console.error(error);
  }
};

const obtenerEstadoCliente = async (req, res) => {
  try {
    const estadosClientes = await EstadoCliente.findAll({
      where: {
        id: {
          [Op.in]: [1, 2, 3]
        }
      },
    });
    res.status(200).json({ estadosClientes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los estados de los clientes" });
  }
};

const obtenerCategoriasHit = async (req, res) => {

  const { rol_id, sub_rol_id } = req.usuario;

  let categoriasPermitidas = [];

  if (rol_id === 3 && sub_rol_id === 5) {
    categoriasPermitidas = [1, 2];
  } else if (rol_id === 3 && sub_rol_id === 2) {
    categoriasPermitidas = [3, 4, 5];
  }

  const whereConditions = {
    borrado: 1
  };

  if (categoriasPermitidas.length > 0) {
    whereConditions.id = categoriasPermitidas;
  }

  try {
    const categoriasHit = await CategoriaCliente.findAll({
      where: whereConditions
    });

    res.status(200).json({ categoriasHit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las categorías hit" });
  }
}

const obtenerDetallesDeClienteId = async (req, res) => {
  const clienteId = req.query.id_cliente;
  try {
    const detallesClientes = await ClienteDetalle.findAll({
      where: {
        borrado: 1,
        cliente_id: clienteId
      },
      include: [
        {
          model: Cliente,
          as: "cliente",
          where: {
            borrado: 1
          },
          attributes: ["nombre", "apellido"],
          include: [
            {
              model: EstadoCliente,
              as: "estadoCliente",
              attributes: ["tipo"],
            },
            {
              model: CategoriaCliente,
              as: "categoriaCliente",
              attributes: ["tipo"],
              where: {
                borrado: 1
              }
            }
          ]
        }
      ],
      attributes: [
        "fecha_nacimiento",
        "fecha_alta",
        "fecha_baja",
        "motivo_baja",
        "gusto_gastronomico",
        "equipo_futbol",
        "profesion",
        "gusto_musical"
      ]
    });

    if (detallesClientes.length > 0) {
      const detalle = detallesClientes[0];
      const fechaNacimiento = moment(detalle.fecha_nacimiento).tz('America/Argentina/Buenos_Aires').startOf('day');
      const hoy = moment().tz('America/Argentina/Buenos_Aires').startOf('day');

      const cumpleAniosHoy = (hoy.date() === fechaNacimiento.date() && hoy.month() === fechaNacimiento.month());

      let edad = hoy.year() - fechaNacimiento.year();
      const yaCumplioEsteAno = (hoy.month() > fechaNacimiento.month()) ||
        (hoy.month() === fechaNacimiento.month() && hoy.date() >= fechaNacimiento.date());

      if (!yaCumplioEsteAno) {
        edad--;
      }
      const cumpleAnios = cumpleAniosHoy ? `Hoy cumple ${edad} años` : `No cumple años hoy, tiene ${edad} años`;
      const cumpleAniosHoyString = cumpleAniosHoy ? "true" : "false";

      res.status(200).json({ detallesClientes, cumpleAnios, cumpleAniosHoy: cumpleAniosHoyString });
    } else {
      res.status(404).json({ message: "Cliente no encontrado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los detalles de los clientes" });
  }
}

const obtenerDniClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      attributes: ['dni'],
      where: {
        borrado: 1
      },
    });

    const dniList = clientes.map(cliente => cliente.dni);

    res.status(200).json({ dniList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los DNIs de los clientes" });
  }
};

const eliminarCliente = async (req, res) => {
  const { io } = require("../app");
  try {
    const { dni } = req.body;
    const cliente = await Cliente.findOne({ where: { dni, borrado: 1 } });

    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    await cliente.update({
      borrado: 2
    })
    io.emit('clienteEliminado', { shouldDeleteClient: true });
    res.status(200).json({ message: "Cliente eliminado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el cliente" });
  }
};



module.exports = {
  registrarCliente,
  obtenerClientes,
  obtenerCliente,
  actualizarCliente,
  adherirClienteExpulsado,
  registrarExpulsado,
  obtenerClienteExpulsado,
  obtenerClientesExpulsados,
  alertaObservado,
  alertaExpulsado,
  obtenerEstadoCliente,
  obtenerDetallesDeClienteId,
  obtenerDniClientes,
  eliminarCliente,
  obtenerCategoriasHit,
};