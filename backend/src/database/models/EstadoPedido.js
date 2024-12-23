module.exports = (sequelize, dataTypes) => {
  let alias = 'EstadoPedido';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo: {
      type: dataTypes.STRING(100),
      allowNull: false,
    },
  };
  let config = {
    tableName: 'estado_pedido',
    timestamps: false
  }
  const EstadoPedido = sequelize.define(alias, cols, config);

  EstadoPedido.associate = function (models) {
    EstadoPedido.hasMany(models.GastronomiaVIP, {
      as: 'gastronomia_vip',
      foreignKey: 'estado_pedido_id'
    });
  }

  return EstadoPedido
}
  