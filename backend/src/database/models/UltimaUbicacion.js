module.exports = (sequelize, dataTypes) => {
  let alias = 'UltimaUbicacion';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ubicacion: {
      type: dataTypes.INTEGER
    },
    estado: {
      type: dataTypes.INTEGER
    },
    motivo: {
      type: dataTypes.TEXT
    },
  };
  let config = {
    tableName: 'ultima_ubicacion',
    timestamps: false
  };
  const UltimaUbicacion = sequelize.define(alias, cols, config);

  return UltimaUbicacion;
};