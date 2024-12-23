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
const EstadoPrenda = db.EstadoPrenda;
const Cliente = db.Cliente;
const ClasePrenda = db.ClasePrenda;
const LogCargaPrenda = db.LogCargaPrenda;
const Usuario = db.Usuario;
const EstadoCliente = db.EstadoCliente;
const Turno = db.Turno;
const CambioEstadoPrenda = db.CambioEstadoPrenda;
const UltimaUbicacion = db.UltimaUbicacion;
const UsuariosLog = db.UsuariosLog;
const BlackListToken = db.BlackListToken;

// Se utiliza para verificar si el cliente está expulsado u observado.
const { alertaExpulsado, alertaObservado } = require('./clientes');

function formatearFecha(fecha) {
  const opciones = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  return new Date(fecha).toLocaleDateString('es-AR', opciones);
};

// Gestión de prendas
const registrarPrenda = async (req, res) => {
  const { io } = require('../app');
  try {
    const prendas = req.body;
    const clienteDNI = prendas[0]?.cliente.dni;
    const expulsado = await alertaExpulsado(clienteDNI);
    const observado = await alertaObservado(clienteDNI);
    if (expulsado) {
      return res.status(400).json({ error: "El cliente ha sido expulsado. Informar a supervisor de turno y solicitarle al cliente que aguarde." });
    } else {
      for (const prenda of prendas) {
        let cliente = await Cliente.findOne({ where: { dni: prenda.cliente.dni, borrado: 1 } });

        if (cliente) {
          await cliente.update({
            nombre: prenda.cliente.nombre || cliente.nombre,
            apellido: prenda.cliente.apellido || cliente.apellido,
            email: prenda.cliente.email || cliente.email,
            telefono: prenda.cliente.telefono || cliente.telefono,
            estado_clientes_id: prenda.cliente.estado_clientes_id || cliente.estado_clientes_id,
          });
        } else {
          cliente = await Cliente.create({
            nombre: prenda.cliente.nombre || null,
            apellido: prenda.cliente.apellido || null,
            dni: prenda.cliente.dni,
            email: prenda.cliente.email || 'sinRegistroDeMail@sinRegistroDeMail',
            telefono: prenda.cliente.telefono || 1010101,
            estado_clientes_id: prenda.cliente.estado_clientes_id || 2,
          });
        }

        const nuevaPrenda = await Prenda.create({
          clientes_id: cliente.id,
          estado_prendas_id: prenda.estado_prendas_id || 1,
          fecha_de_ingreso: moment(prenda.fecha_ingreso).format('YYYY-MM-DD HH:mm:ss'),
          usuario_ingreso_id: req.usuario.id
        });

        await CambioEstadoPrenda.create({
          prenda_id: nuevaPrenda.id,
          estado_prendas_id: nuevaPrenda.estado_prendas_id,
        });

        const detallesPrendaList = [];
        for (const detalle of prenda.detalles) {
          const clase_prenda = await ClasePrenda.findOne({ where: { id: detalle.clase_prenda_id } });

          if (clase_prenda.capacidad_actual <= 0) {
            return res.status(400).json({ error: `No hay capacidad disponible para el tipo de prenda con ID: ${detalle.clase_prenda_id}.` });
          }

          await ClasePrenda.update(
            { capacidad_actual: clase_prenda.capacidad_actual - 1 },
            { where: { id: clase_prenda.id } }
          );

          const nuevaPrendaDetalle = await PrendaDetalle.create({
            clase_prenda_id: detalle.clase_prenda_id,
            ubicacion: detalle.ubicacion,
            detalle: detalle.detalle,
            prenda_id: nuevaPrenda.id
          });
          nuevaPrendaDetalle.dataValues.clase_prenda = { tipo: clase_prenda.tipo };
          detallesPrendaList.push(nuevaPrendaDetalle);
        }

        const ultimaUbicacion = prenda.detalles[prenda.detalles.length - 1].ubicacion;

        await UltimaUbicacion.update(
          {
            ubicacion: ultimaUbicacion,
            estado: 1,
            motivo: `Registro de prenda`
          },
          { where: { id: 1 } }
        );

        /*
        if (cliente.email !== "sinRegistroDeMail@sinRegistroDeMail") {
                   (async () => {
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
                         to: cliente.email,
                         subject: "Guardado de Prenda",
                         html: await ejs.renderFile(path.join(__dirname, "../views/prendas/new_prenda.ejs"), { cliente, detallesPrendaList, nuevaPrenda }),
                         bcc: "",
                       };
                       const info = await transporter.sendMail(mailOptions);
                       console.log("Email enviado");
                     } catch (error) {
                       console.log(error, "error al enviar email");
                     }
                   })();
                 } else {
                   console.log("No se envió email porque el cliente no tiene email");
                 }
        */
      }
      io.emit('newRegister', { message: "Nuevo registro de ingreso", shouldRerender: true });
      return res.status(200).json({ message: "Prendas registradas con éxito" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al registrar las prendas y sus detalles');
  }
};
const retirarPrenda = async (req, res) => {
  const { io } = require('../app');
  try {
    const { dni, id_prenda } = req.body;
    const cliente = await Cliente.findOne({ where: { dni, borrado: 1 } });
    if (!cliente) {
      return res.status(404).json({ message: "No se encontró un cliente con el DNI ingresado" });
    }
    const prenda = await Prenda.findOne({
      where: {
        clientes_id: cliente.id,
        id: id_prenda,
        [Op.or]: [
          { estado_prendas_id: 1 },
          { estado_prendas_id: 3 }
        ],
        borrado: 1
      },
      include: [
        {
          model: PrendaDetalle,
          as: 'detalles',
        }
      ]
    });
    if (!prenda) {
      return res.status(404).json({ message: "No se encontró una prenda" });
    } else {
      try {
        if (prenda.estado_prendas_id === 3) {
          prenda.estado_prendas_id = 5;
        } else {
          prenda.estado_prendas_id = 2;
        }
        prenda.fecha_de_egreso = moment().format('YYYY-MM-DD HH:mm:ss');
        prenda.usuario_egreso_id = req.usuario.id;
        await prenda.save();

        await CambioEstadoPrenda.create({
          prenda_id: prenda.id,
          estado_prendas_id: prenda.estado_prendas_id,
        });

        for (const detalle of prenda.detalles) {
          detalle.entrega_parcial = 3;
          detalle.fecha_egreso_parcial = moment().format('YYYY-MM-DD HH:mm:ss');
          await detalle.save();

          const tipoPrenda = await ClasePrenda.findOne({
            where: { id: detalle.clase_prenda_id }
          });

          if (prenda.estado_prendas_id === 2) {
            if (tipoPrenda.capacidad_actual + 1 <= tipoPrenda.capacidad_maxima) {
              await ClasePrenda.update(
                { capacidad_actual: tipoPrenda.capacidad_actual + 1 },
                { where: { id: tipoPrenda.id } }
              );
            }
          }
        }

        io.emit('newWithdraw', { message: "Retiro de prenda exitoso", shouldNewWithdraw: true });
        return res.status(200).json({ message: "Prenda retirada con éxito" });
      } catch (error) {
        console.error("Error al guardar la prenda:", error);
        return res.status(500).json({ error: "Error interno al actualizar el estado de la prenda" });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al retirar la prenda');
  }
};
const agregarMasPrendas = async (req, res) => {
  const { io } = require('../app');
  const { id_prenda, prendas } = req.body[0];
  try {
    const prenda = await Prenda.findOne({ where: { id: id_prenda, borrado: 1 } });
    if (!prenda) {
      return res.status(404).json({ message: "No se encontró una prenda con el ID ingresado" });
    }
    const cliente = await Cliente.findOne({ where: { id: prenda.clientes_id, borrado: 1 } });
    if (!cliente) {
      return res.status(404).json({ message: "No se encontró un cliente asociado a la prenda" });
    }
    const detallesPrendaList = [];
    for (const detalle of prendas) {
      const clase_prenda = await ClasePrenda.findOne({ where: { id: detalle.clase_prenda_id } });
      if (clase_prenda.capacidad_actual <= 0) {
        return res.status(400).json({ error: `No hay capacidad disponible para el tipo de prenda con ID: ${detalle.clase_prenda_id}.` });
      }
      await ClasePrenda.update(
        { capacidad_actual: clase_prenda.capacidad_actual - 1 },
        { where: { id: clase_prenda.id } }
      );
      const nuevoDetallePrenda = await PrendaDetalle.create({
        clase_prenda_id: detalle.clase_prenda_id,
        ubicacion: detalle.ubicacion,
        detalle: detalle.detalle,
        prenda_id: prenda.id
      });
      nuevoDetallePrenda.dataValues.clase_prenda = { tipo: clase_prenda.tipo };
      detallesPrendaList.push(nuevoDetallePrenda);
    }

    if (detallesPrendaList.length > 0) {
      const ultimaUbicacion = detallesPrendaList[detallesPrendaList.length - 1].ubicacion;
      await UltimaUbicacion.update(
        {
          ubicacion: ultimaUbicacion,
          estado: 1,
          motivo: `Ingreso de prendas adicionales`
        },
        { where: { id: 1 } }
      );
    } else {
      console.warn("No se encontraron detalles para actualizar la última ubicación.");
    }
    /*
  
      if (cliente.email !== "sinRegistroDeMail@sinRegistroDeMail") {
        (async () => {
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
              to: cliente.email,
              subject: "Guardado de Prenda",
              html: await ejs.renderFile(path.join(__dirname, "../views/prendas/new_prenda.ejs"), { cliente, detallesPrendaList, prenda }),
              bcc: "",
            };
            const info = await transporter.sendMail(mailOptions);
            console.log("Email enviado");
          } catch (error) {
            console.log(error, "error al enviar email");
          }
        })();
      }
      
    */

    io.emit('addNewRegister', {
      message: `Prenda adherida a cliente: ${cliente.dni}`, shouldAddNewRegister: true
    });
    return res.status(200).json({ message: "Prendas registradas con éxito" });

  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al registrar las prendas y sus detalles');
  }
};
const entregaParcialPrenda = async (req, res) => {
  const { io } = require("../app");
  try {
    const { dni, id_prenda, ubicacion } = req.body;
    const cliente = await Cliente.findOne({ where: { dni, borrado: 1 } });
    if (!cliente) {
      return res.status(404).json({ message: "No se encontró un cliente con el DNI ingresado" });
    }
    const prenda = await Prenda.findOne({
      where: {
        clientes_id: cliente.id,
        id: id_prenda,
        estado_prendas_id: 1,
        borrado: 1
      },
      include: [
        {
          model: PrendaDetalle,
          as: 'detalles',
        }
      ],
      attributes: ['id']
    });

    if (!prenda) {
      return res.status(404).json({ message: "No se encontró una prenda" });
    }

    const prendaUnica = await PrendaDetalle.findOne({
      where: {
        prenda_id: prenda.id,
        entrega_parcial: 1,
        ubicacion
      }
    });

    if (!prendaUnica) {
      return res.status(400).json({ message: "Ya se entregó parcialmente la prenda" });
    }

    try {
      prendaUnica.entrega_parcial = 2;
      prendaUnica.fecha_egreso_parcial = moment().format('YYYY-MM-DD HH:mm:ss');
      await prendaUnica.save();

      const tipoPrenda = await ClasePrenda.findOne({
        where: { id: prendaUnica.clase_prenda_id }
      });

      if (tipoPrenda.capacidad_actual + 1 <= tipoPrenda.capacidad_maxima) {
        await ClasePrenda.update(
          { capacidad_actual: tipoPrenda.capacidad_actual + 1 },
          { where: { id: tipoPrenda.id } }
        );
      }

      io.emit('newWithdrawPartial', { message: "Retiro de prenda exitoso", shouldNewWithdrawPartial: true });
      res.status(200).json({ message: "Prenda entregada parcialmente con éxito" });

    } catch (error) {
      console.error("Error al guardar la prenda:", error);
      return res.status(500).json({ error: "Error interno al actualizar el estado de la prenda" });
    }
    /*
         if (cliente.email !== "sinRegistroDeMail@sinRegistroDeMail") {
           (async () => {
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
                 to: cliente.email,
                 subject: "Entrega Parcial de Prenda",
                 html: await ejs.renderFile(path.join(__dirname, "../views/prendas/entrega_parcial_prenda.ejs"), { cliente, prenda }),
                 bcc: "",
               };
               const info = await transporter.sendMail(mailOptions);
               console.log("Email enviado");
               prenda.alerta_enviada = 1;
               await prenda.save();
             } catch (error) {
               console.log(error, "error al enviar email");
             }
           })();
         }
        */

  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al entregar parcialmente la prenda');
  }
};
const obtenerPrenda = async (req, res) => {
  try {
    const { id_prenda } = req.query;
    const prenda = await Prenda.findOne({
      where: {
        id: id_prenda,
        borrado: 1
      },
      include: [
        {
          model: PrendaDetalle,
          as: 'detalles',
          attributes: ['id', 'clase_prenda_id', 'ubicacion', 'detalle', 'prenda_id', 'fecha_egreso_parcial', 'entrega_parcial'],
          include: [
            {
              model: ClasePrenda,
              as: 'clase_prenda',
              attributes: ['id', 'tipo']
            }
          ],
          where: {
            borrado: 1
          }
        },
        {
          model: EstadoPrenda,
          as: 'estadoPrenda',
          attributes: ['id', 'tipo']
        },
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'apellido', 'dni', 'email', 'telefono', 'estado_clientes_id'],
          include: [
            {
              model: EstadoCliente,
              as: 'estadoCliente',
              attributes: ['id', 'tipo']
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuario_ingreso',
          attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
        },
        {
          model: Usuario,
          as: 'usuario_egreso',
          attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
        }
      ]
    });
    if (!prenda) {
      return res.status(404).json({ message: "No se encontró una prenda con el DNI ingresado" });
    }
    return res.status(200).json({ prenda });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al obtener el detalle de la prenda');
  }
};
const detalleRetirarPrenda = async (req, res) => {
  try {
    const { dni } = req.body;
    const cliente = await Cliente.findOne({
      where: { dni, borrado: 1 },
      attributes: ['id', 'nombre', 'apellido', 'dni', 'email', 'telefono', 'estado_clientes_id']
    });
    if (!cliente) {
      return res.status(404).json({ message: "No se encontró un cliente con el DNI ingresado" });
    }
    const prenda = await Prenda.findOne({
      where: {
        clientes_id: cliente.id,
        estado_prendas_id: 1,
        borrado: 1
      },
      include: [
        {
          model: PrendaDetalle,
          as: 'detalles',
        }
      ]
    });
    if (!prenda) {
      return res.status(404).json({ message: "No se encontró una prenda con el DNI ingresado" });
    }
    return res.status(200).json({ prenda, cliente });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al obtener el detalle de la prenda');
  }
};
const obtenerPrendasEnResguardo = async (req, res) => {
  try {
    const today = moment().local();

    let startOfMonth, endOfMonth;

    if (today.date() === 1) {
      console.warn("Es el primer día del mes");
      startOfMonth = today.startOf('month').set({ hour: 21, minute: 0, second: 0, millisecond: 0 }).subtract(4, 'day').toDate();
    } else {
      console.warn("No es el primer día del mes");
      startOfMonth = today.startOf('month').set({ hour: 21, minute: 0, second: 0, millisecond: 0 }).subtract(3, 'day').toDate();
    }
    endOfMonth = today.endOf('month').add(2, 'month').set({ hour: 20, minute: 59, second: 59, millisecond: 999 }).toDate();

    console.log("🚀 ~ obtenerPrendasEnResguardo ~ startOfMonth:", startOfMonth);
    console.log("🚀 ~ obtenerPrendasEnResguardo ~ endOfMonth:", endOfMonth);

    const prendas = await Prenda.findAll({
      attributes: ['id', 'estado_prendas_id', 'fecha_de_ingreso', 'fecha_de_egreso', 'usuario_ingreso_id', 'usuario_egreso_id', 'clientes_id'],
      include: [
        {
          model: EstadoPrenda,
          as: 'estadoPrenda',
          attributes: ['id', 'tipo']
        },
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'apellido', 'dni', 'email', 'telefono', 'estado_clientes_id'],
          include: [
            {
              model: EstadoCliente,
              as: 'estadoCliente',
              attributes: ['id', 'tipo']
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuario_ingreso',
          attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
        },
        {
          model: Usuario,
          as: 'usuario_egreso',
          attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
        },
        {
          model: PrendaDetalle,
          as: 'detalles',
          attributes: ['id', 'clase_prenda_id', 'ubicacion', 'detalle', 'prenda_id', 'fecha_egreso_parcial', 'entrega_parcial'],
          include: [
            {
              model: ClasePrenda,
              as: 'clase_prenda',
              attributes: ['id', 'tipo']
            }
          ],
          where: {
            borrado: 1
          }
        }
      ],
      where: {
        estado_prendas_id: 1,
        fecha_de_ingreso: {
          [Op.between]: [startOfMonth, endOfMonth]
        },
        borrado: 1
      },
      order: [['fecha_de_ingreso', 'DESC']]
    });

    for (const prenda of prendas) {
      const clienteId = prenda.clientes_id;
      const prendasOlvido = await Prenda.findAll({
        where: {
          clientes_id: clienteId,
          estado_prendas_id: 3,
          borrado: 1
        },
        attributes: ['id', 'fecha_de_ingreso', 'usuario_ingreso_id'],
        include: [
          {
            model: Usuario,
            as: 'usuario_ingreso',
            attributes: ['id', 'nombre', 'apellido']
          },
          {
            model: PrendaDetalle,
            as: 'detalles',
            attributes: ['id', 'clase_prenda_id', 'ubicacion', 'detalle', 'prenda_id', 'fecha_egreso_parcial', 'entrega_parcial'],
            include: [
              {
                model: ClasePrenda,
                as: 'clase_prenda',
                attributes: ['id', 'tipo']
              }
            ],
            where: {
              borrado: 1
            }
          }
        ]
      });

      prenda.dataValues.tienePrendasOlvidadas = prendasOlvido.length > 0;
      prenda.dataValues.detallesPrendasOlvidadas = prendasOlvido;
    }

    return res.status(200).json(prendas);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al obtener las prendas');
  }
};
const obtenerPrendasEntregadas = async (req, res) => {
  try {
    const today = moment().local();
    let startOfMonth, endOfMonth;

    if (today.date() === 1) {
      console.warn("Es el primer día del mes");
      startOfMonth = today.startOf('month').set({ hour: 21, minute: 0, second: 0, millisecond: 0 }).subtract(4, 'day').toDate();
    } else {
      console.warn("No es el primer día del mes");
      startOfMonth = today.subtract(7, 'days').set({ hour: 21, minute: 0, second: 0, millisecond: 0 }).toDate();
    }
    endOfMonth = today.endOf('month').add(2, 'month').set({ hour: 20, minute: 59, second: 59, millisecond: 999 }).toDate();

    console.log("🚀 ~ obtenerPrendasEnResguardo ~ startOfMonth:", startOfMonth);
    console.log("🚀 ~ obtenerPrendasEnResguardo ~ endOfMonth:", endOfMonth);

    const prendas = await Prenda.findAll({
      include: [
        {
          model: EstadoPrenda,
          as: 'estadoPrenda',
          attributes: ['id', 'tipo']
        },
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'apellido', 'dni', 'email', 'telefono', 'estado_clientes_id'],
          include: [
            {
              model: EstadoCliente,
              as: 'estadoCliente',
              attributes: ['id', 'tipo']
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuario_ingreso',
          attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
        },
        {
          model: Usuario,
          as: 'usuario_egreso',
          attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
        },
        {
          model: PrendaDetalle,
          as: 'detalles',
          attributes: ['id', 'clase_prenda_id', 'ubicacion', 'detalle', 'prenda_id', 'fecha_egreso_parcial', 'entrega_parcial'],
          include: [
            {
              model: ClasePrenda,
              as: 'clase_prenda',
              attributes: ['id', 'tipo']
            }
          ],
          where: {
            borrado: 1
          }
        }
      ],
      where: {
        estado_prendas_id: [
          2,
          5
        ],
        fecha_de_ingreso: {
          [Op.between]: [startOfMonth, endOfMonth]
        },
        borrado: 1
      },
      order: [['fecha_de_egreso', 'DESC']]
    });
    return res.status(200).json(prendas);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al obtener las prendas');
  }
};
const obtenerPrendasOlvidadas = async (req, res) => {
  try {
    const today = moment().local();
    let startOfMonth, endOfMonth;

    if (today.date() === 1) {
      console.warn("Es el primer día del mes");
      startOfMonth = today.clone().subtract(6, 'month').startOf('month').set({ hour: 21, minute: 0, second: 0, millisecond: 0 }).toDate();
    } else {
      console.warn("No es el primer día del mes");
      startOfMonth = today.clone().subtract(3, 'month').startOf('month').set({ hour: 21, minute: 0, second: 0, millisecond: 0 }).toDate();
    }
    endOfMonth = today.endOf('month').add(3, 'month').set({ hour: 20, minute: 59, second: 59, millisecond: 999 }).toDate();

    const prendas = await Prenda.findAll({
      include: [
        {
          model: EstadoPrenda,
          as: 'estadoPrenda',
          attributes: ['id', 'tipo']
        },
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'apellido', 'dni', 'email', 'telefono', 'estado_clientes_id'],
          include: [
            {
              model: EstadoCliente,
              as: 'estadoCliente',
              attributes: ['id', 'tipo']
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuario_ingreso',
          attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
        },
        {
          model: Usuario,
          as: 'usuario_egreso',
          attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
        },
        {
          model: PrendaDetalle,
          as: 'detalles',
          attributes: ['id', 'clase_prenda_id', 'ubicacion', 'detalle', 'prenda_id', 'fecha_egreso_parcial', 'entrega_parcial'],
          include: [
            {
              model: ClasePrenda,
              as: 'clase_prenda',
              attributes: ['id', 'tipo']
            }
          ],
          where: {
            borrado: 1
          }
        }
      ],
      where: {
        estado_prendas_id: {
          [Op.in]: [3, 4]
        },
        fecha_de_ingreso: {
          [Op.between]: [startOfMonth, endOfMonth]
        },
        borrado: 1
      },
      order: [['fecha_de_ingreso', 'DESC']]
    });
    return res.status(200).json(prendas);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al obtener las prendas');
  }
};
const obtenerPrendasPorFechasYTipo = async (req, res) => {
  try {
    const { tipoPrendaId, fechaInicio, fechaFin, tipoFecha, estadoPrenda, dni } = req.query;

    let fechaCondition = {};
    if (tipoFecha === 'ingreso') {
      fechaCondition.fecha_de_ingreso = {
        [Op.between]: [new Date(fechaInicio), new Date(`${fechaFin}T23:59:59`)]
      };
    } else if (tipoFecha === 'egreso') {
      fechaCondition.fecha_de_egreso = {
        [Op.between]: [new Date(fechaInicio), new Date(`${fechaFin}T23:59:59`)]
      };
    } else if (tipoFecha === 'ambas') {
      fechaCondition = {
        [Op.or]: [
          {
            fecha_de_ingreso: {
              [Op.between]: [new Date(fechaInicio), new Date(`${fechaFin}T23:59:59`)]
            }
          },
          {
            fecha_de_egreso: {
              [Op.between]: [new Date(fechaInicio), new Date(`${fechaFin}T23:59:59`)]
            }
          }
        ]
      };
    }

    let estadoCondition = {};
    if (estadoPrenda !== '0') {
      estadoCondition.estado_prendas_id = estadoPrenda;
    }

    let clienteCondition = {};
    if (dni) {
      clienteCondition.dni = dni;
    }

    let prendaDetalleCondition = {};
    if (tipoPrendaId && tipoPrendaId !== '0') {
      prendaDetalleCondition.clase_prenda_id = tipoPrendaId;
    }

    const prendas = await Prenda.findAll({
      attributes: ['id', 'estado_prendas_id', 'fecha_de_ingreso', 'fecha_de_egreso', 'usuario_ingreso_id', 'usuario_egreso_id', 'clientes_id'],
      include: [
        {
          model: EstadoPrenda,
          as: 'estadoPrenda',
          attributes: ['id', 'tipo']
        },
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'apellido', 'dni', 'email', 'telefono', 'estado_clientes_id'],
          include: [
            {
              model: EstadoCliente,
              as: 'estadoCliente',
              attributes: ['id', 'tipo']
            }
          ],
          where: clienteCondition
        },
        {
          model: Usuario,
          as: 'usuario_ingreso',
          attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
        },
        {
          model: Usuario,
          as: 'usuario_egreso',
          attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
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
          ],
          where: prendaDetalleCondition
        }
      ],
      where: {
        ...fechaCondition,
        ...estadoCondition
      },
      order: [['fecha_de_ingreso', 'DESC']]
    });

    if (prendas.length === 0) {
      return res.status(204).json({ mensaje: 'No se encontraron prendas para los criterios especificados.', cantidad: 0 });
    }
    return res.status(200).json({ prendas, cantidad: prendas.length });

  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al obtener las prendas');
  }
};
const obtenerClientesFrecuentes = async (req, res) => {
  try {
    const { dateFrom, dateTo, cantidadClientes } = req.query;

    const startDate = moment(dateFrom, 'YYYY-MM-DD', true).isValid()
      ? moment(dateFrom, 'YYYY-MM-DD').startOf('day').subtract(3, 'hours').toDate()
      : moment().startOf('month').subtract(3, 'hours').toDate();

    const endDate = moment(dateTo, 'YYYY-MM-DD', true).isValid()
      ? moment(dateTo, 'YYYY-MM-DD').endOf('day').subtract(3, 'hours').toDate()
      : moment().endOf('day').subtract(3, 'hours').toDate();
    const topClientes = cantidadClientes ? parseInt(cantidadClientes) : 10;

    const clientes = await Prenda.findAll({
      attributes: [
        'clientes_id',
        [fn('COUNT', col('Prenda.id')), 'cantidad'],
        [fn('AVG', literal('HOUR(fecha_de_ingreso) + MINUTE(fecha_de_ingreso) / 60')), 'hora_promedio_ingreso'],
        [fn('AVG', literal('HOUR(fecha_de_egreso) + MINUTE(fecha_de_egreso) / 60')), 'hora_promedio_egreso'],
        [fn('AVG', literal('TIMESTAMPDIFF(MINUTE, fecha_de_ingreso, fecha_de_egreso)')), 'promedio_tiempo_permanencia'],
        [fn('SUM', literal('TIMESTAMPDIFF(MINUTE, fecha_de_ingreso, fecha_de_egreso)')), 'total_tiempo_permanencia'],
        [fn('GROUP_CONCAT', fn('DAYOFWEEK', col('fecha_de_ingreso'))), 'dias_frecuentes']
      ],
      where: {
        fecha_de_ingreso: {
          [Op.between]: [startDate, endDate]
        },
        borrado: 1,
        estado_prendas_id: 2
      },
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'apellido', 'dni', 'email', 'telefono', 'estado_clientes_id'],
          include: [
            {
              model: EstadoCliente,
              as: 'estadoCliente',
              attributes: ['id', 'tipo']
            }
          ]
        }
      ],
      group: ['clientes_id'],
      order: [[literal('cantidad'), 'DESC']],
      limit: topClientes
    });

    const convertirMinutosAHoraMinutos = (minutos) => {
      const horas = Math.floor(minutos / 60);
      const minutosRestantes = minutos % 60;
      return `${horas.toString().padStart(2, '0')}:${minutosRestantes.toString().padStart(2, '0')}`;
    };

    const convertirHoraDecimalAHoraMinutos = (horaDecimal) => {
      const horas = Math.floor(horaDecimal);
      const minutos = Math.round((horaDecimal - horas) * 60);
      return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    };

    const obtenerDiasFrecuentes = (fechas) => {
      const diasSemana = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];
      const conteoDias = fechas.reduce((acc, fecha) => {
        const dia = parseInt(fecha, 10) - 1;
        acc[dia] = (acc[dia] || 0) + 1;
        return acc;
      }, {});

      const diasFrecuentes = Object.entries(conteoDias)
        .sort((a, b) => b[1] - a[1])
        .map(([dia]) => diasSemana[dia])
        .join(',');

      return diasFrecuentes;
    };

    const clientesConRangoHorario = clientes.map((cliente, index) => {
      const horaPromedioIngreso = parseFloat(cliente.dataValues.hora_promedio_ingreso);
      const horaPromedioEgreso = parseFloat(cliente.dataValues.hora_promedio_egreso);
      const promedioTiempoPermanencia = parseFloat(cliente.dataValues.promedio_tiempo_permanencia);
      const totalTiempoPermanencia = parseFloat(cliente.dataValues.total_tiempo_permanencia);

      const rangoHorario = horaPromedioIngreso <= horaPromedioEgreso
        ? `${Math.floor(horaPromedioIngreso)}:00 - ${Math.ceil(horaPromedioEgreso)}:00`
        : `${Math.floor(horaPromedioIngreso)}:00 - ${Math.ceil(horaPromedioEgreso)}:00 (día siguiente)`;

      const diasFrecuentes = obtenerDiasFrecuentes(cliente.dataValues.dias_frecuentes.split(','));

      return {
        top: index + 1,
        ...cliente.dataValues,
        hora_promedio_ingreso: convertirHoraDecimalAHoraMinutos(horaPromedioIngreso),
        hora_promedio_egreso: convertirHoraDecimalAHoraMinutos(horaPromedioEgreso),
        promedio_tiempo_permanencia: convertirMinutosAHoraMinutos(Math.round(promedioTiempoPermanencia)),
        total_tiempo_permanencia: convertirMinutosAHoraMinutos(totalTiempoPermanencia),
        rango_horario: rangoHorario,
        dias_frecuentes: diasFrecuentes
      };
    });

    res.status(200).json(clientesConRangoHorario);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al obtener los clientes frecuentes');
  }
};
const borrarPrenda = async (req, res) => {
  const { io } = require("../app");
  try {
    const { id } = req.body;
    const prenda = await Prenda.findOne({ where: { id, borrado: 1 }, include: ['detalles'] });
    if (!prenda) {
      return res.status(404).json({ message: 'No se encontró la prenda' });
    }

    for (const detalle of prenda.detalles) {
      const tipoPrenda = await ClasePrenda.findOne({
        where: { id: detalle.clase_prenda_id }
      });

      if (tipoPrenda) {
        const clasePrenda = await ClasePrenda.findOne({ where: { id: tipoPrenda.id } });
        if (clasePrenda) {
          const nuevaCapacidadActual = tipoPrenda.capacidad_actual + 1;
          if (nuevaCapacidadActual <= clasePrenda.capacidad_maxima) {
            await ClasePrenda.update(
              { capacidad_actual: nuevaCapacidadActual },
              { where: { id: tipoPrenda.id } }
            );
          }
          const tipoPrendaActualizada = await ClasePrenda.findOne({
            where: { id: detalle.clase_prenda_id }
          });
        }
      }
    }

    await prenda.update({ borrado: 2 });
    io.emit('newWithdraw', { message: "Prenda eliminada con éxito", shouldNewWithdraw: true });
    return res.status(200).json({ message: 'Prenda marcada como borrada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al marcar la prenda como borrada');
  }
};
const borrarPrendaEntregada = async (req, res) => {
  const { io } = require("../app");
  try {
    const { id } = req.body;
    const prenda = await Prenda.findOne({
      where: {
        id: id,
        borrado: 1
      },
      include: [
        {
          model: PrendaDetalle,
          as: 'detalles',
          attributes: ['id', 'clase_prenda_id', 'ubicacion', 'detalle', 'prenda_id', 'fecha_egreso_parcial', 'entrega_parcial'],
          include: [
            {
              model: ClasePrenda,
              as: 'clase_prenda',
              attributes: ['id', 'tipo']
            }
          ],
          where: {
            borrado: 1
          }
        },
        {
          model: EstadoPrenda,
          as: 'estadoPrenda',
          attributes: ['id', 'tipo']
        },
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'apellido', 'dni', 'email', 'telefono', 'estado_clientes_id'],
          include: [
            {
              model: EstadoCliente,
              as: 'estadoCliente',
              attributes: ['id', 'tipo']
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuario_ingreso',
          attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
        },
        {
          model: Usuario,
          as: 'usuario_egreso',
          attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
        }
      ]
    });

    if (!prenda) {
      return res.status(404).json({ message: 'No se encontró la prenda' });
    }

    for (const detalle of prenda.detalles) {
      const tipoPrenda = await ClasePrenda.findOne({
        where: { id: detalle.clase_prenda_id }
      });
    }

    await prenda.update({ borrado: 2 });

    io.emit('newWithdraw', { message: "Prenda eliminada con éxito", shouldNewWithdraw: true });

    /*
    const transporte = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS,
      },
    });

    const fechaYHoraActual = new Date();
    const fechaYHoraFormateada = new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(fechaYHoraActual);

    const contenidoCorreo = await ejs.renderFile(path.join(__dirname, "../views/prendas/prenda_retirada_eliminada.ejs"), {
      prenda,
      detalles: prenda.detalles,
      usuario: req.usuario,
      fechaYHoraFormateada,
      formatearFecha,
      cliente: prenda.cliente,
    });

    const mailOptions = {
      from: {
        name: process.env.MAILER_ALIAS,
        address: process.env.MAILER_USER
      },
      to: ["SupervisoresMarketingSala.TG@boldt.com.ar"],
      cc: ["jorge.sanabria@trileniumcasino.com.ar"],
      subject: "Prenda entregada borrada",
      html: contenidoCorreo
    };

    await transporte.sendMail(mailOptions);
    console.log("Email enviado");
    */
    return res.status(200).json({ message: 'Prenda marcada como borrada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al marcar la prenda como borrada');
  }
};
const reenviarAlertaDeOlvido = async (req, res) => {
  const { io } = require("../app");
  try {
    const { id } = req.body;
    const prenda = await Prenda.findOne({
      attributes: ['id', 'alerta_enviada'],
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'apellido', 'dni', 'email', 'telefono', 'estado_clientes_id'],
          include: [
            {
              model: EstadoCliente,
              as: 'estadoCliente',
              attributes: ['id', 'tipo']
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuario_ingreso',
          attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
        },
        {
          model: Usuario,
          as: 'usuario_egreso',
          attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
        },
        {
          model: PrendaDetalle,
          as: 'detalles',
          attributes: ['id', 'clase_prenda_id', 'ubicacion', 'detalle', 'prenda_id', 'fecha_egreso_parcial', 'entrega_parcial'],
          include: [
            {
              model: ClasePrenda,
              as: 'clase_prenda',
              attributes: ['id', 'tipo']
            }
          ],
          where: {
            borrado: 1
          }
        }
      ],
      where: {
        id,
        estado_prendas_id: 3,
        borrado: 1
      }
    });

    if (!prenda) {
      return res.status(404).json({ message: 'No se encontró la prenda' });
    }

    if (prenda.cliente.email === 'sinRegistroDeMail@sinRegistroDeMail') {
      await prenda.update({
        alerta_enviada: 0
      });
      io.emit("AlertSend", { shouldAlertSend: true });
      return res.status(400).json({ message: 'El cliente no tiene un correo electrónico registrado' });
    }

    /*
     const transporter = nodemailer.createTransport({
       host: "smtp.gmail.com",
       port: 587,
       auth: {
         user: process.env.MAILER_USER,
         pass: process.env.MAILER_PASS,
       },
     });

     const detallesPrendaList = prenda.detalles.map(detalle => ({
       ...detalle,
       clase_prenda: detalle.clase_prenda || { tipo: 'Tipo no disponible' },
       ubicacion: detalle.ubicacion
     }));
    */

    const contenidoCorreo = await ejs.renderFile(path.join(__dirname, "../views/prendas/olvido_prenda.ejs"), {
      cliente: prenda.cliente,
      prendasOlvidadas: [prenda],
      detallesPrendaList,
      tieneMasDeDosDetalles: prenda.detalles.length > 1
    });

    /*
     const mailOptions = {
       from: {
         name: process.env.MAILER_ALIAS,
         address: process.env.MAILER_USER
       },
       to: prenda.cliente.email,
       subject: "Prenda Olvidada",
       html: contenidoCorreo
     };

     await transporter.sendMail(mailOptions);
    */
    console.log("Email enviado a: ", prenda.cliente.email);

    await prenda.update({
      alerta_enviada: 1
    });
    io.emit("AlertSend", { shouldAlertSend: true });

    return res.status(200).json({ message: 'Alerta de olvido reenviada con éxito' });
  }
  catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al reenviar la alerta de olvido');
  }
};
const editarPrendaDetalle = async (req, res) => {
  const { io } = require("../app");
  try {
    const detalles = req.body.detalles;

    let cliente = await Cliente.findOne({ where: { dni: req.body.dni, borrado: 1 } });

    if (!cliente) {
      cliente = await Cliente.create({
        nombre: null,
        apellido: null,
        dni: req.body.dni,
        email: 'sinRegistroDeMail@sinRegistroDeMail',
        telefono: 1010101,
        estado_clientes_id: 2,
      });
    }

    const clienteId = cliente.id;

    const prenda = await Prenda.findOne({ where: { id: req.body.id, borrado: 1 } });

    if (!prenda) {
      return res.status(404).json({ message: 'No se encontró la prenda' });
    }

    await prenda.update({ clientes_id: clienteId });

    for (const detalle of detalles) {
      const { id, ubicacion, detalle: descripcion, clase_prenda_id } = detalle;
      const prendaDetalle = await PrendaDetalle.findOne({ where: { id } });

      if (!prendaDetalle) {
        return res.status(404).json({ message: `No se encontró el detalle de prenda con ID: ${id}` });
      }

      const clasePrendaAnterior = await ClasePrenda.findOne({ where: { id: prendaDetalle.clase_prenda_id } });
      const clasePrendaNueva = await ClasePrenda.findOne({ where: { id: clase_prenda_id } });

      if (!clasePrendaNueva) {
        return res.status(404).json({ message: `No se encontró la clase de prenda con ID: ${clase_prenda_id}` });
      }

      await prendaDetalle.update({ ubicacion, detalle: descripcion, clase_prenda_id });

      if (clasePrendaAnterior && clasePrendaAnterior.id !== clase_prenda_id) {
        await clasePrendaAnterior.update({ capacidad_actual: clasePrendaAnterior.capacidad_actual + 1 });
      }

      if (clasePrendaNueva.capacidad_actual > 0) {
        await clasePrendaNueva.update({ capacidad_actual: clasePrendaNueva.capacidad_actual - 1 });
      } else {
        return res.status(400).json({ message: `La clase de prenda con ID: ${clase_prenda_id} ha alcanzado su capacidad máxima` });
      }
    }

    io.emit('updateClothes', { shouldUpdateClothes: true });
    return res.status(200).json({ message: 'Detalles de prenda editados con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al editar los detalles de prenda');
  }
};
const borrarPrendaDetalle = async (req, res) => {
  const { io } = require("../app");
  try {
    const { id } = req.body;
    const prendaDetalle = await PrendaDetalle.findOne({ where: { id } });

    if (!prendaDetalle) {
      return res.status(404).json({ message: 'No se encontró el detalle de prenda' });
    }

    const clasePrenda = await ClasePrenda.findOne({ where: { id: prendaDetalle.clase_prenda_id } });
    if (!clasePrenda) {
      return res.status(404).json({ message: 'No se encontró la clase de prenda' });
    }

    if (prendaDetalle.borrado !== 0) {
      await clasePrenda.update({ capacidad_actual: clasePrenda.capacidad_actual + 1 });
    }

    await prendaDetalle.update({ borrado: 0 });

    io.emit('updateDeleteClothes', { shouldUpdateDeleteClothes: true });
    return res.status(200).json({ message: 'Detalle de prenda eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al eliminar el detalle de prenda');
  }
};
const pasarPrendaAOlvidada = async (req, res) => {
  const { io } = require("../app");
  try {
    const { id } = req.body;
    const prenda = await Prenda.findOne({
      where: {
        id,
        borrado: 1
      },
      include: [
        {
          model: PrendaDetalle,
          as: 'detalles',
          attributes: ['id', 'clase_prenda_id', 'ubicacion', 'detalle', 'prenda_id', 'fecha_egreso_parcial', 'entrega_parcial'],
          include: [
            {
              model: ClasePrenda,
              as: 'clase_prenda',
              attributes: ['id', 'tipo']
            }
          ],
          where: {
            borrado: 1
          }
        },
        {
          model: EstadoPrenda,
          as: 'estadoPrenda',
          attributes: ['id', 'tipo']
        },
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'apellido', 'dni', 'email', 'telefono', 'estado_clientes_id'],
          include: [
            {
              model: EstadoCliente,
              as: 'estadoCliente',
              attributes: ['id', 'tipo']
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuario_ingreso',
          attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
        },
        {
          model: Usuario,
          as: 'usuario_egreso',
          attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
        }
      ]
    });

    if (!prenda) {
      return res.status(404).json({ message: 'No se encontró la prenda' });
    }

    await prenda.update({ estado_prendas_id: 3 });

    await CambioEstadoPrenda.create({
      prenda_id: prenda.id,
      estado_prendas_id: prenda.estado_prendas_id,
    });

    for (const detalle of prenda.detalles) {
      detalle.entrega_parcial = 3;
      detalle.fecha_egreso_parcial = moment().format('YYYY-MM-DD HH:mm:ss');
      await detalle.save();

      const tipoPrenda = await ClasePrenda.findOne({
        where: { id: detalle.clase_prenda_id }
      });

      await ClasePrenda.update(
        { capacidad_actual: tipoPrenda.capacidad_actual + 1 },
        { where: { id: tipoPrenda.id } }
      );
    }

    /* 
        if (prenda.cliente.email !== 'sinRegistroDeMail@sinRegistroDeMail') {
          const transporter = nodemailer.createTransport({
             host: "smtp.gmail.com",
             port: 587,
             auth: {
               user: process.env.MAILER_USER,
               pass: process.env.MAILER_PASS,
             },
           });
     
           const prendasDelCliente = prendasOlvidadasList.filter(prenda => prenda.cliente.email === cliente.email);
     
           const detallesPrendaList = prendasDelCliente.flatMap(prenda =>
             prenda.detalles.map(detalle => ({
               ...detalle,
               clase_prenda: detalle.clase_prenda || { tipo: 'Tipo no disponible' },
               ubicacion: detalle.ubicacion
             }))
           );
     
           let tieneMasDeDosDetalles = false;
     
           prendasDelCliente.forEach(prenda => {
             if (prenda.detalles.length > 1) {
               tieneMasDeDosDetalles = true;
             }
           });
     
           const contenidoCorreo = await ejs.renderFile(path.join(__dirname, "../views/prendas/olvido_prenda.ejs"), {
             cliente,
             prendasOlvidadas: prendasDelCliente,
             detallesPrendaList,
             tieneMasDeDosDetalles
           });
     
           const mailOptions = {
             from: {
               name: process.env.MAILER_ALIAS,
               address: process.env.MAILER_USER
             },
             to: cliente.email,
             subject: "Prendas Olvidadas",
             html: contenidoCorreo
           };
     
           await transporter.sendMail(mailOptions);
           console.log("Email enviado a: ", cliente.email);
           
          for (const prenda of prendasDelCliente) {
            await prenda.update({
              alerta_enviada: 1
            });
          }
        }
    */

    io.emit('newForget', { message: "Prenda olvidada con éxito", shouldNewForget: true });

    return res.status(200).json({ message: 'Prenda actualizada a olvidada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al actualizar la prenda');
  }
};
const pasarPrendaOlvidadaADonada = async (req, res) => {
  const { io } = require("../app");
  try {
    const { id_prenda, detalle_guardado } = req.body;

    const prenda = await Prenda.findOne({
      where: {
        id: id_prenda,
        borrado: 1
      }
    });

    if (!prenda) {
      return res.status(404).json({ message: 'No se encontró la prenda' });
    }

    await prenda.update({
      estado_prendas_id: 4,
      fecha_de_egreso: moment().format('YYYY-MM-DD HH:mm:ss'),
      usuario_egreso_id: req.usuario.id,
    });

    await PrendaDetalle.update(
      { detalle: detalle_guardado },
      {
        where: {
          prenda_id: id_prenda,
          borrado: 1
        }
      }
    );

    await CambioEstadoPrenda.create({
      prenda_id: prenda.id,
      estado_prendas_id: prenda.estado_prendas_id,
    });

    io.emit('newDonate', { message: "Prenda donada con éxito", shouldNewDonate: true });

    return res.status(200).json({ message: 'Prenda actualizada a donada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al actualizar la prenda');
  }
};

// --------------- //

// Turnos
const aperturaTurno = async (req, res) => {
  const { io } = require("../app");
  try {
    if (!req.usuario || !req.usuario.id) {
      return res.status(400).send('El ID del usuario es requerido');
    }
    const numero_apertura = req.body.numero_apertura;
    const fecha = moment().format('YYYY-MM-DD HH:mm:ss');
    const numero_apertura_modificado = numero_apertura - 1;
    const turno = await Turno.create({
      numero_apertura: numero_apertura_modificado,
      usuario_id_apertura: req.usuario.id,
      fecha_apertura: fecha,
      primera_vez: 1
    });

    await UltimaUbicacion.update(
      {
        ubicacion: (numero_apertura - 1),
        estado: 3,
        motivo: `Apertura de turno ${req.usuario.apellido}, ${req.usuario.nombre}`
      },
      { where: { id: 1 } }
    );
    io.emit('updateShiftOpen', { shouldUpdateShiftOpen: true });
    return res.status(200).json({ message: 'Turno abierto con éxito', turno });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al abrir el turno');
  }
};
const cierreTurnoParcial = async (req, res) => {
  const { io } = require("../app");
  try {
    const { numero_cierre } = req.body;
    const usuario = req.usuario.id;
    const fecha = moment().format('YYYY-MM-DD HH:mm:ss');

    const turno = await Turno.findOne({
      where: {
        usuario_id_cierre: null,
        fecha_cierre: null,
        numero_cierre: null
      }
    });

    turno.numero_cierre = numero_cierre;
    turno.usuario_id_cierre = usuario;
    turno.fecha_cierre = fecha;
    const cierre = await turno.save();

    await UltimaUbicacion.update(
      {
        ubicacion: numero_cierre,
        estado: 2,
        motivo: `Cierre de turno parcial ${req.usuario.apellido}, ${req.usuario.nombre}`
      },
      { where: { id: 1 } }
    );

    io.emit('updateShiftPartial', { shouldUpdateShiftPartial: true });
    res.status(200).json({ turno, message: 'Turno parcial cerrado con éxito' });
  } catch (error) {
    console.error('Error al cerrar el turno:', error);
    res.status(500).send('Ocurrió un error al cerrar el turno');
  }
};
const cierreTurno = async (req, res) => {
  const { io } = require("../app");
  try {
    const { numero_cierre } = req.body;
    const usuario = req.usuario.id;
    const fecha = moment().format('YYYY-MM-DD HH:mm:ss');

    const turno = await Turno.findOne({
      where: {
        usuario_id_cierre: null,
        fecha_cierre: null,
        numero_cierre: null
      }
    });

    if (!turno) {
      return res.status(404).json({ message: "No se encontró un turno abierto para el usuario" });
    }

    turno.numero_cierre = numero_cierre;
    turno.usuario_id_cierre = usuario;
    turno.fecha_cierre = fecha;
    const cierre = await turno.save();

    await UltimaUbicacion.update(
      {
        ubicacion: numero_cierre,
        estado: 2,
        motivo: `Cierre de turno ${req.usuario.apellido}, ${req.usuario.nombre}`
      },
      { where: { id: 1 } }
    );

    const clasesPrenda = await ClasePrenda.findAll();

    for (const clase of clasesPrenda) {
      await ClasePrenda.update(
        { capacidad_actual: clase.capacidad_maxima },
        { where: { id: clase.id } }
      );
    }

    if (cierre) {
      try {
        const fechaCierre = moment(turno.fecha_cierre).utc();
        const unDiaAntes = fechaCierre.clone().subtract(4, 'days').format('YYYY-MM-DD');
        const unDiaAntesOlvidadas = fechaCierre.clone().subtract(2, 'days').format('YYYY-MM-DD');
        const fechaCierreFormatted = fechaCierre.add(1, "day").format('YYYY-MM-DD');

        const prendasParaActualizar = await Prenda.findAll({
          where: {
            estado_prendas_id: 1,
            fecha_de_ingreso: {
              [Op.between]: [unDiaAntes, fechaCierreFormatted]
            },
            borrado: 1
          }
        });

        for (const prenda of prendasParaActualizar) {
          await prenda.update({
            estado_prendas_id: 3,
          });
        }

        const prendasOlvidadasList = await Prenda.findAll({
          attributes: ['id', 'estado_prendas_id', 'fecha_de_ingreso', 'fecha_de_egreso', 'usuario_ingreso_id', 'usuario_egreso_id', 'clientes_id'],
          include: [
            {
              model: EstadoPrenda,
              as: 'estadoPrenda',
              attributes: ['id', 'tipo']
            },
            {
              model: Cliente,
              as: 'cliente',
              attributes: ['id', 'nombre', 'apellido', 'dni', 'email', 'telefono', 'estado_clientes_id'],
              include: [
                {
                  model: EstadoCliente,
                  as: 'estadoCliente',
                  attributes: ['id', 'tipo']
                }
              ]
            },
            {
              model: Usuario,
              as: 'usuario_ingreso',
              attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
            },
            {
              model: Usuario,
              as: 'usuario_egreso',
              attributes: ['id', 'nombre', 'apellido', 'legajo', 'roles_id', 'sub_rol_id'],
            },
            {
              model: PrendaDetalle,
              as: 'detalles',
              attributes: ['id', 'clase_prenda_id', 'ubicacion', 'detalle', 'prenda_id', 'fecha_egreso_parcial', 'entrega_parcial'],
              include: [
                {
                  model: ClasePrenda,
                  as: 'clase_prenda',
                  attributes: ['id', 'tipo']
                }
              ],
              where: {
                borrado: 1
              }
            }
          ],
          where: {
            estado_prendas_id: 3,
            fecha_de_ingreso: {
              [Op.between]: [unDiaAntesOlvidadas, fechaCierreFormatted]
            },
            borrado: 1
          }
        });

        const usuariosLogAbiertos = await UsuariosLog.findAll({
          where: {
            estado: 1,
            detalle: "ingreso",
            fecha_egreso: null
          },
          include: [
            {
              model: Usuario,
              as: 'usuario',
              where: {
                sub_rol_id: 5
              }
            }
          ]
        });

        for (const logOpen of usuariosLogAbiertos) {
          if (logOpen.usuario_id === req.usuario.id) {
            continue;
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
          logOpen.detalle = `Egreso por cierre de Turno / ${req.usuario.legajo} ${req.usuario.nombre} ${req.usuario.apellido}`;
          logOpen.estado = 0;
          await logOpen.save();

          await BlackListToken.update({ estado: 0 }, { where: { estado: 1, usuario_id: logOpen.usuario_id } });
        }

      } catch (error) {
        return res.status(400).send({ message: "Error durante el proceso de cierre", error });
      }

      io.emit('updateShift', { shouldUpdateShift: true, usuarioId: usuario });
      return res.status(200).json(turno);
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Ocurrió un error al cerrar el turno', error: error.message });
  }
};
const obtenerTurnoAbierto = async (req, res) => {
  try {
    const turno = await Turno.findOne({
      attributes: ['id', 'numero_apertura', 'fecha_apertura', 'usuario_id_apertura'],
      include: {
        model: Usuario,
        as: 'usuario_apertura',
        attributes: ['nombre', 'apellido', 'legajo']
      },
      where: {
        usuario_id_cierre: null,
        fecha_cierre: null,
        numero_cierre: null
      }
    });

    if (!turno) {
      return res.status(400).json({ message: 'No se encontró un turno abierto' });
    }

    const fechaAperturaFormateada = new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(turno.fecha_apertura));

    const turnoFormateado = {
      ...turno.toJSON(),
      fecha_apertura: fechaAperturaFormateada
    };

    return res.status(200).json(turnoFormateado);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Ocurrió un error al obtener el turno abierto', error: error.message });
  }
};
const obtenerTodosLosTurnos = async (req, res) => {
  try {
    const turnos = await Turno.findAll({
      attributes: ['id', 'numero_apertura', 'numero_cierre', 'fecha_apertura', 'fecha_cierre', 'usuario_id_apertura', 'usuario_id_cierre'],
      include: [
        {
          model: Usuario,
          as: 'usuario_apertura',
          attributes: ['nombre', 'apellido', 'legajo']
        },
        {
          model: Usuario,
          as: 'usuario_cierre',
          attributes: ['nombre', 'apellido', 'legajo']
        }
      ],
      where: {
        fecha_cierre: {
          [Op.ne]: null
        },
        numero_cierre: {
          [Op.ne]: null
        },
        usuario_id_cierre: {
          [Op.ne]: null
        }
      },
      order: [['fecha_cierre', 'DESC']],
      limit: 5
    });

    const formatearFecha = (fecha) => {
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(new Date(fecha));
    };

    const turnosFormateados = turnos.map(turno => {
      return {
        ...turno.toJSON(),
        fecha_apertura: formatearFecha(turno.fecha_apertura),
        fecha_cierre: formatearFecha(turno.fecha_cierre)
      };
    });

    return res.status(200).json(turnosFormateados);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Ocurrió un error al obtener los turnos', error: error.message });
  }
};
const ultimoTurno = async (req, res) => {
  try {
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    const ultimoTurno = await Turno.findOne({
      attributes: ['numero_apertura'],
      where: {
        fecha_apertura: {
          [Op.gte]: fechaActual,
          [Op.lt]: new Date(fechaActual.getTime() + 24 * 60 * 60 * 1000)
        },
        numero_cierre: null,
        fecha_cierre: null,
      },
      order: [['numero_apertura', 'DESC']]
    });

    return res.status(200).json(ultimoTurno);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al obtener el último turno');
  }
};
// ----------------- //

// Gestión de tipos de prendas
const tipoDePrenda = async (req, res) => {
  try {
    const clases = await ClasePrenda.findAll({
      where: { estado: 1 }
    });
    return res.status(200).json(clases);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al obtener los tipos de prendas');
  }
};
const editarTipoDePrenda = async (req, res) => {
  const { io } = require("../app");
  try {
    const { id, tipo, capacidad_maxima, capacidad_actual } = req.body;
    const clase = await ClasePrenda.findOne({ where: { id } });

    if (!clase) {
      return res.status(404).json({ message: 'No se encontró la clase de prenda' });
    }

    if (tipo !== undefined) {
      clase.tipo = tipo;
    }

    if (capacidad_maxima !== undefined) {
      await actualizarCapacidadMaximaDePrenda(id, capacidad_maxima);
    }

    if (capacidad_actual !== undefined) {
      clase.capacidad_actual = capacidad_actual;
    }

    await clase.save();
    io.emit('updateClothesTypes', { shouldUpdateClothesTypes: true });
    return res.status(200).json({ message: 'Tipo de prenda editado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al editar el tipo de prenda');
  }
};
const eliminarTipoDePrenda = async (req, res) => {
  const { io } = require("../app");
  try {
    const { id } = req.body;
    const clase = await ClasePrenda.findOne({ where: { id } });
    if (!clase) {
      return res.status(404).json({ message: 'No se encontró la clase de prenda' });
    }
    clase.estado = 0;
    await clase.save();
    io.emit('updateClothesTypes', { shouldUpdateClothesTypes: true });
    return res.status(200).json({ message: 'Tipo de prenda eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al eliminar el tipo de prenda');
  }
};
const crearTipoDePrenda = async (req, res) => {
  const { io } = require("../app");
  try {
    const { tipo, capacidad_maxima } = req.body;
    const clase = await ClasePrenda.create({
      tipo,
      capacidad_maxima,
      capacidad_actual: capacidad_maxima
    });
    io.emit('updateClothesTypes', { shouldUpdateClothesTypes: true });
    return res.status(200).json({ message: 'Tipo de prenda creado con éxito', tipo: clase.tipo });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al crear el tipo de prenda');
  }
};
const obtenerPrendasOlvidadasYDonadas = async (req, res) => {
  try {
    const estadisticas = await Prenda.findAll({
      attributes: [
        [fn('SUM', literal('CASE WHEN estado_prendas_id = 3 THEN 1 ELSE 0 END')), 'cantidad_olvidadas'],
        [fn('SUM', literal('CASE WHEN estado_prendas_id = 4 THEN 1 ELSE 0 END')), 'cantidad_donadas']
      ],
      where: {
        borrado: 1
      }
    });

    res.json({ estadisticas });
  } catch (error) {
    console.error('Error al obtener las prendas olvidadas y donadas:', error);
    res.status(500).send('Error al obtener las prendas olvidadas y donadas');
  }
};
const obtenerPrendasPorTipoYEstado = async (req, res) => {
  try {
    const estadisticas = await Prenda.findAll({
      attributes: [
        'estado_prendas_id',
        'detalles.clase_prenda_id',
        [fn('COUNT', col('Prenda.id')), 'cantidad']
      ],
      include: [
        {
          model: PrendaDetalle,
          as: 'detalles',
          attributes: []
        }
      ],
      where: {
        borrado: 1
      },
      group: ['estado_prendas_id', 'detalles.clase_prenda_id']
    });

    res.json({ estadisticas });
  } catch (error) {
    console.error('Error al obtener las prendas por tipo y estado:', error);
    res.status(500).send('Error al obtener las prendas por tipo y estado');
  }
};
const actualizarCapacidadMaximaDePrenda = async (id, capacidad_maxima) => {
  const clase = await ClasePrenda.findOne({
    where: {
      id,
      estado: 1
    }
  });

  if (!clase) {
    throw new Error('No se encontró la clase de prenda');
  }

  const capacidad_anterior = clase.capacidad_maxima - clase.capacidad_actual;
  const capacidad_nueva = capacidad_maxima - capacidad_anterior;

  const capacidad_utilizada = clase.capacidad_maxima - clase.capacidad_actual;
  clase.capacidad_maxima = capacidad_maxima;
  clase.capacidad_actual = capacidad_maxima - capacidad_utilizada;

  await clase.save();
};
// --------------- //

// Estadisticas y datos
const obtenerEstadisticasPrendasPorDiaDeLaSemana = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const estadisticas = await Prenda.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('fecha_de_ingreso'), '%w'), 'dia_semana_num'],
        [fn('DATE_FORMAT', col('fecha_de_ingreso'), '%W'), 'dia_semana'],
        [fn('COUNT', col('Prenda.id')), 'cantidad_ingresos'],
        [fn('SUM', literal('CASE WHEN fecha_de_ingreso != fecha_de_egreso AND estado_prendas_id = 2 THEN 1 ELSE 0 END')), 'cantidad_egresos']
      ],
      include: [
        {
          model: PrendaDetalle,
          as: 'detalles',
          attributes: ['id', 'clase_prenda_id', 'ubicacion', 'detalle', 'prenda_id', 'fecha_egreso_parcial', 'entrega_parcial'],
          include: [
            {
              model: ClasePrenda,
              as: 'clase_prenda',
              attributes: ['id', 'tipo']
            }
          ],
          where: {
            borrado: 1
          }
        }
      ],
      where: {
        borrado: 1,
        fecha_de_ingreso: {
          [Op.between]: [fechaInicio, fechaFin]
        }
      },
      group: [
        fn('DATE_FORMAT', col('fecha_de_ingreso'), '%w'),
        fn('DATE_FORMAT', col('fecha_de_ingreso'), '%W'),
        col('detalles.clase_prenda.tipo'),
        col('detalles.id'),
        col('detalles.clase_prenda_id'),
        col('detalles.ubicacion'),
        col('detalles.detalle'),
        col('detalles.prenda_id'),
        col('detalles.fecha_egreso_parcial'),
        col('detalles.entrega_parcial'),
        col('detalles->clase_prenda.id'),
        col('detalles->clase_prenda.tipo')
      ],
      order: [
        [fn('DATE_FORMAT', col('fecha_de_ingreso'), '%w'), 'ASC']
      ]
    });

    const estadisticasPorDia = {};

    estadisticas.forEach(est => {
      const diaSemana = est.dataValues.dia_semana;
      const ingresos = parseInt(est.dataValues.cantidad_ingresos, 10);
      const egresos = parseInt(est.dataValues.cantidad_egresos, 10);
      const tipoPrenda = est.dataValues.detalles?.clase_prenda?.tipo || 'undefined';

      if (!estadisticasPorDia[diaSemana]) {
        estadisticasPorDia[diaSemana] = {
          cantidad_ingresos: 0,
          cantidad_egresos: 0,
          detalles: []
        };
      }

      estadisticasPorDia[diaSemana].cantidad_ingresos += ingresos;
      estadisticasPorDia[diaSemana].cantidad_egresos += egresos;
      estadisticasPorDia[diaSemana].detalles.push(...est.dataValues.detalles);
    });

    let maxIngresos = 0;
    let minIngresos = Number.MAX_SAFE_INTEGER;
    let maxEgresos = 0;
    let minEgresos = Number.MAX_SAFE_INTEGER;

    const estadisticasTraducidas = Object.keys(estadisticasPorDia).map(diaSemana => {
      const diaEstadisticas = estadisticasPorDia[diaSemana];
      const tipoPrendaMasFrecuente = determinarPrendaMasFrecuente(diaEstadisticas.detalles);

      if (diaEstadisticas.cantidad_ingresos > maxIngresos) maxIngresos = diaEstadisticas.cantidad_ingresos;
      if (diaEstadisticas.cantidad_ingresos < minIngresos) minIngresos = diaEstadisticas.cantidad_ingresos;
      if (diaEstadisticas.cantidad_egresos > maxEgresos) maxEgresos = diaEstadisticas.cantidad_egresos;
      if (diaEstadisticas.cantidad_egresos < minEgresos) minEgresos = diaEstadisticas.cantidad_egresos;

      return {
        dia_semana: diaSemana,
        cantidad_ingresos: diaEstadisticas.cantidad_ingresos,
        cantidad_egresos: diaEstadisticas.cantidad_egresos,
        tipo_prenda_mas_frecuente: tipoPrendaMasFrecuente
      };
    });

    const diasSemana = {
      'Monday': 'Lunes',
      'Tuesday': 'Martes',
      'Wednesday': 'Miércoles',
      'Thursday': 'Jueves',
      'Friday': 'Viernes',
      'Saturday': 'Sábado',
      'Sunday': 'Domingo'
    };

    const estadisticasFinales = estadisticasTraducidas.map(est => ({
      ...est,
      dia_semana: diasSemana[est.dia_semana]
    }));

    res.json({
      estadisticas: estadisticasFinales,
      maxIngresos,
      minIngresos,
      maxEgresos,
      minEgresos
    });
  } catch (error) {
    console.error('Error al obtener las estadísticas de prendas por día de la semana:', error);
    res.status(500).send('Error al obtener las estadísticas de prendas por día de la semana');
  }
};
const obtenerEstadisticasPrendasPorAno = async (req, res) => {
  try {
    const { ano } = req.query;
    const year = ano || moment().year();

    const estadisticasPorMes = {};
    for (let month = 0; month < 12; month++) {
      const mes = moment({ year, month }).format('YYYY-MM');
      estadisticasPorMes[mes] = {
        cantidad_ingresos: 0,
        cantidad_egresos: 0,
        detalles: []
      };
    }

    const estadisticas = await Prenda.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('fecha_de_ingreso'), '%Y-%m'), 'mes'],
        [fn('COUNT', col('Prenda.id')), 'cantidad_ingresos'],
        [fn('SUM', literal('CASE WHEN fecha_de_ingreso != fecha_de_egreso AND estado_prendas_id = 2 THEN 1 ELSE 0 END')), 'cantidad_egresos']
      ],
      include: [
        {
          model: PrendaDetalle,
          as: 'detalles',
          attributes: ['id', 'clase_prenda_id', 'ubicacion', 'detalle', 'prenda_id', 'fecha_egreso_parcial', 'entrega_parcial'],
          include: [
            {
              model: ClasePrenda,
              as: 'clase_prenda',
              attributes: ['id', 'tipo']
            }
          ],
          where: {
            borrado: 1
          }
        }
      ],
      where: {
        borrado: 1,
        fecha_de_ingreso: {
          [Op.between]: [`${year}-01-01`, `${year}-12-31`]
        }
      },
      group: [
        fn('DATE_FORMAT', col('fecha_de_ingreso'), '%Y-%m'),
        col('detalles.clase_prenda.tipo'),
        col('detalles.id'),
        col('detalles.clase_prenda_id'),
        col('detalles.ubicacion'),
        col('detalles.detalle'),
        col('detalles.prenda_id'),
        col('detalles.fecha_egreso_parcial'),
        col('detalles.entrega_parcial'),
        col('detalles->clase_prenda.id'),
        col('detalles->clase_prenda.tipo')
      ],
      order: [
        [fn('DATE_FORMAT', col('fecha_de_ingreso'), '%Y-%m'), 'ASC']
      ]
    });

    let totalIngresosAnuales = 0;
    let totalEgresosAnuales = 0;
    let mesMaxIngresos = '';
    let mesMaxEgresos = '';
    let maxIngresos = 0;
    let maxEgresos = 0;

    estadisticas.forEach(est => {
      const mes = est.dataValues.mes;
      const ingresos = parseInt(est.dataValues.cantidad_ingresos, 10);
      const egresos = parseInt(est.dataValues.cantidad_egresos, 10);
      const tipoPrenda = est.dataValues.detalles?.clase_prenda?.tipo || 'undefined';

      estadisticasPorMes[mes].cantidad_ingresos += ingresos;
      estadisticasPorMes[mes].cantidad_egresos += egresos;
      estadisticasPorMes[mes].detalles.push(...est.dataValues.detalles);

      totalIngresosAnuales += ingresos;
      totalEgresosAnuales += egresos;

      if (estadisticasPorMes[mes].cantidad_ingresos > maxIngresos) {
        maxIngresos = estadisticasPorMes[mes].cantidad_ingresos;
        mesMaxIngresos = mes;
      }

      if (estadisticasPorMes[mes].cantidad_egresos > maxEgresos) {
        maxEgresos = estadisticasPorMes[mes].cantidad_egresos;
        mesMaxEgresos = mes;
      }
    });

    let minIngresos = Number.MAX_SAFE_INTEGER;
    let minEgresos = Number.MAX_SAFE_INTEGER;

    const estadisticasTraducidas = Object.keys(estadisticasPorMes).map(mes => {
      const mesEstadisticas = estadisticasPorMes[mes];
      const tipoPrendaMasFrecuente = determinarPrendaMasFrecuente(mesEstadisticas.detalles);

      if (mesEstadisticas.cantidad_ingresos < minIngresos) minIngresos = mesEstadisticas.cantidad_ingresos;
      if (mesEstadisticas.cantidad_egresos < minEgresos) minEgresos = mesEstadisticas.cantidad_egresos;

      return {
        mes,
        cantidad_ingresos: mesEstadisticas.cantidad_ingresos,
        cantidad_egresos: mesEstadisticas.cantidad_egresos,
        tipo_prenda_mas_frecuente: tipoPrendaMasFrecuente
      };
    });

    res.json({
      estadisticas: estadisticasTraducidas,
      maxIngresos,
      minIngresos,
      maxEgresos,
      minEgresos,
      totalIngresosAnuales,
      totalEgresosAnuales,
      mesMaxIngresos,
      mesMaxEgresos
    });
  } catch (error) {
    console.error('Error al obtener las estadísticas de prendas por año:', error);
    res.status(500).send('Error al obtener las estadísticas de prendas por año');
  }
};
const obtenerEstadisticasPrendasPorHoraMensual = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const fechaInicioDefault = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const fechaFinDefault = new Date();

    let fechaInicioModificada = fechaInicio ? new Date(fechaInicio) : fechaInicioDefault;
    let fechaFinModificada = fechaFin ? new Date(fechaFin) : fechaFinDefault;

    if (fechaInicio) {
      fechaInicioModificada.setHours(21, 0, 0, 0);
    }
    if (fechaFin) {
      fechaFinModificada.setDate(fechaFinModificada.getDate() + 1);
      fechaFinModificada.setHours(20, 59, 59, 999);
    }

    const whereClause = { fecha_cambio: { [Op.between]: [fechaInicioModificada, fechaFinModificada] } };

    const estadisticas = await CambioEstadoPrenda.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('fecha_cambio'), '%Y-%m-%d %H:00:00'), 'hora'],
        [literal('SUM(CASE WHEN estado_prendas_id = 1 THEN 1 ELSE 0 END)'), 'cantidad_ingresos'],
        [literal('SUM(CASE WHEN estado_prendas_id = 2 THEN 1 ELSE 0 END)'), 'cantidad_egresos']
      ],
      where: whereClause,
      group: [fn('DATE_FORMAT', col('fecha_cambio'), '%Y-%m-%d %H:00:00')],
      order: [fn('DATE_FORMAT', col('fecha_cambio'), '%Y-%m-%d %H:00:00')]
    });

    let totalCantidadIngresos = 0;
    let totalCantidadEgresos = 0;

    estadisticas.forEach(est => {
      const cantidad_ingresos = parseInt(est.dataValues.cantidad_ingresos, 10);
      const cantidad_egresos = parseInt(est.dataValues.cantidad_egresos, 10);

      totalCantidadIngresos += cantidad_ingresos;
      totalCantidadEgresos += cantidad_egresos;
    });

    res.json({ estadisticas, totalCantidadIngresos, totalCantidadEgresos });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener estadísticas de prendas por hora mensual');
  }
};
const promedioOcupacionGuardarropa = async (req, res) => {
  try {
    const clases = await ClasePrenda.findAll({
      attributes: ['capacidad_maxima', 'capacidad_actual'],
      where: { estado: 1 }
    });

    let capacidadMaximaTotal = 0;
    let capacidadActualTotal = 0;

    clases.forEach(clase => {
      if (clase.capacidad_maxima > 0) {
        capacidadMaximaTotal += parseInt(clase.capacidad_maxima);
        capacidadActualTotal += parseInt(clase.capacidad_actual);
      }
    });

    if (capacidadMaximaTotal === 0) {
      return res.status(200).json({
        promedioOcupacion: 0,
        promedioOcupacionInvertido: 100,
        estadoCapacidad: 'Lleno'
      });
    }

    const promedioOcupacion = (capacidadActualTotal / capacidadMaximaTotal) * 100;
    const promedioOcupacionRedondeado = promedioOcupacion.toFixed(2);

    const ocupacionInvertida = 100 - promedioOcupacion;
    const ocupacionInvertidaRedondeada = ocupacionInvertida.toFixed(2);

    let estadoCapacidad = '';

    if (ocupacionInvertidaRedondeada < 10) {
      estadoCapacidad = 'Menos de 10% ocupado';
    } else if (ocupacionInvertidaRedondeada >= 10 && ocupacionInvertidaRedondeada < 20) {
      estadoCapacidad = 'Entre el 10% y el 20% ocupado';
    } else if (ocupacionInvertidaRedondeada >= 20 && ocupacionInvertidaRedondeada < 30) {
      estadoCapacidad = 'Entre el 20% y el 30% ocupado';
    } else if (ocupacionInvertidaRedondeada >= 30 && ocupacionInvertidaRedondeada < 40) {
      estadoCapacidad = 'Entre el 30% y el 40% ocupado';
    } else if (ocupacionInvertidaRedondeada >= 40 && ocupacionInvertidaRedondeada < 50) {
      estadoCapacidad = 'Entre el 40% y el 50% ocupado';
    } else if (ocupacionInvertidaRedondeada >= 50 && ocupacionInvertidaRedondeada < 60) {
      estadoCapacidad = 'Entre el 50% y el 60% ocupado';
    } else if (ocupacionInvertidaRedondeada >= 60 && ocupacionInvertidaRedondeada < 70) {
      estadoCapacidad = 'Entre el 60% y el 70% ocupado';
    } else if (ocupacionInvertidaRedondeada >= 70 && ocupacionInvertidaRedondeada < 80) {
      estadoCapacidad = 'Entre el 70% y el 80% ocupado';
    } else if (ocupacionInvertidaRedondeada >= 80 && ocupacionInvertidaRedondeada < 90) {
      estadoCapacidad = 'Entre el 80% y el 90% ocupado';
    } else if (ocupacionInvertidaRedondeada >= 90 && ocupacionInvertidaRedondeada < 99.99) {
      estadoCapacidad = 'Entre el 90% y el 99% ocupado';
    } else {
      estadoCapacidad = 'Lleno';
    }

    return res.status(200).json({
      promedioOcupacion: promedioOcupacionRedondeado,
      promedioOcupacionInvertido: ocupacionInvertidaRedondeada,
      estadoCapacidad: estadoCapacidad
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al calcular el promedio de ocupación del guardarropa');
  }
};
const tiempoDeCargaPrenda = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, promedio_tiempo } = req.body;

    const fechaInicioFormatted = moment(fecha_inicio).format('YYYY-MM-DD HH:mm:ss');
    const fechaFinFormatted = moment(fecha_fin).format('YYYY-MM-DD HH:mm:ss');

    const tiempo = await LogCargaPrenda.create({
      fecha_inicio: fechaInicioFormatted,
      fecha_fin: fechaFinFormatted,
      usuarios_id: req.usuario.id,
      promedio_tiempo
    });

    return res.status(200).json({ message: 'Tiempo de carga de prenda registrado con éxito' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Hubo un error al obtener el tiempo de carga de prendas' });
  }
};
const obtenerTiempoDeCargaPrenda = async (req, res) => {
  try {
    let { dateFrom, dateTo } = req.query;

    const fechaInicio = dateFrom ? new Date(dateFrom) : new Date();
    const fechaFin = dateTo ? new Date(dateTo) : new Date();

    if (isNaN(fechaInicio) || isNaN(fechaFin)) {
      return res.status(400).json({ message: 'Fechas inválidas' });
    }

    const tiempo = await LogCargaPrenda.findAll({
      attributes: ['fecha_inicio', 'fecha_fin', 'promedio_tiempo'],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'legajo']
        }
      ],
      where: {
        timestamp: {
          [Op.gte]: fechaInicio,
          [Op.lt]: fechaFin
        }
      }
    });

    const promedioTiempoGeneral = calcularPromedioTiempoDeCarga(tiempo.map(log => log.promedio_tiempo));

    let totalPrendasRegistradas = 0;

    const tiemposPorUsuario = tiempo.reduce((acc, log) => {
      const usuarioId = log.usuario.id;
      if (!acc[usuarioId]) {
        acc[usuarioId] = {
          usuario: log.usuario,
          tiempos: [],
          cantidadRegistros: 0,
          cantidadPrendas: 0
        };
      }
      acc[usuarioId].tiempos.push(log.promedio_tiempo);
      acc[usuarioId].cantidadRegistros += 1;
      acc[usuarioId].cantidadPrendas += 1;
      totalPrendasRegistradas += 1;
      return acc;
    }, {});

    const promedioTiempoPorUsuario = Object.values(tiemposPorUsuario).map(usuarioData => {
      const promedio = calcularPromedioTiempoDeCarga(usuarioData.tiempos);
      return {
        usuario: usuarioData.usuario,
        promedio_tiempo: promedio,
        cantidadRegistros: usuarioData.cantidadRegistros,
        cantidadPrendas: usuarioData.cantidadPrendas
      };
    });

    promedioTiempoPorUsuario.sort((a, b) => {
      if (b.cantidadPrendas === a.cantidadPrendas) {
        return a.promedio_tiempo - b.promedio_tiempo;
      }
      return b.cantidadPrendas - a.cantidadPrendas;
    });

    return res.status(200).json({ tiempo, promedioTiempoGeneral, promedioTiempoPorUsuario, totalPrendasRegistradas });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Hubo un error al obtener el tiempo de carga de prendas' });
  }
}
const obtenerTiempoDeCargaAnual = async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const topN = parseInt(req.query.topN) || 10;

  const meses = [
    { numero: 1, nombre: 'Enero' },
    { numero: 2, nombre: 'Febrero' },
    { numero: 3, nombre: 'Marzo' },
    { numero: 4, nombre: 'Abril' },
    { numero: 5, nombre: 'Mayo' },
    { numero: 6, nombre: 'Junio' },
    { numero: 7, nombre: 'Julio' },
    { numero: 8, nombre: 'Agosto' },
    { numero: 9, nombre: 'Septiembre' },
    { numero: 10, nombre: 'Octubre' },
    { numero: 11, nombre: 'Noviembre' },
    { numero: 12, nombre: 'Diciembre' }
  ];

  try {
    const tiemposDeCarga = await LogCargaPrenda.findAll({
      attributes: ['fecha_inicio', 'fecha_fin', 'promedio_tiempo', 'timestamp'],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'legajo']
        }
      ],
      where: {
        timestamp: {
          [Op.between]: [`${year}-01-01`, `${year}-12-31`]
        }
      }
    });

    const tiemposPorMes = {};
    const promediosGeneralesPorMes = {};

    tiemposDeCarga.forEach(({ usuario, promedio_tiempo, timestamp }) => {
      const mes = new Date(timestamp).getMonth() + 1;
      const key = `${usuario.id}-${mes}`;

      if (!tiemposPorMes[key]) {
        tiemposPorMes[key] = [];
      }
      tiemposPorMes[key].push({ promedio_tiempo: parseFloat(promedio_tiempo), usuario });

      if (!promediosGeneralesPorMes[mes]) {
        promediosGeneralesPorMes[mes] = [];
      }
      promediosGeneralesPorMes[mes].push(parseFloat(promedio_tiempo));
    });

    const promediosPorMes = {};
    for (const key in tiemposPorMes) {
      const tiempos = tiemposPorMes[key];
      const totalTiempo = tiempos.reduce((acc, curr) => acc + curr.promedio_tiempo, 0);
      const promedio = totalTiempo / tiempos.length;
      promediosPorMes[key] = { promedio, usuario: tiempos[0].usuario, registros: tiempos.length };
    }

    const promediosGenerales = {};
    for (const mes of meses) {
      if (promediosGeneralesPorMes[mes.numero]) {
        const tiempos = promediosGeneralesPorMes[mes.numero];
        const totalTiempo = tiempos.reduce((acc, curr) => acc + curr, 0);
        const promedio = totalTiempo / tiempos.length;
        promediosGenerales[mes.numero] = { promedio: calcularPromedioTiempoDeCarga([promedio]), nombre: mes.nombre };
      } else {
        promediosGenerales[mes.numero] = { promedio: '0 segundos', nombre: mes.nombre };
      }
    }

    const promediosArray = Object.entries(promediosPorMes).map(([key, { promedio, usuario, registros }]) => {
      const [usuario_id, mes] = key.split('-');
      return { usuario_id, mes: parseInt(mes), promedio: calcularPromedioTiempoDeCarga([promedio]), usuario, registros };
    });

    const mejoresPromediosPorMes = {};
    for (const mes of meses) {
      const promediosDelMes = promediosArray.filter(item => item.mes === mes.numero);
      promediosDelMes.sort((a, b) => b.registros - a.registros || parseFloat(b.promedio) - parseFloat(a.promedio));
      mejoresPromediosPorMes[mes.numero] = promediosDelMes.slice(0, topN).map(item => ({
        usuario_id: item.usuario_id,
        nombre: item.usuario.nombre,
        apellido: item.usuario.apellido,
        legajo: item.usuario.legajo,
        promedio: item.promedio,
        mes: item.mes,
        registros: item.registros
      }));
    }

    const mejoresPromediosPorMesTable = {};
    for (const mes of meses) {
      mejoresPromediosPorMesTable[mes.nombre] = mejoresPromediosPorMes[mes.numero] || [];
    }

    res.status(200).json({
      mejoresPromediosPorMes,
      promediosGenerales: Object.entries(promediosGenerales).map(([mes, { promedio, nombre }]) => ({ mes, promedio, nombre }))
    });
  } catch (error) {
    console.error("Error al obtener los promedios anuales:", error);
    res.status(500).json({ error: "Error interno al obtener los promedios anuales" });
  }
};
const obtenerDatosParaGraficos = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
      return res.status(400).json({ message: 'Los parámetros dateFrom y dateTo son requeridos' });
    }

    const tiempo = await LogCargaPrenda.findAll({
      attributes: ['fecha_inicio', 'fecha_fin', 'promedio_tiempo', 'timestamp'],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'legajo']
        }
      ],
      where: {
        timestamp: {
          [Op.between]: [new Date(dateFrom), new Date(dateTo)]
        }
      }
    });

    const datosPorHora = calcularPromedioPorHora(tiempo);
    const promedioDiario = calcularPromedioDiario(tiempo);
    const promedioMensual = calcularPromedioMensual(tiempo);

    return res.status(200).json({ datosPorHora, promedioDiario, promedioMensual });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Hubo un error al obtener los datos para gráficos' });
  }
};
const obtenerDNIMasUtilizadosPorHora = async (req, res) => {
  try {
    const horaActual = new Date().getHours();

    const dniMasUtilizados = await Prenda.findAll({
      attributes: [
        'cliente.dni',
        'cliente.id',
        [fn('COUNT', col('cliente.dni')), 'uso_count']
      ],
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['dni', 'id']
        }
      ],
      where: {
        borrado: 1,
        [Op.and]: [
          fn('HOUR', col('fecha_de_ingreso')), horaActual
        ]
      },
      group: ['cliente.dni', 'cliente.id'],
      order: [[literal('uso_count'), 'DESC']],
      limit: 100
    });

    const dniSugeridos = dniMasUtilizados.map(dni => dni.cliente.dni);

    return res.status(200).json({ dniSugeridos });
  } catch (error) {
    console.error('Error al obtener los DNI más utilizados por hora:', error);
    return res.status(500).json({ message: 'Hubo un error al obtener los DNI más utilizados por hora' });
  }
};
const determinarPrendaMasFrecuente = (detalles) => {
  const tipoPrendaCount = {};
  detalles.forEach(detalle => {
    const tipo = detalle.clase_prenda.tipo;
    if (!tipoPrendaCount[tipo]) {
      tipoPrendaCount[tipo] = 0;
    }
    tipoPrendaCount[tipo]++;
  });
  return Object.keys(tipoPrendaCount).reduce((a, b) => tipoPrendaCount[a] > tipoPrendaCount[b] ? a : b, 'Desconocido');
};
const obtenerPromedioTiempoPermanencia = async (req, res) => {
  try {
    const estadisticas = await Prenda.findAll({
      attributes: [
        [fn('AVG', literal('TIMESTAMPDIFF(MINUTE, fecha_de_ingreso, fecha_de_egreso)')), 'promedio_tiempo_permanencia']
      ],
      where: {
        borrado: 1,
        fecha_de_egreso: {
          [Op.ne]: null
        }
      }
    });

    res.json({ estadisticas });
  } catch (error) {
    console.error('Error al obtener el promedio de tiempo de permanencia de prendas:', error);
    res.status(500).send('Error al obtener el promedio de tiempo de permanencia de prendas');
  }
};
const obtenerEstadisticasPrendasPorMes = async (req, res) => {
  try {
    const { ano } = req.query;
    const year = ano || new Date().getFullYear();

    const estadisticas = await Prenda.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('fecha_de_ingreso'), '%Y-%m'), 'mes'],
        [fn('COUNT', col('Prenda.id')), 'cantidad_ingresos'],
        [fn('SUM', literal('CASE WHEN fecha_de_ingreso != fecha_de_egreso AND estado_prendas_id = 2 THEN 1 ELSE 0 END')), 'cantidad_egresos']
      ],
      where: {
        borrado: 1,
        fecha_de_ingreso: {
          [Op.between]: [`${year}-01-01`, `${year}-12-31`]
        }
      },
      group: [fn('DATE_FORMAT', col('fecha_de_ingreso'), '%Y-%m')],
      order: [fn('DATE_FORMAT', col('fecha_de_ingreso'), '%Y-%m')]
    });

    res.json({ estadisticas });
  } catch (error) {
    console.error('Error al obtener las estadísticas de prendas por mes:', error);
    res.status(500).send('Error al obtener las estadísticas de prendas por mes');
  }
};
const calcularPromedioTiempoDeCarga = (tiempos) => {
  const tiemposFiltrados = tiempos.filter(t => !isNaN(parseFloat(t)));
  if (tiemposFiltrados.length === 0) return '0 segundos';

  const totalTiempo = tiemposFiltrados.reduce((acc, curr) => acc + parseFloat(curr), 0);
  const promedio = totalTiempo / tiemposFiltrados.length;

  if (promedio > 60) {
    return `${(promedio / 60).toFixed(2)} minutos`;
  } else {
    return `${Math.round(promedio)} segundos`;
  }
};
// ----------------- //

