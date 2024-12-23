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


const Usuario = db.Usuario;
const CategoriaCliente = db.CategoriaCliente;
const Cliente = db.Cliente;
const ClienteDetalle = db.ClienteDetalle;
const EstadoCliente = db.EstadoCliente;
const EstadoPedido = db.EstadoPedido;
const GastronomiaVIP = db.GastronomiaVIP;
const MenuVip = db.MenuVip;
const TipoPlato = db.TipoDePlato;
const PremioSlot = db.PremioSlot;
const ProductoCanjeado = db.ProductoCanjeado;
const RegistroCliente = db.RegistroCliente;
const TipoComida = db.TipoComida;
const TurnoVip = db.TurnoVip;
const VentaTicket = db.VentaTicket;

// ------------------------------ // 
// FUNCIONES EXTRAS // 
const restarHoras = (fecha, horas) => {
  const fechaModificada = new Date(fecha);
  fechaModificada.setHours(fechaModificada.getHours() - horas);
  return fechaModificada;
};

// SECTOR DE GESTIÓN DE TURNOS VIP

const aperturaTurno = async (req, res) => {
  const { io } = require('../app');
  let { novedad_apertura } = req.body;
  const usuario_id = req.usuario.id;
  const fecha_apertura = new Date();

  if (!novedad_apertura) {
    novedad_apertura = "Sin novedad";
  }

  try {
    const turnoAbierto = await TurnoVip.findOne({ where: { fecha_cierre: null, borrado: 1 } });
    if (turnoAbierto) {
      return res.status(400).json({ message: 'Ya hay un turno abierto sin cerrar' });
    }

    const turno = await TurnoVip.create({
      usuario_id_apertura: usuario_id,
      fecha_apertura,
      novedad_apertura,
    });

    io.emit('apertura-turno', { shouldAperturaTurno: true });

    res.status(200).json({ message: 'Turno abierto correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const agregarNovedadAlTurnoApertura = async (req, res) => {
  const { io } = require('../app');
  const { novedad_apertura } = req.body;
  const usuario_id = req.usuario.id;

  if (!novedad_apertura) {
    return res.status(400).json({ message: 'Falta la novedad' });
  }

  try {
    const turnoAbierto = await TurnoVip.findOne({ where: { fecha_cierre: null, borrado: 1 } });
    if (!turnoAbierto) {
      return res.status(400).json({ message: 'No hay un turno abierto para agregar novedad' });
    }

    if (turnoAbierto.usuario_id_apertura !== usuario_id) {
      return res.status(403).json({ message: 'No tienes permiso para agregar novedades a este turno' });
    }

    let nuevasNovedades;
    if (turnoAbierto.novedad_apertura === "Sin novedad") {
      nuevasNovedades = novedad_apertura;
    } else {
      nuevasNovedades = `${turnoAbierto.novedad_apertura}. ${novedad_apertura}`;
    }

    await turnoAbierto.update({
      novedad_apertura: nuevasNovedades,
      usuario_id_novedad: usuario_id,
    });

    io.emit('novedad-turno', { shouldNovedadTurno: true });
    res.status(200).json({ message: 'Novedad agregada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAperturaTardeUno = async (req, res) => {
  const { io } = require('../app');
  let { novedad_tarde_uno } = req.body;
  const usuario_id = req.usuario.id;

  if (!novedad_tarde_uno) {
    novedad_tarde_uno = "Sin novedad";
  }

  const now = new Date();
  const hora_tarde_uno = now.toTimeString().split(' ')[0];

  try {
    const turnoAbierto = await TurnoVip.findOne({ where: { fecha_cierre: null, borrado: 1 } });
    if (!turnoAbierto) {
      return res.status(400).json({ message: 'No hay un turno abierto para actualizar' });
    }

    const nuevasNovedades = turnoAbierto.novedad_tarde_uno ? `${turnoAbierto.novedad_tarde_uno}. ${novedad_tarde_uno}` : novedad_tarde_uno;

    await turnoAbierto.update({
      usuario_id_tarde_uno: usuario_id,
      hora_tarde_uno: hora_tarde_uno,
      novedad_tarde_uno: nuevasNovedades,
    });

    io.emit('apertura-turno', { shouldAperturaTurno: true });
    res.status(200).json({ message: 'Apertura tarde uno actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const agregarNovedadAlTurnoTardeUno = async (req, res) => {
  const { io } = require('../app');
  const { novedad_tarde_uno } = req.body;
  const usuario_id = req.usuario.id;

  if (!novedad_tarde_uno) {
    return res.status(400).json({ message: 'Falta la novedad' });
  }

  try {
    const turnoAbierto = await TurnoVip.findOne({ where: { fecha_cierre: null, borrado: 1 } });
    if (!turnoAbierto) {
      return res.status(400).json({ message: 'No hay un turno abierto para agregar novedad' });
    }

    if (turnoAbierto.usuario_id_tarde_uno !== usuario_id) {
      return res.status(403).json({ message: 'No tienes permiso para agregar novedades a este turno' });
    }

    let nuevasNovedades;
    if (turnoAbierto.novedad_tarde_uno === "Sin novedad") {
      nuevasNovedades = novedad_tarde_uno;
    } else {
      nuevasNovedades = `${turnoAbierto.novedad_tarde_uno}. ${novedad_tarde_uno}`;
    }

    await turnoAbierto.update({
      novedad_tarde_uno: nuevasNovedades,
    });

    io.emit('novedad-turno', { shouldNovedadTurno: true });
    res.status(200).json({ message: 'Novedad agregada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAperturaTardeDos = async (req, res) => {
  const { io } = require('../app');
  let { novedad_tarde_dos } = req.body;
  const usuario_id = req.usuario.id;
  const hora_tarde_dos = new Date().toTimeString().split(' ')[0];

  if (!novedad_tarde_dos) {
    novedad_tarde_dos = "Sin novedad";
  }

  try {
    const turnoAbierto = await TurnoVip.findOne({ where: { fecha_cierre: null, borrado: 1 } });
    if (!turnoAbierto) {
      return res.status(400).json({ message: 'No hay un turno abierto para actualizar' });
    }

    const nuevasNovedades = turnoAbierto.novedad_tarde_dos ? `${turnoAbierto.novedad_tarde_dos}. ${novedad_tarde_dos}` : novedad_tarde_dos;

    await turnoAbierto.update({
      usuario_id_tarde_dos: usuario_id,
      hora_tarde_dos,
      novedad_tarde_dos: nuevasNovedades,
    });

    io.emit('apertura-turno', { shouldAperturaTurno: true });

    res.status(200).json({ message: 'Turno tarde actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const agregarNovedadAlTurnoTardeDos = async (req, res) => {
  const { io } = require('../app');
  const { novedad_tarde_dos } = req.body;
  const usuario_id = req.usuario.id;

  if (!novedad_tarde_dos) {
    return res.status(400).json({ message: 'Falta la novedad' });
  }

  try {
    const turnoAbierto = await TurnoVip.findOne({ where: { fecha_cierre: null, borrado: 1 } });
    if (!turnoAbierto) {
      return res.status(400).json({ message: 'No hay un turno abierto para agregar novedad' });
    }

    if (turnoAbierto.usuario_id_tarde_dos !== usuario_id) {
      return res.status(403).json({ message: 'No tienes permiso para agregar novedades a este turno' });
    }

    let nuevasNovedades;
    if (turnoAbierto.novedad_tarde_dos === "Sin novedad") {
      nuevasNovedades = novedad_tarde_dos;
    } else {
      nuevasNovedades = `${turnoAbierto.novedad_tarde_dos}. ${novedad_tarde_dos}`;
    }

    await turnoAbierto.update({
      novedad_tarde_dos: nuevasNovedades,
    });

    io.emit('novedad-turno', { shouldNovedadTurno: true });

    res.status(200).json({ message: 'Novedad agregada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAperturaTurnoNocheUno = async (req, res) => {
  const { io } = require('../app');
  let { novedad_noche_uno } = req.body;
  const usuario_id = req.usuario.id;
  const hora_noche_uno = new Date().toTimeString().split(' ')[0];

  if (!novedad_noche_uno) {
    novedad_noche_uno = "Sin novedad";
  }

  try {
    const turnoAbierto = await TurnoVip.findOne({ where: { fecha_cierre: null, borrado: 1 } });
    if (!turnoAbierto) {
      return res.status(400).json({ message: 'No hay un turno abierto para actualizar' });
    }

    const nuevasNovedades = turnoAbierto.novedad_noche_uno ? `${turnoAbierto.novedad_noche_uno}. ${novedad_noche_uno}` : novedad_noche_uno;

    await turnoAbierto.update({
      usuario_id_noche_uno: usuario_id,
      hora_noche_uno,
      novedad_noche_uno: nuevasNovedades,
    });

    io.emit('apertura-turno', { shouldAperturaTurno: true });

    res.status(200).json({ message: 'Turno noche actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const agregarNovedadAlTurnoNocheUno = async (req, res) => {
  const { io } = require('../app');
  const { novedad_noche_uno } = req.body;
  const usuario_id = req.usuario.id;

  if (!novedad_noche_uno) {
    return res.status(400).json({ message: 'Falta la novedad' });
  }

  try {
    const turnoAbierto = await TurnoVip.findOne({ where: { fecha_cierre: null, borrado: 1 } });
    if (!turnoAbierto) {
      return res.status(400).json({ message: 'No hay un turno abierto para agregar novedad' });
    }

    if (turnoAbierto.usuario_id_noche_uno !== usuario_id) {
      return res.status(403).json({ message: 'No tienes permiso para agregar novedades a este turno' });
    }

    let nuevasNovedades;
    if (turnoAbierto.novedad_noche_uno === "Sin novedad") {
      nuevasNovedades = novedad_noche_uno;
    } else {
      nuevasNovedades = `${turnoAbierto.novedad_noche_uno}. ${novedad_noche_uno}`;
    }

    await turnoAbierto.update({
      novedad_noche_uno: nuevasNovedades,
    });

    io.emit('novedad-turno', { shouldNovedadTurno: true });

    res.status(200).json({ message: 'Novedad agregada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerTurnoAbierto = async (req, res) => {
  try {
    const turnoAbierto = await TurnoVip.findOne({
      include: [
        {
          model: Usuario,
          as: 'usuario_apertura',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
        {
          model: Usuario,
          as: 'usuario_tarde_uno',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
        {
          model: Usuario,
          as: 'usuario_tarde_dos',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
        {
          model: Usuario,
          as: 'usuario_noche_uno',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
        {
          model: Usuario,
          as: 'usuario_cierre',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
      ],
      where: { fecha_cierre: null, borrado: 1 }
    });

    if (!turnoAbierto) {
      return res.status(404).json({ message: 'No hay una jornada abierto' });
    }

    const turnoFormateado = {
      ...turnoAbierto.toJSON(),
      fecha_apertura: moment(turnoAbierto.fecha_apertura).tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss')
    };

    return res.status(200).json({
      turno: turnoFormateado,
    });
  } catch (error) {
    console.error("Error al obtener el turno abierto:", error);
    return res.status(500).json({ message: 'Error al obtener el turno abierto' });
  }
};

const obtenerTodosLosTurnosPorFecha = async (req, res) => {
  let { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio) {
    fechaInicio = moment().subtract(7, 'days').startOf('day').subtract(3, 'hours').toISOString();
  }
  if (!fechaFin) {
    fechaFin = moment().endOf('day').subtract(3, 'hours').toISOString();
  }

  try {
    const turnos = await TurnoVip.findAll({
      where: {
        fecha_apertura: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        borrado: 1,
        fecha_cierre: { [Op.ne]: null },
        usuario_id_cierre: { [Op.ne]: null }
      },
      include: [
        {
          model: Usuario,
          as: 'usuario_apertura',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
        {
          model: Usuario,
          as: 'usuario_tarde_uno',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
        {
          model: Usuario,
          as: 'usuario_tarde_dos',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
        {
          model: Usuario,
          as: 'usuario_noche_uno',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
        {
          model: Usuario,
          as: 'usuario_cierre',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
      ],
      order: [['fecha_apertura', 'DESC']]
    });

    if (!turnos.length) {
      return res.status(404).json({ message: 'No hay turnos en el periodo seleccionado' });
    }

    const turnosFormateados = turnos.map(turno => ({
      ...turno.toJSON(),
      fecha_apertura: moment(turno.fecha_apertura).tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss'),
      fecha_cierre: moment(turno.fecha_cierre).tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss')
    }));

    return res.status(200).json(turnosFormateados);

  } catch (error) {
    console.error("Error al obtener los turnos del periodo:", error);
    return res.status(500).json({ message: 'Error al obtener los turnos del periodo' });
  }
};

const cierreTurno = async (req, res) => {
  const { io } = require('../app');
  let { novedad_cierre } = req.body;
  const usuario_id = req.usuario.id;
  const fecha_cierre = new Date();

  if (!novedad_cierre) {
    novedad_cierre = "Sin novedad";
  }

  try {
    const turnoAbierto = await TurnoVip.findOne({ where: { fecha_cierre: null, borrado: 1 } });
    if (!turnoAbierto) {
      return res.status(400).json({ message: 'No hay un turno abierto para cerrar' });
    }

    const turnoCerrado = await turnoAbierto.update({
      usuario_id_cierre: usuario_id,
      fecha_cierre,
      novedad_cierre,
    });

    const turno = await TurnoVip.findOne({
      include: [
        {
          model: Usuario,
          as: 'usuario_apertura',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
        {
          model: Usuario,
          as: 'usuario_tarde_uno',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
        {
          model: Usuario,
          as: 'usuario_tarde_dos',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
        {
          model: Usuario,
          as: 'usuario_noche_uno',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
        {
          model: Usuario,
          as: 'usuario_cierre',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
      ],
      where: { id: turnoCerrado.id },
    });

    const fechaApertura = turnoAbierto.fecha_apertura;
    const fechaCierre = turnoAbierto.fecha_cierre || new Date();
    const fechaInicio = restarHoras(fechaApertura, 3);

      /* Premios Post Cierre */
      const premios = await PremioSlot.findAll({
        attributes: ['id', 'numero_slot', 'importe', 'fecha'],
        include: [
          {
            model: Cliente,
            as: 'cliente',
            include: [
              {
                model: CategoriaCliente,
                as: 'categoriaCliente',
                attributes: ['tipo'],
              },
            ],
            attributes: ['id', 'nombre', 'apellido'],
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'apellido', 'legajo'],
          }
        ],
        where: {
          fecha: {
            [Op.between]: [fechaInicio, fechaCierre]
          },
          borrado: 1
        },
        order: [['fecha', 'DESC']]
      });

      const premiosFormateados = premios.map(premio => ({
        ...premio.toJSON(),
        fecha: moment(premio.fecha).tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss')
      }));
      const importeTotal = premios.reduce((total, premio) => total + parseFloat(premio.importe), 0);
      const cantidadPremios = premios.length;
      /* - - - - - */

      /* Ventas Post Cierre */
      const ventas = await VentaTicket.findAll({
        attributes: ['id', 'monto', 'fecha'],
        include: [
          {
            model: Cliente,
            as: 'cliente',
            include: [
              {
                model: CategoriaCliente,
                as: 'categoriaCliente',
                attributes: ['tipo'],
              },
            ],
            attributes: ['id', 'nombre', 'apellido'],
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'apellido', 'legajo'],
          }
        ],
        where: {
          fecha: {
            [Op.between]: [fechaInicio, fechaCierre]
          },
          borrado: 1
        },
        order: [['fecha', 'DESC']]
      });

      const valorTotal = ventas.reduce((total, venta) => total + parseFloat(venta.monto), 0);
      const ventasFormateadas = ventas.map(venta => ({
        ...venta.toJSON(),
        fecha: moment(venta.fecha).format('YYYY-MM-DD HH:mm:ss')
      }));
      const totalCambios = await VentaTicket.count({
        where: {
          borrado: 1,
          fecha: {
            [Op.between]: [fechaInicio, fechaCierre]
          }
        }
      });
      /* - - - - - */

      /* Canjes Post Cierre */
      const canjes = await ProductoCanjeado.findAll({
        attributes: ['id', 'producto', 'cantidad', 'fecha'],
        include: [
          {
            model: Cliente,
            as: 'cliente',
            include: [
              {
                model: CategoriaCliente,
                as: 'categoriaCliente',
                attributes: ['tipo'],
              },
            ],
            attributes: ['id', 'nombre', 'apellido'],
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'apellido', 'legajo'],
          }
        ],
        where: {
          fecha: {
            [Op.between]: [fechaInicio, fechaCierre]
          },
          borrado: 1
        },
        order: [['fecha', 'DESC']]
      });

      const cantidadTotal = canjes.reduce((total, canje) => total + parseInt(canje.cantidad), 0);
      const canjesFormateados = canjes.map(canje => ({
        ...canje.toJSON(),
        fecha: moment(canje.fecha).format('YYYY-MM-DD HH:mm:ss')
      }));
      /* - - - - - */

      /* Gastronomia Post Cierre */
      const gastronomia = await GastronomiaVIP.findAll({
        attributes: ['id', 'fecha', 'observacion', 'entrega', 'cantidad'],
        include: [
          {
            model: MenuVip,
            as: 'menu_vip',
            attributes: ['id', 'nombre', 'detalle', 'disponible', 'cantidad'],
            include: [
              {
                model: TipoPlato,
                as: 'tipoDePlato',
                attributes: ['tipo'],
              }
            ]
          },
          {
            model: Cliente,
            as: 'cliente',
            attributes: ['id', 'nombre', 'apellido'],
            include: [
              {
                model: CategoriaCliente,
                as: 'categoriaCliente',
                attributes: ['tipo'],
              },
            ],
          },
          {
            model: TipoComida,
            as: 'tipo_comida',
            attributes: ['id', 'tipo'],
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'apellido', 'legajo'],
          },
          {
            model: EstadoPedido,
            as: 'estado_pedido',
            attributes: ['id', 'tipo'],
          }
        ],
        where: {
          fecha: {
            [Op.between]: [fechaInicio, fechaCierre]
          },
          borrado: 1
        },
        order: [['fecha', 'DESC']]
      });

      const registrosFormateados = gastronomia.map(registro => ({
        ...registro.toJSON(),
        fecha: moment(registro.fecha).format('YYYY-MM-DD HH:mm:ss')
      }));
      const totalPlatos = gastronomia.length;
      /* - - - - - */

      /* Registro de clientes Post Cierre */
      const registros = await RegistroCliente.findAll({
        attributes: ['id', 'ingreso', 'egreso', 'observacion', 'permanencia', 'valor_cambio_total'],
        include: [
          {
            model: Cliente,
            as: 'cliente',
            include: [
              {
                model: CategoriaCliente,
                as: 'categoriaCliente',
                attributes: ['tipo'],
              },
            ],
            attributes: ['id', 'nombre', 'apellido'],
          },
          {
            model: Usuario,
            as: 'usuario_ingreso',
            attributes: ['nombre', 'apellido', 'legajo'],
          },
          {
            model: Usuario,
            as: 'usuario_egreso',
            attributes: ['nombre', 'apellido', 'legajo'],
          }
        ],
        where: {
          ingreso: {
            [Op.between]: [fechaInicio, fechaCierre]
          },
          borrado: 1
        },
        order: [['ingreso', 'DESC']]
      });

      const hoy = moment().tz('America/Argentina/Buenos_Aires').startOf('day');
      const registrosConDetalles = await Promise.all(registros.map(async registro => {
        const cliente = registro.cliente;
        const detalleCliente = await ClienteDetalle.findOne({
          where: {
            cliente_id: cliente.id,
            borrado: 1
          },
          attributes: [
            'fecha_nacimiento',
            'fecha_alta',
            'fecha_baja',
            'motivo_baja',
            'gusto_gastronomico',
            'equipo_futbol',
            'profesion',
            'gusto_musical'
          ]
        });
        let cumpleAniosHoy = false;
        let edad = null;
        if (detalleCliente) {
          const fechaNacimiento = moment(detalleCliente.fecha_nacimiento).tz('America/Argentina/Buenos_Aires').startOf('day');
          cumpleAniosHoy = (hoy.date() === fechaNacimiento.date() && hoy.month() === fechaNacimiento.month());
          edad = hoy.year() - fechaNacimiento.year();
          const yaCumplioEsteAno = (hoy.month() > fechaNacimiento.month()) ||
            (hoy.month() === fechaNacimiento.month() && hoy.date() >= fechaNacimiento.date());
          if (!yaCumplioEsteAno) {
            edad--;
          }
        }
        const ingreso = new Date(registro.ingreso);
        const egreso = registro.egreso ? new Date(registro.egreso) : null;
        const permanenciaMs = egreso ? Math.abs(egreso - ingreso) : Math.abs(new Date() - ingreso);
        const horas = Math.floor(permanenciaMs / 36e5);
        const minutos = Math.floor((permanenciaMs % 36e5) / 60000);
        const permanenciaLegible = horas > 0
          ? `${horas} hora${horas > 1 ? 's' : ''} y ${minutos} minuto${minutos > 1 ? 's' : ''}`
          : `${minutos} minuto${minutos > 1 ? 's' : ''}`;

        const historialCambios = await VentaTicket.findAll({
          include: [
            {
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre', 'apellido', 'legajo'],
            }
          ],
          where: {
            cliente_id: cliente.id,
            borrado: 1,
            fecha: {
              [Op.between]: [fechaInicio, fechaCierre]
            }
          },
          order: [['fecha', 'DESC']],
          limit: 10
        });

        return {
          ...registro.toJSON(),
          permanenciaLegible,
          egreso: registro.egreso ? registro.egreso : null,
          cumpleAniosHoy,
          edad,
          detallesCliente: detalleCliente ? detalleCliente.toJSON() : null,
          historialCambios: historialCambios.map(cambio => cambio.toJSON())
        };
      }));

      const permanenciaTotalMs = registros.reduce((total, registro) => {
        const ingreso = new Date(registro.ingreso);
        const egreso = registro.egreso ? new Date(registro.egreso) : new Date();
        return total + Math.abs(egreso - ingreso);
      }, 0);

      const totalHoras = Math.floor(permanenciaTotalMs / 36e5);
      const totalMinutos = Math.floor((permanenciaTotalMs % 36e5) / 60000);

      const permanenciaTotalLegible = totalHoras > 0
        ? `${totalHoras} hora${totalHoras > 1 ? 's' : ''} y ${totalMinutos} minuto${totalMinutos > 1 ? 's' : ''}`
        : `${totalMinutos} minuto${totalMinutos > 1 ? 's' : ''}`;

      const valorCambioTotal = registros.reduce((total, registro) => total + parseFloat(registro.valor_cambio_total), 0);

      io.emit('cierre-turno', { shouldCierreTurno: true });

      const message = 'Turno cerrado correctamente';

      const responseData = {
        message,
        turno,
        premios,
        premiosFormateados,
        importeTotal,
        cantidadPremios,
        ventas: ventasFormateadas,
        valorTotal,
        totalCambios,
        canjes: canjesFormateados,
        cantidadTotal,
        gastronomia: registrosFormateados,
        totalPlatos,
        registros: registrosConDetalles,
        permanenciaTotal: permanenciaTotalLegible,
        valorCambioTotal,
      };

      res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------------------ //

// SECTOR DE GESTIÓN DE PREMIOS VIP

const nuevoPremio = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const { numero_slot, importe, cliente_id } = req.body;
  const fecha = new Date();

  if (!numero_slot || !importe || !cliente_id) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    const premio = await PremioSlot.create({
      numero_slot,
      importe,
      fecha,
      cliente_id,
      usuario_id: usuarioId,
    });

    io.emit('nuevo-premio', { shouldNuevoPremio: true });

    res.status(201).json({ message: 'Premio creado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editarPremio = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const premioId = req.query.id;
  const { numero_slot, importe, cliente_id } = req.body;
  const fecha = new Date();

  const updateData = {};

  if (numero_slot !== undefined) {
    updateData.numero_slot = numero_slot;
  }
  if (importe !== undefined) {
    updateData.importe = importe;
  }
  if (cliente_id !== undefined) {
    updateData.cliente_id = cliente_id;
  }

  updateData.fecha = fecha;
  updateData.usuario_id = usuarioId;

  try {
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No hay datos nuevos para actualizar' });
    }

    const premio = await PremioSlot.findOne({ where: { id: premioId } });
    if (!premio) {
      return res.status(404).json({ message: 'Premio no encontrado' });
    }

    await premio.update(updateData);

    io.emit('editar-premio', { shouldEditarPremio: true });
    res.status(200).json({ message: 'Premio actualizado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const borrarPremio = async (req, res) => {
  const { io } = require('../app');
  const premioId = req.query.id;
  const fecha = new Date();
  const usuarioId = req.usuario.id;

  try {
    const premio = await PremioSlot.findOne({ where: { id: premioId } });
    if (!premio) {
      return res.status(404).json({ message: 'Premio no encontrado' });
    }

    await premio.update({
      borrado: 0,
      fecha,
      usuario_id: usuarioId,
    });

    io.emit('borrar-premio', { shouldBorrarPremio: true });
    res.status(200).json({ message: 'Premio eliminado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerPremiosDelTurnoAbierto = async (req, res) => {
  try {
    const turnoAbierto = await TurnoVip.findOne({ where: { fecha_cierre: null, borrado: 1 } });

    if (!turnoAbierto) {
      return res.status(404).json({ message: 'No hay un turno abierto' });
    }

    const fechaApertura = turnoAbierto.fecha_apertura;
    const fechaCierre = turnoAbierto.fecha_cierre || new Date();
    const fechaInicio = restarHoras(fechaApertura, 3);

    const premios = await PremioSlot.findAll({
      attributes: ['id', 'numero_slot', 'importe', 'fecha'],
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            {
              model: CategoriaCliente,
              as: 'categoriaCliente',
              attributes: ['tipo'],
            },
          ],
          attributes: ['id', 'nombre', 'apellido'],
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'legajo'],
        }
      ],
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaCierre]
        },
        borrado: 1
      },
      order: [['fecha', 'DESC']]
    });

    if (!premios) {
      return res.status(404).json({ message: 'No hay premios en el turno abierto' });
    }

    const premiosFormateados = premios.map(premio => ({
      ...premio.toJSON(),
      fecha: moment(premio.fecha).tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss')
    }));

    const importeTotal = premios.reduce((total, premio) => total + parseFloat(premio.importe), 0);
    const cantidadPremios = premios.length;

    return res.status(200).json({
      premios: premiosFormateados,
      importeTotal,
      cantidadPremios
    });
  } catch (error) {
    console.error("Error al obtener los premios del turno abierto:", error);
    return res.status(500).json({ message: 'Error al obtener los premios del turno abierto' });
  }
};

const obtenerPremiosPorCliente = async (req, res) => {

  const clienteId = req.query.cliente_id;
  let fechaInicio = req.query.fechaInicio;
  let fechaFin = req.query.fechaFin;

  if (!fechaInicio || !fechaFin) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    fechaInicio = fechaInicio || firstDay.toISOString().split('T')[0];
    fechaFin = fechaFin || lastDay.toISOString().split('T')[0];
  }

  try {
    const premios = await PremioSlot.findAll({
      attributes: ['id', 'numero_slot', 'importe', 'fecha'],
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            {
              model: CategoriaCliente,
              as: 'categoriaCliente',
              attributes: ['tipo'],
            },
          ],
          attributes: ['id', 'nombre', 'apellido'],
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'legajo'],
        }
      ],
      where: {
        cliente_id: clienteId,
        fecha: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        borrado: 1
      }
    });

    if (!premios) {
      return res.status(404).json({ message: 'No hay premios para el cliente' });
    }

    const premiosFormateados = premios.map(premio => ({
      ...premio.toJSON(),
      fecha: moment(premio.fecha).tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss')
    }));

    const importeTotal = premios.reduce((total, premio) => total + parseFloat(premio.importe), 0);
    const cantidadPremios = premios.length;

    return res.status(200).json({
      premios: premiosFormateados,
      importeTotal,
      cantidadPremios
    });

  } catch (error) {
    console.error("Error al obtener los premios del cliente:", error);
    return res.status(500).json({ message: 'Error al obtener los premios del cliente' });
  }
};

const obtenerPremiosMensuales = async (req, res) => {
  let { fechaInicio, fechaFin } = req.query;
  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  if (!fechaInicio || !fechaFin) {
    const now = moment().tz('America/Argentina/Buenos_Aires');
    const firstDay = now.clone().startOf('month');
    const lastDay = now.clone().endOf('month');

    fechaInicio = fechaInicio || firstDay.format('YYYY-MM-DD');
    fechaFin = fechaFin || lastDay.format('YYYY-MM-DD');
  }

  try {
    const premios = await PremioSlot.findAll({
      attributes: ['id', 'numero_slot', 'importe', 'fecha'],
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            {
              model: CategoriaCliente,
              as: 'categoriaCliente',
              attributes: ['tipo'],
            },
          ],
          attributes: ['id', 'nombre', 'apellido'],
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'legajo'],
        }
      ],
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        borrado: 1
      }
    });

    if (!premios.length) {
      return res.status(404).json({ message: 'No hay premios en el rango de fechas seleccionado' });
    }

    const premiosFormateados = premios.map(premio => ({
      ...premio.toJSON(),
      fecha: moment(premio.fecha).tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss')
    }));

    const importeTotal = premios.reduce((total, premio) => total + parseFloat(premio.importe), 0);
    const cantidadPremios = premios.length;

    const mes = moment(fechaInicio).tz('America/Argentina/Buenos_Aires').month();
    const nombreMes = nombresMeses[mes];

    const top3Premios = premiosFormateados
      .sort((a, b) => b.importe - a.importe)
      .slice(0, 3)
      .map((premio, index) => ({ ...premio, puesto: index + 1 }));

    return res.status(200).json({
      premios: premiosFormateados,
      importeTotal,
      cantidadPremios,
      top3Premios,
      fechasSeleccionadas: {
        fechaInicio,
        fechaFin,
        numeroMes: mes + 1,
        nombreMes
      }
    });
  } catch (error) {
    console.error("Error al obtener los premios mensuales:", error);
    return res.status(500).json({ message: 'Error al obtener los premios mensuales' });
  }
};

const obtenerPremiosMensualesAnuales = async (req, res) => {
  const year = new Date().getFullYear();
  const premiosPorMes = [];
  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  try {
    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const fechaInicio = firstDay.toISOString().split('T')[0];
      const fechaFin = lastDay.toISOString().split('T')[0];

      const premios = await PremioSlot.findAll({
        attributes: ['id', 'numero_slot', 'importe', 'fecha'],
        include: [
          {
            model: Cliente,
            as: 'cliente',
            include: [
              {
                model: CategoriaCliente,
                as: 'categoriaCliente',
                attributes: ['tipo'],
              },
            ],
            attributes: ['id', 'nombre', 'apellido'],
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'apellido', 'legajo'],
          }
        ],
        where: {
          fecha: {
            [Op.between]: [fechaInicio, fechaFin]
          },
          borrado: 1
        }
      });

      const premiosFormateados = premios.map(premio => ({
        ...premio.toJSON(),
        fecha: moment(premio.fecha).tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss')
      }));

      const importeTotal = premios.reduce((total, premio) => total + parseFloat(premio.importe), 0);
      const cantidadPremios = premios.length;

      const top3Premios = premiosFormateados
        .sort((a, b) => b.importe - a.importe)
        .slice(0, 3)
        .map((premio, index) => ({ ...premio, puesto: index + 1 }));

      premiosPorMes.push({
        mes: month + 1,
        nombreMes: nombresMeses[month],
        premios: premiosFormateados,
        importeTotal,
        cantidadPremios,
        top3Premios
      });
    }

    return res.status(200).json(premiosPorMes);
  } catch (error) {
    console.error("Error al obtener los premios mensuales anuales:", error);
    return res.status(500).json({ message: 'Error al obtener los premios mensuales anuales' });
  }
};

const obtenerPremiosDiariosDeLaSemana = async (req, res) => {
  const diasDeLaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const premiosPorDia = [];

  try {
    for (let i = 0; i < 7; i++) {
      const fecha = moment().tz('America/Argentina/Buenos_Aires').subtract(i, 'days');
      const fechaInicio = fecha.clone().startOf('day').subtract(3, 'hours').format('YYYY-MM-DD HH:mm:ss');
      const fechaFin = fecha.clone().endOf('day').subtract(3, 'hours').format('YYYY-MM-DD HH:mm:ss');

      const premios = await PremioSlot.findAll({
        attributes: ['id', 'numero_slot', 'importe', 'fecha'],
        include: [
          {
            model: Cliente,
            as: 'cliente',
            include: [
              {
                model: CategoriaCliente,
                as: 'categoriaCliente',
                attributes: ['tipo'],
              },
            ],
            attributes: ['id', 'nombre', 'apellido'],
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'apellido', 'legajo'],
          }
        ],
        where: {
          fecha: {
            [Op.between]: [fechaInicio, fechaFin]
          },
          borrado: 1
        }
      });

      const premiosFormateados = premios.map(premio => ({
        ...premio.toJSON(),
        fecha: moment(premio.fecha).tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss')
      }));

      const importeTotal = premios.reduce((total, premio) => total + parseFloat(premio.importe), 0);
      const cantidadPremios = premios.length;

      const top3Premios = premiosFormateados
        .sort((a, b) => b.importe - a.importe)
        .slice(0, 3)
        .map((premio, index) => ({ ...premio, puesto: index + 1 }));

      premiosPorDia.push({
        dia: diasDeLaSemana[fecha.day()],
        fecha: fecha.format('YYYY-MM-DD'),
        premios: premiosFormateados,
        importeTotal,
        cantidadPremios,
        top3Premios
      });
    }

    return res.status(200).json(premiosPorDia);
  } catch (error) {
    console.error("Error al obtener los premios diarios de la semana:", error);
    return res.status(500).json({ message: 'Error al obtener los premios diarios de la semana' });
  }
};

const obtenerPremiosDeSlotPorFecha = async (req, res) => {
  const { fechaFrom, fechaTo, registros, numero_slot } = req.query;

  try {
    const fechaInicio = moment.tz(fechaFrom, 'YYYY-MM-DD', 'America/Argentina/Buenos_Aires')
      .startOf('day')
      .subtract(3, 'hours')
      .set({ hour: 21, minute: 0, second: 0, millisecond: 0 })
      .toDate();

    const fechaFin = moment.tz(fechaTo, 'YYYY-MM-DD', 'America/Argentina/Buenos_Aires')
      .endOf('day')
      .add(1, 'day')
      .set({ hour: 20, minute: 59, second: 59, millisecond: 0 })
      .toDate();

    const premios = await PremioSlot.findAll({
      attributes: ['id', 'numero_slot', 'importe', 'fecha'],
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        numero_slot,
        borrado: 1
      },
      order: [['fecha', 'DESC']],
      limit: registros ? parseInt(registros) : 10
    });

    if (!premios.length) {
      return res.status(404).json({ message: 'No hay premios en el rango de fechas seleccionado' });
    }

    const premiosFormateados = premios.map(premio => ({
      ...premio.toJSON(),
      fecha: moment(premio.fecha).tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss')
    }));

    const importeTotal = premios.reduce((total, premio) => total + parseFloat(premio.importe), 0);
    const cantidadPremios = premios.length;

    const ultimoPremioMayorImporte = await PremioSlot.findOne({
      attributes: ['id', 'numero_slot', 'importe', 'fecha'],
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        numero_slot,
        borrado: 1
      },
      order: [['importe', 'DESC'], ['fecha', 'DESC']]
    });

    const ultimoPremioFormateado = ultimoPremioMayorImporte ? {
      ...ultimoPremioMayorImporte.toJSON(),
      fecha: moment(ultimoPremioMayorImporte.fecha).tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss')
    } : null;

    return res.status(200).json({
      premios: premiosFormateados,
      importeTotal,
      cantidadPremios,
      ultimoPremioMayorImporte: ultimoPremioFormateado
    });
  } catch (error) {
    console.error("Error al obtener los premios por fecha:", error);
    return res.status(500).json({ message: 'Error al obtener los premios por fecha' });
  }
};

const obtenerPremiosSlotsPorFecha = async (req, res) => {

  let { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio) {
    fechaInicio = moment().subtract(7, 'days').startOf('day').subtract(3, 'hours').toISOString();
  }
  if (!fechaFin) {
    fechaFin = moment().endOf('day').subtract(3, 'hours').toISOString();
  }

  try {
    const premios = await PremioSlot.findAll({
      attributes: ['id', 'numero_slot', 'importe', 'fecha'],
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            {
              model: CategoriaCliente,
              as: 'categoriaCliente',
              attributes: ['tipo'],
            },
          ],
          attributes: ['id', 'nombre', 'apellido'],
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'legajo'],
        }
      ],
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        borrado: 1
      },
      order: [['fecha', 'DESC']]
    });

    if (!premios.length) {
      return res.status(404).json({ message: 'No hay premios en el rango de fechas seleccionado' });
    }

    const premiosFormateados = premios.map(premio => ({
      ...premio.toJSON(),
      fecha: moment(premio.fecha).tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss')
    }));

    const importeTotal = premios.reduce((total, premio) => total + parseFloat(premio.importe), 0);
    const cantidadPremios = premios.length;

    return res.status(200).json({
      premios: premiosFormateados,
      importeTotal,
      cantidadPremios
    });

  } catch (error) {
    console.error("Error al obtener los premios por fecha:", error);
    return res.status(500).json({ message: 'Error al obtener los premios por fecha' });
  }
};


// ------------------------------ //

// SECTOR DE GESTIÓN DE REGISTRO DE INGRESO Y EGRESO DE CLIENTES Y CAMBIOS DE EFECTIVO.

const registroDeIngresoDeCliente = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const { cliente_id, observacion } = req.body;

  if (!cliente_id) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  if (!observacion) {
    observacion = "Sin novedad";
  }

  try {
    const registroExistente = await RegistroCliente.findOne({
      where: {
        cliente_id,
        borrado: 1,
        egreso: null,
        permanencia: "En sala",
        usuario_id_egreso: null
      }
    });

    if (registroExistente) {
      return res.status(400).json({ message: 'No se puede crear un nuevo registro hasta que se registre el egreso del cliente actual.' });
    }

    const ingreso = new Date();

    const registro = await RegistroCliente.create({
      cliente_id,
      ingreso,
      observacion,
      usuario_id_ingreso: usuarioId,
    });

    io.emit('nuevo-registro-ingreso', { shouldNuevoRegistroIngreso: true });

    res.status(201).json({ message: 'Registro de ingreso creado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const modificarRegistroDeIngresoDeCliente = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const { cliente_id, observacion, ingreso } = req.body;

  if (!cliente_id) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    const registroExistente = await RegistroCliente.findOne({
      where: {
        cliente_id,
        borrado: 1,
        egreso: null,
        permanencia: "En sala",
        usuario_id_egreso: null
      }
    });

    if (!registroExistente) {
      return res.status(404).json({ message: 'No se encontró un registro de ingreso para el cliente actual.' });
    }

    const actualizacion = {
      cliente_id,
      observacion,
      usuario_id_ingreso: usuarioId,
    };

    if (ingreso) {
      actualizacion.ingreso = new Date(ingreso);
    }

    await registroExistente.update(actualizacion);

    io.emit('modificar-registro-ingreso', { shouldModificarRegistroIngreso: true });

    res.status(200).json({ message: 'Registro de ingreso modificado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const registroDeEgresoDeCliente = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const { observacion } = req.body;
  const clienteId = req.query.cliente_id;

  if (!clienteId) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    const registro = await RegistroCliente.findOne({ where: { cliente_id: clienteId, borrado: 1, egreso: null, permanencia: "En sala", usuario_id_egreso: null } });

    if (!registro) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    const ingreso = new Date(registro.ingreso);
    const egresoDate = new Date();
    const permanenciaMs = Math.abs(egresoDate - ingreso);

    const horas = Math.floor(permanenciaMs / 36e5);
    const minutos = Math.floor((permanenciaMs % 36e5) / 60000);
    const permanenciaLegible = horas > 0
      ? `${horas} hora${horas > 1 ? 's' : ''} y ${minutos} minuto${minutos > 1 ? 's' : ''}`
      : `${minutos} minuto${minutos > 1 ? 's' : ''}`;

    let nuevaObservacion;

    if (registro.observacion.toLowerCase() === 'sin novedad') {
      nuevaObservacion = observacion ? `${observacion}` : 'Sin novedad';
    } else {
      nuevaObservacion = observacion ? `${registro.observacion}.\n${observacion}` : registro.observacion;
    }

    await registro.update({
      egreso: egresoDate,
      observacion: nuevaObservacion,
      usuario_id_egreso: usuarioId,
      permanencia: permanenciaMs / 36e5,
    });

    io.emit('nuevo-registro-egreso', { shouldNuevoRegistroEgreso: true });

    res.status(200).json({
      message: 'Registro de egreso actualizado correctamente',
      permanencia: permanenciaLegible
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const modificarRegistroDeEgresoDeCliente = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const { observacion, egreso } = req.body;
  const clienteId = req.query.cliente_id;

  if (!clienteId) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    const registro = await RegistroCliente.findOne({ where: { cliente_id: clienteId, borrado: 1, egreso: null, permanencia: "En sala", usuario_id_egreso: null } });

    if (!registro) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    const ingreso = new Date(registro.ingreso);
    const egresoDate = new Date(egreso);
    const permanenciaMs = Math.abs(egresoDate - ingreso);

    const horas = Math.floor(permanenciaMs / 36e5);
    const minutos = Math.floor((permanenciaMs % 36e5) / 60000);
    const permanenciaLegible = horas > 0
      ? `${horas} hora${horas > 1 ? 's' : ''} y ${minutos} minuto${minutos > 1 ? 's' : ''}`
      : `${minutos} minuto${minutos > 1 ? 's' : ''}`;

    const nuevaObservacion = registro.observacion
      ? `${registro.observacion}\n${observacion}`
      : observacion;

    await registro.update({
      egreso: egresoDate,
      observacion: nuevaObservacion,
      usuario_id_egreso: usuarioId,
      permanencia: permanenciaMs / 36e5,
    });

    io.emit('modificar-registro-egreso', { shouldModificarRegistroEgreso: true });

    res.status(200).json({
      message: 'Registro de egreso actualizado correctamente',
      permanencia: permanenciaLegible
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const eliminarRegistroDeCliente = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const { registro_id, cliente_id } = req.query;

  try {
    const registro = await RegistroCliente.findOne({ where: { id: registro_id, cliente_id, borrado: 1 } });

    if (!registro) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    await registro.update({
      borrado: 0,
      egreso: new Date(),
      permanencia: 0,
      usuario_id_egreso: usuarioId,
      observacion: "Registro eliminado"
    });

    io.emit('eliminar-registro', { shouldEliminarRegistro: true });

    res.status(200).json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const agregarObservacionACliente = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const { observacion } = req.body;
  const registroId = req.query.registro_id;

  if (!observacion || !registroId) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    const registro = await RegistroCliente.findOne({ where: { id: registroId, borrado: 1, egreso: null, permanencia: "En sala", usuario_id_egreso: null } });

    if (!registro) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    let nuevaObservacion;
    if (registro.observacion.toLowerCase() === 'sin novedad') {
      nuevaObservacion = `${observacion}`;
    } else {
      nuevaObservacion = `${registro.observacion.trim().replace(/(\.|\n)*$/, '')}.\n${observacion}`;
    }

    await registro.update({
      observacion: nuevaObservacion,
    });

    io.emit('nueva-novedad', { shouldNuevaNovedad: true });

    res.status(200).json({ message: 'Novedad agregada correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerRegistrosDeClientesTurnoAbierto = async (req, res) => {
  try {
    const turnoAbierto = await TurnoVip.findOne({ where: { fecha_cierre: null, borrado: 1 } });

    if (!turnoAbierto) {
      return res.status(404).json({ message: 'No hay un turno abierto' });
    }

    const fechaApertura = turnoAbierto.fecha_apertura;
    const fechaCierre = turnoAbierto.fecha_cierre || new Date();
    const fechaInicio = restarHoras(fechaApertura, 3);

    const registros = await RegistroCliente.findAll({
      attributes: ['id', 'ingreso', 'egreso', 'observacion', 'permanencia', 'valor_cambio_total'],
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            {
              model: CategoriaCliente,
              as: 'categoriaCliente',
              attributes: ['tipo'],
            },
          ],
          attributes: ['id', 'nombre', 'apellido'],
        },
        {
          model: Usuario,
          as: 'usuario_ingreso',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
        {
          model: Usuario,
          as: 'usuario_egreso',
          attributes: ['nombre', 'apellido', 'legajo'],
        }
      ],
      where: {
        ingreso: {
          [Op.between]: [fechaInicio, fechaCierre]
        },
        borrado: 1
      },
      order: [['ingreso', 'DESC']]
    });

    if (!registros.length) {
      return res.status(404).json({ message: 'No hay registros de clientes para el turno abierto' });
    }

    const hoy = moment().tz('America/Argentina/Buenos_Aires').startOf('day');

    const registrosConDetalles = await Promise.all(registros.map(async registro => {
      const cliente = registro.cliente;
      const detalleCliente = await ClienteDetalle.findOne({
        where: {
          cliente_id: cliente.id,
          borrado: 1
        },
        attributes: [
          'fecha_nacimiento',
          'fecha_alta',
          'fecha_baja',
          'motivo_baja',
          'gusto_gastronomico',
          'equipo_futbol',
          'profesion',
          'gusto_musical'
        ]
      });

      let cumpleAniosHoy = false;
      let edad = null;
      if (detalleCliente) {
        const fechaNacimiento = moment(detalleCliente.fecha_nacimiento).tz('America/Argentina/Buenos_Aires').startOf('day');
        cumpleAniosHoy = (hoy.date() === fechaNacimiento.date() && hoy.month() === fechaNacimiento.month());
        edad = hoy.year() - fechaNacimiento.year();
        const yaCumplioEsteAno = (hoy.month() > fechaNacimiento.month()) ||
          (hoy.month() === fechaNacimiento.month() && hoy.date() >= fechaNacimiento.date());
        if (!yaCumplioEsteAno) {
          edad--;
        }
      }

      const ingreso = new Date(registro.ingreso);
      const egreso = registro.egreso ? new Date(registro.egreso) : null;
      const permanenciaMs = egreso ? Math.abs(egreso - ingreso) : Math.abs(new Date() - ingreso);

      const horas = Math.floor(permanenciaMs / 36e5);
      const minutos = Math.floor((permanenciaMs % 36e5) / 60000);

      const permanenciaLegible = horas > 0
        ? `${horas} hora${horas > 1 ? 's' : ''} y ${minutos} minuto${minutos > 1 ? 's' : ''}`
        : `${minutos} minuto${minutos > 1 ? 's' : ''}`;

      const historialCambios = await VentaTicket.findAll({
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'apellido', 'legajo'],
          }
        ],
        where: {
          cliente_id: cliente.id,
          borrado: 1,
          fecha: {
            [Op.between]: [fechaInicio, fechaCierre]
          }
        },
        order: [['fecha', 'DESC']],
        limit: 10
      });

      return {
        ...registro.toJSON(),
        permanenciaLegible,
        egreso: registro.egreso ? registro.egreso : null,
        cumpleAniosHoy,
        edad,
        detallesCliente: detalleCliente ? detalleCliente.toJSON() : null,
        historialCambios: historialCambios.map(cambio => cambio.toJSON())
      };
    }));

    const permanenciaTotalMs = registros.reduce((total, registro) => {
      const ingreso = new Date(registro.ingreso);
      const egreso = registro.egreso ? new Date(registro.egreso) : new Date();
      return total + Math.abs(egreso - ingreso);
    }, 0);

    const totalHoras = Math.floor(permanenciaTotalMs / 36e5);
    const totalMinutos = Math.floor((permanenciaTotalMs % 36e5) / 60000);

    const permanenciaTotalLegible = totalHoras > 0
      ? `${totalHoras} hora${totalHoras > 1 ? 's' : ''} y ${totalMinutos} minuto${totalMinutos > 1 ? 's' : ''}`
      : `${totalMinutos} minuto${totalMinutos > 1 ? 's' : ''}`;

    const valorCambioTotal = registros.reduce((total, registro) => total + parseFloat(registro.valor_cambio_total), 0);

    const totalCambios = await VentaTicket.count({
      where: {
        borrado: 1,
        fecha: {
          [Op.between]: [fechaInicio, fechaCierre]
        }
      }
    });

    return res.status(200).json({
      registros: registrosConDetalles,
      permanenciaTotal: permanenciaTotalLegible,
      valorCambioTotal,
      cantidadCambios: totalCambios
    });
  } catch (error) {
    console.error("Error al obtener los registros de clientes del turno abierto:", error);
    return res.status(500).json({ message: 'Error al obtener los registros de clientes del turno abierto' });
  }
};

const obtenerRegistrosDeClientesPorFecha = async (req, res) => {
  let { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio) {
    fechaInicio = moment().subtract(7, 'days').startOf('day').subtract(3, 'hours').toISOString();
  }
  if (!fechaFin) {
    fechaFin = moment().endOf('day').subtract(3, 'hours').toISOString();
  }

  try {
    const registros = await RegistroCliente.findAll({
      attributes: ['id', 'ingreso', 'egreso', 'observacion', 'permanencia', 'valor_cambio_total'],
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            {
              model: CategoriaCliente,
              as: 'categoriaCliente',
              attributes: ['tipo'],
            },
          ],
          attributes: ['id', 'nombre', 'apellido'],
        },
        {
          model: Usuario,
          as: 'usuario_ingreso',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
        {
          model: Usuario,
          as: 'usuario_egreso',
          attributes: ['nombre', 'apellido', 'legajo'],
        }
      ],
      where: {
        ingreso: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        borrado: 1
      },
      order: [['ingreso', 'DESC']]
    });

    if (!registros.length) {
      return res.status(404).json({ message: 'No hay registros de clientes en el rango de fechas seleccionado' });
    }

    const registrosConDetalles = await Promise.all(registros.map(async registro => {
      const cliente = registro.cliente;
      const detalleCliente = await ClienteDetalle.findOne({
        where: {
          cliente_id: cliente.id,
          borrado: 1
        },
        attributes: [
          'fecha_nacimiento',
          'fecha_alta',
          'fecha_baja',
          'motivo_baja',
          'gusto_gastronomico',
          'equipo_futbol',
          'profesion',
          'gusto_musical'
        ]
      });

      let cumpleAniosHoy = false;
      let edad = null;
      if (detalleCliente) {
        const fechaNacimiento = moment(detalleCliente.fecha_nacimiento).tz('America/Argentina/Buenos_Aires').startOf('day');
        const hoy = moment().tz('America/Argentina/Buenos_Aires').startOf('day');
        cumpleAniosHoy = (hoy.date() === fechaNacimiento.date() && hoy.month() === fechaNacimiento.month());
        edad = hoy.year() - fechaNacimiento.year();
        const yaCumplioEsteAno = (hoy.month() > fechaNacimiento.month()) ||
          (hoy.month() === fechaNacimiento.month() && hoy.date() >= fechaNacimiento.date());
        if (!yaCumplioEsteAno) {
          edad--;
        }
      }

      const ingreso = new Date(registro.ingreso);
      const egreso = registro.egreso ? new Date(registro.egreso) : null;
      const permanenciaMs = egreso ? Math.abs(egreso - ingreso) : Math.abs(new Date() - ingreso);

      const horas = Math.floor(permanenciaMs / 36e5);
      const minutos = Math.floor((permanenciaMs % 36e5) / 60000);

      const permanenciaLegible = horas > 0 ? `${horas} hora${horas > 1 ? 's' : ''} y ${minutos} minuto${minutos > 1 ? 's' : ''}` : `${minutos} minuto${minutos > 1 ? 's' : ''}`;

      const historialCambios = await VentaTicket.findAll({
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'apellido', 'legajo'],
          }
        ],
        where: {
          cliente_id: cliente.id,
          borrado: 1,
          fecha: {
            [Op.between]: [fechaInicio, fechaFin]
          }
        },
        order: [['fecha', 'DESC']],
        limit: 10
      });

      return {
        ...registro.toJSON(),
        permanenciaLegible,
        egreso: registro.egreso ? registro.egreso : null,
        cumpleAniosHoy,
        edad,
        detallesCliente: detalleCliente ? detalleCliente.toJSON() : null,
        historialCambios: historialCambios.map(cambio => cambio.toJSON())
      };
    }));

    const permanenciaTotalMs = registros.reduce((total, registro) => {
      const ingreso = new Date(registro.ingreso);
      const egreso = registro.egreso ? new Date(registro.egreso) : new Date();
      return total + Math.abs(egreso - ingreso);
    }, 0);

    const totalHoras = Math.floor(permanenciaTotalMs / 36e5);
    const totalMinutos = Math.floor((permanenciaTotalMs % 36e5) / 60000);

    const permanenciaTotalLegible = totalHoras > 0 ? `${totalHoras} hora${totalHoras > 1 ? 's' : ''} y ${totalMinutos} minuto${totalMinutos > 1 ? 's' : ''}` : `${totalMinutos} minuto${totalMinutos > 1 ? 's' : ''}`;

    const valorCambioTotal = registros.reduce((total, registro) => total + parseFloat(registro.valor_cambio_total), 0);

    const totalCambios = await VentaTicket.count({
      where: {
        borrado: 1,
        fecha: {
          [Op.between]: [fechaInicio, fechaFin]
        }
      }
    });

    return res.status(200).json({
      registros: registrosConDetalles,
      permanenciaTotal: permanenciaTotalLegible,
      valorCambioTotal,
      cantidadCambios: totalCambios
    });

  } catch (error) {
    console.error("Error al obtener los registros de clientes por fecha:", error);
    return res.status(500).json({ message: 'Error al obtener los registros de clientes por fecha' });
  }
};

const modificarClienteUObservacionEnRegistro = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const registroId = req.query.registro_id;
  const { cliente_id, observacion } = req.body;

  const updateData = {};

  if (cliente_id !== undefined) {
    updateData.cliente_id = cliente_id;
  }
  if (observacion !== undefined) {
    updateData.observacion = observacion;
  }

  updateData.usuario_id = usuarioId;

  try {

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No hay datos nuevos para actualizar' });
    }

    const registro = await RegistroCliente.findOne({ where: { id: registroId, borrado: 1 } });

    if (!registro) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    await registro.update(updateData);

    io.emit('editar-registro', { shouldEditarRegistro: true });

    res.status(200).json({ message: 'Registro actualizado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------------------ //

// CANJES DE PRODUCTOS. 

const canjeDeProducto = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const { cliente_id, producto, cantidad } = req.body;

  if (!cliente_id || !producto || !cantidad) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    const fecha = new Date();

    const canje = await ProductoCanjeado.create({
      cliente_id,
      producto,
      cantidad,
      fecha,
      usuario_id: usuarioId,
    });

    io.emit('canje-producto', { shouldCanjeProducto: true });

    res.status(201).json({ message: 'Canje de producto creado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const modificarCanjeDeProducto = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const canjeId = req.query.id;
  const { cliente_id, producto, cantidad } = req.body;

  const updateData = {};

  if (cliente_id !== undefined) {
    updateData.cliente_id = cliente_id;
  }
  if (producto !== undefined) {
    updateData.producto = producto;
  }
  if (cantidad !== undefined) {
    updateData.cantidad = cantidad;
  }

  updateData.usuario_id = usuarioId;
  updateData.updatedAt = new Date();

  try {
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No hay datos nuevos para actualizar' });
    }

    const canje = await ProductoCanjeado.findOne({ where: { id: canjeId } });
    if (!canje) {
      return res.status(404).json({ message: 'Canje no encontrado' });
    }

    await canje.update(updateData);

    io.emit('editar-canje-producto', { shouldEditarCanjeProducto: true });
    res.status(200).json({ message: 'Canje de producto actualizado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const borrarCanjeDeProducto = async (req, res) => {
  const { io } = require('../app');
  const canjeId = req.query.id;
  const usuarioId = req.usuario.id;

  try {
    const canje = await ProductoCanjeado.findOne({ where: { id: canjeId } });
    if (!canje) {
      return res.status(404).json({ message: 'Canje no encontrado' });
    }

    const usuario = await Usuario.findOne({ where: { id: usuarioId } });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const fechaBorrado = moment().format('YYYY-MM-DD HH:mm:ss');

    const textoBorrado = `Fecha de borrado: ${fechaBorrado} por ${usuario.nombre} ${usuario.apellido}`;

    await canje.update(
      {
        borrado: 0,
        producto: `${canje.producto} - ${textoBorrado}`
      },
      {
        where: { id: canjeId }
      }
    );

    io.emit('borrar-canje-producto', { shouldBorrarCanjeProducto: true });

    res.status(200).json({ message: 'Canje de producto eliminado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerCanjesDeProductos = async (req, res) => {
  try {
    const turnoAbierto = await TurnoVip.findOne({ where: { fecha_cierre: null, borrado: 1 } });

    if (!turnoAbierto) {
      return res.status(400).json({ message: 'No hay un turno abierto actualmente' });
    }

    const fechaApertura = turnoAbierto.fecha_apertura;
    const fechaCierre = turnoAbierto.fecha_cierre || new Date();
    const fechaInicio = restarHoras(fechaApertura, 3);

    const canjes = await ProductoCanjeado.findAll({
      attributes: ['id', 'producto', 'cantidad', 'fecha'],
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            {
              model: CategoriaCliente,
              as: 'categoriaCliente',
              attributes: ['tipo'],
            },
          ],
          attributes: ['id', 'nombre', 'apellido'],
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'legajo'],
        }
      ],
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaCierre]
        },
        borrado: 1
      }
    });

    if (!canjes.length) {
      return res.status(404).json({ message: 'No se encontraron canjes de productos para el turno abierto' });
    }

    const cantidadTotal = canjes.reduce((total, canje) => total + parseInt(canje.cantidad), 0);

    return res.status(200).json({
      canjes,
      cantidadTotal
    });
  } catch (error) {
    console.error("Error al obtener los canjes de productos:", error);
    return res.status(500).json({ message: 'Error al obtener los canjes de productos' });
  }
};

const obtenerCanjesDeProductosDelTunoAbierto = async (req, res) => {
  try {
    const turnoAbierto = await TurnoVip.findOne({ where: { fecha_cierre: null, borrado: 1 } });

    if (!turnoAbierto) {
      return res.status(400).json({ message: 'No hay un turno abierto actualmente' });
    }

    const fechaApertura = turnoAbierto.fecha_apertura;
    const fechaCierre = turnoAbierto.fecha_cierre || new Date();
    const fechaInicio = restarHoras(fechaApertura, 3);

    const canjes = await ProductoCanjeado.findAll({
      attributes: ['id', 'producto', 'cantidad', 'fecha'],
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            {
              model: CategoriaCliente,
              as: 'categoriaCliente',
              attributes: ['tipo'],
            },
          ],
          attributes: ['id', 'nombre', 'apellido'],
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'legajo'],
        }
      ],
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaCierre]
        },
        borrado: 1
      },
      order: [['fecha', 'DESC']]
    });

    if (!canjes.length) {
      return res.status(404).json({ message: 'No se encontraron canjes de productos para el turno abierto' });
    }

    const cantidadTotal = canjes.reduce((total, canje) => total + parseInt(canje.cantidad), 0);

    const canjesFormateados = canjes.map(canje => ({
      ...canje.toJSON(),
      fecha: moment(canje.fecha).format('YYYY-MM-DD HH:mm:ss')
    }));

    return res.status(200).json({
      canjes: canjesFormateados,
      cantidadTotal
    });
  } catch (error) {
    console.error("Error al obtener los canjes de productos del turno abierto:", error);
    return res.status(500).json({ message: 'Error al obtener los canjes de productos del turno abierto' });
  }
}

const obtenerCanjesDeProductosPorFecha = async (req, res) => {

  let { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio) {
    fechaInicio = moment().subtract(7, 'days').startOf('day').subtract(3, 'hours').toISOString();
  }
  if (!fechaFin) {
    fechaFin = moment().endOf('day').subtract(3, 'hours').toISOString();
  }

  try {
    const canjes = await ProductoCanjeado.findAll({
      attributes: ['id', 'producto', 'cantidad', 'fecha'],
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            {
              model: CategoriaCliente,
              as: 'categoriaCliente',
              attributes: ['tipo'],
            },
          ],
          attributes: ['id', 'nombre', 'apellido'],
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'legajo'],
        }
      ],
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        borrado: 1
      },
      order: [['fecha', 'DESC']]
    });

    if (!canjes.length) {
      return res.status(404).json({ message: 'No se encontraron canjes de productos en el rango de fechas seleccionado' });
    }

    const cantidadTotal = canjes.reduce((total, canje) => total + parseInt(canje.cantidad), 0);

    const canjesFormateados = canjes.map(canje => ({
      ...canje.toJSON(),
      fecha: moment(canje.fecha).format('YYYY-MM-DD HH:mm:ss')
    }));

    return res.status(200).json({
      canjes: canjesFormateados,
      cantidadTotal
    });

  } catch (error) {
    console.error("Error al obtener los canjes de productos por fecha:", error);
    return res.status(500).json({ message: 'Error al obtener los canjes de productos por fecha' });
  }
};

// ------------------------------ //

// VENTA DE TICKETS

const ventaDeTicket = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const { cliente_id, monto } = req.body;

  if (!cliente_id || !monto) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    const fecha = new Date();

    const montoNormalizado = parseFloat(monto.toString().replace(',', '.'));

    if (isNaN(montoNormalizado)) {
      return res.status(400).json({ message: 'Monto inválido' });
    }

    const ticket = await VentaTicket.create({
      cliente_id,
      monto: montoNormalizado,
      fecha,
      usuario_id: usuarioId,
    });

    const cliente = await RegistroCliente.findOne({ where: { cliente_id, borrado: 1, egreso: null, permanencia: "En sala", usuario_id_egreso: null } });
    if (cliente) {
      cliente.valor_cambio_total = (parseFloat(cliente.valor_cambio_total) || 0) + montoNormalizado;
      await cliente.save();
    }

    io.emit('venta-ticket', { shouldVentaTicket: true });

    res.status(201).json({ message: 'Venta de ticket creada correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const modificarVentaDeTicket = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const ticketId = req.query.id;
  const { cliente_id, monto } = req.body;

  const updateData = {};

  if (cliente_id !== undefined) {
    updateData.cliente_id = cliente_id;
  }
  if (monto !== undefined) {
    updateData.monto = monto;
  }

  updateData.usuario_id = usuarioId;
  updateData.updatedAt = new Date();

  try {
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No hay datos nuevos para actualizar' });
    }

    const ticket = await VentaTicket.findOne({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    const oldMonto = parseFloat(ticket.monto);

    await ticket.update(updateData);

    const registroCliente = await RegistroCliente.findOne({
      where: {
        cliente_id: ticket.cliente_id,
        borrado: 1,
        egreso: null,
        permanencia: "En sala",
        usuario_id_egreso: null
      }
    });

    if (registroCliente) {
      registroCliente.valor_cambio_total = (parseFloat(registroCliente.valor_cambio_total) || 0) - oldMonto + (parseFloat(monto) || 0);
      await registroCliente.save();
    }

    io.emit('editar-venta-ticket', { shouldEditarVentaTicket: true });
    res.status(200).json({ message: 'Venta de ticket actualizada correctamente' });

  } catch (error) {
    console.error("Error al modificar la venta de ticket:", error);
    res.status(500).json({ error: error.message });
  }
}

const borrarVentaDeTicket = async (req, res) => {
  const { io } = require('../app');
  const ticketId = req.query.id;
  const fecha = new Date();
  const usuarioId = req.usuario.id;

  try {
    const ticket = await VentaTicket.findOne({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    const clienteId = ticket.cliente_id;
    const montoTicket = ticket.monto;

    await ticket.update({
      borrado: 0,
      fecha,
      usuario_id: usuarioId,
    });

    const registroCliente = await RegistroCliente.findOne({
      where: {
        cliente_id: clienteId,
        egreso: null,
        borrado: 1
      }
    });

    if (registroCliente) {
      await registroCliente.update({
        valor_cambio_total: registroCliente.valor_cambio_total - montoTicket
      });
    }

    io.emit('borrar-venta-ticket', { shouldBorrarVentaTicket: true });

    res.status(200).json({ message: 'Venta de ticket eliminada correctamente' });

  } catch (error) {
    console.error("Error al borrar la venta de ticket:", error);
    res.status(500).json({ error: error.message });
  }
}

const obtenerVentasDeTickets = async (req, res) => {
  try {
    const turnoAbierto = await TurnoVip.findOne({ where: { fecha_cierre: null, borrado: 1 } });

    if (!turnoAbierto) {
      return res.status(400).json({ message: 'No hay un turno abierto actualmente' });
    }

    const fechaApertura = turnoAbierto.fecha_apertura;
    const fechaCierre = turnoAbierto.fecha_cierre || new Date();
    const fechaInicio = restarHoras(fechaApertura, 3);

    const ventas = await VentaTicket.findAll({
      attributes: ['id', 'monto', 'fecha'],
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            {
              model: CategoriaCliente,
              as: 'categoriaCliente',
              attributes: ['tipo'],
            },
          ],
          attributes: ['id', 'nombre', 'apellido'],
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'legajo'],
        }
      ],
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaCierre]
        },
        borrado: 1
      }
    });

    if (!ventas.length) {
      return res.status(404).json({ message: 'No se encontraron ventas de tickets para el turno abierto' });
    }

    const valorTotal = ventas.reduce((total, venta) => total + parseFloat(venta.monto), 0);

    res.status(200).json({ ventas, valorTotal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerVentasDeTicketsDelTurnoAbierto = async (req, res) => {
  try {
    const turnoAbierto = await TurnoVip.findOne({ where: { fecha_cierre: null, borrado: 1 } });

    if (!turnoAbierto) {
      return res.status(400).json({ message: 'No hay un turno abierto actualmente' });
    }

    const fechaApertura = turnoAbierto.fecha_apertura;
    const fechaCierre = turnoAbierto.fecha_cierre || new Date();
    const fechaInicio = restarHoras(fechaApertura, 3);

    const ventas = await VentaTicket.findAll({
      attributes: ['id', 'monto', 'fecha'],
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            {
              model: CategoriaCliente,
              as: 'categoriaCliente',
              attributes: ['tipo'],
            },
          ],
          attributes: ['id', 'nombre', 'apellido'],
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'legajo'],
        }
      ],
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaCierre]
        },
        borrado: 1
      },
      order: [['fecha', 'DESC']]
    });

    if (!ventas.length) {
      return res.status(404).json({ message: 'No se encontraron ventas de tickets para el turno abierto' });
    }

    const valorTotal = ventas.reduce((total, venta) => total + parseFloat(venta.monto), 0);

    const ventasFormateadas = ventas.map(venta => ({
      ...venta.toJSON(),
      fecha: moment(venta.fecha).format('YYYY-MM-DD HH:mm:ss')
    }));

    const totalCambios = await VentaTicket.count({
      where: {
        borrado: 1,
        fecha: {
          [Op.between]: [fechaInicio, fechaCierre]
        }
      }
    });

    res.status(200).json({ ventas: ventasFormateadas, valorTotal, totalCambios });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const obtenerVentasDeTicketsPorFecha = async (req, res) => {

  let { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio) {
    fechaInicio = moment().subtract(7, 'days').startOf('day').subtract(3, 'hours').toISOString();
  }
  if (!fechaFin) {
    fechaFin = moment().endOf('day').subtract(3, 'hours').toISOString();
  }

  try {
    const ventas = await VentaTicket.findAll({
      attributes: ['id', 'monto', 'fecha'],
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            {
              model: CategoriaCliente,
              as: 'categoriaCliente',
              attributes: ['tipo'],
            },
          ],
          attributes: ['id', 'nombre', 'apellido'],
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'legajo'],
        }
      ],
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        borrado: 1
      },
      order: [['fecha', 'DESC']]
    });

    if (!ventas.length) {
      return res.status(404).json({ message: 'No se encontraron ventas de tickets en el rango de fechas seleccionado' });
    }

    const valorTotal = ventas.reduce((total, venta) => total + parseFloat(venta.monto), 0);

    const ventasFormateadas = ventas.map(venta => ({
      ...venta.toJSON(),
      fecha: moment(venta.fecha).format('YYYY-MM-DD HH:mm:ss')
    }));

    const totalCambios = await VentaTicket.count({
      where: {
        borrado: 1,
        fecha: {
          [Op.between]: [fechaInicio, fechaFin]
        }
      }
    });

    return res.status(200).json({
      ventas: ventasFormateadas,
      valorTotal,
      totalCambios
    });

  } catch (error) {
    console.error("Error al obtener las ventas de tickets por fecha:", error);
    return res.status(500).json({ message: 'Error al obtener las ventas de tickets por fecha' });
  }
};

