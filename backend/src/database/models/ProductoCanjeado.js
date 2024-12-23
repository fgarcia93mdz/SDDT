module.exports = (sequelize, dataTypes) => {
  let alias = 'ProductoCanjeado';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    producto: {
      type: dataTypes.INTEGER
    },
    cliente_id: {
      type: dataTypes.INTEGER
    },
    fecha: {
      type: dataTypes.DATE
    },
    usuario_id: {
      type: dataTypes.INTEGER
    },
    borrado: {
      type: dataTypes.INTEGER
    },
    cantidad: {
      type: dataTypes.INTEGER
    },
  };
  let config = {
    tableName: 'productos_canjeados',
    timestamps: false,
  };
  const ProductoCanjeado = sequelize.define(alias, cols, config);

  ProductoCanjeado.associate = function (models) {
    ProductoCanjeado.belongsTo(models.Cliente, {
      as: 'cliente',
      foreignKey: 'cliente_id'
    });
    ProductoCanjeado.belongsTo(models.Usuario, {
      as: 'usuario',
      foreignKey: 'usuario_id'
    });
  }

  return ProductoCanjeado;
}