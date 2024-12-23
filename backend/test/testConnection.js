const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log({
  database: process.env.DATABASE,
  username: process.env.USER_NAME,
  password: '2615995585Fgg$',
  host: process.env.HOST,
  dialect: process.env.DIALECT,
});

// Importa tus modelos aquí
const ClasePrenda = require('../src/database/models/ClasePrenda');
const Cliente = require('../src/database/models/Cliente');
const EstadoCliente = require('../src/database/models/EstadoCliente');
const EstadoPrenda = require('../src/database/models/EstadoPrenda');
const LogCargaPrenda = require('../src/database/models/LogCargaPrenda');
const Prenda = require('../src/database/models/Prenda');
const PrendaDetalle = require('../src/database/models/PrendaDetalle');
const Rol = require('../src/database/models/Rol');
const Turno = require('../src/database/models/Turno');
const Usuario = require('../src/database/models/Usuario');

const sequelize = new Sequelize(process.env.DATABASE, process.env.USER_NAME, decryptedPasswordDev, {
  host: process.env.HOST,
  dialect: process.env.DIALECT,
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida exitosamente.');

    await sequelize.sync({ force: true });
    console.log('Todos los modelos fueron sincronizados exitosamente.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();