// ------------------------------ //

// CLIENTES //

const obtenerClientesVip = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      attributes: ['id', 'nombre', 'apellido'],
      include: [
        {
          model: CategoriaCliente,
          as: 'categoriaCliente',
          attributes: ['tipo'],
          where: {
            id: {
              [Op.in]: [3, 4]
            }
          }
        },
      ],
      where: {
        borrado: 1,
        id: {
          [Op.in]: Sequelize.literal(`(
            SELECT cliente_id 
            FROM registro_clientes 
            WHERE ingreso IS NOT NULL 
              AND usuario_id_ingreso IS NOT NULL
              AND egreso IS NULL 
              AND usuario_id_egreso IS NULL
          )`)
        }
      }
    });

    if (!clientes.length) {
      return res.status(404).json({ message: 'No se encontraron clientes' });
    }

    res.status(200).json(clientes);
  } catch (error) {
    console.error("Error al obtener los clientes VIP:", error);
    res.status(500).json({ error: error.message });
  }
};

const obtenerClientesVipParaIngreso = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      attributes: ['id', 'nombre', 'apellido'],
      include: [
        {
          model: CategoriaCliente,
          as: 'categoriaCliente',
          attributes: ['tipo'],
          where: {
            id: {
              [Op.in]: [3, 4]
            }
          }
        },
      ],
      where: {
        borrado: 1,
        id: {
          [Op.notIn]: Sequelize.literal(`(
            SELECT cliente_id 
            FROM registro_clientes 
            WHERE egreso IS NULL OR usuario_id_egreso IS NULL
          )`)
        }
      }
    });

    if (!clientes.length) {
      return res.status(404).json({ message: 'No se encontraron clientes' });
    }

    const hoy = moment().tz('America/Argentina/Buenos_Aires').startOf('day');

    const clientesConCumpleanos = await Promise.all(clientes.map(async cliente => {
      const detalleCliente = await ClienteDetalle.findOne({
        where: {
          cliente_id: cliente.id,
          borrado: 1
        },
        attributes: ['fecha_nacimiento']
      });

      let cumpleAniosHoy = false;
      if (detalleCliente) {
        const fechaNacimiento = moment(detalleCliente.fecha_nacimiento).tz('America/Argentina/Buenos_Aires').startOf('day');
        cumpleAniosHoy = (hoy.date() === fechaNacimiento.date() && hoy.month() === fechaNacimiento.month());
      }

      return {
        ...cliente.toJSON(),
        cumpleAniosHoy
      };
    }));

    res.status(200).json(clientesConCumpleanos);
  } catch (error) {
    console.error("Error al obtener los clientes VIP:", error);
    res.status(500).json({ error: error.message });
  }
};

