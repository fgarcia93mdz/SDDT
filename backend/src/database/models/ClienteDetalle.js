module.exports = (sequelize, dataTypes) => {
  let alias = 'ClienteDetalle';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cliente_id: {
      type: dataTypes.INTEGER
    },
    fecha_nacimiento: {
      type: dataTypes.DATE
    },
    fecha_alta: {
      type: dataTypes.DATE
    },
    fecha_baja: {
      type: dataTypes.DATE
    },
    motivo_baja: {
      type: dataTypes.STRING
    },
    borrado: {
      type: dataTypes.INTEGER
    },
    gusto_gastronomico: {
      type: dataTypes.STRING
    },
    equipo_futbol: {
      type: dataTypes.STRING
    },
    profesion: {
      type: dataTypes.STRING
    },
    gusto_musical: {
      type: dataTypes.STRING
    },
  };
  let config = {
    tableName: 'clientes_detalle',
    timestamps: false,
  };
  const ClienteDetalle = sequelize.define(alias, cols, config);

  ClienteDetalle.associate = function (models) {
    ClienteDetalle.belongsTo(models.Cliente, {
      as: 'cliente',
      foreignKey: 'cliente_id'
    });
  }

  return ClienteDetalle;
}