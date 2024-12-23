module.exports = (sequelize, dataTypes) => {
  let alias = 'GastronomiaVIP';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cliente_id: {
      type: dataTypes.INTEGER
    },
    borrado: {
      type: dataTypes.INTEGER
    },
    tipo_comida_id: {
      type: dataTypes.INTEGER
    },
    observacion: {
      type: dataTypes.STRING
    },
    menu_vip_id: {
      type: dataTypes.INTEGER
    },
    fecha: {
      type: dataTypes.DATE
    },
    usuario_id: {
      type: dataTypes.INTEGER
    },
    entrega: {
      type: dataTypes.DATE
    },
    cantidad: {
      type: dataTypes.INTEGER
    },
    estado_pedido_id: {
      type: dataTypes.INTEGER
    },
  };
  let config = {
    tableName: 'gastronomia_vip',
    timestamps: false,
  };
  const GastronomiaVIP = sequelize.define(alias, cols, config);

  GastronomiaVIP.associate = function (models) {
    GastronomiaVIP.belongsTo(models.Cliente, {
      as: 'cliente',
      foreignKey: 'cliente_id'
    });
    GastronomiaVIP.belongsTo(models.TipoComida, {
      as: 'tipo_comida',
      foreignKey: 'tipo_comida_id'
    });
    GastronomiaVIP.belongsTo(models.Usuario, {
      as: 'usuario',
      foreignKey: 'usuario_id'
    });
    GastronomiaVIP.belongsTo(models.MenuVip, {
      as: 'menu_vip',
      foreignKey: 'menu_vip_id'
    });
    GastronomiaVIP.belongsTo(models.EstadoPedido, {
      as: 'estado_pedido',
      foreignKey: 'estado_pedido_id'
    });
  }

  return GastronomiaVIP;
}