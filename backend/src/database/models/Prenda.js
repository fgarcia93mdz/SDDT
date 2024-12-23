module.exports = (sequelize, dataTypes) => {
  let alias = 'Prenda';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    estado_prendas_id: {
      type: dataTypes.INTEGER
    },
    fecha_de_ingreso: {
      type: dataTypes.DATE
    },
    fecha_de_egreso: {
      type: dataTypes.DATE
    },
    usuario_ingreso_id: {
      type: dataTypes.INTEGER
    },
    usuario_egreso_id: {
      type: dataTypes.INTEGER
    },
    clientes_id: {
      type: dataTypes.INTEGER
    },
    alerta_enviada: {
      type: dataTypes.INTEGER
    },
    borrado: {
      type: dataTypes.INTEGER
    },
  }

  let config = {
    tableName: 'prendas',
    timestamps: false,
  };
  const Prenda = sequelize.define(alias, cols, config);

  Prenda.associate = function (models) {
    Prenda.belongsTo(models.EstadoPrenda, {
      as: 'estadoPrenda',
      foreignKey: 'estado_prendas_id'
    });
    Prenda.belongsTo(models.Cliente, {
      as: 'cliente',
      foreignKey: 'clientes_id'
    });
    Prenda.belongsTo(models.Usuario, {
      as: 'usuario_ingreso',
      foreignKey: 'usuario_ingreso_id'
    });
    Prenda.belongsTo(models.Usuario, {
      as: 'usuario_egreso',
      foreignKey: 'usuario_egreso_id'
    });
    Prenda.hasMany(models.PrendaDetalle, {
      as: 'detalles',
      foreignKey: 'prenda_id'
    });
    Prenda.hasMany(models.CambioEstadoPrenda, {
      as: 'cambiosEstado',
      foreignKey: 'prenda_id'
    });
    Prenda.belongsToMany(models.ClasePrenda, {
      through: models.PrendaDetalle,
      as: 'clasesPrenda',
      foreignKey: 'prenda_id',
      otherKey: 'clase_prenda_id'
    });
  };

  return Prenda;
}