module.exports = (sequelize, dataTypes) => { 
  let alias = 'PrendaDetalle';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    clase_prenda_id: {
      type: dataTypes.INTEGER
    },
    ubicacion: {
      type: dataTypes.STRING
    },
    detalle: {
      type: dataTypes.STRING
    },
    prenda_id: {
      type: dataTypes.INTEGER
    },
    fecha_egreso_parcial: {
      type: dataTypes.DATE
    },
    entrega_parcial: {
      type: dataTypes.INTEGER
    },
    borrado: {
      type: dataTypes.INTEGER
    }
  }
  let config = {
    tableName: 'prendas_detalles',
    timestamps: false
  }
  const PrendaDetalle = sequelize.define(alias, cols, config);
  PrendaDetalle.associate = function (models) {
    PrendaDetalle.belongsTo(models.Prenda, {
      as: 'prenda',
      foreignKey: 'prenda_id'
    });
    PrendaDetalle.belongsTo(models.ClasePrenda, {
      as: 'clase_prenda',
      foreignKey: 'clase_prenda_id'
    });
  };
  return PrendaDetalle;
}