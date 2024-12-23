module.exports = (sequelize, dataTypes) => {
  let alias = 'CambioEstadoPrenda';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    estado_prendas_id: {
      type: dataTypes.INTEGER
    },
    prenda_id: {
      type: dataTypes.INTEGER
    },
    fecha_cambio: {
      type: dataTypes.DATE
    },
  }

  let config = {
    tableName: 'cambios_estado_prendas',
    timestamps: false,
  };
  const CambioEstadoPrenda = sequelize.define(alias, cols, config);

  CambioEstadoPrenda.associate = function (models) {
    CambioEstadoPrenda.belongsTo(models.EstadoPrenda, {
      as: 'estadoPrenda',
      foreignKey: 'estado_prendas_id'
    });
    CambioEstadoPrenda.belongsTo(models.Prenda, {
      as: 'prenda',
      foreignKey: 'prenda_id'
    });
  };

  return CambioEstadoPrenda;
}