const obtenerListaDeClientesVip = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      attributes: ['id', 'nombre', 'apellido', 'email', 'telefono', 'dni'],
      include: [
        {
          model: CategoriaCliente,
          as: 'categoriaCliente',
          attributes: ['id', 'tipo'],
          where: {
            id: {
              [Op.in]: [3, 4]
            }
          }
        },
        {
          model: EstadoCliente,
          as: "estadoCliente",
          attributes: ["id", "tipo"],
        },
        {
          model: ClienteDetalle,
          as: 'detalleCliente',
        }
      ],
      where: {
        borrado: 1
      }
    });

    if (!clientes.length) {
      return res.status(404).json({ message: 'No se encontraron clientes' });
    }

    const clientesConDetalles = await Promise.all(clientes.map(async cliente => {
      const ultimaVisita = await RegistroCliente.findOne({
        where: {
          cliente_id: cliente.id,
          borrado: 1
        },
        order: [['ingreso', 'DESC']],
        attributes: ['ingreso', 'egreso']
      });

      let tiempoDesdeUltimaVisita = null;
      let ultimaVisitaLegible = null;
      if (ultimaVisita) {
        const ultimaEgreso = ultimaVisita.egreso ? new Date(ultimaVisita.egreso) : new Date();
        const tiempoMs = Math.abs(new Date() - ultimaEgreso);
        const dias = Math.floor(tiempoMs / (1000 * 60 * 60 * 24));
        tiempoDesdeUltimaVisita = `${dias} día${dias !== 1 ? 's' : ''}`;
        ultimaVisitaLegible = {
          ingreso: moment(ultimaVisita.ingreso).format('DD/MM/YYYY HH:mm'),
          egreso: ultimaVisita.egreso ? moment(ultimaVisita.egreso).format('DD/MM/YYYY HH:mm') : 'sin registrar'
        };
      }

      const mayorPermanencia = await RegistroCliente.findOne({
        where: {
          cliente_id: cliente.id,
          borrado: 1
        },
        order: [[Sequelize.literal('TIMESTAMPDIFF(SECOND, ingreso, COALESCE(egreso, NOW()))'), 'DESC']],
        attributes: ['ingreso', 'egreso']
      });

      let mayorPermanenciaLegible = null;
      if (mayorPermanencia) {
        const ingreso = new Date(mayorPermanencia.ingreso);
        const egreso = mayorPermanencia.egreso ? new Date(mayorPermanencia.egreso) : new Date();
        const permanenciaMs = Math.abs(egreso - ingreso);
        const horas = Math.floor(permanenciaMs / 36e5);
        const minutos = Math.floor((permanenciaMs % 36e5) / 60000);
        mayorPermanenciaLegible = {
          dia: moment(ingreso).format('DD/MM/YYYY'),
          duracion: horas > 0
            ? `${horas} hora${horas > 1 ? 's' : ''} y ${minutos} minuto${minutos > 1 ? 's' : ''}`
            : `${minutos} minuto${minutos > 1 ? 's' : ''}`
        };
      }

      return {
        ...cliente.toJSON(),
        ultimaVisita: ultimaVisitaLegible,
        tiempoDesdeUltimaVisita,
        mayorPermanencia: mayorPermanenciaLegible
      };
    }));

    res.status(200).json({ clientes: clientesConDetalles });
  } catch (error) {
    console.error("Error al obtener los clientes VIP:", error);
    res.status(500).json({ error: error.message });
  }
};

