module.exports = (sequelize, dataTypes) => {
  let alias = 'ClasePrenda';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo: {
      type: dataTypes.STRING
    },
    capacidad_maxima: {
      type: dataTypes.INTEGER
    },
    capacidad_actual: {
      type: dataTypes.INTEGER
    },
    estado: {
      type: dataTypes.INTEGER
    }
  };
  let config = {
    tableName: 'clase_prenda',
    timestamps: false,
  };
  const ClasePrenda = sequelize.define(alias, cols, config);

  ClasePrenda.associate = function(models) {
    ClasePrenda.hasMany(models.PrendaDetalle, {
      as: 'prendas',
      foreignKey: 'clase_prenda_id'
    });
  }

  return ClasePrenda;
};