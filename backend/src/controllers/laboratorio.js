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


// Importar Modelos 

const Usuario = db.Usuario;
const InsumoLaboratorio = db.InsumoLaboratorio;
const CargaRepuesto = db.CargaRepuesto;
const CargaInsumo = db.CargaInsumo;
const CategoriaLaboratorio = db.CategoriaLaboratorio;
const CategoriaPrincipalLaboratorio = db.CategoriaPrincipalLaboratorio;
const EstadoProductoLaboratorio = db.EstadoProductoLaboratorio;
const HerramientaLaboratorio = db.HerramientaLaboratorio;
const MarcaLaboratorio = db.MarcaLaboratorio;
const ModeloLaboratorio = db.ModeloLaboratorio;
const RepuestoLaboratorio = db.RepuestoLaboratorio;
const TipoSala = db.TipoSala;
const UbicacionLaboratorio = db.UbicacionLaboratorio;
const UsuarioLaboratorioSala = db.UsuarioLaboratorioSala;

// Función para generar un numero de serie único.

const generarNumeroDeSerieUnico = async () => {
  let serial;
  let existe = true;

  while (existe) {
    serial = Math.random().toString(36).substring(2, 10).toUpperCase();

    const insumo = await InsumoLaboratorio.findOne({ where: { serial: serial } });
    const repuesto = await RepuestoLaboratorio.findOne({ where: { serial: serial } });

    if (!insumo && !repuesto) {
      existe = false;
    }
  }
  return serial;
};

// Categorías de InsumoLaboratorio, Repuestos y Herramientas

const generarCategoria = async (req, res) => {
  const nombre = req.body.nombre;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ message: "El nombre de la categoría es obligatorio" });
  }

  try {
    const CategoriaExiste = await CategoriaLaboratorio.findOne({
      where: {
        nombre: nombre.trim(),
        borrado: 0
      }
    });

    if (CategoriaExiste) {
      return res.status(400).json({ message: "La categoría ya existe" });
    }

    const categoria = await CategoriaLaboratorio.create({ nombre: nombre.trim() });
    return res.status(200).json({ message: "Categoría creada correctamente", categoria });

  } catch (error) {
    console.error('Error al crear la categoría:', error);
    return res.status(500).json({ message: "Error al crear la categoría" });
  }
};

const editarCategoria = async (req, res) => {
  const id = req.query.id;
  const nombre = req.body.nombre;
  try {
    const categoria = await CategoriaLaboratorio.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "La categoría no existe" });
    }

    const categoriaExistente = await CategoriaLaboratorio.findOne({ where: { nombre } });
    if (categoriaExistente && categoriaExistente.id !== id) {
      return res.status(400).json({ message: "Ya existe una categoría con ese nombre" });
    }

    categoria.nombre = nombre;
    await categoria.save();
    return res.status(200).json({ message: "Categoría editada correctamente" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al editar la categoría" });
  }
};

const eliminarCategoria = async (req, res) => {
  const id = req.query.id;
  try {
    const categoria = await CategoriaLaboratorio.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "La categoría no existe" });
    }
    categoria.borrado = 1;
    await categoria.save();
    return res.status(200).json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al eliminar la categoría" });
  }
};

const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await CategoriaLaboratorio.findAll({ where: { borrado: 0 } });
    return res.status(200).json(categorias);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al obtener las categorías" });
  }
};

// Modelos de InsumoLaboratorio, Repuestos y Herramientas

const generarModelo = async (req, res) => {
  const nombre = req.body.nombre;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ message: "El nombre del modelo es obligatorio" });
  }

  try {
    const existeModelo = await ModeloLaboratorio.findOne({
      where: {
        nombre: nombre.trim(),
        borrado: 0
      }
    });

    if (existeModelo) {
      return res.status(400).json({ message: "Ya existe un modelo con ese nombre y está activo" });
    }

    const modelo = await ModeloLaboratorio.create({ nombre: nombre.trim() });
    return res.status(200).json({ message: "Modelo creado correctamente", modelo });

  } catch (error) {
    console.error('Error al crear el modelo:', error);
    return res.status(500).json({ message: "Error al crear el modelo" });
  }
};