// Ubicación 
const modificarUltimaUbicacion = async (req, res) => {
  const { io } = require("../app");
  try {
    const { ubicacion, motivo } = req.body;
    const anteriorUbicacion = await UltimaUbicacion.findOne({ where: { id: 1 } });
    await UltimaUbicacion.update(
      {
        ubicacion: (ubicacion - 1),
        estado: 1,
        motivo: `${motivo} - Usuario ${req.usuario.apellido}, ${req.usuario.nombre}`
      },
      { where: { id: 1 } }
    );
    const nuevaUbicacion = await UltimaUbicacion.findOne({ where: { id: 1 } });
    if (anteriorUbicacion.ubicacion === nuevaUbicacion.ubicacion) {
      return res.status(400).json({ message: 'La ubicación no fue modificada' });
    } else {
      io.emit('updateLocation', { message: "Ubicación actualizada", shouldUpdateLocation: true });
      res.status(200).json({ message: 'Ubicación modificada con éxito' });
      /*
            (async () => {
              try {
                const transporter = nodemailer.createTransport({
                  host: "smtp.gmail.com",
                  port: 587,
                  auth: {
                    user: process.env.MAILER_USER,
                    pass: process.env.MAILER_PASS,
                  },
                });
                const contenidoCorreo = await ejs.renderFile(path.join(__dirname, "../views/prendas/cambio_de_ubicacion.ejs"), {
                  anteriorUbicacion,
                  nuevaUbicacion
                });
                const mailOptions = {
                  from: {
                    name: process.env.MAILER_ALIAS,
                    address: process.env.MAILER_USER
                  },
                  to: ["SupervisoresMarketingSala.TG@boldt.com.ar"],
                  cc: ["jorge.sanabria@trileniumcasino.com.ar"],
                  subject: "Cambio de ubicación",
                  html: contenidoCorreo
                };
                await transporter.sendMail(mailOptions);
              } catch (error) {
                console.error('Error al enviar el correo:', error);
              }
            })();
      */
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al modificar la última ubicación');
  }
};
const ultimaUbicacion = async (req, res) => {
  try {
    const ultimaUbicacion = await UltimaUbicacion.findOne({
      where: {
        id: 1
      }
    });
    if (ultimaUbicacion.estado === 1) {
      console.log("Entre a la ultima ubicacion según una prenda");
      return res.status(200).json({ ubicacion: ultimaUbicacion.ubicacion, mensaje: 'true' });
    } else if (ultimaUbicacion.estado === 2) {
      console.log("Entre a la ultima ubicacion por cierre parcial de un turno");
      return res.status(200).json({ ubicacion: ultimaUbicacion.ubicacion, mensaje: 'false' });
    } else {
      console.log("Entre a la ultima ubicacion según la apertura de un turno");
      return res.status(200).json({ ubicacion: ultimaUbicacion.ubicacion, mensaje: 'true' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Hubo un error al obtener la última ubicación' });
  }
};
// ----------------- //

module.exports = {
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
  borrarPrenda,
  borrarPrendaEntregada,
  reenviarAlertaDeOlvido,
  editarPrendaDetalle,
  borrarPrendaDetalle,
  obtenerDNIMasUtilizadosPorHora,
  pasarPrendaAOlvidada,
  pasarPrendaOlvidadaADonada,
  obtenerPrendasOlvidadasYDonadas,
  obtenerPrendasPorTipoYEstado,
  obtenerPromedioTiempoPermanencia,
  obtenerEstadisticasPrendasPorMes
};
