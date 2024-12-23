module.exports = (sequelize, dataTypes) => {
  let alias = 'VentaTicket';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cliente_id: {
      type: dataTypes.INTEGER
    },
    fecha: {
      type: dataTypes.DATE
    },
    monto: {
      type: dataTypes.INTEGER
    },
    usuario_id: {
      type: dataTypes.INTEGER
    },
    borrado: {
      type: dataTypes.INTEGER
    },
  };
  let config = {
    tableName: 'venta_ticket',
    timestamps: false,
  };
  const VentaTicket = sequelize.define(alias, cols, config);

  VentaTicket.associate = function (models) {
    VentaTicket.belongsTo(models.Cliente, {
      as: 'cliente',
      foreignKey: 'cliente_id'
    });
    VentaTicket.belongsTo(models.Usuario, {
      as: 'usuario',
      foreignKey: 'usuario_id'
    });
  }

  return VentaTicket;
}