const editarModelo = async (req, res) => {
  const id = req.query.id;
  const nombre = req.body.nombre;
  try {
    const modelo = await ModeloLaboratorio.findByPk(id);
    if (!modelo) {
      return res.status(404).json({ message: "El modelo no existe" });
    }
    const modeloExistente = await ModeloLaboratorio.findOne({
      where: {
        nombre,
        borrado: 0
      }
    });

    if (modeloExistente && modeloExistente.id !== id) {
      return res.status(400).json({ message: "Ya existe un modelo con ese nombre y está activo" });
    };

    modelo.nombre = nombre;
    await modelo.save();
    return res.status(200).json({ message: "Modelo editado correctamente" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al editar el modelo" });
  }
};

const eliminarModelo = async (req, res) => {
  const id = req.query.id;
  try {
    const modelo = await ModeloLaboratorio.findByPk(id);
    if (!modelo) {
      return res.status(404).json({ message: "El modelo no existe" });
    }
    modelo.borrado = 1;
    await modelo.save();
    return res.status(200).json({ message: "Modelo eliminado correctamente" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al eliminar el modelo" });
  }
};

const obtenerModelos = async (req, res) => {
  try {
    const modelos = await ModeloLaboratorio.findAll({ where: { borrado: 0 } });
    return res.status(200).json(modelos);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al obtener los modelos" });
  }
};

// Marcas de InsumoLaboratorio, Repuestos y Herramientas

const generarMarca = async (req, res) => {
  const nombre = req.body.nombre;
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ message: "El nombre del modelo es obligatorio" });
  }
  try {
    const marcaExiste = await MarcaLaboratorio.findOne({
      where: {
        nombre: nombre.trim(),
        borrado: 0
      }
    });
    if (marcaExiste) {
      return res.status(400).json({ message: "Ya existe una marca con ese nombre y está activa" });
    };

    const marca = await MarcaLaboratorio.create({ nombre: nombre });

    return res.status(200).json({ message: "Marca creada correctamente", marca });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al crear la marca" });
  }
}

const editarMarca = async (req, res) => {
  const id = req.query.id;
  const nombre = req.body.nombre;
  try {
    const marca = await MarcaLaboratorio.findByPk(id);
    if (!marca) {
      return res.status(404).json({ message: "La marca no existe" });
    }
    const marcaExistente = await MarcaLaboratorio.findOne({
      where: {
        nombre,
        borrado: 0
      }
    });
    if (marcaExistente && marcaExistente.id !== id) {
      return res.status(400).json({ message: "Ya existe una marca con ese nombre y está activa" });
    }

    marca.nombre = nombre;
    await marca.save();

    return res.status(200).json({ message: "Marca editada correctamente" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al editar la marca" });
  }
};

const eliminarMarca = async (req, res) => {
  const id = req.query.id;
  try {
    const marca = await MarcaLaboratorio.findByPk(id);
    if (!marca) {
      return res.status(404).json({ message: "La marca no existe" });
    }
    marca.borrado = 1;
    await marca.save();
    return res.status(200).json({ message: "Marca eliminada correctamente" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al eliminar la marca" });
  }
};

const obtenerMarcas = async (req, res) => {
  try {
    const marcas = await MarcaLaboratorio.findAll({ where: { borrado: 0 } });
    return res.status(200).json(marcas);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al obtener las marcas" });
  }
};

// Herramientas de Laboratorio

const generarHerramientaPrestada = async (req, res) => {
  const {
    categorias_laboratorio_id,
    marcas_laboratorio_id,
    modelos_laboratorio_id,
    personal_retira,
    estado_productos_laboratorio_retira,
    detalle_retira,
    email_personal_retira,
  } = req.body;

  const usuario_entrega_id = req.usuario.id;
  const fecha_entrega = moment().format('YYYY-MM-DD HH:mm:ss');

  try {
    const herramienta = await HerramientaLaboratorio.create({
      categorias_laboratorio_id,
      marcas_laboratorio_id,
      modelos_laboratorio_id,
      personal_retira,
      estado_productos_laboratorio_retira,
      detalle_retira,
      email_personal_retira,
      usuario_entrega_id,
      fecha_entrega,
    });

    return res.status(200).json({ message: "Herramienta generada correctamente", herramienta });

  } catch (error) {
    console.error('Error al generar la herramienta:', error);
    return res.status(500).json({ message: "Error al generar la herramienta" });
  }
};

const editarHerramientaPrestada = async (req, res) => {
  const id = req.query.id;
  const {
    categorias_laboratorio_id,
    marcas_laboratorio_id,
    modelos_laboratorio_id,
    personal_retira,
    estado_productos_laboratorio_retira,
    detalle_retira,
    email_personal_retira,
  } = req.body;

  try {
    const herramienta = await HerramientaLaboratorio.findByPk(id);
    if (!herramienta) {
      return res.status(404).json({ message: "La herramienta no existe" });
    }

    herramienta.categorias_laboratorio_id = categorias_laboratorio_id;
    herramienta.marcas_laboratorio_id = marcas_laboratorio_id;
    herramienta.modelos_laboratorio_id = modelos_laboratorio_id;
    herramienta.personal_retira = personal_retira;
    herramienta.estado_productos_laboratorio_retira = estado_productos_laboratorio_retira;
    herramienta.detalle_retira = detalle_retira;
    herramienta.email_personal_retira = email_personal_retira;

    await herramienta.save();

    return res.status(200).json({ message: "Herramienta editada correctamente" });

  } catch (error) {
    console.error('Error al editar la herramienta:', error);
    return res.status(500).json({ message: "Error al editar la herramienta" });
  }
};

const eliminarHerramientaPrestada = async (req, res) => {
  const id = req.query.id;

  try {
    const herramienta = await HerramientaLaboratorio.findByPk(id);
    if (!herramienta) {
      return res.status(404).json({ message: "La herramienta no existe" });
    }

    herramienta.borrado = 1;
    await herramienta.save();

    return res.status(200).json({ message: "Herramienta eliminada correctamente" });

  } catch (error) {
    console.error('Error al eliminar la herramienta:', error);
    return res.status(500).json({ message: "Error al eliminar la herramienta" });
  }
};

const devolucionDeHerramienta = async (req, res) => {

  const id = req.query.id;

  const { detalle_devuelve, estado_productos_laboratorio_devuelve } = req.body;

  const usuario_devuelve = await Usuario.findOne({ where: { id: req.usuario.id } });

  const fecha_devolucion = moment().format('YYYY-MM-DD HH:mm:ss');

  try {
    const herramienta = await HerramientaLaboratorio.findByPk(id);
    if (!herramienta) {
      return res.status(404).json({ message: "La herramienta no existe" });
    }

    herramienta.detalle_devuelve = `${detalle_devuelve} - ${usuario_devuelve.nombre} ${usuario_devuelve.apellido}`;
    herramienta.estado_productos_laboratorio_devuelve = estado_productos_laboratorio_devuelve;
    herramienta.fecha_devolucion = fecha_devolucion;

    await herramienta.save();

    return res.status(200).json({ message: "Herramienta devuelta correctamente" });

  } catch (error) {
    console.error('Error al devolver la herramienta:', error);
    return res.status(500).json({ message: "Error al devolver la herramienta" });
  }
};

const obtenerHerramientasPrestadas = async (req, res) => {
  try {
    const herramientas = await HerramientaLaboratorio.findAll({
      where: {
        borrado: 0
      },
    });
    return res.status(200).json(herramientas);
  } catch (error) {
    console.error('Error al obtener las herramientas:', error);
    return res.status(500).json({ message: "Error al obtener las herramientas" });
  }
};

const obtenerHerramientasPrestadasPorUsuario = async (req, res) => {
  const usuario_entrega_id = req.usuario.id;
  try {
    const herramientas = await HerramientaLaboratorio.findAll({
      include: [
        {
          model: CategoriaLaboratorio,
          as: 'categorias_laboratorio',
          attributes: ['nombre']
        },
        {
          model: MarcaLaboratorio,
          as: 'marcas_laboratorio',
          attributes: ['nombre']
        },
        {
          model: ModeloLaboratorio,
          as: 'modelos_laboratorio',
          attributes: ['nombre']
        },
        {
          model: EstadoProductoLaboratorio,
          as: 'estado_productos_laboratorio_retira',
          attributes: ['tipo']
        },
        {
          model: Usuario,
          as: 'usuario_entrega',
          attributes: ['nombre', 'apellido', 'email']
        },
      ],
      where: {
        usuario_entrega_id,
        borrado: 0
      },
    });
    return res.status(200).json(herramientas);
  } catch (error) {
    console.error('Error al obtener las herramientas:', error);
    return res.status(500).json({ message: "Error al obtener las herramientas" });
  }
};

const obtenerHerramientaRetiradasPorUsuario = async (req, res) => {
  const usuario_entrega_id = req.usuario.id;

  try {
    const herramientas = await HerramientaLaboratorio.findAll({
      include: [
        {
          model: CategoriaLaboratorio,
          as: 'categorias_laboratorio',
          attributes: ['nombre']
        },
        {
          model: MarcaLaboratorio,
          as: 'marcas_laboratorio',
          attributes: ['nombre']
        },
        {
          model: ModeloLaboratorio,
          as: 'modelos_laboratorio',
          attributes: ['nombre']
        },
        {
          model: EstadoProductoLaboratorio,
          as: 'estado_productos_laboratorio_retira',
          attributes: ['tipo']
        },
        {
          model: Usuario,
          as: 'usuario_entrega',
          attributes: ['nombre', 'apellido', 'email']
        },
      ],
      where: {
        usuario_entrega_id,
        borrado: 0
      },
    });

    return res.status(200).json(herramientas);

  } catch (error) {
    console.error('Error al obtener las herramientas:', error);
    return res.status(500).json({ message: "Error al obtener las herramientas" });
  }
};

const obtenerHerramientasPorFecha = async (req, res) => {
  let { fecha_inicio, fecha_fin } = req.query;

  if (!fecha_inicio) {
    fecha_inicio = moment().startOf('month').format('YYYY-MM-DD');
  }
  if (!fecha_fin) {
    fecha_fin = moment().endOf('month').format('YYYY-MM-DD');
  }

  try {
    const herramientas = await HerramientaLaboratorio.findAll({
      include: [
        {
          model: CategoriaLaboratorio,
          as: 'categorias_laboratorio',
          attributes: ['nombre']
        },
        {
          model: MarcaLaboratorio,
          as: 'marcas_laboratorio',
          attributes: ['nombre']
        },
        {
          model: ModeloLaboratorio,
          as: 'modelos_laboratorio',
          attributes: ['nombre']
        },
        {
          model: EstadoProductoLaboratorio,
          as: 'estado_productos_laboratorio_retira',
          attributes: ['tipo']
        },
        {
          model: Usuario,
          as: 'usuario_entrega',
          attributes: ['nombre', 'apellido', 'email']
        },
      ],
      where: {
        fecha_entrega: {
          [Op.between]: [fecha_inicio, fecha_fin]
        },
        borrado: 0
      },
    });

    return res.status(200).json(herramientas);

  } catch (error) {
    console.error('Error al obtener las herramientas:', error);
    return res.status(500).json({ message: "Error al obtener las herramientas" });
  }
};

// Ubicaciones de InsumoLaboratorio, Repuestos y Herramientas

const generarUbicacion = async (req, res) => {
  const { nombre, detalle } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ message: "El nombre de la ubicación es obligatorio" });
  }

  try {
    const ubicacionExiste = await UbicacionLaboratorio.findOne({ where: { nombre: nombre.trim(), borrado: 0 } });

    if (ubicacionExiste) {
      return res.status(400).json({ message: "La ubicación ya existe", ubicacionExiste });
    }

    const ubicacion = await UbicacionLaboratorio.create({ nombre: nombre.trim(), detalle });
    return res.status(200).json({ message: "Ubicación creada correctamente", ubicacion });

  } catch (error) {
    console.error('Error al crear la ubicación:', error);
    return res.status(500).json({ message: "Error al crear la ubicación" });
  }
};

const editarUbicacion = async (req, res) => {
  const id = req.query.id;
  const { nombre, detalle } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ message: "El nombre de la ubicación es obligatorio" });
  }

  try {
    const ubicacion = await UbicacionLaboratorio.findByPk(id);
    if (!ubicacion) {
      return res.status(404).json({ message: "La ubicación no existe" });
    }

    const ubicacionExistente = await UbicacionLaboratorio.findOne({ where: { nombre: nombre.trim(), borrado: 0 } });
    if (ubicacionExistente && ubicacionExistente.id !== id) {
      return res.status(400).json({ message: "Ya existe una ubicación con ese nombre", ubicacionExistente });
    }

    ubicacion.nombre = nombre.trim();
    ubicacion.detalle = detalle;

    await ubicacion.save();
    return res.status(200).json({ message: "Ubicación editada correctamente", ubicacion });

  } catch (error) {
    console.error('Error al editar la ubicación:', error);
    return res.status(500).json({ message: "Error al editar la ubicación" });
  }
};