const editarDetallesDeCliente = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const clienteId = req.query.id;

  const {
    fecha_nacimiento,
    fecha_alta,
    fecha_baja,
    motivo_baja,
    gusto_gastronomico,
    equipo_futbol,
    profesion,
    gusto_musical
  } = req.body;

  const updateData = {};

  if (fecha_nacimiento !== undefined) {
    updateData.fecha_nacimiento = fecha_nacimiento;
  }
  if (fecha_alta !== undefined) {
    updateData.fecha_alta = fecha_alta;
  }
  if (fecha_baja !== undefined) {
    updateData.fecha_baja = fecha_baja;
  }
  if (motivo_baja !== undefined) {
    updateData.motivo_baja = motivo_baja;
  }
  if (gusto_gastronomico !== undefined) {
    updateData.gusto_gastronomico = gusto_gastronomico;
  }
  if (equipo_futbol !== undefined) {
    updateData.equipo_futbol = equipo_futbol;
  }
  if (profesion !== undefined) {
    updateData.profesion = profesion;
  }
  if (gusto_musical !== undefined) {
    updateData.gusto_musical = gusto_musical;
  }

  try {
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No hay datos nuevos para actualizar' });
    }

    const clienteDetalle = await ClienteDetalle.findOne({ where: { cliente_id: clienteId } });
    if (!clienteDetalle) {
      return res.status(404).json({ message: 'Detalles del cliente no encontrados' });
    }

    // Actualizar solo los campos definidos en el modelo
    const camposDefinidos = Object.keys(ClienteDetalle.rawAttributes);
    const datosActualizados = {};
    for (const campo in updateData) {
      if (camposDefinidos.includes(campo)) {
        datosActualizados[campo] = updateData[campo];
      }
    }

    await clienteDetalle.update(datosActualizados);

    io.emit('editar-cliente-detalle', { shouldEditarCliente: true });
    res.status(200).json({ message: 'Detalles del cliente actualizados correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------------------ //

// GASTRONOMÍA // 
const crearTipoDePlato = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const { tipo } = req.body;

  if (!tipo) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }
  try {
    const tipoPlato = await TipoPlato.create({
      tipo,
    });

    io.emit('crear-tipo-plato', { shouldCrearTipoPlato: true });
    res.status(201).json({ message: 'Tipo de plato creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const modificarTipoDePlato = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const tipoPlatoId = req.query.id;
  const { tipo } = req.body;

  const updateData = {};

  if (tipo !== undefined) {
    updateData.tipo = tipo;
  }

  try {
    if (Object.keys(updateData).length === 0) {

      return res.status(400).json({ message: 'No hay datos nuevos para actualizar' });
    }

    const tipoPlato = await TipoPlato.findOne({ where: { id: tipoPlatoId } });
    if (!tipoPlato) {
      return res.status(404).json({ message: 'Tipo de plato no encontrado' });
    }

    await tipoPlato.update(updateData);

    io.emit('editar-tipo-plato', { shouldEditarTipoPlato: true });
    res.status(200).json({ message: 'Tipo de plato actualizado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const borrarTipoDePlato = async (req, res) => {
  const { io } = require('../app');
  const tipoPlatoId = req.query.id;
  const usuarioId = req.usuario.id;

  try {
    const tipoPlato = await TipoPlato.findOne({ where: { id: tipoPlatoId } });
    if (!tipoPlato) {
      return res.status(404).json({ message: 'Tipo de plato no encontrado' });
    }

    await tipoPlato.update({
      borrado: 0,
    });

    io.emit('borrar-tipo-plato', { shouldBorrarTipoPlato: true });
    res.status(200).json({ message: 'Tipo de plato eliminado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const crearTipoDeComida = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const { tipo } = req.body;

  if (!tipo) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }
  try {
    const tipoComida = await TipoComida.create({
      tipo,
    });
    io.emit('crear-tipo-comida', { shouldCrearTipoComida: true });
    res.status(201).json({ message: 'Tipo de comida creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const modificarTipoDeComida = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const tipoComidaId = req.query.id;
  const { tipo } = req.body;

  const updateData = {};

  if (tipo !== undefined) {
    updateData.tipo = tipo;
  }

  try {
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No hay datos nuevos para actualizar' });
    }

    const tipoComida = await TipoComida.findOne({ where: { id: tipoComidaId } });
    if (!tipoComida) {
      return res.status(404).json({ message: 'Tipo de comida no encontrado' });
    }

    await tipoComida.update(updateData);

    io.emit('editar-tipo-comida', { shouldEditarTipoComida: true });
    res.status(200).json({ message: 'Tipo de comida actualizado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const borrarTipoDeComida = async (req, res) => {
  const { io } = require('../app');
  const tipoComidaId = req.query.id;
  const usuarioId = req.usuario.id;

  try {
    const tipoComida = await TipoComida.findOne({ where: { id: tipoComidaId } });
    if (!tipoComida) {
      return res.status(404).json({ message: 'Tipo de comida no encontrado' });
    }

    await tipoComida.update({
      borrado: 0,
    });

    io.emit('borrar-tipo-comida', { shouldBorrarTipoComida: true });
    res.status(200).json({ message: 'Tipo de comida eliminado correctamente' });

  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const obtenerTipoDePlatos = async (req, res) => {
  try {
    const tipos = await TipoPlato.findAll({
      attributes: ['id', 'tipo'],
      where: {
        borrado: 1
      }
    });

    if (!tipos.length) {
      return res.status(404).json({ message: 'No se encontraron tipos de platos' });
    }

    res.status(200).json(tipos);
  } catch (error) {
    console.error("Error al obtener los tipos de platos:", error);
    res.status(500).json({ error: error.message });
  }
};
const obtenerTipoComidas = async (req, res) => {
  try {
    const comidas = await TipoComida.findAll({
      attributes: ['id', 'tipo'],
      where: {
        borrado: 1
      }
    });

    if (!comidas.length) {
      return res.status(404).json({ message: 'No se encontraron tipos de comidas' });
    }

    res.status(200).json(comidas);
  } catch (error) {
    console.error("Error al obtener los tipos de comidas:", error);
    res.status(500).json({ error: error.message });
  }
};
const crearMenuVip = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const { nombre, tipo_de_plato_id, detalle, cantidad } = req.body;

  if (!nombre || !tipo_de_plato_id || !detalle, !cantidad) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    const menu = await MenuVip.create({
      nombre,
      tipo_de_plato_id,
      detalle,
      disponible: 1,
      cantidad,
    });

    io.emit('crear-menu-vip', { shouldCrearMenuVip: true });

    res.status(201).json({ message: 'Menú VIP creado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const modificarMenuVip = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const menuId = req.query.id;
  const { nombre, tipo_de_plato_id, detalle, cantidad } = req.body;

  const updateData = {};

  if (nombre !== undefined) {
    updateData.nombre = nombre;
  }
  if (tipo_de_plato_id !== undefined) {
    updateData.tipo_de_plato_id = tipo_de_plato_id;
  }
  if (detalle !== undefined) {
    updateData.detalle = detalle;
  }
  if (cantidad !== undefined) {
    updateData.cantidad = cantidad;
  }

  try {
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No hay datos nuevos para actualizar' });
    }

    const menu = await MenuVip.findOne({ where: { id: menuId } });
    if (!menu) {
      return res.status(404).json({ message: 'Menú no encontrado' });
    }

    await menu.update(updateData);

    io.emit('editar-menu-vip', { shouldEditarMenuVip: true });
    res.status(200).json({ message: 'Menú VIP actualizado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const borrarMenuVip = async (req, res) => {
  const { io } = require('../app');
  const menuId = req.query.id;
  const usuarioId = req.usuario.id;

  try {
    const menu = await MenuVip.findOne({ where: { id: menuId } });
    if (!menu) {
      return res.status(404).json({ message: 'Menú no encontrado' });
    }

    await menu.update({
      borrado: 0,
    });

    io.emit('borrar-menu-vip', { shouldBorrarMenuVip: true });

    res.status(200).json({ message: 'Menú VIP eliminado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const menuItemDisponibleEditar = async (req, res) => {
  const { io } = require('../app');
  const menuId = req.query.id;
  const { disponible } = req.body;

  if (typeof disponible !== 'boolean') {
    return res.status(400).json({ message: 'El campo disponible debe ser un booleano' });
  }

  try {
    const menu = await MenuVip.findOne({ where: { id: menuId } });
    if (!menu) {
      return res.status(404).json({ message: 'Menú no encontrado' });
    }

    await menu.update({ disponible });

    io.emit('editar-menu-vip', { shouldEditarMenuVip: true });
    res.status(200).json({ message: 'Menú VIP actualizado correctamente' });
  } catch (error) {
    console.error("Error al actualizar la disponibilidad", error);
    res.status(500).json({ error: error.message });
  }
};
const obtenerMenusVip = async (req, res) => {
  try {
    const menus = await MenuVip.findAll({
      attributes: ['id', 'nombre', 'detalle', 'disponible', 'cantidad', "url_imagen"],
      include: [
        {
          model: TipoPlato,
          as: 'tipoDePlato',
          attributes: ['id', 'tipo'],
        }
      ],
      where: {
        borrado: 1
      },
      order: [
        [{ model: TipoPlato, as: 'tipoDePlato' }, 'tipo', 'ASC'],
        ['cantidad', 'DESC']
      ]
    });

    if (!menus.length) {
      return res.status(404).json({ message: 'No se encontraron menús VIP' });
    }

    res.status(200).json(menus);
  } catch (error) {
    console.error("Error al obtener los menús VIP:", error);
    res.status(500).json({ error: error.message });
  }
};
const crearRegistroGastronomiaVip = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  let { menu_vip_id, cliente_id, tipo_comida_id, observacion, cantidad } = req.body;

  if (!menu_vip_id || !cliente_id || !tipo_comida_id || !cantidad) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  if (observacion) {
    observacion = observacion.trim();
    if (observacion && !observacion.endsWith('.')) {
      observacion = `${observacion}.`;
    }
  }

  try {

    const menuVip = await MenuVip.findByPk(menu_vip_id);

    if (!menuVip) {
      return res.status(404).json({ message: 'Menú VIP no encontrado' });
    }

    if (menuVip.cantidad < cantidad) {
      return res.status(400).json({ message: 'Cantidad insuficiente en el menú VIP' });
    }

    menuVip.cantidad -= cantidad;
    await menuVip.save();

    const registro = await GastronomiaVIP.create({
      menu_vip_id,
      cliente_id,
      tipo_comida_id,
      observacion,
      fecha: new Date(),
      usuario_id: usuarioId,
      cantidad: cantidad,
      estado_pedido_id: 1
    });

    io.emit('crear-registro-gastronomia-vip', { shouldCrearRegistroGastronomiaVip: true });

    res.status(200).json({ message: 'Registro de gastronomía VIP creado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const modificarRegistroGastronomiaVip = async (req, res) => {
  const { io } = require('../app');
  const usuarioId = req.usuario.id;
  const registroId = req.query.id;
  const { menu_vip_id, cliente_id, tipo_comida_id, observacion, cantidad } = req.body;

  const updateData = {};

  if (menu_vip_id !== undefined) {
    updateData.menu_vip_id = menu_vip_id;
  }
  if (cliente_id !== undefined) {
    updateData.cliente_id = cliente_id;
  }
  if (tipo_comida_id !== undefined) {
    updateData.tipo_comida_id = tipo_comida_id;
  }
  if (observacion !== undefined) {
    updateData.observacion = observacion;
  }
  if (cantidad !== undefined) {
    updateData.cantidad = cantidad;
  }

  updateData.usuario_id = usuarioId;
  updateData.fecha = new Date();

  try {
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No hay datos nuevos para actualizar' });
    }

    const registro = await GastronomiaVIP.findOne({ where: { id: registroId, borrado: 1 } });
    if (!registro) {
      return res.status(404).json({ message: 'Registro de gastronomía VIP no encontrado' });
    }

    const menuVipAnterior = await MenuVip.findByPk(registro.menu_vip_id);
    if (menuVipAnterior) {
      menuVipAnterior.cantidad += registro.cantidad;
      await menuVipAnterior.save();
    }

    if (menu_vip_id !== undefined && cantidad !== undefined) {
      const menuVipNuevo = await MenuVip.findByPk(menu_vip_id);
      if (!menuVipNuevo) {
        return res.status(404).json({ message: 'Nuevo menú VIP no encontrado' });
      }

      if (menuVipNuevo.cantidad < cantidad) {
        return res.status(400).json({ message: 'Cantidad insuficiente en el nuevo menú VIP' });
      }

      menuVipNuevo.cantidad -= cantidad;
      await menuVipNuevo.save();
    }

    await registro.update(updateData);

    io.emit('editar-registro-gastronomia-vip', { shouldEditarRegistroGastronomiaVip: true });
    res.status(200).json({ message: 'Registro de gastronomía VIP actualizado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const borrarRegistroGastronomiaVip = async (req, res) => {
  const { io } = require('../app');
  const registroId = req.query.id;
  const usuarioId = req.usuario.id;

  try {
    const registro = await GastronomiaVIP.findOne({ where: { id: registroId, borrado: 1 } });
    if (!registro) {
      return res.status(404).json({ message: 'Registro de gastronomía VIP no encontrado' });
    }

    await registro.update({
      borrado: 0,
    });

    io.emit('borrar-registro-gastronomia-vip', { shouldBorrarRegistroGastronomiaVip: true });

    res.status(200).json({ message: 'Registro de gastronomía VIP eliminado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const obtenerRegistrosGastronomiaVipTurnoAbierto = async (req, res) => {
  try {
    const turnoAbierto = await TurnoVip.findOne({ where: { fecha_cierre: null, borrado: 1 } });

    if (!turnoAbierto) {
      return res.status(400).json({ message: 'No hay un turno abierto actualmente' });
    }

    const fechaApertura = turnoAbierto.fecha_apertura;
    const fechaCierre = turnoAbierto.fecha_cierre || new Date();
    const fechaInicio = restarHoras(fechaApertura, 3);

    const registros = await GastronomiaVIP.findAll({
      attributes: ['id', 'fecha', 'observacion', 'entrega', 'cantidad'],
      include: [
        {
          model: MenuVip,
          as: 'menu_vip',
          attributes: ['id', 'nombre', 'detalle', 'disponible', 'cantidad'],
          include: [
            {
              model: TipoPlato,
              as: 'tipoDePlato',
              attributes: ['tipo'],
            }
          ]
        },
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'apellido'],
          include: [
            {
              model: CategoriaCliente,
              as: 'categoriaCliente',
              attributes: ['tipo'],
            },
          ],
        },
        {
          model: TipoComida,
          as: 'tipo_comida',
          attributes: ['id', 'tipo'],
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
        {
          model: EstadoPedido,
          as: 'estado_pedido',
          attributes: ['id', 'tipo'],
        }
      ],
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaCierre]
        },
        borrado: 1
      },
      order: [['fecha', 'DESC']]
    });

    if (!registros.length) {
      return res.status(404).json({ message: 'No se encontraron registros de gastronomía VIP para el turno abierto' });
    }

    const registrosFormateados = registros.map(registro => ({
      ...registro.toJSON(),
      fecha: moment(registro.fecha).format('YYYY-MM-DD HH:mm:ss')
    }));

    const totalPlatos = registros.length;

    res.status(200).json({ registros: registrosFormateados, totalPlatos });

  } catch (error) {
    console.error("Error al obtener los registros de gastronomía VIP del turno abierto:", error);
    res.status(500).json({ error: error.message });
  }
}
const marcarEntregaDePlato = async (req, res) => {
  const { io } = require('../app');
  const registroId = req.query.id;
  const usuarioId = req.usuario.id;
  const observacion = req.body.observacion;

  try {
    const registro = await GastronomiaVIP.findOne({ where: { id: registroId, borrado: 1 } });
    if (!registro) {
      return res.status(404).json({ message: 'Registro de gastronomía VIP no encontrado' });
    }

    const estadoPedido = observacion ? 6 : 5;

    const updateData = {
      entrega: new Date(),
      estado_pedido_id: estadoPedido,
    };

    if (observacion) {
      const nuevaObservacion = registro.observacion
        ? `${registro.observacion.trim()}\n${observacion.trim()}`
        : observacion.trim();
      updateData.observacion = nuevaObservacion;
    }

    await registro.update(updateData);

    io.emit('entrega-de-plato', { shouldEntregaDePlato: true });

    res.status(200).json({ message: 'Plato entregado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const obtenerRegistroGastronomiaVipPorFecha = async (req, res) => {

  let { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio) {
    fechaInicio = moment().subtract(7, 'days').startOf('day').subtract(3, 'hours').toISOString();
  }
  if (!fechaFin) {
    fechaFin = moment().endOf('day').subtract(3, 'hours').toISOString();
  }

  try {
    const registros = await GastronomiaVIP.findAll({
      attributes: ['id', 'fecha', 'observacion', 'entrega', 'cantidad'],
      include: [
        {
          model: MenuVip,
          as: 'menu_vip',
          attributes: ['id', 'nombre', 'detalle', 'disponible', 'cantidad'],
          include: [
            {
              model: TipoPlato,
              as: 'tipoDePlato',
              attributes: ['tipo'],
            }
          ]
        },
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'apellido'],
          include: [
            {
              model: CategoriaCliente,
              as: 'categoriaCliente',
              attributes: ['tipo'],
            },
          ],
        },
        {
          model: TipoComida,
          as: 'tipo_comida',
          attributes: ['id', 'tipo'],
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido', 'legajo'],
        },
        {
          model: EstadoPedido,
          as: 'estado_pedido',
          attributes: ['id', 'tipo'],
        }
      ],
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        borrado: 1
      },
      order: [['fecha', 'DESC']]
    });

    if (!registros.length) {
      return res.status(404).json({ message: 'No se encontraron registros de gastronomía VIP en el rango de fechas seleccionado' });
    }

    const registrosFormateados = registros.map(registro => ({
      ...registro.toJSON(),
      fecha: moment(registro.fecha).format('YYYY-MM-DD HH:mm:ss')
    }));

    const totalPlatos = registros.length;

    res.status(200).json({ registros: registrosFormateados, totalPlatos });

  } catch (error) {
    console.error("Error al obtener los registros de gastronomía VIP por fecha:", error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
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
  // Ventas de tickets
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
  obtenerRegistroGastronomiaVipPorFecha,
};