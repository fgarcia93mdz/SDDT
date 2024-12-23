module.exports = (sequelize, dataTypes) => { 
  let alias = "EstadoPrenda";
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo: {
      type: dataTypes.STRING
    }
  };
  let config = {
    tableName: "estado_prendas",
    timestamps: false
  };
  const EstadoPrenda = sequelize.define(alias, cols, config);
  EstadoPrenda.associate = function (models) {
    EstadoPrenda.hasMany(models.Prenda, {
      as: 'prendas',
      foreignKey: 'estado_prendas_id'
    });
    EstadoPrenda.hasMany(models.CambioEstadoPrenda, {
      as: 'cambiosEstado',
      foreignKey: 'estado_prendas_id'
    });
  };
  return EstadoPrenda;
}