const eliminarUbicacion = async (req, res) => {
  const id = req.query.id;
  try {
    const ubicacion = await UbicacionLaboratorio.findByPk(id);
    if (!ubicacion) {
      return res.status(404).json({ message: "La ubicación no existe" });
    }
    ubicacion.borrado = 1;
    await ubicacion.save();
    return res.status(200).json({ message: "Ubicación eliminada correctamente" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al eliminar la ubicación" });
  }
};

const obtenerUbicaciones = async (req, res) => {
  try {
    const ubicaciones = await UbicacionLaboratorio.findAll({ where: { borrado: 0 } });
    return res.status(200).json(ubicaciones);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al obtener las ubicaciones" });
  }
};

// Carga de InsumoLaboratorio

const cargarInsumo = async (req, res) => {
  const {
    categorias_laboratorio_id,
    marcas_laboratorio_id,
    modelos_laboratorio_id,
    ubicacion_laboratorio_id,
    detalle,
    estado_productos_laboratorio
  } = req.body;

  const cantidad = parseInt(req.query.cantidad) || 1;

  try {
    const insumos = [];
    const cargasInsumo = [];

    for (let i = 0; i < cantidad; i++) {
      const serial = await generarNumeroDeSerieUnico();

      const insumo = await InsumoLaboratorio.create({
        categorias_laboratorio_id,
        marcas_laboratorio_id,
        modelos_laboratorio_id,
        serial,
        ubicacion_laboratorio_id,
        detalle,
        estado_productos_laboratorio
      });

      const carga_insumo = await CargaInsumo.create({
        insumo_laboratorio_id: insumo.id,
        usuario_ingreso_id: req.usuario.id,
        fecha_ingreso: moment().format('YYYY-MM-DD HH:mm:ss'),
      });

      insumos.push(insumo);
      cargasInsumo.push(carga_insumo);
    }

    return res.status(200).json({ message: "InsumoLaboratorio cargados correctamente", insumos, cargasInsumo });

  } catch (error) {
    console.error('Error al cargar los insumos:', error);
    return res.status(500).json({ message: "Error al cargar los insumos" });
  }
};

const retirarInsumo = async (req, res) => {
  const id = req.query.id;
  let { slot, mdc } = req.body;

  // Validación de entrada
  if (!slot || slot.trim() === '') {
    slot = "Sin Asignar";
  }
  if (!mdc || mdc.trim() === '') {
    mdc = "Sin Asignar";
  }

  try {
    const retiroDeInsumo = await CargaInsumo.findOne({
      where: {
        insumo_laboratorio_id: id,
        usuario_egreso_id: null,
        fecha_egreso: null,
        borrado: 0
      }
    });

    if (!retiroDeInsumo) {
      return res.status(404).json({ message: "El insumo no se encuentra en stock" });
    }

    retiroDeInsumo.usuario_egreso_id = req.usuario.id;
    retiroDeInsumo.fecha_egreso = moment().format('YYYY-MM-DD HH:mm:ss');
    retiroDeInsumo.slot = slot.trim();
    retiroDeInsumo.mdc = mdc.trim();
    await retiroDeInsumo.save();

    return res.status(200).json({ message: "Insumo retirado correctamente", retiroDeInsumo });

  } catch (error) {
    console.error('Error al retirar el insumo:', error);
    return res.status(500).json({ message: "Error al retirar el insumo" });
  }
};

const editarInsumo = async (req, res) => {
  const id = req.query.id;
  const {
    categorias_laboratorio_id,
    marcas_laboratorio_id,
    modelos_laboratorio_id,
    ubicacion_laboratorio_id,
    detalle,
    estado_productos_laboratorio
  } = req.body;

  try {
    const insumo = await InsumoLaboratorio.findByPk(id);
    if (!insumo) {
      return res.status(404).json({ message: "El insumo no existe" });
    }

    insumo.categorias_laboratorio_id = categorias_laboratorio_id;
    insumo.marcas_laboratorio_id = marcas_laboratorio_id;
    insumo.modelos_laboratorio_id = modelos_laboratorio_id;
    insumo.ubicacion_laboratorio_id = ubicacion_laboratorio_id;
    insumo.detalle = detalle;
    insumo.estado_productos_laboratorio = estado_productos_laboratorio;

    await insumo.save();

    const carga_insumo = await CargaInsumo.findOne({ where: { insumo_laboratorio_id: id } });
    if (!carga_insumo) {
      return res.status(404).json({ message: "La carga del insumo no existe" });
    }

    carga_insumo.fecha_ingreso = moment().format('YYYY-MM-DD HH:mm:ss');
    carga_insumo.usuario_ingreso_id = req.usuario.id;

    await carga_insumo.save();

    return res.status(200).json({ message: "Insumo editado correctamente", insumo, carga_insumo });

  } catch (error) {
    console.error('Error al editar el insumo:', error);
    return res.status(500).json({ message: "Error al editar el insumo" });
  }
};

const eliminarInsumo = async (req, res) => {
  const id = req.query.id;
  try {
    const insumo = await InsumoLaboratorio.findByPk(id);
    if (!insumo) {
      return res.status(404).json({ message: "El insumo no existe" });
    }
    insumo.borrado = 1;
    await insumo.save();

    const carga_insumo = await CargaInsumo.findOne({ where: { insumo_laboratorio_id: id, borrado: 0 } });

    if (!carga_insumo) {
      return res.status(404).json({ message: "La carga del insumo no existe" });
    }
    carga_insumo.borrado = 1;
    await carga_insumo.save();

    return res.status(200).json({ message: "Insumo eliminado correctamente" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al eliminar el insumo" });
  }
};

const obtenerInsumosCargados = async (req, res) => {
  try {
    const cargaInsumos = await CargaInsumo.findAll({
      include: [
        {
          model: InsumoLaboratorio,
          as: 'insumo_laboratorio',
          include: [
            {
              model: CategoriaLaboratorio,
              as: 'categorias_laboratorio',
              attributes: ['nombre']
            },
            {
              model: MarcaLaboratorio,
              as: 'marcas_laboratorio',
              attributes: ['nombre']
            },
            {
              model: ModeloLaboratorio,
              as: 'modelos_laboratorio',
              attributes: ['nombre']
            },
            {
              model: UbicacionLaboratorio,
              as: 'ubicacion_laboratorio',
              attributes: ['nombre']
            },
            {
              model: EstadoProductoLaboratorio,
              as: 'estado_productos_laboratorio',
              attributes: ['tipo']
            },
          ],
        },
        {
          model: Usuario,
          as: 'usuario_ingreso',
          attributes: ['nombre', 'apellido', 'email']
        },
        {
          model: Usuario,
          as: 'usuario_egreso',
          attributes: ['nombre', 'apellido', 'email']
        },
      ],
      where: {
        borrado: 0
      }
    });

    return res.status(200).json(cargaInsumos);
  } catch (error) {
    console.error('Error al obtener los insumos:', error);
    return res.status(500).json({ message: "Error al obtener los insumos" });
  }
};

const obtenerInsumosRetirados = async (req, res) => {
  try {
    const cargaInsumos = await CargaInsumo.findAll({
      include: [
        {
          model: InsumoLaboratorio,
          as: 'insumo_laboratorio',
          include: [
            {
              model: CategoriaLaboratorio,
              as: 'categorias_laboratorio',
              attributes: ['nombre']
            },
            {
              model: MarcaLaboratorio,
              as: 'marcas_laboratorio',
              attributes: ['nombre']
            },
            {
              model: ModeloLaboratorio,
              as: 'modelos_laboratorio',
              attributes: ['nombre']
            },
            {
              model: UbicacionLaboratorio,
              as: 'ubicacion_laboratorio',
              attributes: ['nombre']
            },
            {
              model: EstadoProductoLaboratorio,
              as: 'estado_productos_laboratorio',
              attributes: ['tipo']
            },
          ],
        },
        {
          model: Usuario,
          as: 'usuario_ingreso',
          attributes: ['nombre', 'apellido', 'email']
        },
        {
          model: Usuario,
          as: 'usuario_egreso',
          attributes: ['nombre', 'apellido', 'email']
        },
      ],
      where: {
        usuario_egreso_id: {
          [Op.ne]: null
        },
        fecha_egreso: {
          [Op.ne]: null
        },
        borrado: 0
      }
    });

    return res.status(200).json(cargaInsumos);
  } catch (error) {
    console.error('Error al obtener los insumos:', error);
    return res.status(500).json({ message: "Error al obtener los insumos" });
  }
};

const obtenerInsumosCargadosPorFecha = async (req, res) => {
  let { fecha_inicio, fecha_fin } = req.query;

  if (!fecha_inicio) {
    fecha_inicio = moment().startOf('month').format('YYYY-MM-DD');
  }
  if (!fecha_fin) {
    fecha_fin = moment().endOf('month').format('YYYY-MM-DD');
  }

  try {
    const cargaInsumos = await CargaInsumo.findAll({
      include: [
        {
          model: InsumoLaboratorio,
          as: 'insumo_laboratorio',
          include: [
            {
              model: CategoriaLaboratorio,
              as: 'categorias_laboratorio',
              attributes: ['nombre']
            },
            {
              model: MarcaLaboratorio,
              as: 'marcas_laboratorio',
              attributes: ['nombre']
            },
            {
              model: ModeloLaboratorio,
              as: 'modelos_laboratorio',
              attributes: ['nombre']
            },
            {
              model: UbicacionLaboratorio,
              as: 'ubicacion_laboratorio',
              attributes: ['nombre']
            },
            {
              model: EstadoProductoLaboratorio,
              as: 'estado_productos_laboratorio',
              attributes: ['tipo']
            },
          ],
        },
        {
          model: Usuario,
          as: 'usuario_ingreso',
          attributes: ['nombre', 'apellido', 'email']
        },
        {
          model: Usuario,
          as: 'usuario_egreso',
          attributes: ['nombre', 'apellido', 'email']
        },
      ],
      where: {
        [Op.or]: [
          {
            fecha_ingreso: {
              [Op.between]: [fecha_inicio, fecha_fin]
            }
          },
          {
            fecha_egreso: {
              [Op.between]: [fecha_inicio, fecha_fin]
            }
          }
        ],
        borrado: 0
      }
    });

    return res.status(200).json(cargaInsumos);
  } catch (error) {
    console.error('Error al obtener los insumos:', error);
    return res.status(500).json({ message: "Error al obtener los insumos" });
  }
}

// Carga de Repuestos

const cargarRepuesto = async (req, res) => {
  const {
    categorias_laboratorio_id,
    marcas_laboratorio_id,
    modelos_laboratorio_id,
    ubicacion_laboratorio_id,
    detalle,
    estado_productos_laboratorio
  } = req.body;

  const cantidad = parseInt(req.query.cantidad) || 1;

  try {
    const repuestos = [];
    const cargasRepuesto = [];

    for (let i = 0; i < cantidad; i++) {
      const serial = await generarNumeroDeSerieUnico();

      const repuesto = await RepuestoLaboratorio.create({
        categorias_laboratorio_id,
        marcas_laboratorio_id,
        modelos_laboratorio_id,
        serial,
        ubicacion_laboratorio_id,
        detalle,
        estado_productos_laboratorio
      });

      const carga_repuesto = await CargaRepuesto.create({
        repuesto_laboratorio_id: repuesto.id,
        usuario_ingreso_id: req.usuario.id,
        fecha_ingreso: moment().format('YYYY-MM-DD HH:mm:ss'),
      });

      repuestos.push(repuesto);
      cargasRepuesto.push(carga_repuesto);
    }

    return res.status(200).json({ message: "Repuestos cargados correctamente", repuestos, cargasRepuesto });

  } catch (error) {
    console.error('Error al cargar los repuestos:', error);
    return res.status(500).json({ message: "Error al cargar los repuestos" });
  }
};

const retirarRepuesto = async (req, res) => {
  const id = req.query.id;
  let { slot, mdc } = req.body;

  if (!slot || !mdc) {
    return res.status(400).json({ message: "El slot y el mdc son obligatorios" });
  }

  try {
    const retiroDeRepuesto = await CargaRepuesto.findOne({
      where: {
        repuesto_laboratorio_id: id,
        usuario_egreso_id: null,
        fecha_egreso: null,
        borrado: 0
      }
    });

    if (!retiroDeRepuesto) {
      return res.status(404).json({ message: "El repuesto no se encuentra en stock" });
    }

    retiroDeRepuesto.usuario_egreso_id = req.usuario.id;
    retiroDeRepuesto.fecha_egreso = moment().format('YYYY-MM-DD HH:mm:ss');
    retiroDeRepuesto.slot = slot.trim();
    retiroDeRepuesto.mdc = mdc.trim();
    await retiroDeRepuesto.save();

    return res.status(200).json({ message: "Repuesto retirado correctamente", retiroDeRepuesto });

  } catch (error) {
    console.error('Error al retirar el repuesto:', error);
    return res.status(500).json({ message: "Error al retirar el repuesto" });
  }
};

const editarRepuesto = async (req, res) => {
  const id = req.query.id;
  const {
    categorias_laboratorio_id,
    marcas_laboratorio_id,
    modelos_laboratorio_id,
    ubicacion_laboratorio_id,
    detalle,
    estado_productos_laboratorio
  } = req.body;

  try {
    const repuesto = await RepuestoLaboratorio.findByPk(id);
    if (!repuesto) {
      return res.status(404).json({ message: "El repuesto no existe" });
    }

    repuesto.categorias_laboratorio_id = categorias_laboratorio_id;
    repuesto.marcas_laboratorio_id = marcas_laboratorio_id;
    repuesto.modelos_laboratorio_id = modelos_laboratorio_id;
    repuesto.ubicacion_laboratorio_id = ubicacion_laboratorio_id;
    repuesto.detalle = detalle;
    repuesto.estado_productos_laboratorio = estado_productos_laboratorio;

    await repuesto.save();

    const carga_repuesto = await CargaRepuesto.findOne({ where: { repuesto_laboratorio_id: id } });
    if (!carga_repuesto) {
      return res.status(404).json({ message: "La carga del repuesto no existe" });
    }

    carga_repuesto.fecha_ingreso = moment().format('YYYY-MM-DD HH:mm:ss');
    carga_repuesto.usuario_ingreso_id = req.usuario.id;

    await carga_repuesto.save();

    return res.status(200).json({ message: "Repuesto editado correctamente", repuesto, carga_repuesto });

  } catch (error) {
    console.error('Error al editar el repuesto:', error);
    return res.status(500).json({ message: "Error al editar el repuesto" });
  }
};

const eliminarRepuesto = async (req, res) => {
  const id = req.query.id;
  try {
    const repuesto = await RepuestoLaboratorio.findByPk(id);
    if (!repuesto) {
      return res.status(404).json({ message: "El repuesto no existe" });
    }
    repuesto.borrado = 1;
    await repuesto.save();

    const carga_repuesto = await CargaRepuesto.findOne({ where: { repuesto_laboratorio_id: id, borrado: 0 } });

    if (!carga_repuesto) {
      return res.status(404).json({ message: "La carga del repuesto no existe" });
    }
    carga_repuesto.borrado = 1;
    await carga_repuesto.save();

    return res.status(200).json({ message: "Repuesto eliminado correctamente" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al eliminar el repuesto" });
  }
};

const obtenerRepuestosCargados = async (req, res) => {
  try {
    const cargaRepuestos = await CargaRepuesto.findAll({
      include: [
        {
          model: RepuestoLaboratorio,
          as: 'repuesto_laboratorio',
          include: [
            {
              model: CategoriaLaboratorio,
              as: 'categorias_laboratorio',
              attributes: ['nombre']
            },
            {
              model: MarcaLaboratorio,
              as: 'marcas_laboratorio',
              attributes: ['nombre']
            },
            {
              model: ModeloLaboratorio,
              as: 'modelos_laboratorio',
              attributes: ['nombre']
            },
            {
              model: UbicacionLaboratorio,
              as: 'ubicacion_laboratorio',
              attributes: ['nombre']
            },
            {
              model: EstadoProductoLaboratorio,
              as: 'estado_productos_laboratorio',
              attributes: ['tipo']
            },
          ],
        },
        {
          model: Usuario,
          as: 'usuario_ingreso',
          attributes: ['nombre', 'apellido', 'email']
        },
        {
          model: Usuario,
          as: 'usuario_egreso',
          attributes: ['nombre', 'apellido', 'email']
        },
      ],
      where: {
        borrado: 0
      }
    });

    return res.status(200).json(cargaRepuestos);
  } catch (error) {
    console.error('Error al obtener los repuestos:', error);
    return res.status(500).json({ message: "Error al obtener los repuestos" });
  }
};

const obtenerRepuestosRetirados = async (req, res) => {
  try {
    const cargaRepuestos = await CargaRepuesto.findAll({
      include: [
        {
          model: RepuestoLaboratorio,
          as: 'repuesto_laboratorio',
          include: [
            {
              model: CategoriaLaboratorio,
              as: 'categorias_laboratorio',
              attributes: ['nombre']
            },
            {
              model: MarcaLaboratorio,
              as: 'marcas_laboratorio',
              attributes: ['nombre']
            },
            {
              model: ModeloLaboratorio,
              as: 'modelos_laboratorio',
              attributes: ['nombre']
            },
            {
              model: UbicacionLaboratorio,
              as: 'ubicacion_laboratorio',
              attributes: ['nombre']
            },
            {
              model: EstadoProductoLaboratorio,
              as: 'estado_productos_laboratorio',
              attributes: ['tipo']
            },
          ],
        },
        {
          model: Usuario,
          as: 'usuario_ingreso',
          attributes: ['nombre', 'apellido', 'email']
        },
        {
          model: Usuario,
          as: 'usuario_egreso',
          attributes: ['nombre', 'apellido', 'email']
        },
      ],
      where: {
        usuario_egreso_id: {
          [Op.ne]: null
        },
        fecha_egreso: {
          [Op.ne]: null
        },
        borrado: 0
      }
    });

    return res.status(200).json(cargaRepuestos);
  } catch (error) {
    console.error('Error al obtener los repuestos:', error);
    return res.status(500).json({ message: "Error al obtener los repuestos" });
  }
};

const obtenerRepuestosCargadosPorFecha = async (req, res) => {
  let { fecha_inicio, fecha_fin } = req.query;

  if (!fecha_inicio) {
    fecha_inicio = moment().startOf('month').format('YYYY-MM-DD');
  }
  if (!fecha_fin) {
    fecha_fin = moment().endOf('month').format('YYYY-MM-DD');
  }

  try {
    const cargaRepuestos = await CargaRepuesto.findAll({
      include: [
        {
          model: RepuestoLaboratorio,
          as: 'repuesto_laboratorio',
          include: [
            {
              model: CategoriaLaboratorio,
              as: 'categorias_laboratorio',
              attributes: ['nombre']
            },
            {
              model: MarcaLaboratorio,
              as: 'marcas_laboratorio',
              attributes: ['nombre']
            },
            {
              model: ModeloLaboratorio,
              as: 'modelos_laboratorio',
              attributes: ['nombre']
            },
            {
              model: UbicacionLaboratorio,
              as: 'ubicacion_laboratorio',
              attributes: ['nombre']
            },
            {
              model: EstadoProductoLaboratorio,
              as: 'estado_productos_laboratorio',
              attributes: ['tipo']
            },
          ],
        },
        {
          model: Usuario,
          as: 'usuario_ingreso',
          attributes: ['nombre', 'apellido', 'email']
        },
        {
          model: Usuario,
          as: 'usuario_egreso',
          attributes: ['nombre', 'apellido', 'email']
        },
      ],
      where: {
        [Op.or]: [
          {
            fecha_ingreso: {
              [Op.between]: [fecha_inicio, fecha_fin]
            }
          },
          {
            fecha_egreso: {
              [Op.between]: [fecha_inicio, fecha_fin]
            }
          }
        ],
        borrado: 0
      }
    });

    return res.status(200).json(cargaRepuestos);
  } catch (error) {
    console.error('Error al obtener los repuestos:', error);
    return res.status(500).json({ message: "Error al obtener los repuestos" });
  }
};



module.exports = {
  // Categorías de InsumoLaboratorio, Repuestos y Herramientas
  generarCategoria,
  editarCategoria,
  eliminarCategoria,
  obtenerCategorias,
  // Modelos de InsumoLaboratorio, Repuestos y Herramientas
  generarModelo,
  editarModelo,
  eliminarModelo,
  obtenerModelos,
  // Marcas de InsumoLaboratorio, Repuestos y Herramientas
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
  // Ubicaciones de InsumoLaboratorio, Repuestos y Herramientas
  generarUbicacion,
  editarUbicacion,
  eliminarUbicacion,
  obtenerUbicaciones,
  // Carga de InsumoLaboratorio
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

};

