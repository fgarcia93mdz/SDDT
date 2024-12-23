module.exports = (sequelize, dataTypes) => {
  let alias = 'RegistroCliente';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cliente_id: {
      type: dataTypes.INTEGER
    },
    ingreso: {
      type: dataTypes.DATE
    },
    egreso: {
      type: dataTypes.DATE
    },
    permanencia: {
      type: dataTypes.STRING
    },
    valor_cambio_total: {
      type: dataTypes.INTEGER
    },
    usuario_id_ingreso: {
      type: dataTypes.INTEGER
    },
    usuario_id_egreso: {
      type: dataTypes.INTEGER
    },
    borrado: {
      type: dataTypes.INTEGER
    },
    observacion: {
      type: dataTypes.STRING
    },
  };
  let config = {
    tableName: 'registro_clientes',
    timestamps: false,
  };
  const RegistroCliente = sequelize.define(alias, cols, config);

  RegistroCliente.associate = function (models) {
    RegistroCliente.belongsTo(models.Cliente, {
      as: 'cliente',
      foreignKey: 'cliente_id'
    });
    RegistroCliente.belongsTo(models.Usuario, {
      as: 'usuario_ingreso',
      foreignKey: 'usuario_id_ingreso'
    });
    RegistroCliente.belongsTo(models.Usuario, {
      as: 'usuario_egreso',
      foreignKey: 'usuario_id_egreso'
    });
  }

  return RegistroCliente;
}